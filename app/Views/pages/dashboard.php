<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['admin_name'])) {
    header('Location: login.php');
    exit();
}

// Data placeholders (connect to DB/backend later)
$adminName = $_SESSION['admin_name'] ?? 'Admin';
$totalSalesToday = 0;
$transactionsToday = 0;
$lowStockItems = 0;
$predictedSales = 0;

// Chart placeholders
$dailySales = [];
$salesByCategory = [];

$pageTitle = "Admin Dashboard - Machine System POS";
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
            <li class="menu-item active">
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
        <header class="dashboard-header">
            <div class="header-left">
                <h1>Dashboard</h1>
                <p class="date-time" id="dateTime"></p>
            </div>
            <div class="header-right">
                <div class="notifications">
                    <i class="fas fa-bell"></i>
                    <span class="badge" style="display:none;">0</span>
                </div>
                <div class="profile-dropdown">
                    <div class="profile-info">
                        <i class="fas fa-user-circle"></i>
                        <span><?php echo htmlspecialchars($adminName); ?></span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu">
                        <a href="profile.php"><i class="fas fa-user"></i> Profile</a>
                        <a href="settings.php"><i class="fas fa-cog"></i> Settings</a>
                        <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            </div>
        </header>

        <!-- Dashboard Content -->
        <div class="dashboard-content">
            <!-- Summary Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="summary-card sales">
                        <div class="card-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="card-content">
                            <h3>₱<?php echo number_format($totalSalesToday, 2); ?></h3>
                            <p>Total Sales Today</p>
                            <span class="trend">—</span>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="summary-card transactions">
                        <div class="card-icon">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <div class="card-content">
                            <h3><?php echo $transactionsToday; ?></h3>
                            <p>Transactions</p>
                            <span class="trend">—</span>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="summary-card inventory">
                        <div class="card-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="card-content">
                            <h3><?php echo $lowStockItems; ?></h3>
                            <p>Low Stock Items</p>
                            <span class="trend">—</span>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="summary-card forecast">
                        <div class="card-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="card-content">
                            <h3>₱<?php echo number_format($predictedSales, 2); ?></h3>
                            <p>Predicted Sales</p>
                            <span class="trend">—</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="row mb-4">
                <div class="col-xl-8 col-lg-7 mb-3">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4>Daily Sales</h4>
                            <div class="chart-controls">
                                <select class="form-select form-select-sm">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>Last 3 Months</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="dailySalesChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-5 mb-3">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4>Sales by Category</h4>
                        </div>
                        <div class="chart-container">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="row">
                <div class="col-12">
                    <div class="activity-card">
                        <div class="card-header">
                            <h4>Recent Activity</h4>
                            <a href="reports.php" class="btn btn-outline-primary btn-sm">View All</a>
                        </div>
                        <div class="activity-list">
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p>No recent activity yet.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Page Data (connect to DB/backend later) -->
<script>
  window.DASHBOARD_DATA = {
    dailySales: <?php echo json_encode($dailySales, JSON_UNESCAPED_UNICODE); ?>,
    salesByCategory: <?php echo json_encode($salesByCategory, JSON_UNESCAPED_UNICODE); ?>
  };
</script>

<!-- Footer -->
<footer class="dashboard-footer">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 text-center">
                <p>&copy; 2025 INNOVATIVE MACHINE POS SYSTEM v1.0.0 - All Rights Reserved</p>
            </div>
        </div>
    </div>
</footer>

<?php
$content = ob_get_clean();
include '../layouts/dashboard-layout.php';
?>
