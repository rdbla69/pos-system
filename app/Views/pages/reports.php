<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['admin_name'])) {
    header('Location: login.php');
    exit();
}

$adminName = $_SESSION['admin_name'] ?? 'Admin';

// Data placeholders (connect to DB/backend later)
$salesData = [];

$servicesData = [];


// Totals (computed from data; 0.00 when no records)
$salesTotal = 0.0;
foreach ($salesData as $sale) {
    $salesTotal += (float)($sale['total'] ?? 0);
}

$servicesTotal = 0.0;
foreach ($servicesData as $service) {
    $servicesTotal += (float)($service['amount'] ?? 0);
}

$pageTitle = "Reports & Analytics - Machine System POS";
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
            <li class="menu-item active">
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
        <header class="reports-header">
            <div class="header-left">
                <div class="header-title">
                    <i class="fas fa-chart-line"></i>
                    <div>
                        <h1>Reports & Analytics</h1>
                        <p class="date-time" id="dateTime"></p>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <div class="profile-info">
                    <i class="fas fa-user-circle"></i>
                    <span><?php echo htmlspecialchars($adminName); ?></span>
                </div>
            </div>
        </header>

        <!-- Reports Content -->
        <div class="reports-content">
            <!-- Date Range & Filters -->
            <div class="filters-section">
                <div class="date-range">
                    <label><i class="fas fa-calendar"></i> Date Range:</label>
                    <input type="date" id="startDate" class="date-input" value="<?php echo date('Y-m-d'); ?>">
                    <span>to</span>
                    <input type="date" id="endDate" class="date-input" value="<?php echo date('Y-m-d'); ?>">
                    <button class="apply-btn" id="applyFilter">
                        <i class="fas fa-check"></i> Apply
                    </button>
                </div>
                <div class="report-filters">
                    <select id="reportType" class="filter-select">
                        <option value="all">All Reports</option>
                        <option value="sales">Sales Only</option>
                        <option value="services">Services Only</option>
                    </select>
                    <select id="paymentMethod" class="filter-select">
                        <option value="all">All Payments</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Digital">Digital</option>
                    </select>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="summary-section">
                <div class="summary-card sales">
                    <div class="card-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="card-content">
                        <h3 id="totalSales">₱0.00</h3>
                        <p>Total Sales</p>
                        <span class="trend">—</span>
                    </div>
                </div>
                <div class="summary-card customers">
                    <div class="card-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="card-content">
                        <h3 id="totalCustomers">0</h3>
                        <p>Total Customers</p>
                        <span class="trend">—</span>
                    </div>
                </div>
                <div class="summary-card services">
                    <div class="card-icon">
                        <i class="fas fa-tools"></i>
                    </div>
                    <div class="card-content">
                        <h3 id="totalServices">0</h3>
                        <p>Services Rendered</p>
                        <span class="trend">—</span>
                    </div>
                </div>
                <div class="summary-card avg">
                    <div class="card-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="card-content">
                        <h3 id="avgTransaction">₱0.00</h3>
                        <p>Avg Transaction</p>
                        <span class="trend">—</span>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3><i class="fas fa-chart-line"></i> Sales Trend</h3>
                        <select class="chart-filter">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                        </select>
                    </div>
                    <div class="chart-container">
                        <canvas id="salesTrendChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h3><i class="fas fa-chart-pie"></i> Payment Methods</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="paymentMethodChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Report Tables -->
            <div class="tables-section">
                <!-- Sales Report Table -->
                <div class="report-table-card">
                    <div class="table-header">
                        <h3><i class="fas fa-receipt"></i> Sales Report</h3>
                        <div class="export-buttons">
                            <button class="export-btn pdf" id="exportSalesPDF">
                                <i class="fas fa-file-pdf"></i> PDF
                            </button>
                            <button class="export-btn excel" id="exportSalesExcel">
                                <i class="fas fa-file-excel"></i> Excel
                            </button>
                            <button class="export-btn print" id="printSales">
                                <i class="fas fa-print"></i> Print
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="report-table" id="salesTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Subtotal</th>
                                    <th>Tax</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($salesData)): ?>
                                <tr>
                                    <td colspan="8" class="text-center">No data yet</td>
                                </tr>
                                <?php else: ?>
