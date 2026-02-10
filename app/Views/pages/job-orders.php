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
$jobOrdersRepo = new JobOrdersRepository($store);
$jobOrders = $jobOrdersRepo->seededAll();

$pageTitle = "Job Orders - Machine System POS";
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
            <li class="menu-item active">
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
        <header class="job-orders-header">
            <div class="header-left">
                <div class="header-title">
                    <i class="fas fa-clipboard-list"></i>
                    <div>
                        <h1>Job Orders Management</h1>
                        <p class="date-time" id="dateTime"></p>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <button class="add-job-btn" id="addJobBtn">
                    <i class="fas fa-plus-circle"></i> Add New Job Order
                </button>
            </div>
        </header>

        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="summary-card">
                <div class="card-icon" style="background: #3b82f6;">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="card-info">
                    <h3 id="totalJobs">0</h3>
                    <p>Total Jobs</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon" style="background: #f59e0b;">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="card-info">
                    <h3 id="pendingJobs">0</h3>
                    <p>Pending</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon" style="background: #8b5cf6;">
                    <i class="fas fa-spinner"></i>
                </div>
                <div class="card-info">
                    <h3 id="ongoingJobs">0</h3>
                    <p>Ongoing</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon" style="background: #22c55e;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="card-info">
                    <h3 id="completedJobs">0</h3>
                    <p>Completed</p>
                </div>
            </div>
        </div>

        <!-- Search and Filter Section -->
        <div class="controls-section">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search by customer, vehicle, or job ID...">
            </div>
            <div class="filters">
                <select id="statusFilter" class="filter-select">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>

        <!-- Job Orders Table -->
        <div class="table-container">
            <table class="job-orders-table">
                <thead>
                    <tr>
                        <th>Job Order ID</th>
                        <th>Customer Name</th>
                        <th>Vehicle Info</th>
                        <th>Assigned Worker(s)</th>
                        <th>Status</th>
                        <th>Date Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="jobOrdersTableBody">
    <?php if (empty($jobOrders)): ?>
        <tr class="empty-row">
            <td colspan="7" style="text-align:center; padding: 1rem; opacity: .8;">
                No job orders yet
            </td>
        </tr>
    <?php else: ?>
        <?php foreach ($jobOrders as $job):
            $jobId = htmlspecialchars($job['job_id'] ?? '-', ENT_QUOTES, 'UTF-8');
            $customerName = htmlspecialchars($job['customer_name'] ?? '-', ENT_QUOTES, 'UTF-8');
            $contact = htmlspecialchars($job['contact'] ?? '-', ENT_QUOTES, 'UTF-8');
            $vehiclePlate = htmlspecialchars($job['vehicle_plate'] ?? '-', ENT_QUOTES, 'UTF-8');
            $vehicleModel = htmlspecialchars($job['vehicle_model'] ?? '-', ENT_QUOTES, 'UTF-8');
            $workers = htmlspecialchars($job['workers'] ?? 'Unassigned', ENT_QUOTES, 'UTF-8');
            $status = htmlspecialchars($job['status'] ?? 'pending', ENT_QUOTES, 'UTF-8');
            $rawDate = $job['date_created'] ?? '';
            $dateCreated = (!empty($rawDate) && strtotime($rawDate)) ? date('M d, Y', strtotime($rawDate)) : '-';
        ?>
        <tr data-job-id="<?php echo (int)($job['id'] ?? 0); ?>" data-status="<?php echo $status; ?>">
            <td><strong><?php echo $jobId; ?></strong></td>
            <td>
                <div class="customer-info">
                    <div class="customer-name"><?php echo $customerName; ?></div>
                    <div class="customer-contact"><?php echo $contact; ?></div>
                </div>
            </td>
            <td>
                <div class="vehicle-info">
                    <div class="vehicle-plate"><?php echo $vehiclePlate; ?></div>
                    <div class="vehicle-model"><?php echo $vehicleModel; ?></div>
                </div>
            </td>
            <td><?php echo $workers; ?></td>
            <td>
                <span class="status-badge status-<?php echo $status; ?>">
                    <?php echo ucfirst($status); ?>
                </span>
            </td>
            <td><?php echo $dateCreated; ?></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewJob(<?php echo (int)($job['id'] ?? 0); ?>)" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editJob(<?php echo (int)($job['id'] ?? 0); ?>)" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteJob(<?php echo (int)($job['id'] ?? 0); ?>)" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        <?php endforeach; ?>
    <?php endif; ?>
</tbody>
            </table>
        </div>
<div class="card-info">
                    <h3 id="totalJobs">0</h3>
                    <p>Total Jobs</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon" style="background: #f59e0b;">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="card-info">
                    <h3 id="pendingJobs">0</h3>
                    <p>Pending</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon" style="background: #8b5cf6;">
                    <i class="fas fa-spinner"></i>
                </div>
                <div class="card-info">
                    <h3 id="ongoingJobs">0</h3>
                    <p>Ongoing</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon" style="background: #22c55e;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="card-info">
                    <h3 id="completedJobs">0</h3>
                    <p>Completed</p>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Add/Edit Job Order Modal -->
