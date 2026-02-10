<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['admin_name'])) {
    header('Location: login.php');
    exit();
}

$adminName = $_SESSION['admin_name'] ?? 'Admin';

// Load data from repository (JSON storage now, DB later)
require_once __DIR__ . '/../../bootstrap.php';
$inventoryRepo = new InventoryRepository($store);
$inventory = $inventoryRepo->seededAll();

// Stock movement placeholders (still static; wire to DB later)
$stockMovements = $store->read('stock_movements', []);

$pageTitle = "Inventory Management - Machine System POS";
ob_start();
?>

<div class="dashboard-container">
    <!-- Sidebar -->
    <nav class="sidebar">
        <div class="sidebar-header">
            <div class="logo">
                <i class="fas fa-cogs"></i>
                <h3>MACHINE POS</h3>
            </div>
        </div>
        
        <ul class="sidebar-menu">
            <li class="menu-item">
                <a href="dashboard.php" class="menu-link">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="pos.php" class="menu-link">
                    <i class="fas fa-cash-register"></i>
                    <span>POS</span>
                </a>
            </li>
            <li class="menu-item active">
                <a href="inventory.php" class="menu-link">
                    <i class="fas fa-boxes"></i>
                    <span>Inventory</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="workers.php" class="menu-link">
                    <i class="fas fa-users"></i>
                    <span>Workers</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="job-orders.php" class="menu-link">
                    <i class="fas fa-clipboard-list"></i>
                    <span>Job Orders</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="reports.php" class="menu-link">
                    <i class="fas fa-chart-bar"></i>
                    <span>Reports</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="messages.php" class="menu-link">
                    <i class="fas fa-comments"></i>
                    <span>Messages</span>
                </a>
            </li>
            <li class="menu-item">
                <a href="settings.php" class="menu-link">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
            </li>
            <li class="menu-item logout">
                <a href="logout.php" class="menu-link">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Header -->
        <header class="inventory-header">
            <div class="header-left">
                <div class="header-title">
                    <i class="fas fa-boxes"></i>
                    <div>
                        <h1>Inventory Management</h1>
                        <p class="date-time" id="dateTime"></p>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <button class="add-item-btn" id="addItemBtn">
                    <i class="fas fa-plus"></i> Add New Item
                </button>
                <div class="profile-info">
                    <i class="fas fa-user-circle"></i>
                    <span><?php echo htmlspecialchars($adminName); ?></span>
                </div>
            </div>
        </header>

        <!-- Inventory Content -->
        <div class="inventory-content">
            <!-- Low Stock Alerts -->
            <div class="alerts-section" id="lowStockAlerts" style="display:none;"></div>

            <!-- Search and Filters -->
            <div class="inventory-controls">
                <div class="search-filter-section">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="inventorySearch" placeholder="Search by name, SKU, or category..." autocomplete="off">
                    </div>
                    <div class="filter-group">
                        <select id="categoryFilter" class="filter-select">
                            <option value="all">All Categories</option>
                            <option value="Parts">Parts</option>
                            <option value="Service">Services</option>
                        </select>
                        <select id="statusFilter" class="filter-select">
                            <option value="all">All Status</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="critical">Critical</option>
                        </select>
                        <button class="filter-btn" id="exportBtn">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="quick-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value"><?php echo count($inventory); ?></span>
                            <span class="stat-label">Total Items</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value"><?php echo count(array_filter($inventory, fn($i) => $i['status'] === 'in_stock')); ?></span>
                            <span class="stat-label">In Stock</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value"><?php echo count(array_filter($inventory, fn($i) => $i['status'] === 'low_stock' || $i['status'] === 'critical')); ?></span>
                            <span class="stat-label">Low Stock</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">₱<?php echo number_format(array_sum(array_map(fn($i) => $i['quantity'] * $i['cost'], $inventory)), 2); ?></span>
                            <span class="stat-label">Total Value</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Grid -->
            <div class="inventory-grid">
                <!-- Inventory Table -->
                <div class="table-section">
                    <div class="table-header">
                        <h3><i class="fas fa-list"></i> Inventory Items</h3>
                        <div class="table-actions">
                            <button class="view-btn active" data-view="table">
                                <i class="fas fa-table"></i>
                            </button>
                            <button class="view-btn" data-view="grid">
                                <i class="fas fa-th"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="inventory-table" id="inventoryTable">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Cost</th>
                                    <th>Price</th>
                                    <th>Supplier</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($inventory as $item): ?>
                                <tr data-id="<?php echo $item['id']; ?>" data-category="<?php echo $item['category']; ?>" data-status="<?php echo $item['status']; ?>">
                                    <td><span class="sku-badge"><?php echo $item['sku']; ?></span></td>
                                    <td class="item-name"><?php echo htmlspecialchars($item['name']); ?></td>
                                    <td><span class="category-badge"><?php echo $item['category']; ?></span></td>
                                    <td class="quantity"><?php echo $item['quantity'] === 999 ? '∞' : $item['quantity']; ?></td>
                                    <td><?php echo $item['unit']; ?></td>
                                    <td>₱<?php echo number_format($item['cost'], 2); ?></td>
                                    <td class="price">₱<?php echo number_format($item['price'], 2); ?></td>
                                    <td><?php echo $item['supplier']; ?></td>
                                    <td>
                                        <span class="status-badge <?php echo $item['status']; ?>">
                                            <?php echo ucfirst(str_replace('_', ' ', $item['status'])); ?>
                                        </span>
                                    </td>
                                    <td class="actions">
                                        <button class="action-icon edit-btn" data-id="<?php echo $item['id']; ?>" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="action-icon adjust-btn" data-id="<?php echo $item['id']; ?>" title="Adjust Stock">
                                            <i class="fas fa-exchange-alt"></i>
                                        </button>
                                        <button class="action-icon delete-btn" data-id="<?php echo $item['id']; ?>" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Sidebar Panels -->
                <div class="sidebar-panels">
                    <!-- Stock Movement Log -->
                    <div class="panel-card">
                        <div class="panel-header">
                            <h3><i class="fas fa-history"></i> Stock Movements</h3>
                            <button class="panel-action" id="viewAllMovements">View All</button>
                        </div>
                        <div class="movement-list">
                            <?php foreach (array_slice($stockMovements, 0, 5) as $movement): ?>
                            <div class="movement-item">
                                <div class="movement-icon <?php echo $movement['type']; ?>">
                                    <i class="fas fa-<?php echo $movement['type'] === 'sale' ? 'arrow-down' : 'arrow-up'; ?>"></i>
                                </div>
                                <div class="movement-content">
                                    <h5><?php echo $movement['item']; ?></h5>
                                    <p><?php echo ucfirst($movement['type']); ?>: <?php echo $movement['quantity']; ?> units</p>
                                    <span class="movement-meta"><?php echo $movement['date']; ?> • <?php echo $movement['user']; ?></span>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Reports Section -->
                    <div class="panel-card">
                        <div class="panel-header">
                            <h3><i class="fas fa-chart-pie"></i> Quick Reports</h3>
                        </div>
                        <div class="report-options">
                            <button class="report-btn">
                                <i class="fas fa-file-pdf"></i>
                                <span>Inventory Report</span>
                            </button>
                            <button class="report-btn">
                                <i class="fas fa-chart-line"></i>
                                <span>Stock Movement</span>
                            </button>
                            <button class="report-btn">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Low Stock Items</span>
                            </button>
                            <button class="report-btn">
                                <i class="fas fa-dollar-sign"></i>
                                <span>Valuation Report</span>
                            </button>
                        </div>
                    </div>

                    <!-- ML Forecast Panel -->
                    <div class="panel-card ml-panel">
                        <div class="panel-header">
                            <h3><i class="fas fa-brain"></i> Smart Forecast</h3>
                        </div>
                        <div class="forecast-content">
                            <div class="forecast-item">
                                <div class="forecast-icon">
                                    <i class="fas fa-trending-up"></i>
                                </div>
                                <div class="forecast-info">
                                    <h5>High Demand Predicted</h5>
                                    <p>Brake Pads - Expected to run out in 7 days</p>
                                    <span class="forecast-action">Recommend ordering 20 units</span>
                                </div>
                            </div>
                            <div class="forecast-item">
                                <div class="forecast-icon">
                                    <i class="fas fa-lightbulb"></i>
                                </div>
                                <div class="forecast-info">
                                    <h5>Seasonal Trend</h5>
                                    <p>Air Filters sales increase by 25% this month</p>
                                    <span class="forecast-action">Stock up recommended</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Add/Edit Modal -->
<div class="modal" id="itemModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle"><i class="fas fa-plus"></i> Add New Item</h3>
            <button class="close-modal" id="closeModal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="itemForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>SKU</label>
                        <input type="text" id="itemSku" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>Item Name</label>
                        <input type="text" id="itemName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="itemCategory" class="form-input" required>
                            <option value="Parts">Parts</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" id="itemQuantity" class="form-input" required min="0">
                    </div>
                    <div class="form-group">
                        <label>Unit</label>
                        <input type="text" id="itemUnit" class="form-input" placeholder="e.g., piece, set, liter" required>
                    </div>
                    <div class="form-group">
                        <label>Cost Price</label>
                        <input type="number" id="itemCost" class="form-input" required min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Selling Price</label>
                        <input type="number" id="itemPrice" class="form-input" required min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Supplier</label>
                        <input type="text" id="itemSupplier" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>Reorder Level</label>
                        <input type="number" id="itemReorder" class="form-input" required min="0">
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="cancelBtn">Cancel</button>
                    <button type="submit" class="btn-primary">Save Item</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php
$content = ob_get_clean();
include '../layouts/dashboard-layout.php';
?>

