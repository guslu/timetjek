<?php

use App\Http\Controllers\Api\TimeEntryController;
use App\Http\Controllers\Api\UserPasswordController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());

    Route::controller(UserPasswordController::class)->group(function () {
        Route::put('/user/password', 'update')->name('user.password.update');
    });

    Route::prefix('time-entries')->controller(TimeEntryController::class)->group(function () {
        Route::post('clock-in', 'clockIn')->name('time-entries.clock-in');
        Route::post('clock-out', 'clockOut')->name('time-entries.clock-out');
        Route::get('current', 'current')->name('time-entries.current');
        Route::get('/', 'index')->name('time-entries.index');
        Route::get('{timeEntry}', 'show')->name('time-entries.show');
        Route::put('{timeEntry}', 'update')->name('time-entries.update');
    });
});
