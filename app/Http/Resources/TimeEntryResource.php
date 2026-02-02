<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\TimeEntry */
class TimeEntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'started_at' => $this->started_at?->toIso8601String(),
            'ended_at' => $this->ended_at?->toIso8601String(),
            'start_lat' => $this->start_lat !== null ? (float) $this->start_lat : null,
            'start_lng' => $this->start_lng !== null ? (float) $this->start_lng : null,
            'end_lat' => $this->end_lat !== null ? (float) $this->end_lat : null,
            'end_lng' => $this->end_lng !== null ? (float) $this->end_lng : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
