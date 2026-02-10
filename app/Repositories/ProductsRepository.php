<?php

class ProductsRepository extends BaseRepository
{
    public function __construct(JsonStore $store)
    {
        parent::__construct($store, 'products');
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
                'price' => 55.0,
                'stock' => 120
            ],
            [
                'id' => 2,
                'sku' => 'MCH-0002',
                'name' => 'Welding Rod 2.5mm',
                'category' => 'Materials',
                'price' => 210.0,
                'stock' => 40
            ]
        ];
    }
}
