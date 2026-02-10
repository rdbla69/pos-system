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
$messagesRepo = new MessagesRepository($store);
$messages = $messagesRepo->seededAll();

// Calculate unread count
$unreadCount = count(array_filter($messages, function($msg) {
    return (($msg['status'] ?? 'unread') === 'unread');
}));

$pageTitle = "Messaging Center - Machine System POS";
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
            <li class="menu-item">
                <a href="reports.php" class="menu-link">
                    <i class="fas fa-chart-bar"></i>
                    <span>Reports</span>
                </a>
            </li>
            <li class="menu-item active">
                <a href="messages.php" class="menu-link">
                    <i class="fas fa-comments"></i>
                    <span>Messages</span>
                    <?php if ($unreadCount > 0): ?>
                    <span class="badge-count"><?php echo $unreadCount; ?></span>
                    <?php endif; ?>
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
        <header class="messages-header">
            <div class="header-left">
                <div class="header-title">
                    <i class="fas fa-comments"></i>
                    <div>
                        <h1>Messaging Center</h1>
                        <p class="date-time" id="dateTime"></p>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <div class="notification-badge" id="notificationBadge">
                    <i class="fas fa-bell"></i>
                    <span class="badge-count" id="unreadBadge"><?php echo $unreadCount; ?></span>
                </div>
                <button class="compose-btn" id="composeBtn">
                    <i class="fas fa-pen"></i> Compose
                </button>
            </div>
        </header>

        <!-- Messaging Layout -->
        <div class="messaging-container">
            <!-- Left Sidebar - Categories -->
            <div class="message-categories">
                <h3><i class="fas fa-folder"></i> Categories</h3>
                <ul class="category-list">
                    <li class="category-item active" data-category="all">
                        <i class="fas fa-inbox"></i>
                        <span>All Messages</span>
                        <span class="count"><?php echo count($messages); ?></span>
                    </li>
                    <li class="category-item" data-category="workers">
                        <i class="fas fa-user-tie"></i>
                        <span>Workers</span>
                        <span class="count"><?php echo count(array_filter($messages, fn($m) => $m['category'] === 'workers')); ?></span>
                    </li>
                    <li class="category-item" data-category="clients">
                        <i class="fas fa-users"></i>
                        <span>Clients</span>
                        <span class="count"><?php echo count(array_filter($messages, fn($m) => $m['category'] === 'clients')); ?></span>
                    </li>
                    <li class="category-item" data-category="system">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>System Alerts</span>
                        <span class="count"><?php echo count(array_filter($messages, fn($m) => $m['category'] === 'system')); ?></span>
                    </li>
                </ul>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                    <button class="quick-action-btn" onclick="markAllAsRead()">
                        <i class="fas fa-check-double"></i> Mark All as Read
                    </button>
                    <button class="quick-action-btn" onclick="deleteAllRead()">
                        <i class="fas fa-trash"></i> Delete Read Messages
                    </button>
                </div>
            </div>

            <!-- Middle Panel - Message List -->
            <div class="message-list-panel">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="messageSearch" placeholder="Search messages...">
                </div>

                <div class="filter-tabs">
                    <button class="filter-tab active" data-filter="all">All</button>
                    <button class="filter-tab" data-filter="unread">Unread</button>
                    <button class="filter-tab" data-filter="read">Read</button>
                </div>

                <div class="message-list" id="messageList">
                    <?php foreach ($messages as $msg): ?>
                    <?php
                        $mStatus = preg_replace('/[^a-zA-Z0-9_-]/','', ($msg['status'] ?? 'unread'));
                        $mId = $msg['id'] ?? '';
                        $mCat = $msg['category'] ?? 'all';
                        $mAvatar = $msg['avatar'] ?? 'assets/images/logo.png';
                        $mSender = $msg['sender'] ?? 'Unknown';
                        $mTs = $msg['timestamp'] ?? '';
                        $mTime = !empty($mTs) ? date('M d, g:i A', strtotime($mTs)) : '';
                        $mSubject = $msg['subject'] ?? '(no subject)';
                        $mPreview = $msg['preview'] ?? '';
                    ?>
                    <div class="message-item <?php echo htmlspecialchars($mStatus, ENT_QUOTES); ?>" data-id="<?php echo htmlspecialchars($mId, ENT_QUOTES); ?>" data-category="<?php echo htmlspecialchars($mCat, ENT_QUOTES); ?>" data-status="<?php echo htmlspecialchars($mStatus, ENT_QUOTES); ?>">
                        <div class="message-avatar">
                            <img src="<?php echo htmlspecialchars($mAvatar, ENT_QUOTES); ?>" alt="<?php echo htmlspecialchars($mSender); ?>">
                            <?php if (($msg['status'] ?? 'unread') === 'unread'): ?>
                            <span class="unread-dot"></span>
                            <?php endif; ?>
                        </div>
                        <div class="message-info">
                            <div class="message-header">
                                <span class="sender-name"><?php echo htmlspecialchars($mSender); ?></span>
                                <span class="message-time"><?php echo htmlspecialchars($mTime); ?></span>
                            </div>
                            <div class="message-subject"><?php echo htmlspecialchars($mSubject); ?></div>
                            <div class="message-preview"><?php echo htmlspecialchars($mPreview); ?></div>
                            <div class="message-meta">
                                <span class="category-badge badge-<?php echo htmlspecialchars($mCat, ENT_QUOTES); ?>">
                                    <?php echo htmlspecialchars(ucfirst($mCat)); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Right Panel - Chat View -->
            <div class="chat-panel" id="chatPanel">
                <div class="chat-empty">
                    <i class="fas fa-comments"></i>
                    <h3>No message selected</h3>
                    <p>Select a message from the list to view the conversation</p>
                </div>
                
                <div class="chat-content" id="chatContent" style="display: none;">
                    <!-- Chat Header -->
                    <div class="chat-header">
                        <div class="chat-info">
                            <div class="chat-avatar" id="chatAvatar"></div>
                            <div>
                                <h3 id="chatSender"></h3>
                                <p id="chatRole"></p>
                            </div>
                        </div>
                        <div class="chat-actions">
                            <button class="chat-action-btn" onclick="toggleMessageStatus()" title="Mark as Read/Unread">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="chat-action-btn" onclick="deleteCurrentMessage()" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="chat-action-btn" onclick="closeChat()" title="Close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Chat Messages -->
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will be populated by JavaScript -->
                    </div>

                    <!-- Chat Input -->
                    <div class="chat-input-area">
                        <div class="attach-options">
                            <button class="attach-btn" onclick="attachFile()" title="Attach File">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <button class="attach-btn" onclick="linkJobOrder()" title="Link Job Order">
                                <i class="fas fa-link"></i> Job Order
                            </button>
                        </div>
                        <div class="input-wrapper">
                            <textarea id="messageInput" placeholder="Type your message..." rows="3"></textarea>
                            <button class="send-btn" onclick="sendMessage()">
                                <i class="fas fa-paper-plane"></i> Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Compose Message Modal -->
<div class="modal" id="composeModal">
    <div class="modal-content">
        <div class="modal-header">
            <h2><i class="fas fa-pen"></i> Compose New Message</h2>
            <button class="close-modal" onclick="closeComposeModal()">&times;</button>
        </div>
        <form id="composeForm" class="modal-body">
            <div class="form-group">
                <label for="recipientType">Recipient Type</label>
                <select id="recipientType" required>
                    <option value="">Select Type</option>
                    <option value="worker">Worker</option>
                    <option value="client">Client</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="recipient">Recipient</label>
                <input type="text" id="recipient" placeholder="Enter recipient name" required>
            </div>
            
            <div class="form-group">
                <label for="messageSubject">Subject</label>
                <input type="text" id="messageSubject" placeholder="Enter subject" required>
            </div>
            
            <div class="form-group">
                <label for="messageBody">Message</label>
                <textarea id="messageBody" rows="6" placeholder="Type your message..." required></textarea>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeComposeModal()">Cancel</button>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-paper-plane"></i> Send Message
                </button>
            </div>
        </form>
    </div>
</div>

<?php
$content = ob_get_clean();
require_once '../layouts/dashboard-layout.php';
?>

