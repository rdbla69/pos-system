<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../app/bootstrap.php';

function json_ok($data = null): void
{
    echo json_encode(['ok' => true, 'data' => $data, 'error' => null], JSON_UNESCAPED_UNICODE);
    exit();
}

function json_error(string $message, int $code = 400): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'data' => null, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

/** @return array<string, mixed> */
function json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