<?php foreach ($salesData as $sale): ?>
                                <tr>
                                    <td><?php echo date('M d, Y', strtotime($sale['date'])); ?></td>
                                    <td><span class="txn-badge"><?php echo $sale['transaction_id']; ?></span></td>
                                    <td><?php echo $sale['customer']; ?></td>
                                    <td><?php echo $sale['items']; ?></td>
                                    <td>₱<?php echo number_format($sale['subtotal'], 2); ?></td>
                                    <td>₱<?php echo number_format($sale['tax'], 2); ?></td>
                                    <td class="total">₱<?php echo number_format($sale['total'], 2); ?></td>
                                    <td><span class="payment-badge"><?php echo $sale['payment_method']; ?></span></td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
</tbody>
                            <?php if (!empty($salesData)): ?>
<tfoot>
                                <tr class="total-row">
                                    <td colspan="6"><strong>TOTAL</strong></td>
                                    <td class="total"><strong>₱<?php echo number_format($salesTotal, 2); ?></strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
<?php endif; ?>
                        </table>
                    </div>
                </div>

                <!-- Services Report Table -->
                <div class="report-table-card">
                    <div class="table-header">
                        <h3><i class="fas fa-tools"></i> Services Report</h3>
                        <div class="export-buttons">
                            <button class="export-btn pdf" id="exportServicesPDF">
                                <i class="fas fa-file-pdf"></i> PDF
                            </button>
                            <button class="export-btn excel" id="exportServicesExcel">
                                <i class="fas fa-file-excel"></i> Excel
                            </button>
                            <button class="export-btn print" id="printServices">
                                <i class="fas fa-print"></i> Print
                            </button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="report-table" id="servicesTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Service ID</th>
                                    <th>Service Name</th>
                                    <th>Technician</th>
                                    <th>Customer</th>
                                    <th>Duration</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($servicesData)): ?>
                                <tr>
                                    <td colspan="8" class="text-center">No data yet</td>
                                </tr>
                                <?php else: ?>
<?php foreach ($servicesData as $service): ?>
                                <tr>
                                    <td><?php echo date('M d, Y', strtotime($service['date'])); ?></td>
                                    <td><span class="srv-badge"><?php echo $service['service_id']; ?></span></td>
                                    <td><?php echo $service['service_name']; ?></td>
                                    <td><?php echo $service['technician']; ?></td>
                                    <td><?php echo $service['customer']; ?></td>
                                    <td><?php echo $service['duration']; ?></td>
                                    <td class="amount">₱<?php echo number_format($service['amount'], 2); ?></td>
                                    <td><span class="status-badge completed"><?php echo $service['status']; ?></span></td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
</tbody>
                            <?php if (!empty($servicesData)): ?>
<tfoot>
                                <tr class="total-row">
                                    <td colspan="6"><strong>TOTAL</strong></td>
                                    <td class="amount"><strong>₱<?php echo number_format($servicesTotal, 2); ?></strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
<?php endif; ?>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Predictive Insights -->
            <div class="insights-section">
                <div class="insights-card">
                    <div class="insights-header">
                        <h3><i class="fas fa-brain"></i> Predictive Insights & Recommendations</h3>
                        <span class="ai-badge">AI-Powered</span>
                    </div>
                    <div class="insights-content">
                        <div class="empty-state">
                            <i class="fas fa-lightbulb"></i>
                            <p>No insights yet.</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Page Data (connect to DB/backend later) -->
<script>
  window.REPORTS_DATA = {
    salesTrend: <?php echo json_encode($salesData, JSON_UNESCAPED_UNICODE); ?>,
    paymentMethods: <?php echo json_encode($servicesData, JSON_UNESCAPED_UNICODE); ?>
  };
</script>

<?php
$content = ob_get_clean();
include '../layouts/dashboard-layout.php';
?>

