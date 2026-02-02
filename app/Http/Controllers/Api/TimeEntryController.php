<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TimeEntry\ClockInRequest;
use App\Http\Requests\TimeEntry\ClockOutRequest;
use App\Http\Requests\TimeEntry\UpdateTimeEntryRequest;
use App\Http\Resources\TimeEntryResource;
use App\Models\TimeEntry;
use App\Services\TimeEntryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TimeEntryController extends Controller
{
    public function __construct(
        private TimeEntryService $timeEntryService
    ) {}

    public function clockIn(ClockInRequest $request): JsonResponse
    {
        $user = $request->user();
        $entry = $this->timeEntryService->clockIn(
            $user,
            $request->input('lat'),
            $request->input('lng')
        );
        return response()->json(new TimeEntryResource($entry), 201);
    }

    public function clockOut(ClockOutRequest $request): JsonResponse
    {
        $user = $request->user();
        $entry = $this->timeEntryService->clockOut(
            $user,
            $request->input('lat'),
            $request->input('lng')
        );
        return response()->json(new TimeEntryResource($entry));
    }

    public function current(Request $request): JsonResponse|TimeEntryResource
    {
        $user = $request->user();
        $entry = $this->timeEntryService->getOpenEntry($user);
        if ($entry === null) {
            return response()->json(['data' => null]);
        }
        return new TimeEntryResource($entry);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $this->authorize('viewAny', TimeEntry::class);

        $entries = TimeEntry::where('user_id', $user->id)
            ->orderBy('started_at', 'desc')
            ->paginate(15);

        return TimeEntryResource::collection($entries);
    }

    public function show(Request $request, TimeEntry $timeEntry): TimeEntryResource
    {
        $this->authorize('view', $timeEntry);
        return new TimeEntryResource($timeEntry);
    }

    public function update(UpdateTimeEntryRequest $request, TimeEntry $timeEntry): TimeEntryResource
    {
        $entry = $this->timeEntryService->update($timeEntry, $request->validated());
        return new TimeEntryResource($entry);
    }
}
