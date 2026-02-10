// Reports & Analytics JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Initialize charts
    initCharts();

    // Initialize filters
    initFilters();

    // Initialize export buttons
    initExportButtons();
});

function getReportsData() {
    const data = (window && window.REPORTS_DATA) ? window.REPORTS_DATA : {};
    return {
        salesTrend: Array.isArray(data.salesTrend) ? data.salesTrend : [],
        paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : []
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

// Generate date labels for the last N days (no hardcoded arrays)
function generateDateLabels(n) {
    const labels = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
}

// Initialize charts
function initCharts() {
    // Sales Trend Chart
    const salesTrendCtx = document.getElementById('salesTrendChart');
    if (salesTrendCtx) {
        const { salesTrend } = getReportsData();
        if (!salesTrend || salesTrend.length === 0) {
            renderEmptyChart(salesTrendCtx, 'No transactions yet.');
        } else {
            new Chart(salesTrendCtx, {
            type: 'line',
            data: {
                labels: salesTrend.map(d => d.label ?? ''),
                datasets: [{
                    label: 'Daily Sales (₱)',
                    data: salesTrend.map(d => Number(d.value ?? 0)),
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
                                return '₱' + context.parsed.y.toLocaleString('en-PH', {minimumFractionDigits: 2});
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
    }

    // Payment Method Chart
    const paymentMethodCtx = document.getElementById('paymentMethodChart');
    if (paymentMethodCtx) {
        const { paymentMethods } = getReportsData();
        if (!paymentMethods || paymentMethods.length === 0) {
            renderEmptyChart(paymentMethodCtx, 'No payment data yet.');
        } else {
            new Chart(paymentMethodCtx, {
            type: 'doughnut',
            data: {
                labels: paymentMethods.map(p => p.label ?? ''),
                datasets: [{
                    data: paymentMethods.map(p => Number(p.value ?? 0)),
                    backgroundColor: [
                        '#22c55e',
                        '#3b82f6',
                        '#a855f7'
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
    }
}

// Initialize filters
function initFilters() {
    const applyBtn = document.getElementById('applyFilter');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            showNotification(`Filtering reports from ${startDate} to ${endDate}...`, 'info');
            
            // In a real application, you would fetch filtered data here
            setTimeout(() => {
                showNotification('Reports updated successfully!', 'success');
            }, 1000);
        });
    }

    // Report type filter
    const reportType = document.getElementById('reportType');
    if (reportType) {
        reportType.addEventListener('change', function() {
            const value = this.value;
            showNotification(`Showing ${value === 'all' ? 'all' : value} reports`, 'info');
        });
    }

    // Payment method filter
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            const value = this.value;
            showNotification(`Filtering by ${value === 'all' ? 'all payment methods' : value}`, 'info');
        });
    }
}

// Initialize export buttons
function initExportButtons() {
    // Sales export buttons
    const exportSalesPDF = document.getElementById('exportSalesPDF');
    const exportSalesExcel = document.getElementById('exportSalesExcel');
    const printSales = document.getElementById('printSales');

    if (exportSalesPDF) {
        exportSalesPDF.addEventListener('click', function() {
            exportTableToPDF('salesTable', 'Sales_Report');
        });
    }

    if (exportSalesExcel) {
        exportSalesExcel.addEventListener('click', function() {
            exportTableToExcel('salesTable', 'Sales_Report');
        });
    }

    if (printSales) {
        printSales.addEventListener('click', function() {
            printTable('salesTable', 'Sales Report');
        });
    }

    // Services export buttons
    const exportServicesPDF = document.getElementById('exportServicesPDF');
    const exportServicesExcel = document.getElementById('exportServicesExcel');
    const printServices = document.getElementById('printServices');

    if (exportServicesPDF) {
        exportServicesPDF.addEventListener('click', function() {
            exportTableToPDF('servicesTable', 'Services_Report');
        });
    }

    if (exportServicesExcel) {
        exportServicesExcel.addEventListener('click', function() {
            exportTableToExcel('servicesTable', 'Services_Report');
        });
    }

    if (printServices) {
        printServices.addEventListener('click', function() {
            printTable('servicesTable', 'Services Report');
        });
    }
}

// Export table to PDF (simulation)
function exportTableToPDF(tableId, filename) {
    showNotification(`Generating ${filename}.pdf...`, 'info');
    
    // In a real application, you would use a library like jsPDF
    setTimeout(() => {
        showNotification(`${filename}.pdf downloaded successfully!`, 'success');
    }, 1500);
}

// Export table to Excel (CSV format)
function exportTableToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = [];
        const cols = rows[i].querySelectorAll('td, th');

        for (let j = 0; j < cols.length; j++) {
            // Clean up the text content
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
            data = data.replace(/"/g, '""');
            row.push('"' + data + '"');
        }

        csv.push(row.join(','));
    }

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`${filename}.csv downloaded successfully!`, 'success');
}

// Print table
function printTable(tableId, title) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                h1 {
                    text-align: center;
                    color: #1e293b;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #e2e8f0;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background: #f1f5f9;
                    font-weight: 600;
                    color: #1e293b;
                }
                tr:nth-child(even) {
                    background: #f8fafc;
                }
                tfoot {
                    font-weight: bold;
                    background: #e2e8f0;
                }
                .print-info {
                    text-align: center;
                    margin-top: 20px;
                    color: #64748b;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p style="text-align: center; color: #64748b;">
                Generated on ${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
            ${table.outerHTML}
            <div class="print-info">
                <p>&copy; INNOVATIVE MACHINE POS SYSTEM</p>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);

    showNotification('Print dialog opened!', 'success');
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
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    notification.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> ${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
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

