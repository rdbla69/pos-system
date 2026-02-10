// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date/time display
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Initialize charts
    initDailySalesChart();
    initCategoryChart();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize profile dropdown
    initProfileDropdown();

    // Initialize notifications
    initNotifications();

    // Add fade-in animation to cards
    animateCards();
});

function getDashboardData() {
    const data = (window && window.DASHBOARD_DATA) ? window.DASHBOARD_DATA : {};
    return {
        dailySales: Array.isArray(data.dailySales) ? data.dailySales : [],
        salesByCategory: Array.isArray(data.salesByCategory) ? data.salesByCategory : []
    };
}

function renderEmptyChart(canvasEl, message) {
    if (!canvasEl) return;
    const container = canvasEl.parentElement;
    if (!container) return;
    container.innerHTML = `<div class="chart-empty-state">
        <div class="chart-empty-icon"><i class="fas fa-chart-line"></i></div>
        <p>${message}</p>
    </div>`;
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
    const dateTimeString = now.toLocaleDateString('en-US', options);
    const dateTimeElement = document.getElementById('dateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeString;
    }
}

// Generate labels for the last N days (no hardcoded arrays)
function generateLastNDaysLabels(n) {
    const labels = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'long' }));
    }
    return labels;
}

// Initialize Daily Sales Chart
function initDailySalesChart() {
    const ctx = document.getElementById('dailySalesChart');
    if (!ctx) return;

    const { dailySales } = getDashboardData();
    // No transactions yet: don't render demo lines/points.
    if (!dailySales || dailySales.length === 0) {
        renderEmptyChart(ctx, 'No transactions yet.');
        return;
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailySales.map(d => d.label ?? ''),
            datasets: [{
                label: 'Sales ($)',
                data: dailySales.map(d => Number(d.value ?? 0)),
                borderWidth: 2,
                tension: 0,
                fill: false,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '₱' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return '₱' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// Initialize Category Chart
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const { salesByCategory } = getDashboardData();
    // No transactions yet: don't render demo donut/legend.
    if (!salesByCategory || salesByCategory.length === 0) {
        renderEmptyChart(ctx, 'No sales data yet.');
        return;
    }

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: salesByCategory.map(c => c.label ?? ''),
            datasets: [{
                data: salesByCategory.map(c => Number(c.value ?? 0)),
                backgroundColor: [
                    '#3b82f6',
                    '#8b5cf6',
                    '#22c55e',
                    '#fb923c'
                ],
                borderColor: '#1e293b',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

// Initialize mobile menu
function initMobileMenu() {
    // Create mobile menu toggle button
    const header = document.querySelector('.dashboard-header');
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileToggle.setAttribute('aria-label', 'Toggle menu');
    
    const headerLeft = document.querySelector('.header-left');
    headerLeft.insertBefore(mobileToggle, headerLeft.firstChild);

    // Create sidebar overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Toggle sidebar
    mobileToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // Close sidebar when clicking overlay
    overlay.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close sidebar when clicking menu links on mobile
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });
}

// Initialize profile dropdown
function initProfileDropdown() {
    const profileDropdown = document.querySelector('.profile-dropdown');
    if (!profileDropdown) return;

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!profileDropdown.contains(event.target)) {
            const dropdown = profileDropdown.querySelector('.dropdown-menu');
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-10px)';
        }
    });
}

// Initialize notifications
function initNotifications() {
    const notifications = document.querySelector('.notifications');
    if (!notifications) return;

    notifications.addEventListener('click', function() {
        // Show notification dropdown or modal
        showNotificationModal();
    });
}

// Show notification modal
function showNotificationModal() {
    // Create notification modal
    const modal = document.createElement('div');
    modal.className = 'notification-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h4>Notifications</h4>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="notification-item">
                    <i class="fas fa-shopping-cart"></i>
                    <div>
                        <h6>New Sale Completed</h6>
                        <p>Customer: John Smith - $450.00</p>
                        <span>2 minutes ago</span>
                    </div>
                </div>
                <div class="notification-item">
                    <i class="fas fa-box"></i>
                    <div>
                        <h6>Low Stock Alert</h6>
                        <p>Brake Pads - Only 3 left</p>
                        <span>15 minutes ago</span>
                    </div>
                </div>
                <div class="notification-item">
                    <i class="fas fa-user-plus"></i>
                    <div>
                        <h6>New Employee Added</h6>
                        <p>Sarah Johnson - Cashier</p>
                        <span>1 hour ago</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .notification-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-header h4 {
            margin: 0;
            color: #1e293b;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
        }
        .modal-body {
            padding: 1rem;
        }
        .notification-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #f1f5f9;
        }
        .notification-item:last-child {
            border-bottom: none;
        }
        .notification-item i {
            color: #60a5fa;
            font-size: 1.2rem;
        }
        .notification-item h6 {
            margin: 0;
            color: #1e293b;
            font-size: 0.9rem;
        }
        .notification-item p {
            margin: 0.25rem 0;
            color: #64748b;
            font-size: 0.8rem;
        }
        .notification-item span {
            color: #94a3b8;
            font-size: 0.75rem;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Close modal
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
}

// Animate cards on load
function animateCards() {
    const cards = document.querySelectorAll('.summary-card, .chart-card, .activity-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Handle window resize
window.addEventListener('resize', function() {
    // Close mobile menu on desktop
    if (window.innerWidth > 1024) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    }
});

// Add loading states
function showLoading(element) {
    element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
}

function hideLoading(element, content) {
    element.innerHTML = content;
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

// Export functions for use in other scripts
window.DashboardUtils = {
    formatCurrency,
    formatNumber,
    showLoading,
    hideLoading
};
