<?php

require_once __DIR__ . '/_helpers.php';

$repo = new TransactionsRepository($store);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($method === 'GET') {
    if ($id) {
        $item = $repo->find($id, $repo->seededAll());
        if (!$item) json_error('Not found', 404);
        json_ok($item);
    }
    json_ok($repo->seededAll());
}

if ($method === 'POST') {
    $data = json_body();
    $data['created_at'] = $data['created_at'] ?? date('Y-m-d H:i:s');
    $created = $repo->create($data, $repo->seededAll());
    json_ok($created);
}

if ($method === 'DELETE') {
    if (!$id) json_error('Missing id');
    $ok = $repo->delete($id, $repo->seededAll());
    if (!$ok) json_error('Not found', 404);
    json_ok(true);
}

json_error('Method not allowed', 405);
