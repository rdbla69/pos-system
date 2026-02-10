// Inventory Management JavaScript
let inventory = [];
let editingItemId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Load inventory from API (JSON store now, DB later)
    loadInventoryFromApi();

    // Initialize modal
    initModal();

    // Initialize search and filters
    initSearchAndFilters();

    // Initialize table actions
    initTableActions();

    // Initialize export
    initExport();

    // Initialize reports
    initReports();
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

// Load inventory from API
async function loadInventoryFromApi() {
    try {
        inventory = await Api.get('inventory.php');
        refreshTable();
    } catch (e) {
        console.error(e);
        // If API isn't reachable, keep current table state as fallback
        loadInventoryFromTableFallback();
    }
}

// Fallback: Load inventory from existing table (legacy mode)
function loadInventoryFromTableFallback() {
    const rows = document.querySelectorAll('#inventoryTable tbody tr');
    inventory = [];
    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (!cells.length) return;
        inventory.push({
            id: parseInt(row.dataset.id || '0'),
            sku: cells[0].querySelector('.sku-badge')?.textContent || '',
            name: cells[1]?.textContent || '',
            category: cells[2].querySelector('.category-badge')?.textContent || '',
            quantity: (cells[3]?.textContent || '').trim() === '∞' ? 999 : parseInt(cells[3]?.textContent || '0'),
            unit: cells[4]?.textContent || '',
            cost: parseFloat((cells[5]?.textContent || '0').replace('₱', '').replace(',', '')),
            price: parseFloat((cells[6]?.textContent || '0').replace('₱', '').replace(',', '')),
            supplier: cells[7]?.textContent || '',
            reorder_level: 0,
            status: row.dataset.status || 'in_stock'
        });
    });
}

// Initialize modal
function initModal() {
    const modal = document.getElementById('itemModal');
    const addBtn = document.getElementById('addItemBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('itemForm');

    // Open modal for new item
    addBtn.addEventListener('click', function() {
        editingItemId = null;
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Add New Item';
        form.reset();
        modal.classList.add('active');
    });

    // Close modal
    const closeModal = () => modal.classList.remove('active');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem();
    });
}

// Save item (add or edit)
async function saveItem() {
    const formData = {
        sku: document.getElementById('itemSku').value,
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        quantity: parseInt(document.getElementById('itemQuantity').value),
        unit: document.getElementById('itemUnit').value,
        cost: parseFloat(document.getElementById('itemCost').value),
        price: parseFloat(document.getElementById('itemPrice').value),
        supplier: document.getElementById('itemSupplier').value,
        reorder_level: parseInt(document.getElementById('itemReorder').value)
    };

    // Determine status
    if (formData.quantity === 0) {
        formData.status = 'out_of_stock';
    } else if (formData.quantity <= formData.reorder_level * 0.5) {
        formData.status = 'critical';
    } else if (formData.quantity <= formData.reorder_level) {
        formData.status = 'low_stock';
    } else {
        formData.status = 'in_stock';
    }

    try {
        if (editingItemId) {
            await Api.put(`inventory.php?id=${editingItemId}`, formData);
            showNotification('Item updated successfully!', 'success');
        } else {
            await Api.post('inventory.php', formData);
            showNotification('Item added successfully!', 'success');
        }
        document.getElementById('itemModal').classList.remove('active');
        await loadInventoryFromApi();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to save item', 'error');
    }
}

