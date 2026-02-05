<?php

namespace Tests\Feature\Api;

use App\Models\TimeEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TimeEntryTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_clock_in_creates_open_entry(): void
    {
        Sanctum::actingAs($this->user);
        Carbon::setTestNow('2026-02-01 10:00:00');

        $response = $this->postJson('/api/time-entries/clock-in', [
            'lat' => 55.6761,
            'lng' => 12.5683,
        ]);

        $response->assertStatus(201);
        $data = $response->json('data') ?? $response->json();
        $this->assertNull($data['ended_at'] ?? null);
        $this->assertNotEmpty($data['started_at'] ?? null);
        $this->assertStringStartsWith('2026-02-01T10:00:00', (string) ($data['started_at'] ?? ''));

        $this->assertDatabaseHas('time_entries', [
            'user_id' => $this->user->id,
            'ended_at' => null,
        ]);
    }

    public function test_clock_out_closes_open_entry(): void
    {
        Sanctum::actingAs($this->user);
        Carbon::setTestNow('2026-02-01 10:00:00');
        $this->postJson('/api/time-entries/clock-in');

        Carbon::setTestNow('2026-02-01 12:30:00');
        $response = $this->postJson('/api/time-entries/clock-out', [
            'lat' => 55.68,
            'lng' => 12.57,
        ]);

        $response->assertStatus(200);
        $data = $response->json('data') ?? $response->json();
        $this->assertNotEmpty($data['ended_at'] ?? null);
        $this->assertStringStartsWith('2026-02-01T12:30:00', (string) ($data['ended_at'] ?? ''));

        $this->assertDatabaseHas('time_entries', [
            'user_id' => $this->user->id,
        ]);
        $entry = TimeEntry::where('user_id', $this->user->id)->first();
        $this->assertNotNull($entry->ended_at);
    }

    public function test_clock_in_when_open_entry_returns_422(): void
    {
        Sanctum::actingAs($this->user);
        Carbon::setTestNow('2026-02-01 10:00:00');
        $this->postJson('/api/time-entries/clock-in');

        $response = $this->postJson('/api/time-entries/clock-in');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['clock']);
    }

    public function test_clock_out_when_no_open_entry_returns_422(): void
    {
        Sanctum::actingAs($this->user);
        $response = $this->postJson('/api/time-entries/clock-out');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['clock']);
    }

    public function test_update_respects_overlap_returns_422(): void
    {
        Sanctum::actingAs($this->user);
        Carbon::setTestNow('2026-02-01 08:00:00');
        $entry1 = TimeEntry::factory()->for($this->user)->create([
            'started_at' => now(),
            'ended_at' => now()->copy()->addHours(2),
        ]);
        Carbon::setTestNow('2026-02-01 12:00:00');
        $entry2 = TimeEntry::factory()->for($this->user)->create([
            'started_at' => now(),
            'ended_at' => now()->copy()->addHours(2),
        ]);

        // Try to extend entry2 to overlap with entry1 (e.g. started_at 09:00, ended_at 13:00)
        $response = $this->putJson("/api/time-entries/{$entry2->id}", [
            'started_at' => '2026-02-01T09:00:00.000Z',
            'ended_at' => '2026-02-01T13:00:00.000Z',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['started_at', 'ended_at']);
    }

    public function test_update_without_overlap_succeeds(): void
    {
        Sanctum::actingAs($this->user);
        $entry = TimeEntry::factory()->for($this->user)->create([
            'started_at' => '2026-02-01 10:00:00',
            'ended_at' => '2026-02-01 12:00:00',
        ]);

        $response = $this->putJson("/api/time-entries/{$entry->id}", [
            'started_at' => '2026-02-01T10:30:00.000Z',
            'ended_at' => '2026-02-01T11:30:00.000Z',
        ]);

        $response->assertStatus(200);
        $entry->refresh();
        $this->assertEquals('2026-02-01 10:30:00', $entry->started_at->format('Y-m-d H:i:s'));
        $this->assertEquals('2026-02-01 11:30:00', $entry->ended_at->format('Y-m-d H:i:s'));
    }

    public function test_list_time_entries_paginated(): void
    {
        Sanctum::actingAs($this->user);
        TimeEntry::factory()->for($this->user)->count(3)->create();

        $response = $this->getJson('/api/time-entries');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'links', 'meta'])
            ->assertJsonCount(3, 'data');
    }

    public function test_guest_cannot_clock_in(): void
    {
        $response = $this->postJson('/api/time-entries/clock-in');
        $response->assertStatus(401);
    }

    public function test_user_cannot_view_another_users_entry(): void
    {
        Sanctum::actingAs($this->user);
        $other = User::factory()->create();
        $entry = TimeEntry::factory()->for($other)->create();

        $response = $this->getJson("/api/time-entries/{$entry->id}");
        $response->assertStatus(403);
    }

    public function test_user_cannot_update_another_users_entry(): void
    {
        Sanctum::actingAs($this->user);
        $other = User::factory()->create();
        $entry = TimeEntry::factory()->for($other)->create([
            'started_at' => '2026-02-01 10:00:00',
            'ended_at' => '2026-02-01 12:00:00',
        ]);

        $response = $this->putJson("/api/time-entries/{$entry->id}", [
            'started_at' => '2026-02-01T11:00:00.000Z',
            'ended_at' => '2026-02-01T13:00:00.000Z',
        ]);

        $response->assertStatus(403);
    }

    public function test_current_returns_open_entry(): void
    {
        Sanctum::actingAs($this->user);
        Carbon::setTestNow('2026-02-01 10:00:00');
        $this->postJson('/api/time-entries/clock-in');

        $response = $this->getJson('/api/time-entries/current');

        $response->assertStatus(200)
            ->assertJsonPath('data.ended_at', null);
    }

    public function test_current_returns_null_when_no_open_entry(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/time-entries/current');

        $response->assertStatus(200)
            ->assertJsonPath('data', null);
    }
}
