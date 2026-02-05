<?php

namespace Tests\Unit;

use App\Models\TimeEntry;
use App\Models\User;
use App\Services\TimeEntryService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class TimeEntryServiceTest extends TestCase
{
    use RefreshDatabase;

    private TimeEntryService $service;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TimeEntryService;
        $this->user = User::factory()->create();
    }

    public function test_get_open_entry_returns_null_when_none(): void
    {
        $this->assertNull($this->service->getOpenEntry($this->user));
    }

    public function test_clock_in_creates_open_entry_and_get_open_entry_returns_it(): void
    {
        Carbon::setTestNow('2026-02-01 10:00:00');

        $entry = $this->service->clockIn($this->user, 55.6, 12.5);

        $this->assertNotNull($entry->id);
        $this->assertNull($entry->ended_at);
        $this->assertEquals(55.6, $entry->start_lat);
        $this->assertEquals(12.5, $entry->start_lng);
        $this->assertSame($entry->id, $this->service->getOpenEntry($this->user)?->id);
    }

    public function test_clock_in_throws_when_already_open(): void
    {
        Carbon::setTestNow('2026-02-01 10:00:00');
        $this->service->clockIn($this->user);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('already have an open time entry');
        $this->service->clockIn($this->user);
    }

    public function test_clock_out_closes_entry_and_clears_open(): void
    {
        Carbon::setTestNow('2026-02-01 10:00:00');
        $entry = $this->service->clockIn($this->user);
        Carbon::setTestNow('2026-02-01 12:00:00');

        $closed = $this->service->clockOut($this->user, 55.7, 12.6);

        $this->assertNotNull($closed->ended_at);
        $this->assertEquals(55.7, $closed->end_lat);
        $this->assertEquals(12.6, $closed->end_lng);
        $this->assertNull($this->service->getOpenEntry($this->user));
    }

    public function test_clock_out_throws_when_no_open_entry(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('no open time entry');
        $this->service->clockOut($this->user);
    }

    public function test_has_overlap_returns_true_when_open_entry_exists(): void
    {
        TimeEntry::factory()->for($this->user)->open()->create([
            'started_at' => '2026-02-01 09:00:00',
        ]);
        $newStart = Carbon::parse('2026-02-01 10:00:00')->setTimezone('UTC');
        $newEnd = Carbon::parse('2026-02-01 11:00:00')->setTimezone('UTC');

        $this->assertTrue($this->service->hasOverlap($this->user, $newStart, $newEnd));
    }

    public function test_has_overlap_returns_false_when_intervals_do_not_overlap(): void
    {
        TimeEntry::factory()->for($this->user)->closed()->create([
            'started_at' => '2026-02-01 08:00:00',
            'ended_at' => '2026-02-01 09:00:00',
        ]);
        $newStart = Carbon::parse('2026-02-01 10:00:00')->setTimezone('UTC');
        $newEnd = Carbon::parse('2026-02-01 11:00:00')->setTimezone('UTC');

        $this->assertFalse($this->service->hasOverlap($this->user, $newStart, $newEnd));
    }

    public function test_update_throws_when_end_before_start(): void
    {
        $entry = TimeEntry::factory()->for($this->user)->closed()->create([
            'started_at' => '2026-02-01 10:00:00',
            'ended_at' => '2026-02-01 12:00:00',
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('End time must be after start time');
        $this->service->update($entry, [
            'started_at' => '2026-02-01T12:00:00.000Z',
            'ended_at' => '2026-02-01T11:00:00.000Z',
        ]);
    }

    public function test_has_overlap_returns_true_when_closed_intervals_overlap(): void
    {
        // Existing entry: 08:00 - 10:00
        TimeEntry::factory()->for($this->user)->closed()->create([
            'started_at' => '2026-02-01 08:00:00',
            'ended_at' => '2026-02-01 10:00:00',
        ]);
        // New entry: 09:00 - 11:00 (overlaps with existing)
        $newStart = Carbon::parse('2026-02-01 09:00:00')->setTimezone('UTC');
        $newEnd = Carbon::parse('2026-02-01 11:00:00')->setTimezone('UTC');

        $this->assertTrue($this->service->hasOverlap($this->user, $newStart, $newEnd));
    }

    public function test_has_overlap_excludes_specified_entry_id(): void
    {
        $entry = TimeEntry::factory()->for($this->user)->closed()->create([
            'started_at' => '2026-02-01 08:00:00',
            'ended_at' => '2026-02-01 10:00:00',
        ]);
        // Same interval as the entry being updated - should not overlap with itself
        $newStart = Carbon::parse('2026-02-01 08:00:00')->setTimezone('UTC');
        $newEnd = Carbon::parse('2026-02-01 10:00:00')->setTimezone('UTC');

        $this->assertFalse($this->service->hasOverlap($this->user, $newStart, $newEnd, $entry->id));
    }

    public function test_has_overlap_returns_false_for_adjacent_intervals(): void
    {
        // Existing entry: 08:00 - 10:00
        TimeEntry::factory()->for($this->user)->closed()->create([
            'started_at' => '2026-02-01 08:00:00',
            'ended_at' => '2026-02-01 10:00:00',
        ]);
        // New entry: 10:00 - 12:00 (starts exactly when existing ends)
        $newStart = Carbon::parse('2026-02-01 10:00:00')->setTimezone('UTC');
        $newEnd = Carbon::parse('2026-02-01 12:00:00')->setTimezone('UTC');

        $this->assertFalse($this->service->hasOverlap($this->user, $newStart, $newEnd));
    }

    public function test_update_throws_when_trying_to_create_second_open_entry(): void
    {
        // Create an open entry
        TimeEntry::factory()->for($this->user)->open()->create([
            'started_at' => '2026-02-01 08:00:00',
        ]);
        // Create a closed entry that we'll try to re-open
        $entry = TimeEntry::factory()->for($this->user)->closed()->create([
            'started_at' => '2026-02-01 12:00:00',
            'ended_at' => '2026-02-01 14:00:00',
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('another open time entry');
        $this->service->update($entry, [
            'started_at' => '2026-02-01T12:00:00.000Z',
            'ended_at' => null,
        ]);
    }
}
