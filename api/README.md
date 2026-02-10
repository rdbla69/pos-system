# API (JSON storage scaffold)

This project previously used in-page placeholder arrays and browser-only state.

To make the UI **ready for database integration (without adding a database yet)**, this folder provides a small JSON-based API layer.

## What you get

- A consistent API response format (`{ ok, data, error }`).
- JSON-file persistence in `storage/` (easy to swap to MySQL later).
- CRUD endpoints for:
  - Inventory (`/api/inventory.php`)
  - Workers (`/api/workers.php`)
  - Job Orders (`/api/job_orders.php`)
  - Messages (`/api/messages.php`)
  - Products (`/api/products.php`) (used by POS)
  - POS Transactions (`/api/transactions.php`)

## Database later

When you're ready to connect MySQL, replace the repository methods in `app/Repositories/*Repository.php` to use PDO queries instead of JSON files.
