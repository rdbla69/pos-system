// Workers Management JavaScript
let workers = [];
let editingWorkerId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Load workers from API (JSON store now, DB later)
    loadWorkersFromApi();

    // Initialize modals
    initModals();

    // Initialize search and filters
    initSearchAndFilters();

    // Initialize table actions
    initTableActions();

    // Initialize export
    initExport();
});

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
    const dateTimeString = now.toLocaleDateString('en-US', options);
    const dateTimeElement = document.getElementById('dateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeString;
    }
}

// Load workers from API
async function loadWorkersFromApi() {
    try {
        workers = await Api.get('workers.php');
        refreshTable();
    } catch (e) {
        console.error(e);
        loadWorkersFromTableFallback();
    }
}

// Fallback: Load workers from existing table (legacy mode)
function loadWorkersFromTableFallback() {
    const rows = document.querySelectorAll('#workersTable tbody tr');
    workers = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const photo = cells[0].querySelector('img').src;
        const contactInfo = cells[5].querySelectorAll('span');
        
        workers.push({
            id: parseInt(row.dataset.id),
            photo: photo,
            emp_id: cells[1].querySelector('.emp-id-badge').textContent,
            name: cells[2].textContent,
            position: cells[3].textContent,
            department: cells[4].querySelector('.dept-badge').textContent,
            email: contactInfo[0].textContent.replace('✉', '').trim(),
            phone: contactInfo[1].textContent.replace('📞', '').trim(),
            hire_date: cells[6].textContent,
            salary: parseFloat(cells[7].textContent.replace('₱', '').replace(',', '')),
            shift: cells[8].querySelector('.shift-badge').textContent,
            status: row.dataset.status
        });
    });
}

// Initialize modals
function initModals() {
    const workerModal = document.getElementById('workerModal');
    const profileModal = document.getElementById('profileModal');
    const addBtn = document.getElementById('addWorkerBtn');
    const closeBtn = document.getElementById('closeModal');
    const closeProfileBtn = document.getElementById('closeProfileModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('workerForm');

    // Open modal for new worker
    addBtn.addEventListener('click', function() {
        editingWorkerId = null;
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New Worker';
        form.reset();
        workerModal.classList.add('active');
    });

    // Close modals
    const closeWorkerModal = () => workerModal.classList.remove('active');
    const closeProfile = () => profileModal.classList.remove('active');
    
    closeBtn.addEventListener('click', closeWorkerModal);
    closeProfileBtn.addEventListener('click', closeProfile);
    cancelBtn.addEventListener('click', closeWorkerModal);
    
    // Close on outside click
    workerModal.addEventListener('click', function(e) {
        if (e.target === workerModal) {
            closeWorkerModal();
        }
    });
    
    profileModal.addEventListener('click', function(e) {
        if (e.target === profileModal) {
            closeProfile();
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveWorker();
    });
}

// Save worker (add or edit)
async function saveWorker() {
    const formData = {
        id: editingWorkerId || Date.now(),
        emp_id: document.getElementById('empId').value,
        name: document.getElementById('workerName').value,
        position: document.getElementById('workerPosition').value,
        department: document.getElementById('workerDepartment').value,
        email: document.getElementById('workerEmail').value,
        phone: document.getElementById('workerPhone').value,
        hire_date: document.getElementById('workerHireDate').value,
        salary: parseFloat(document.getElementById('workerSalary').value),
        shift: document.getElementById('workerShift').value,
        status: document.getElementById('workerStatus').value,
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(document.getElementById('workerName').value)}&background=3b82f6&color=fff`
    };

    try {
        if (editingWorkerId) {
            await Api.put(`workers.php?id=${editingWorkerId}`, formData);
            showNotification('Worker updated successfully!', 'success');
        } else {
            await Api.post('workers.php', formData);
            showNotification('Worker added successfully!', 'success');
        }
        document.getElementById('workerModal').classList.remove('active');
        await loadWorkersFromApi();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to save worker', 'error');
    }
}

// Refresh table
function refreshTable() {
    const tbody = document.querySelector('#workersTable tbody');
    tbody.innerHTML = workers.map(worker => `
        <tr data-id="${worker.id}" data-department="${worker.department}" data-status="${worker.status}">
            <td>
                <div class="worker-photo">
                    <img src="${worker.photo}" alt="${worker.name}">
                </div>
            </td>
            <td><span class="emp-id-badge">${worker.emp_id}</span></td>
            <td class="worker-name">${worker.name}</td>
            <td>${worker.position}</td>
            <td><span class="dept-badge">${worker.department}</span></td>
            <td>
                <div class="contact-info">
                    <span><i class="fas fa-envelope"></i> ${worker.email}</span>
                    <span><i class="fas fa-phone"></i> ${worker.phone}</span>
                </div>
            </td>
            <td>${worker.hire_date}</td>
            <td class="salary">₱${worker.salary.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td><span class="shift-badge">${worker.shift}</span></td>
            <td>
                <span class="status-badge ${worker.status}">
                    ${worker.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
            </td>
            <td class="actions">
                <button class="action-icon view-btn" data-id="${worker.id}" title="View Profile">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-icon edit-btn" data-id="${worker.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-icon delete-btn" data-id="${worker.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Reattach event listeners
    attachTableEventListeners();
    updateSummaryCards();
}

// Attach table event listeners
function attachTableEventListeners() {
    // View profile buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            viewWorkerProfile(parseInt(this.dataset.id));
        });
    });

    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editWorker(parseInt(this.dataset.id));
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteWorker(parseInt(this.dataset.id));
        });
    });
}

