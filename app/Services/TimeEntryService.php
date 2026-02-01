<?php

namespace App\Services;

use App\Models\TimeEntry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class TimeEntryService
{
    /**
     * Clock in: create a new open entry. Fails if user already has an open entry.
     *
     * @param  array{lat?: float|null, lng?: float|null}  $coords
     * @throws ValidationException
     */
    public function clockIn(User $user, ?float $lat = null, ?float $lng = null): TimeEntry
    {
        $openEntry = $this->getOpenEntry($user);
        if ($openEntry !== null) {
            throw ValidationException::withMessages([
                'clock' => ['You already have an open time entry. Clock out first.'],
            ]);
        }

        $now = now('UTC');

        return TimeEntry::create([
            'user_id' => $user->id,
            'started_at' => $now,
            'ended_at' => null,
            'start_lat' => $lat,
            'start_lng' => $lng,
            'end_lat' => null,
            'end_lng' => null,
        ]);
    }

    /**
     * Clock out: close the current open entry. Fails if no open entry.
     *
     * @param  array{lat?: float|null, lng?: float|null}  $coords
     * @throws ValidationException
     */
    public function clockOut(User $user, ?float $lat = null, ?float $lng = null): TimeEntry
    {
        $openEntry = $this->getOpenEntry($user);
        if ($openEntry === null) {
            throw ValidationException::withMessages([
                'clock' => ['You have no open time entry to clock out of.'],
            ]);
        }

        $now = now('UTC');
        $openEntry->update([
            'ended_at' => $now,
            'end_lat' => $lat,
            'end_lng' => $lng,
        ]);

        return $openEntry->fresh();
    }

    /**
     * Get the user's current open entry (at most one).
     */
    public function getOpenEntry(User $user): ?TimeEntry
    {
        return TimeEntry::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();
    }

    /**
     * Check if interval [start, end) overlaps any existing entry for the user.
     * Null end is treated as infinity (open entry).
     * Optionally exclude a time entry ID (for updates).
     *
     * Overlap: oldStart < newEnd AND (oldEnd > newStart), with null end = infinity.
     */
    public function hasOverlap(
        User $user,
        Carbon $newStart,
        ?Carbon $newEnd,
        ?int $excludeTimeEntryId = null
    ): bool {
        $query = TimeEntry::where('user_id', $user->id);

        if ($excludeTimeEntryId !== null) {
            $query->where('id', '!=', $excludeTimeEntryId);
        }

        $existing = $query->get();

        foreach ($existing as $entry) {
            $oldStart = $entry->started_at->copy()->setTimezone('UTC');
            $oldEnd = $entry->ended_at !== null ? $entry->ended_at->copy()->setTimezone('UTC') : null;
            $newEndVal = $newEnd !== null ? $newEnd->copy()->setTimezone('UTC') : null;

            // oldStart < newEnd (treat null newEnd as infinity, so always true)
            if ($newEndVal !== null && $oldStart->gte($newEndVal)) {
                continue;
            }
            // oldEnd > newStart (treat null oldEnd as infinity, so always true)
            if ($oldEnd === null) {
                return true; // open entry: oldEnd is infinity, so overlaps if we passed first check
            }
            if ($oldEnd->lte($newStart->copy()->setTimezone('UTC'))) {
                continue;
            }
            return true;
        }

        return false;
    }

    /**
     * Update a time entry. Validates no overlap and optional open-entry uniqueness.
     *
     * @param  array{started_at: string, ended_at?: string|null, start_lat?: float|null, start_lng?: float|null, end_lat?: float|null, end_lng?: float|null}  $data
     * @throws ValidationException
     */
    public function update(TimeEntry $entry, array $data): TimeEntry
    {
        $user = $entry->user;
        $newStart = isset($data['started_at'])
            ? Carbon::parse($data['started_at'])->setTimezone('UTC')
            : $entry->started_at->copy()->setTimezone('UTC');
        $newEnd = array_key_exists('ended_at', $data)
            ? ($data['ended_at'] === null ? null : Carbon::parse($data['ended_at'])->setTimezone('UTC'))
            : ($entry->ended_at?->copy()->setTimezone('UTC'));

        if ($newEnd !== null && ! $newEnd->gt($newStart)) {
            throw ValidationException::withMessages([
                'ended_at' => ['End time must be after start time.'],
            ]);
        }

        if ($newEnd === null) {
            $otherOpen = TimeEntry::where('user_id', $user->id)
                ->whereNull('ended_at')
                ->where('id', '!=', $entry->id)
                ->exists();
            if ($otherOpen) {
                throw ValidationException::withMessages([
                    'ended_at' => ['You already have another open time entry. Only one open entry is allowed.'],
                ]);
            }
        }

        if ($this->hasOverlap($user, $newStart, $newEnd, (int) $entry->id)) {
            throw ValidationException::withMessages([
                'started_at' => ['This time interval overlaps with an existing entry.'],
                'ended_at' => ['This time interval overlaps with an existing entry.'],
            ]);
        }

        $entry->update([
            'started_at' => $newStart,
            'ended_at' => $newEnd,
            'start_lat' => $data['start_lat'] ?? $entry->start_lat,
            'start_lng' => $data['start_lng'] ?? $entry->start_lng,
            'end_lat' => array_key_exists('end_lat', $data) ? $data['end_lat'] : $entry->end_lat,
            'end_lng' => array_key_exists('end_lng', $data) ? $data['end_lng'] : $entry->end_lng,
        ]);

        return $entry->fresh();
    }
}
