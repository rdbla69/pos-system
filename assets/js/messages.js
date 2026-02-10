// Messaging Center JavaScript

// Data placeholder (connect to PHP/database later)
let messages = [];

let currentMessageId = null;
let currentCategory = 'all';
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupEventListeners();
    updateUnreadCount();
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
    document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

// Setup event listeners
function setupEventListeners() {
    // Category selection
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterMessages();
        });
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterMessages();
        });
    });

    // Message selection
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', function() {
            selectMessage(parseInt(this.dataset.id));
        });
    });

    // Search
    document.getElementById('messageSearch').addEventListener('input', filterMessages);

    // Compose button
    document.getElementById('composeBtn').addEventListener('click', openComposeModal);

    // Compose form
    document.getElementById('composeForm').addEventListener('submit', handleComposeSubmit);
}

// Select message
function selectMessage(id) {
    currentMessageId = id;
    const message = messages.find(m => m.id === id);
    if (!message) return;

    // Mark as read
    if (message.status === 'unread') {
        message.status = 'read';
        updateMessageDisplay();
        updateUnreadCount();
    }

    // Update active state
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.id) === id) {
            item.classList.add('active');
        }
    });

    // Display chat
    displayChat(message);
}

// Display chat
function displayChat(message) {
    document.querySelector('.chat-empty').style.display = 'none';
    document.getElementById('chatContent').style.display = 'flex';

    // Set chat header
    document.getElementById('chatAvatar').style.backgroundImage = `url('${message.avatar}')`;
    document.getElementById('chatSender').textContent = message.sender;
    document.getElementById('chatRole').textContent = message.sender_role;

    // Display messages
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="chat-message">
            <div class="chat-message-header">
                <div class="chat-message-avatar" style="background-image: url('${message.avatar}')"></div>
                <span class="chat-message-sender">${message.sender}</span>
                <span class="chat-message-time">${formatDateTime(message.timestamp)}</span>
            </div>
            <div class="chat-message-body">
                <strong>${message.subject}</strong><br><br>
                ${message.message}
            </div>
        </div>
    `;
}

// Close chat
function closeChat() {
    document.querySelector('.chat-empty').style.display = 'flex';
    document.getElementById('chatContent').style.display = 'none';
    currentMessageId = null;
    document.querySelectorAll('.message-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const messageText = input.value.trim();
    
    if (!messageText || !currentMessageId) return;

    const message = messages.find(m => m.id === currentMessageId);
    if (!message) return;

    // Create sent message element
    const chatMessages = document.getElementById('chatMessages');
    const sentMessage = document.createElement('div');
    sentMessage.className = 'chat-message sent';
    sentMessage.innerHTML = `
        <div class="chat-message-header">
            <div class="chat-message-avatar" style="background-image: url('https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff')"></div>
            <span class="chat-message-sender">You</span>
            <span class="chat-message-time">Just now</span>
        </div>
        <div class="chat-message-body">${messageText}</div>
    `;
    
    chatMessages.appendChild(sentMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    input.value = '';
    showNotification('Message sent successfully!', 'success');
}

// Filter messages
function filterMessages() {
    const searchTerm = document.getElementById('messageSearch').value.toLowerCase();
    
    document.querySelectorAll('.message-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        const message = messages.find(m => m.id === id);
        if (!message) return;

        const matchesCategory = currentCategory === 'all' || message.category === currentCategory;
        const matchesFilter = currentFilter === 'all' || message.status === currentFilter;
        const matchesSearch = !searchTerm || 
            message.sender.toLowerCase().includes(searchTerm) ||
            message.subject.toLowerCase().includes(searchTerm) ||
            message.preview.toLowerCase().includes(searchTerm);

        if (matchesCategory && matchesFilter && matchesSearch) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Update message display
function updateMessageDisplay() {
    messages.forEach(message => {
        const item = document.querySelector(`.message-item[data-id="${message.id}"]`);
        if (!item) return;

        item.classList.remove('unread', 'read');
        item.classList.add(message.status);
        item.dataset.status = message.status;

        const unreadDot = item.querySelector('.unread-dot');
        if (message.status === 'unread' && !unreadDot) {
            const avatar = item.querySelector('.message-avatar');
            avatar.innerHTML += '<span class="unread-dot"></span>';
        } else if (message.status === 'read' && unreadDot) {
            unreadDot.remove();
        }
    });
}

// Update unread count
function updateUnreadCount() {
    const unreadCount = messages.filter(m => m.status === 'unread').length;
    
    const badges = document.querySelectorAll('.badge-count');
    badges.forEach(badge => {
        badge.textContent = unreadCount;
        if (unreadCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = '';
        }
    });

    // Update category counts
    const allCount = messages.length;
    const workersCount = messages.filter(m => m.category === 'workers').length;
    const clientsCount = messages.filter(m => m.category === 'clients').length;
    const systemCount = messages.filter(m => m.category === 'system').length;

    document.querySelector('[data-category="all"] .count').textContent = allCount;
    document.querySelector('[data-category="workers"] .count').textContent = workersCount;
    document.querySelector('[data-category="clients"] .count').textContent = clientsCount;
    document.querySelector('[data-category="system"] .count').textContent = systemCount;
}

// Toggle message status
function toggleMessageStatus() {
    if (!currentMessageId) return;

    const message = messages.find(m => m.id === currentMessageId);
    if (!message) return;

    message.status = message.status === 'read' ? 'unread' : 'read';
    updateMessageDisplay();
    updateUnreadCount();
    showNotification(`Message marked as ${message.status}`, 'success');
}

// Delete current message
function deleteCurrentMessage() {
    if (!currentMessageId) return;

    if (confirm('Are you sure you want to delete this message?')) {
        const index = messages.findIndex(m => m.id === currentMessageId);
        if (index > -1) {
            messages.splice(index, 1);
            document.querySelector(`.message-item[data-id="${currentMessageId}"]`).remove();
            closeChat();
            updateUnreadCount();
            showNotification('Message deleted successfully!', 'success');
        }
    }
}

// Mark all as read
function markAllAsRead() {
    messages.forEach(message => {
        message.status = 'read';
    });
    updateMessageDisplay();
    updateUnreadCount();
    showNotification('All messages marked as read!', 'success');
}

// Delete all read messages
function deleteAllRead() {
    const readCount = messages.filter(m => m.status === 'read').length;
    
    if (readCount === 0) {
        showNotification('No read messages to delete', 'info');
        return;
    }

    if (confirm(`Are you sure you want to delete ${readCount} read message(s)?`)) {
        messages = messages.filter(m => m.status !== 'read');
        
        document.querySelectorAll('.message-item.read').forEach(item => {
            item.remove();
        });
        
        closeChat();
        updateUnreadCount();
        showNotification(`${readCount} message(s) deleted successfully!`, 'success');
    }
}

// Attach file
function attachFile() {
    showNotification('File attachment feature coming soon!', 'info');
    // In production, this would open a file picker
}

// Link job order
function linkJobOrder() {
    showNotification('Job Order linking feature coming soon!', 'info');
    // In production, this would show a modal to select job orders
}

// Open compose modal
function openComposeModal() {
    document.getElementById('composeModal').classList.add('active');
}

// Close compose modal
function closeComposeModal() {
    document.getElementById('composeModal').classList.remove('active');
    document.getElementById('composeForm').reset();
}

// Handle compose submit
function handleComposeSubmit(e) {
    e.preventDefault();

    const recipientType = document.getElementById('recipientType').value;
    const recipient = document.getElementById('recipient').value;
    const subject = document.getElementById('messageSubject').value;
    const body = document.getElementById('messageBody').value;

    // Create new message
    const newId = Math.max(...messages.map(m => m.id)) + 1;
    const newMessage = {
        id: newId,
        category: recipientType === 'worker' ? 'workers' : 'clients',
        sender: 'You',
        sender_role: 'Admin',
        subject: subject,
        preview: body.substring(0, 60) + '...',
        message: body,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'read',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff'
    };

    messages.unshift(newMessage);
    
    // Add to DOM
    const messageList = document.getElementById('messageList');
    const newMessageElement = createMessageElement(newMessage);
    messageList.insertBefore(newMessageElement, messageList.firstChild);

    // Setup click event
    newMessageElement.addEventListener('click', function() {
        selectMessage(newMessage.id);
    });

    updateUnreadCount();
    closeComposeModal();
    showNotification('Message sent successfully!', 'success');
}

// Create message element
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message-item ${message.status}`;
    div.dataset.id = message.id;
    div.dataset.category = message.category;
    div.dataset.status = message.status;
    
    div.innerHTML = `
        <div class="message-avatar">
            <img src="${message.avatar}" alt="${message.sender}">
            ${message.status === 'unread' ? '<span class="unread-dot"></span>' : ''}
        </div>
        <div class="message-info">
            <div class="message-header">
                <span class="sender-name">${message.sender}</span>
                <span class="message-time">${formatDateTime(message.timestamp)}</span>
            </div>
            <div class="message-subject">${message.subject}</div>
            <div class="message-preview">${message.preview}</div>
            <div class="message-meta">
                <span class="category-badge badge-${message.category}">
                    ${message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                </span>
            </div>
        </div>
    `;
    
    return div;
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles
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

