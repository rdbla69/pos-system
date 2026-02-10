// Job Orders Management JavaScript

// Data placeholder (connect to PHP/database later)
let jobOrders = [];

// Load job orders from API (JSON store now, DB later)
async function loadJobOrdersFromApi() {
    try {
        jobOrders = await Api.get('job_orders.php');
    } catch (e) {
        console.error(e);
        // If API isn't reachable, keep the in-memory array
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupEventListeners();
    loadJobOrdersFromApi().finally(() => {
        updateSummaryCards();
        renderJobsTable();
    });
});

// Load job orders from API
async function loadJobOrdersFromApi() {
    try {
        jobOrders = await Api.get('job_orders.php');
    } catch (e) {
        console.error(e);
    }
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

// Setup event listeners
function setupEventListeners() {
    // Add job button
    document.getElementById('addJobBtn').addEventListener('click', openAddJobModal);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', filterJobs);
    
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', filterJobs);
    
    // Form submission
    document.getElementById('jobForm').addEventListener('submit', handleFormSubmit);
}

// Open Add Job Modal
function openAddJobModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Job Order';
    document.getElementById('jobForm').reset();
    document.getElementById('jobId').value = '';
    document.getElementById('statusSection').style.display = 'none';
    document.getElementById('jobModal').classList.add('active');
}

// Close Job Modal
function closeJobModal() {
    document.getElementById('jobModal').classList.remove('active');
    document.getElementById('jobForm').reset();
}

// View Job Details
function viewJob(id) {
    const job = jobOrders.find(j => j.id === id);
    if (!job) return;
    
    const content = `
        <div class="detail-section">
            <h3><i class="fas fa-clipboard-list"></i> Job Information</h3>
            <div class="detail-row">
                <div class="detail-label">Job Order ID:</div>
                <div class="detail-value"><strong>${job.job_id ?? job.job_no ?? "-"}</strong></div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="status-badge status-${job.status ?? "pending"}">${(job.status ?? "pending").charAt(0).toUpperCase() + (job.status ?? "pending").slice(1)}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date Created:</div>
                <div class="detail-value">${formatDate(job.date_created ?? job.created_at)}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-user"></i> Customer Information</h3>
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${job.customer_name ?? job.customer ?? "-"}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Contact:</div>
                <div class="detail-value">${job.contact ?? "-"}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-car"></i> Vehicle Information</h3>
            <div class="detail-row">
                <div class="detail-label">Plate Number:</div>
                <div class="detail-value"><strong>${job.vehicle_plate ?? "-"}</strong></div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Model:</div>
                <div class="detail-value">${job.vehicle_model ?? "-"}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Type:</div>
                <div class="detail-value">${job.vehicle_type}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-wrench"></i> Services & Parts</h3>
            <div class="detail-row">
                <div class="detail-label">Services:</div>
                <div class="detail-value">${job.services}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Parts Used:</div>
                <div class="detail-value">${job.parts}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-user-tie"></i> Assigned Workers</h3>
            <div class="detail-row">
                <div class="detail-label">Workers:</div>
                <div class="detail-value">${job.workers ?? job.assigned_to ?? "Unassigned"}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-sticky-note"></i> Notes & Remarks</h3>
            <div class="detail-row">
                <div class="detail-value">${job.notes || 'No notes available'}</div>
            </div>
        </div>
    `;
    
    document.getElementById('jobDetailsContent').innerHTML = content;
    document.getElementById('viewJobModal').classList.add('active');
}

// Close View Modal
function closeViewModal() {
    document.getElementById('viewJobModal').classList.remove('active');
}

// Edit Job
function editJob(id) {
    const job = jobOrders.find(j => j.id === id);
    if (!job) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Job Order';
    document.getElementById('jobId').value = job.id;
    document.getElementById('customerName').value = job.customer_name;
    document.getElementById('customerContact').value = job.contact;
    document.getElementById('vehiclePlate').value = job.vehicle_plate;
    document.getElementById('vehicleModel').value = job.vehicle_model;
    document.getElementById('vehicleType').value = job.vehicle_type;
    document.getElementById('partsUsed').value = job.parts;
    document.getElementById('jobNotes').value = job.notes;
    document.getElementById('jobStatus').value = job.status;
    
    // Check services
    const services = job.services.split(', ');
    document.querySelectorAll('input[name="service"]').forEach(checkbox => {
        checkbox.checked = services.includes(checkbox.value);
    });
    
    // Check workers
    const workers = job.workers.split(', ');
    document.querySelectorAll('input[name="worker"]').forEach(checkbox => {
        checkbox.checked = workers.includes(checkbox.value);
    });
    
    document.getElementById('statusSection').style.display = 'block';
    document.getElementById('jobModal').classList.add('active');
}