// Refresh table
function refreshTable() {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = inventory.map(item => `
        <tr data-id="${item.id}" data-category="${item.category}" data-status="${item.status}">
            <td><span class="sku-badge">${item.sku}</span></td>
            <td class="item-name">${item.name}</td>
            <td><span class="category-badge">${item.category}</span></td>
            <td class="quantity">${item.quantity === 999 ? '∞' : item.quantity}</td>
            <td>${item.unit}</td>
            <td>₱${item.cost.toFixed(2)}</td>
            <td class="price">₱${item.price.toFixed(2)}</td>
            <td>${item.supplier}</td>
            <td>
                <span class="status-badge ${item.status}">
                    ${item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
            </td>
            <td class="actions">
                <button class="action-icon edit-btn" data-id="${item.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-icon adjust-btn" data-id="${item.id}" title="Adjust Stock">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="action-icon delete-btn" data-id="${item.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Reattach event listeners
    attachTableEventListeners();
    updateStats();
}

// Attach table event listeners
function attachTableEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editItem(parseInt(this.dataset.id));
        });
    });

    // Adjust stock buttons
    document.querySelectorAll('.adjust-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            adjustStock(parseInt(this.dataset.id));
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteItem(parseInt(this.dataset.id));
        });
    });
}

// Edit item
function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    editingItemId = id;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Item';
    
    document.getElementById('itemSku').value = item.sku;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('itemUnit').value = item.unit;
    document.getElementById('itemCost').value = item.cost;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemSupplier').value = item.supplier;
    document.getElementById('itemReorder').value = item.reorder_level;

    document.getElementById('itemModal').classList.add('active');
}

// Adjust stock
async function adjustStock(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const adjustment = prompt(`Current stock: ${item.quantity}\nEnter adjustment (+/- number):`);
    if (adjustment === null) return;

    const adjustmentValue = parseInt(adjustment);
    if (isNaN(adjustmentValue)) {
        alert('Invalid number!');
        return;
    }

    item.quantity += adjustmentValue;
    if (item.quantity < 0) item.quantity = 0;

    // Update status
    if (item.quantity === 0) {
        item.status = 'out_of_stock';
    } else if (item.quantity <= item.reorder_level * 0.5) {
        item.status = 'critical';
    } else if (item.quantity <= item.reorder_level) {
        item.status = 'low_stock';
    } else {
        item.status = 'in_stock';
    }

    try {
        await Api.put(`inventory.php?id=${id}`, {
            quantity: item.quantity,
            status: item.status
        });
        showNotification(`Stock adjusted: ${adjustmentValue > 0 ? '+' : ''}${adjustmentValue}`, 'success');
        await loadInventoryFromApi();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to adjust stock', 'error');
    }
}

// Delete item
async function deleteItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
        await Api.del(`inventory.php?id=${id}`);
        showNotification('Item deleted successfully!', 'success');
        await loadInventoryFromApi();
    } catch (e) {
        console.error(e);
        showNotification(e.message || 'Failed to delete item', 'error');
    }
}

// Initialize search and filters
function initSearchAndFilters() {
    const searchInput = document.getElementById('inventorySearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    searchInput.addEventListener('input', filterTable);
    categoryFilter.addEventListener('change', filterTable);
    statusFilter.addEventListener('change', filterTable);
}

// Filter table
function filterTable() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;

    const rows = document.querySelectorAll('#inventoryTable tbody tr');

    rows.forEach(row => {
        const name = row.querySelector('.item-name').textContent.toLowerCase();
        const sku = row.querySelector('.sku-badge').textContent.toLowerCase();
        const itemCategory = row.dataset.category;
        const itemStatus = row.dataset.status;

        const matchesSearch = name.includes(searchTerm) || sku.includes(searchTerm);
        const matchesCategory = category === 'all' || itemCategory === category;
        const matchesStatus = status === 'all' || itemStatus === status;

        if (matchesSearch && matchesCategory && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize table actions
function initTableActions() {
    attachTableEventListeners();

    // View toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            if (view === 'grid') {
                showNotification('Grid view coming soon!', 'info');
            }
        });
    });

    // View all movements
    document.getElementById('viewAllMovements').addEventListener('click', function() {
        showNotification('Full stock movement history coming soon!', 'info');
    });
}

// Initialize export
function initExport() {
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportToCSV();
    });
}

// Export to CSV
function exportToCSV() {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Unit', 'Cost', 'Price', 'Supplier', 'Status'];
    const rows = inventory.map(item => [
        item.sku,
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.cost,
        item.price,
        item.supplier,
        item.status
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Inventory exported successfully!', 'success');
}

// Initialize reports
function initReports() {
    const reportBtns = document.querySelectorAll('.report-btn');
    reportBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const reportType = this.querySelector('span').textContent;
            showNotification(`Generating ${reportType}...`, 'info');
        });
    });

    // Alert reorder buttons
    document.querySelectorAll('.alert-action').forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Reorder request sent!', 'success');
        });
    });
}

// Update stats
function updateStats() {
    const totalItems = inventory.length;
    const inStock = inventory.filter(i => i.status === 'in_stock').length;
    const lowStock = inventory.filter(i => i.status === 'low_stock' || i.status === 'critical').length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = totalItems;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = inStock;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = lowStock;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = '₱' + totalValue.toFixed(2);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#1e293b' : type === 'error' ? '#1e293b' : '#1e293b'};
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

