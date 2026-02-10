<?php

/**
 * Tiny JSON-file store to make the front-end "DB-ready" without adding a database yet.
 *
 * Swap this later with a PDO/MySQL implementation (same repository interface).
 */
class JsonStore
{
    private string $storageDir;

    public function __construct(string $storageDir)
    {
        $this->storageDir = rtrim($storageDir, DIRECTORY_SEPARATOR);
        if (!is_dir($this->storageDir)) {
            mkdir($this->storageDir, 0775, true);
        }
    }

    private function path(string $name): string
    {
        // Only allow simple file keys
        $safe = preg_replace('/[^a-zA-Z0-9_\-]/', '', $name);
        return $this->storageDir . DIRECTORY_SEPARATOR . $safe . '.json';
    }

    /**
     * @return array<mixed>
     */
    public function read(string $name, array $default = []): array
    {
        $path = $this->path($name);
        if (!file_exists($path)) {
            $this->write($name, $default);
            return $default;
        }

        $raw = file_get_contents($path);
        if ($raw === false || trim($raw) === '') {
            return $default;
        }

        $data = json_decode($raw, true);
        return is_array($data) ? $data : $default;
    }

    public function write(string $name, array $data): void
    {
        $path = $this->path($name);
        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}
