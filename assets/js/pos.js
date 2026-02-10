// POS System JavaScript
let cart = [];
let selectedPaymentMethod = 'cash';
let todaySales = 0;
let transactionCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Initialize product cards
    initProductCards();

    // Initialize filters
    initFilters();

    // Initialize search
    initSearch();

    // Initialize cart functionality
    initCart();

    // Initialize payment
    initPayment();

    // Initialize receipt actions
    initReceiptActions();

    // Initialize quick tools
    initQuickTools();
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

// Initialize product cards
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const product = {
                id: parseInt(this.dataset.id, 10),
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                category: this.dataset.category
            };
            addToCart(product);
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

// Initialize filters
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterProducts(category);
        });
    });
}

// Filter products
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (category === 'all') {
            product.style.display = 'flex';
        } else {
            if (product.dataset.category === category) {
                product.style.display = 'flex';
            } else {
                product.style.display = 'none';
            }
        }
    });
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('productSearch');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const name = (product.dataset.name || '').toLowerCase();
            const category = (product.dataset.category || '').toLowerCase();
            
            if (name.includes(searchTerm) || category.includes(searchTerm)) {
                product.style.display = 'flex';
            } else {
                product.style.display = 'none';
            }
        });
    });
}

// Add to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    updateMLSuggestions(product);
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>No items in cart</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">₱${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn decrease" data-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn increase" data-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item-btn" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Attach event listeners
        document.querySelectorAll('.qty-btn.increase').forEach(btn => {
            btn.addEventListener('click', () => increaseQuantity(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.qty-btn.decrease').forEach(btn => {
            btn.addEventListener('click', () => decreaseQuantity(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => removeItem(parseInt(btn.dataset.id)));
        });
    }
    
    updatePaymentSummary();
}

// Increase quantity
function increaseQuantity(id) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

// Decrease quantity
function decreaseQuantity(id) {
    const item = cart.find(i => i.id === id);
    if (item && item.quantity > 1) {
        item.quantity--;
        updateCart();
    }
}

// Remove item
function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

// Initialize cart
function initCart() {
    const clearCartBtn = document.getElementById('clearCart');
    
    clearCartBtn.addEventListener('click', function() {
        if (cart.length > 0 && confirm('Are you sure you want to clear the cart?')) {
            cart = [];
            updateCart();
        }
    });
}

// Update payment summary
function updatePaymentSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const discountAmount = subtotal * (discount / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = subtotalAfterDiscount * 0.10;
    const total = subtotalAfterDiscount + tax;
    
    document.getElementById('subtotal').textContent = '₱' + subtotal.toFixed(2);
    document.getElementById('tax').textContent = '₱' + tax.toFixed(2);
    document.getElementById('total').textContent = '₱' + total.toFixed(2);
    
    // Update change
    updateChange();
}

// Initialize payment
function initPayment() {
    const paymentBtns = document.querySelectorAll('.payment-btn');
    const discountInput = document.getElementById('discount');
    const amountReceivedInput = document.getElementById('amountReceived');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Payment method selection
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            paymentBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedPaymentMethod = this.dataset.method;
        });
    });
    
    // Discount change
    discountInput.addEventListener('input', updatePaymentSummary);
    
    // Amount received change
    amountReceivedInput.addEventListener('input', updateChange);
    
    // Checkout
    checkoutBtn.addEventListener('click', processCheckout);
}

// Update change
function updateChange() {
    const total = parseFloat(document.getElementById('total').textContent.replace('₱', ''));
    const amountReceived = parseFloat(document.getElementById('amountReceived').value) || 0;
    const change = amountReceived - total;
    
    const changeElement = document.getElementById('change');
    if (change >= 0) {
        changeElement.textContent = '₱' + change.toFixed(2);
        changeElement.style.color = '#22c55e';
    } else {
        changeElement.textContent = '-₱' + Math.abs(change).toFixed(2);
        changeElement.style.color = '#ef4444';
    }
}

// Process checkout
function processCheckout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const total = parseFloat(document.getElementById('total').textContent.replace('₱', ''));
    const amountReceived = parseFloat(document.getElementById('amountReceived').value) || 0;
    
    if (selectedPaymentMethod === 'cash' && amountReceived < total) {
        alert('Insufficient payment amount!');
        return;
    }
    
    // Get customer info
    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const customerPhone = document.getElementById('customerPhone').value || 'N/A';
    
    // Create receipt
    const receipt = {
        transactionId: 'TXN-' + Date.now(),
        date: new Date().toLocaleString(),
        customer: {
            name: customerName,
            phone: customerPhone
        },
        items: [...cart],
        payment: {
            method: selectedPaymentMethod,
            subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('₱', '')),
            tax: parseFloat(document.getElementById('tax').textContent.replace('₱', '')),
            discount: parseFloat(document.getElementById('discount').value) || 0,
            total: total,
            amountReceived: amountReceived,
            change: amountReceived - total
        }
    };

    // Persist transaction (JSON store now, DB later)
    Api.post('transactions.php', receipt).catch((e) => console.error('Failed to save transaction', e));
    
    // Update stats
    todaySales += total;
    transactionCount++;
    updateStats();
    
    // Show success message
    showSuccessMessage(receipt);
    
    // Clear transaction
    setTimeout(() => {
        clearTransaction();
    }, 2000);
}

