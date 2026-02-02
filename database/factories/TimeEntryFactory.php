<?php

namespace Database\Factories;

use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimeEntry>
 */
class TimeEntryFactory extends Factory
{
    protected $model = TimeEntry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = fake()->dateTimeBetween('-30 days', 'now');
        $endedAt = fake()->optional(0.8)->dateTimeBetween($startedAt, 'now');

        return [
            'user_id' => User::factory(),
            'started_at' => $startedAt,
            'ended_at' => $endedAt,
            'start_lat' => fake()->optional(0.7)->latitude(),
            'start_lng' => fake()->optional(0.7)->longitude(),
            'end_lat' => $endedAt ? fake()->optional(0.7)->latitude() : null,
            'end_lng' => $endedAt ? fake()->optional(0.7)->longitude() : null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'ended_at' => null,
            'end_lat' => null,
            'end_lng' => null,
        ]);
    }

    public function closed(): static
    {
        return $this->state(function (array $attributes) {
            $startedAt = $attributes['started_at'] ?? now()->subHours(2);
            $start = $startedAt instanceof \DateTimeInterface
                ? \Carbon\Carbon::parse($startedAt)
                : \Carbon\Carbon::parse($startedAt);
            return [
                'started_at' => $start,
                'ended_at' => $start->copy()->addHours(2),
            ];
        });
    }
}