// View worker profile
function viewWorkerProfile(id) {
    const worker = workers.find(w => w.id === id);
    if (!worker) return;

    const profileContent = document.getElementById('profileContent');
    profileContent.innerHTML = `
        <div class="profile-header">
            <div class="profile-photo-large">
                <img src="${worker.photo}" alt="${worker.name}">
            </div>
            <div class="profile-main-info">
                <h2>${worker.name}</h2>
                <p>${worker.position} • ${worker.department}</p>
                <span class="status-badge ${worker.status}">
                    ${worker.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
            </div>
        </div>
        <div class="profile-details">
            <div class="detail-item">
                <span class="detail-label">Employee ID</span>
                <span class="detail-value">${worker.emp_id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-value">${worker.email}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Phone</span>
                <span class="detail-value">${worker.phone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Hire Date</span>
                <span class="detail-value">${worker.hire_date}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Salary</span>
                <span class="detail-value">₱${worker.salary.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Shift</span>
                <span class="detail-value">${worker.shift}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Department</span>
                <span class="detail-value">${worker.department}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Position</span>
                <span class="detail-value">${worker.position}</span>
            </div>
        </div>
    `;

    document.getElementById('profileModal').classList.add('active');
}

// Edit worker
function editWorker(id) {
    const worker = workers.find(w => w.id === id);
    if (!worker) return;

    editingWorkerId = id;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit Worker';
    
    document.getElementById('empId').value = worker.emp_id;
    document.getElementById('workerName').value = worker.name;
    document.getElementById('workerPosition').value = worker.position;
    document.getElementById('workerDepartment').value = worker.department;
    document.getElementById('workerEmail').value = worker.email;
    document.getElementById('workerPhone').value = worker.phone;
    document.getElementById('workerHireDate').value = worker.hire_date;
    document.getElementById('workerSalary').value = worker.salary;
    document.getElementById('workerShift').value = worker.shift;
    document.getElementById('workerStatus').value = worker.status;

    document.getElementById('workerModal').classList.add('active');
}

// Delete worker
async function deleteWorker(id) {
    const worker = workers.find(w => w.id === id);
    if (!worker) return;

    if (!confirm(`Are you sure you want to delete "${worker.name}"?`)) return;

    try {
        await Api.del(`workers.php?id=${id}`);
        showNotification('Worker deleted successfully!', 'success');
        await loadWorkersFromApi();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to delete worker', 'error');
    }
}

// Initialize search and filters
function initSearchAndFilters() {
    const searchInput = document.getElementById('workerSearch');
    const departmentFilter = document.getElementById('departmentFilter');
    const statusFilter = document.getElementById('statusFilter');

    searchInput.addEventListener('input', filterTable);
    departmentFilter.addEventListener('change', filterTable);
    statusFilter.addEventListener('change', filterTable);
}

// Filter table
function filterTable() {
    const searchTerm = document.getElementById('workerSearch').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const status = document.getElementById('statusFilter').value;

    const rows = document.querySelectorAll('#workersTable tbody tr');

    rows.forEach(row => {
        const name = row.querySelector('.worker-name').textContent.toLowerCase();
        const position = row.querySelectorAll('td')[3].textContent.toLowerCase();
        const workerDepartment = row.dataset.department;
        const workerStatus = row.dataset.status;

        const matchesSearch = name.includes(searchTerm) || position.includes(searchTerm);
        const matchesDepartment = department === 'all' || workerDepartment === department;
        const matchesStatus = status === 'all' || workerStatus === status;

        if (matchesSearch && matchesDepartment && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize table actions
function initTableActions() {
    attachTableEventListeners();
}

// Initialize export
function initExport() {
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportToCSV();
    });
}

// Export to CSV
function exportToCSV() {
    const headers = ['Employee ID', 'Name', 'Position', 'Department', 'Email', 'Phone', 'Hire Date', 'Salary', 'Shift', 'Status'];
    const rows = workers.map(worker => [
        worker.emp_id,
        worker.name,
        worker.position,
        worker.department,
        worker.email,
        worker.phone,
        worker.hire_date,
        worker.salary,
        worker.shift,
        worker.status
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Workers list exported successfully!', 'success');
}

// Update summary cards
function updateSummaryCards() {
    const total = workers.length;
    const active = workers.filter(w => w.status === 'active').length;
    const busy = workers.filter(w => w.status === 'busy').length;
    const onLeave = workers.filter(w => w.status === 'on_leave').length;

    document.querySelector('.summary-card.total .card-value').textContent = total;
    document.querySelector('.summary-card.active .card-value').textContent = active;
    document.querySelector('.summary-card.busy .card-value').textContent = busy;
    document.querySelector('.summary-card.leave .card-value').textContent = onLeave;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: #1e293b;
        border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.5)' : type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)'};
        border-radius: 8px;
        color: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        z-index: 10001;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

