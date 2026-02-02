<?php

namespace App\Http\Requests\TimeEntry;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTimeEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->can('update', $this->route('time_entry'));
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'started_at' => ['required', 'date'],
            'ended_at' => ['nullable', 'date', 'after:started_at'],
            'start_lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'start_lng' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'end_lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'end_lng' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
