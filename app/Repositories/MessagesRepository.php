<?php

class MessagesRepository extends BaseRepository
{
    public function __construct(JsonStore $store)
    {
        parent::__construct($store, 'messages');
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
                'from' => 'System',
                'subject' => 'Welcome',
                'message' => 'Your POS is ready. This is a seeded message stored in JSON.',
                'created_at' => date('Y-m-d H:i:s'),
                'read' => false
            ]
        ];
    }
}
