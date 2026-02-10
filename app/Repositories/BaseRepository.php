<?php

abstract class BaseRepository
{
    protected JsonStore $store;
    protected string $key;

    public function __construct(JsonStore $store, string $key)
    {
        $this->store = $store;
        $this->key = $key;
    }

    /** @return array<int, array<string, mixed>> */
    public function all(array $seed = []): array
    {
        $items = $this->store->read($this->key, $seed);
        return is_array($items) ? $items : $seed;
    }

    /** @return array<string, mixed>|null */
    public function find(int $id, array $seed = []): ?array
    {
        foreach ($this->all($seed) as $item) {
            if (isset($item['id']) && (int)$item['id'] === $id) {
                return $item;
            }
        }
        return null;
    }

    /** @param array<string, mixed> $data */
    public function create(array $data, array $seed = []): array
    {
        $items = $this->all($seed);
        $data['id'] = $this->nextId($items);
        $items[] = $data;
        $this->store->write($this->key, $items);
        return $data;
    }

    /** @param array<string, mixed> $data */
    public function update(int $id, array $data, array $seed = []): ?array
    {
        $items = $this->all($seed);
        $found = false;
        foreach ($items as $idx => $item) {
            if (isset($item['id']) && (int)$item['id'] === $id) {
                $data['id'] = $id;
                $items[$idx] = array_merge($item, $data);
                $found = true;
                break;
            }
        }
        if (!$found) {
            return null;
        }
        $this->store->write($this->key, $items);
        return $this->find($id, $seed);
    }

    public function delete(int $id, array $seed = []): bool
    {
        $items = $this->all($seed);
        $before = count($items);
        $items = array_values(array_filter($items, fn($i) => (int)($i['id'] ?? -1) !== $id));
        if (count($items) === $before) {
            return false;
        }
        $this->store->write($this->key, $items);
        return true;
    }

    /** @param array<int, array<string, mixed>> $items */
    protected function nextId(array $items): int
    {
        $max = 0;
        foreach ($items as $i) {
            $max = max($max, (int)($i['id'] ?? 0));
        }
        return $max + 1;
    }
}
