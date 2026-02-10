<?php

class TransactionsRepository extends BaseRepository
{
    public function __construct(JsonStore $store)
    {
        parent::__construct($store, 'transactions');
    }

    /** @return array<int, array<string, mixed>> */
    public function seededAll(): array
    {
        return $this->all([]);
    }
}
