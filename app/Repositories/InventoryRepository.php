<?php

class InventoryRepository extends BaseRepository
{
    public function __construct(JsonStore $store)
    {
        parent::__construct($store, 'inventory');
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
                'sku' => 'MCH-0001',
                'name' => 'Cutting Disc 4"',
                'category' => 'Tools',
                'quantity' => 120,
                'unit' => 'pcs',
                'cost' => 35.0,
                'price' => 55.0,
                'supplier' => 'Metro Supply',
                'reorder_level' => 30,
                'status' => 'in_stock'
            ],
            [
                'id' => 2,
                'sku' => 'MCH-0002',
                'name' => 'Welding Rod 2.5mm',
                'category' => 'Materials',
                'quantity' => 40,
                'unit' => 'packs',
                'cost' => 150.0,
                'price' => 210.0,
                'supplier' => 'SteelWorks Trading',
                'reorder_level' => 50,
                'status' => 'low_stock'
            ],
            [
                'id' => 3,
                'sku' => 'MCH-0003',
                'name' => 'Bearing 6202',
                'category' => 'Parts',
                'quantity' => 0,
                'unit' => 'pcs',
                'cost' => 60.0,
                'price' => 95.0,
                'supplier' => 'Prime Bearings',
                'reorder_level' => 20,
                'status' => 'out_of_stock'
            ]
        ];
    }
}
