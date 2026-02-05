<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\TimeEntry */
class TimeEntryResource extends JsonResource
{
    private static function toIso8601(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        if ($value instanceof \DateTimeInterface) {
            return $value->format('c');
        }
        try {
            return Carbon::parse($value)->format('c');
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'started_at' => self::toIso8601($this->started_at),
            'ended_at' => self::toIso8601($this->ended_at),
            'start_lat' => $this->start_lat !== null ? (float) $this->start_lat : null,
            'start_lng' => $this->start_lng !== null ? (float) $this->start_lng : null,
            'end_lat' => $this->end_lat !== null ? (float) $this->end_lat : null,
            'end_lng' => $this->end_lng !== null ? (float) $this->end_lng : null,
            'created_at' => self::toIso8601($this->created_at ?? null),
            'updated_at' => self::toIso8601($this->updated_at ?? null),
        ];
    }
}
