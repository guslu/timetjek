<?php

use App\Http\Controllers\Api\TimeEntryController;
use App\Http\Controllers\Api\UserPasswordController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::put('/user/password', [UserPasswordController::class, 'update'])
        ->name('user.password.update');

    Route::post('/time-entries/clock-in', [TimeEntryController::class, 'clockIn'])
        ->name('time-entries.clock-in');
    Route::post('/time-entries/clock-out', [TimeEntryController::class, 'clockOut'])
        ->name('time-entries.clock-out');
    Route::get('/time-entries/current', [TimeEntryController::class, 'current'])
        ->name('time-entries.current');
    Route::get('/time-entries', [TimeEntryController::class, 'index'])
        ->name('time-entries.index');
    Route::get('/time-entries/{timeEntry}', [TimeEntryController::class, 'show'])
        ->name('time-entries.show');
    Route::put('/time-entries/{timeEntry}', [TimeEntryController::class, 'update'])
        ->name('time-entries.update');
});