// Show success message
function showSuccessMessage(receipt) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: #1e293b;
            padding: 3rem;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            border: 1px solid rgba(34, 197, 94, 0.3);
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: rgba(34, 197, 94, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
            ">
                <i class="fas fa-check" style="font-size: 2.5rem; color: #22c55e;"></i>
            </div>
            <h2 style="color: #f1f5f9; margin-bottom: 0.5rem;">Transaction Complete!</h2>
            <p style="color: #94a3b8; margin-bottom: 1rem;">Transaction ID: ${receipt.transactionId}</p>
            <p style="color: #22c55e; font-size: 2rem; font-weight: 700; margin: 1rem 0;">
                ₱${receipt.payment.total.toFixed(2)}
            </p>
            <p style="color: #cbd5e1; margin-top: 1rem;">
                Change: ₱${receipt.payment.change.toFixed(2)}
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 2000);
    
    // Store receipt for printing
    window.lastReceipt = receipt;
}

// Update stats
function updateStats() {
    document.getElementById('todaySales').textContent = '₱' + todaySales.toFixed(2);
    document.getElementById('transactionCount').textContent = transactionCount;
}

// Clear transaction
function clearTransaction() {
    cart = [];
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('discount').value = '0';
    document.getElementById('amountReceived').value = '';
    updateCart();
}

// Initialize receipt actions
function initReceiptActions() {
    document.getElementById('printReceipt').addEventListener('click', printReceipt);
    document.getElementById('emailReceipt').addEventListener('click', emailReceipt);
    document.getElementById('smsReceipt').addEventListener('click', smsReceipt);
}

// Print receipt
function printReceipt() {
    if (!window.lastReceipt) {
        alert('No recent transaction to print!');
        return;
    }
    
    const receipt = window.lastReceipt;
    const printWindow = window.open('', '', 'width=300,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt</title>
            <style>
                body { font-family: monospace; padding: 20px; }
                h2 { text-align: center; }
                .line { border-top: 1px dashed #000; margin: 10px 0; }
                .row { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { font-weight: bold; font-size: 1.2em; }
            </style>
        </head>
        <body>
            <h2>MACHINE POS SYSTEM</h2>
            <div class="line"></div>
            <p>Transaction: ${receipt.transactionId}</p>
            <p>Date: ${receipt.date}</p>
            <p>Customer: ${receipt.customer.name}</p>
            <p>Phone: ${receipt.customer.phone}</p>
            <div class="line"></div>
            <h3>Items:</h3>
            ${receipt.items.map(item => `
                <div class="row">
                    <span>${item.name} x${item.quantity}</span>
                    <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
            <div class="line"></div>
            <div class="row">
                <span>Subtotal:</span>
                <span>₱${receipt.payment.subtotal.toFixed(2)}</span>
            </div>
            <div class="row">
                <span>Tax (10%):</span>
                <span>₱${receipt.payment.tax.toFixed(2)}</span>
            </div>
            ${receipt.payment.discount > 0 ? `
                <div class="row">
                    <span>Discount (${receipt.payment.discount}%):</span>
                    <span>-₱${(receipt.payment.subtotal * receipt.payment.discount / 100).toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="line"></div>
            <div class="row total">
                <span>TOTAL:</span>
                <span>₱${receipt.payment.total.toFixed(2)}</span>
            </div>
            <div class="row">
                <span>Paid (${receipt.payment.method}):</span>
                <span>₱${receipt.payment.amountReceived.toFixed(2)}</span>
            </div>
            <div class="row">
                <span>Change:</span>
                <span>₱${receipt.payment.change.toFixed(2)}</span>
            </div>
            <div class="line"></div>
            <p style="text-align: center;">Thank you for your business!</p>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Email receipt
function emailReceipt() {
    if (!window.lastReceipt) {
        alert('No recent transaction!');
        return;
    }
    
    const email = prompt('Enter customer email:');
    if (email) {
        alert('Receipt sent to ' + email + ' (Demo mode)');
    }
}

// SMS receipt
function smsReceipt() {
    if (!window.lastReceipt) {
        alert('No recent transaction!');
        return;
    }
    
    const phone = window.lastReceipt.customer.phone;
    if (phone && phone !== 'N/A') {
        alert('Receipt sent via SMS to ' + phone + ' (Demo mode)');
    } else {
        alert('Please enter customer phone number first!');
    }
}

// Initialize quick tools
function initQuickTools() {
    document.getElementById('holdTransaction').addEventListener('click', holdTransaction);
    document.getElementById('newTransaction').addEventListener('click', newTransaction);
}

// Hold transaction
function holdTransaction() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    const heldTransactions = JSON.parse(localStorage.getItem('heldTransactions') || '[]');
    heldTransactions.push({
        id: Date.now(),
        cart: [...cart],
        customer: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value
        }
    });
    localStorage.setItem('heldTransactions', JSON.stringify(heldTransactions));
    
    alert('Transaction held successfully!');
    clearTransaction();
}

// New transaction
function newTransaction() {
    if (cart.length > 0 && !confirm('Start new transaction? Current cart will be cleared.')) {
        return;
    }
    clearTransaction();
}

// Update ML suggestions based on cart
function updateMLSuggestions(product) {
    const suggestions = {
        'Brake Pads': 'Customers who buy Brake Pads often add Air Filter (+35%)',
        'Engine Oil Change': 'Recommend Air Filter with oil change service (+42%)',
        'Battery': 'Suggest checking charging system (+28%)',
        'Spark Plugs': 'Often purchased with Air Filter (+31%)',
        'default': 'Add related parts for better service (+25%)'
    };
    
    const suggestion = suggestions[product.name] || suggestions.default;
    
    document.getElementById('mlSuggestions').innerHTML = `
        <div class="suggestion-item">
            <i class="fas fa-lightbulb"></i>
            <span>${suggestion}</span>
        </div>
    `;
}

