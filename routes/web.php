<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('app'));
Route::get('/login', fn () => view('app'));
Route::get('/entries', fn () => view('app'));
Route::get('/entries/{id}', fn () => view('app'));
Route::get('/profile', fn () => view('app'));

require __DIR__.'/auth.php';
