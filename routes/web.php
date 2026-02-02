<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth.web')->group(function () {
    Route::view('/', 'app')->name('dashboard');
    Route::view('/entries', 'app');
    Route::view('/entries/{id}', 'app');
    Route::view('/profile', 'app');
});

Route::view('/login', 'app')->name('login');

require __DIR__.'/auth.php';
