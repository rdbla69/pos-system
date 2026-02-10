<?php

class JobOrdersRepository extends BaseRepository
{
    public function __construct(JsonStore $store)
    {
        parent::__construct($store, 'job_orders');
    }

    /**
     * Return job orders with a stable, UI-friendly schema.
     *
     * Normalizes any legacy keys so the UI doesn't render "undefined" or "Invalid Date".
     *
     * @return array<int, array<string, mixed>>
     */
    public function seededAll(): array
    {
        $items = $this->all($this->seed());

        // Normalize schema for front-end expectations
        $normalized = [];
        foreach ($items as $item) {
            if (!is_array($item)) continue;

            $normalized[] = [
                'id' => (int)($item['id'] ?? 0),

                // Prefer current key, fall back to legacy key(s)
                'job_id' => (string)($item['job_id'] ?? $item['job_no'] ?? ''),

                'customer_name' => (string)($item['customer_name'] ?? $item['customer'] ?? ''),
                'contact' => (string)($item['contact'] ?? ''),

                'vehicle_plate' => (string)($item['vehicle_plate'] ?? ''),
                'vehicle_model' => (string)($item['vehicle_model'] ?? ''),
                'vehicle_type' => (string)($item['vehicle_type'] ?? ''),

                'services' => (string)($item['services'] ?? $item['description'] ?? ''),
                'parts' => (string)($item['parts'] ?? 'None'),

                // UI label is "Assigned Worker(s)"
                'workers' => (string)($item['workers'] ?? $item['assigned_to'] ?? 'Unassigned'),

                'notes' => (string)($item['notes'] ?? ''),
                'status' => (string)($item['status'] ?? 'pending'),

                // Prefer date_created for UI; fall back to created_at
                'date_created' => (string)($item['date_created'] ?? $item['created_at'] ?? ''),
            ];
        }

        return $normalized;
    }

    /**
     * Default seed is intentionally empty.
     * A "fake" record causes confusing placeholders in the UI.
     *
     * @return array<int, array<string, mixed>>
     */
    private function seed(): array
    {
        return [];
    }
}