<div class="modal" id="jobModal">
    <div class="modal-content modal-large">
        <div class="modal-header">
            <h2 id="modalTitle">Add New Job Order</h2>
            <button class="close-modal" onclick="closeJobModal()">&times;</button>
        </div>
        <form id="jobForm" class="modal-body">
            <input type="hidden" id="jobId">
            
            <!-- Customer Details Section -->
            <div class="form-section">
                <h3><i class="fas fa-user"></i> Customer Details</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="customerName">Customer Name <span class="required">*</span></label>
                        <input type="text" id="customerName" required>
                    </div>
                    <div class="form-group">
                        <label for="customerContact">Contact Number <span class="required">*</span></label>
                        <input type="tel" id="customerContact" placeholder="+63 XXX XXX XXXX" required>
                    </div>
                </div>
            </div>

            <!-- Vehicle Details Section -->
            <div class="form-section">
                <h3><i class="fas fa-car"></i> Vehicle Details</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="vehiclePlate">Plate Number <span class="required">*</span></label>
                        <input type="text" id="vehiclePlate" placeholder="ABC 1234" required>
                    </div>
                    <div class="form-group">
                        <label for="vehicleModel">Vehicle Model <span class="required">*</span></label>
                        <input type="text" id="vehicleModel" placeholder="e.g., Toyota Vios 2020" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="vehicleType">Vehicle Type <span class="required">*</span></label>
                        <select id="vehicleType" required>
                            <option value="">Select Type</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Pickup">Pickup</option>
                            <option value="Van">Van</option>
                            <option value="MPV">MPV</option>
                            <option value="Motorcycle">Motorcycle</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Services Section -->
            <div class="form-section">
                <h3><i class="fas fa-wrench"></i> Services Requested</h3>
                <div class="services-checklist">
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="Oil Change"> Oil Change
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="Brake Inspection"> Brake Inspection
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="Tire Replacement"> Tire Replacement
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="Engine Tune-up"> Engine Tune-up
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="AC Repair"> AC Repair
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="Battery Replacement"> Battery Replacement
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="Transmission Repair"> Transmission Repair
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="service" value="General Checkup"> General Checkup
                    </label>
                </div>
            </div>

            <!-- Parts Used Section -->
            <div class="form-section">
                <h3><i class="fas fa-cog"></i> Parts Used</h3>
                <div class="form-group">
                    <label for="partsUsed">Parts (separate with comma)</label>
                    <textarea id="partsUsed" rows="3" placeholder="e.g., Engine Oil (3L), Brake Pads, Spark Plugs"></textarea>
                </div>
            </div>

            <!-- Assigned Workers Section -->
            <div class="form-section">
                <h3><i class="fas fa-user-tie"></i> Assigned Worker(s)</h3>
                <div class="workers-checklist">
                    <label class="checkbox-label">
                        <input type="checkbox" name="worker" value="Michael Chen"> Michael Chen (Technician)
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="worker" value="Lisa Wong"> Lisa Wong (Technician)
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="worker" value="John Smith"> John Smith (Mechanic)
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="worker" value="Sarah Johnson"> Sarah Johnson (Specialist)
                    </label>
                </div>
            </div>

            <!-- Status Section (Edit mode only) -->
            <div class="form-section" id="statusSection" style="display: none;">
                <h3><i class="fas fa-info-circle"></i> Job Status</h3>
                <div class="form-group">
                    <label for="jobStatus">Status</label>
                    <select id="jobStatus">
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <!-- Notes Section -->
            <div class="form-section">
                <h3><i class="fas fa-sticky-note"></i> Notes & Remarks</h3>
                <div class="form-group">
                    <label for="jobNotes">Additional Notes</label>
                    <textarea id="jobNotes" rows="4" placeholder="Enter any special instructions or remarks..."></textarea>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeJobModal()">Cancel</button>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> Save Job Order
                </button>
            </div>
        </form>
    </div>
</div>

<!-- View Job Order Modal -->
<div class="modal" id="viewJobModal">
    <div class="modal-content modal-large">
        <div class="modal-header">
            <h2><i class="fas fa-eye"></i> Job Order Details</h2>
            <button class="close-modal" onclick="closeViewModal()">&times;</button>
        </div>
        <div class="modal-body view-mode">
            <div id="jobDetailsContent">
                <!-- Content will be populated by JavaScript -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeViewModal()">Close</button>
                <button type="button" class="btn-info" onclick="printJobOrder()">
                    <i class="fas fa-print"></i> Print
                </button>
                <button type="button" class="btn-success" onclick="sendJobSummary()">
                    <i class="fas fa-paper-plane"></i> Send Summary
                </button>
            </div>
        </div>
    </div>
</div>

<?php
$content = ob_get_clean();
require_once '../layouts/dashboard-layout.php';
?>

