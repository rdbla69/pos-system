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
$productsRepo = new ProductsRepository($store);
$products = $productsRepo->seededAll();

$pageTitle = "POS System - Machine System POS";
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
            <li class="menu-item active">
                <a href="pos.php" class="menu-link">
                    <i class="fas fa-cash-register"></i>
                    <span>POS</span>
                </a>
            </li>
            <li class="menu-item">
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
        <header class="pos-header">
            <div class="header-left">
                <div class="logo-section">
                    <i class="fas fa-cash-register"></i>
                    <div>
                        <h1>Point of Sale</h1>
                        <p class="date-time" id="dateTime"></p>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <div class="header-stats">
                    <div class="stat-item">
                        <span class="stat-label">Today's Sales</span>
                        <span class="stat-value" id="todaySales">₱0.00</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Transactions</span>
                        <span class="stat-value" id="transactionCount">0</span>
                    </div>
                </div>
                <div class="profile-info">
                    <i class="fas fa-user-circle"></i>
                    <span><?php echo htmlspecialchars($adminName); ?></span>
                </div>
            </div>
        </header>

        <!-- POS Content -->
        <div class="pos-content">
            <div class="pos-grid">
                <!-- Left Section: Products & Search -->
                <div class="pos-left">
                    <!-- Search & Filters -->
                    <div class="search-section">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="productSearch" placeholder="Search products or services..." autocomplete="off">
                        </div>
                        <div class="filter-buttons">
                            <button class="filter-btn active" data-category="all">
                                <i class="fas fa-th"></i> All
                            </button>
                            <button class="filter-btn" data-category="Parts">
                                <i class="fas fa-cog"></i> Parts
                            </button>
                            <button class="filter-btn" data-category="Service">
                                <i class="fas fa-tools"></i> Services
                            </button>
                        </div>
                    </div>

                    <!-- Products Grid -->
                    <div class="products-grid" id="productsGrid">
                        <?php foreach ($products as $product): ?>
                        <div class="product-card" data-id="<?php echo (int)$product['id']; ?>" data-name="<?php echo htmlspecialchars($product['name'], ENT_QUOTES); ?>" data-price="<?php echo (float)$product['price']; ?>" data-category="<?php echo $product['category']; ?>">
                            <div class="product-icon">
                                <i class="fas fa-<?php echo $product['category'] === 'Service' ? 'tools' : 'cog'; ?>"></i>
                            </div>
                            <div class="product-info">
                                <h4><?php echo htmlspecialchars($product['name']); ?></h4>
                                <p class="product-category"><?php echo $product['category']; ?></p>
                                <p class="product-stock">Stock: <?php echo $product['stock'] === 999 ? '∞' : $product['stock']; ?></p>
                            </div>
                            <div class="product-price">
                                <span>₱<?php echo number_format($product['price'], 2); ?></span>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Right Section: Cart & Payment -->
                <div class="pos-right">
                    <!-- Customer Info -->
                    <div class="customer-section">
                        <h3><i class="fas fa-user"></i> Customer Information</h3>
                        <div class="customer-form">
                            <input type="text" id="customerName" placeholder="Customer Name" class="form-input">
                            <input type="tel" id="customerPhone" placeholder="Phone Number" class="form-input">
                        </div>
                    </div>

                    <!-- Cart Section -->
                    <div class="cart-section">
                        <div class="cart-header">
                            <h3><i class="fas fa-shopping-cart"></i> Cart Items</h3>
                            <button class="clear-cart-btn" id="clearCart">
                                <i class="fas fa-trash"></i> Clear
                            </button>
                        </div>
                        <div class="cart-items" id="cartItems">
                            <div class="empty-cart">
                                <i class="fas fa-shopping-cart"></i>
                                <p>No items in cart</p>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Section -->
                    <div class="payment-section">
                        <div class="payment-summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span id="subtotal">₱0.00</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax (10%):</span>
                                <span id="tax">₱0.00</span>
                            </div>
                            <div class="summary-row">
                                <span>Discount:</span>
                                <div class="discount-input">
                                    <input type="number" id="discount" value="0" min="0" max="100" class="form-input-sm">
                                    <span>%</span>
                                </div>
                            </div>
                            <div class="summary-row total">
                                <span>Total:</span>
                                <span id="total">₱0.00</span>
                            </div>
                        </div>

                        <div class="payment-methods">
                            <button class="payment-btn active" data-method="cash">
                                <i class="fas fa-money-bill-wave"></i> Cash
                            </button>
                            <button class="payment-btn" data-method="card">
                                <i class="fas fa-credit-card"></i> Card
                            </button>
                            <button class="payment-btn" data-method="digital">
                                <i class="fas fa-mobile-alt"></i> Digital
                            </button>
                        </div>

                        <div class="amount-input">
                            <label>Amount Received</label>
                            <input type="number" id="amountReceived" placeholder="0.00" class="form-input" step="0.01">
                            <div class="change-display">
                                <span>Change:</span>
                                <span id="change">₱0.00</span>
                            </div>
                        </div>

                        <button class="checkout-btn" id="checkoutBtn">
                            <i class="fas fa-check-circle"></i> Complete Transaction
                        </button>

                        <div class="receipt-actions">
                            <button class="action-btn" id="printReceipt">
                                <i class="fas fa-print"></i> Print
                            </button>
                            <button class="action-btn" id="emailReceipt">
                                <i class="fas fa-envelope"></i> Email
                            </button>
                            <button class="action-btn" id="smsReceipt">
                                <i class="fas fa-sms"></i> SMS
                            </button>
                        </div>
                    </div>

                    <!-- Quick Tools -->
                    <div class="quick-tools">
                        <button class="tool-btn" id="holdTransaction">
                            <i class="fas fa-pause"></i> Hold
                        </button>
                        <button class="tool-btn" id="newTransaction">
                            <i class="fas fa-plus"></i> New
                        </button>
                    </div>

                    <!-- ML Insights (Optional) -->
                    <div class="ml-insights">
                        <div class="insight-header">
                            <i class="fas fa-brain"></i>
                            <span>Smart Suggestions</span>
                        </div>
                        <div class="suggestions" id="mlSuggestions">
                            <div class="suggestion-item">
                                <i class="fas fa-lightbulb"></i>
                                <span>Customers buying Brake Pads often add Air Filter</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<?php
$content = ob_get_clean();
include '../layouts/dashboard-layout.php';
?>

