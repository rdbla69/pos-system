<?php

require_once __DIR__ . '/_helpers.php';

$repo = new JobOrdersRepository($store);

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
    $data['status'] = $data['status'] ?? 'pending';
    // Front-end expects date_created
    $data['date_created'] = $data['date_created'] ?? date('Y-m-d');
    $created = $repo->create($data, $repo->seededAll());
    json_ok($created);
}

if ($method === 'PUT') {
    if (!$id) json_error('Missing id');
    $data = json_body();
    $updated = $repo->update($id, $data, $repo->seededAll());
    if (!$updated) json_error('Not found', 404);
    json_ok($updated);
}

if ($method === 'DELETE') {
    if (!$id) json_error('Missing id');
    $ok = $repo->delete($id, $repo->seededAll());
    if (!$ok) json_error('Not found', 404);
    json_ok(true);
}

json_error('Method not allowed', 405);
