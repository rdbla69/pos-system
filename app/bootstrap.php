<?php

// Minimal bootstrap (no framework). Keeps includes in one place.

require_once __DIR__ . '/Core/JsonStore.php';
require_once __DIR__ . '/Repositories/BaseRepository.php';
require_once __DIR__ . '/Repositories/InventoryRepository.php';
require_once __DIR__ . '/Repositories/WorkersRepository.php';
require_once __DIR__ . '/Repositories/JobOrdersRepository.php';
require_once __DIR__ . '/Repositories/MessagesRepository.php';
require_once __DIR__ . '/Repositories/ProductsRepository.php';
require_once __DIR__ . '/Repositories/TransactionsRepository.php';

// Shared store instance
$store = new JsonStore(__DIR__ . '/../storage');
