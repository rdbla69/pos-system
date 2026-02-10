<?php

class WorkersRepository extends BaseRepository
{
    public function __construct(JsonStore $store)
    {
        parent::__construct($store, 'workers');
    }

    /** @return array<int, array<string, mixed>> */
    public function seededAll(): array
    {
        return $this->all($this->seed());
    }

    /** @return array<int, array<string, mixed>> */
    private function seed(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'Juan Dela Cruz',
                'role' => 'Cashier',
                'email' => 'juan@example.com',
                'phone' => '0917-000-0001',
                'status' => 'active',
                'created_at' => date('Y-m-d')
            ],
            [
                'id' => 2,
                'name' => 'Maria Santos',
                'role' => 'Inventory Clerk',
                'email' => 'maria@example.com',
                'phone' => '0917-000-0002',
                'status' => 'active',
                'created_at' => date('Y-m-d')
            ]
        ];
    }
}