// Delete Job
async function deleteJob(id) {
    if (!confirm('Are you sure you want to delete this job order?')) return;
    try {
        await Api.del(`job_orders.php?id=${id}`);
        await loadJobOrdersFromApi();
        renderJobsTable();
        updateSummaryCards();
        showNotification('Job order deleted successfully!', 'success');
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to delete job order', 'error');
    }
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const jobId = document.getElementById('jobId').value;
    const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked'))
        .map(cb => cb.value).join(', ');
    const selectedWorkers = Array.from(document.querySelectorAll('input[name="worker"]:checked'))
        .map(cb => cb.value).join(', ');
    
    const jobData = {
        customer_name: document.getElementById('customerName').value,
        contact: document.getElementById('customerContact').value,
        vehicle_plate: document.getElementById('vehiclePlate').value,
        vehicle_model: document.getElementById('vehicleModel').value,
        vehicle_type: document.getElementById('vehicleType').value,
        services: selectedServices,
        parts: document.getElementById('partsUsed').value || 'None',
        workers: selectedWorkers || 'Unassigned',
        notes: document.getElementById('jobNotes').value,
        status: document.getElementById('jobStatus').value || 'pending',
        date_created: new Date().toISOString().split('T')[0]
    };
    
    try {
        if (jobId) {
            await Api.put(`job_orders.php?id=${jobId}`, jobData);
            showNotification('Job order updated successfully!', 'success');
        } else {
            // Let the API assign numeric id; keep a human-readable job code
            const nextNo = jobOrders.length ? (Math.max(...jobOrders.map(j => j.id)) + 1) : 1;
            jobData.job_no = `JO-${String(nextNo).padStart(4, '0')}`;
            await Api.post('job_orders.php', jobData);
            showNotification('Job order created successfully!', 'success');
        }
        await loadJobOrdersFromApi();
        renderJobsTable();
        updateSummaryCards();
        closeJobModal();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to save job order', 'error');
    }
}

// Filter Jobs
function filterJobs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const rows = document.querySelectorAll('#jobOrdersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.dataset.status;
        
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Render Jobs Table
function renderJobsTable() {
    const tbody = document.getElementById('jobOrdersTableBody');
    tbody.innerHTML = '';

    
    if (!jobOrders || jobOrders.length === 0) {
        // Keep table body empty when there is no data
        return;
    }
jobOrders.forEach(job => {
        const tr = document.createElement('tr');
        tr.dataset.jobId = job.id;
        tr.dataset.status = (job.status ?? "pending");
        
        tr.innerHTML = `
            <td><strong>${job.job_id ?? job.job_no ?? "-"}</strong></td>
            <td>
                <div class="customer-info">
                    <div class="customer-name">${job.customer_name ?? job.customer ?? "-"}</div>
                    <div class="customer-contact">${job.contact ?? "-"}</div>
                </div>
            </td>
            <td>
                <div class="vehicle-info">
                    <div class="vehicle-plate">${job.vehicle_plate ?? "-"}</div>
                    <div class="vehicle-model">${job.vehicle_model ?? "-"}</div>
                </div>
            </td>
            <td>${job.workers ?? job.assigned_to ?? "Unassigned"}</td>
            <td>
                <span class="status-badge status-${job.status ?? "pending"}">
                    ${(job.status ?? "pending").charAt(0).toUpperCase() + (job.status ?? "pending").slice(1)}
                </span>
            </td>
            <td>${formatDate(job.date_created ?? job.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewJob(${job.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editJob(${job.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteJob(${job.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Update Summary Cards
function updateSummaryCards() {
    const total = jobOrders.length;
    const pending = jobOrders.filter(j => j.status === 'pending').length;
    const ongoing = jobOrders.filter(j => j.status === 'ongoing').length;
    const completed = jobOrders.filter(j => j.status === 'completed').length;
    
    document.getElementById('totalJobs').textContent = total;
    document.getElementById('pendingJobs').textContent = pending;
    document.getElementById('ongoingJobs').textContent = ongoing;
    document.getElementById('completedJobs').textContent = completed;
}

// Print Job Order
function printJobOrder() {
    window.print();
}

// Send Job Summary
function sendJobSummary() {
    showNotification('Job summary will be sent via email/SMS', 'info');
    // In production, this would integrate with email/SMS API
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show Notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles dynamically
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e293b;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #22c55e;
    }
    
    .notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification i {
        font-size: 1.5rem;
    }
    
    .notification-success i {
        color: #22c55e;
    }
    
    .notification-info i {
        color: #3b82f6;
    }
`;
document.head.appendChild(style);

