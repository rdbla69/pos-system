<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'Admin Dashboard - POS System'; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="/pos-system/assets/css/dashboard.css" rel="stylesheet">
    <?php if (strpos($_SERVER['PHP_SELF'], 'pos.php') !== false): ?>
    <link href="/pos-system/assets/css/pos.css" rel="stylesheet">
    <?php endif; ?>
    <?php if (strpos($_SERVER['PHP_SELF'], 'inventory.php') !== false): ?>
    <link href="/pos-system/assets/css/inventory.css" rel="stylesheet">
    <?php endif; ?>
    <?php if (strpos($_SERVER['PHP_SELF'], 'workers.php') !== false): ?>
    <link href="/pos-system/assets/css/workers.css" rel="stylesheet">
    <?php endif; ?>
    <?php if (strpos($_SERVER['PHP_SELF'], 'job-orders.php') !== false): ?>
    <link href="/pos-system/assets/css/job-orders.css" rel="stylesheet">
    <?php endif; ?>
    <?php if (strpos($_SERVER['PHP_SELF'], 'reports.php') !== false): ?>
    <link href="/pos-system/assets/css/reports.css" rel="stylesheet">
    <?php endif; ?>
    <?php if (strpos($_SERVER['PHP_SELF'], 'messages.php') !== false): ?>
    <link href="/pos-system/assets/css/messages.css" rel="stylesheet">
    <?php endif; ?>
    <?php if (strpos($_SERVER['PHP_SELF'], 'settings.php') !== false): ?>
    <link href="/pos-system/assets/css/settings.css" rel="stylesheet">
    <?php endif; ?>
</head>
<body>
    <?php echo $content; ?>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/pos-system/assets/js/apiClient.js"></script>
    <?php if (strpos($_SERVER['PHP_SELF'], 'pos.php') !== false): ?>
    <script src="/pos-system/assets/js/pos.js"></script>
    <?php elseif (strpos($_SERVER['PHP_SELF'], 'inventory.php') !== false): ?>
    <script src="/pos-system/assets/js/inventory.js"></script>
    <?php elseif (strpos($_SERVER['PHP_SELF'], 'workers.php') !== false): ?>
    <script src="/pos-system/assets/js/workers.js"></script>
    <?php elseif (strpos($_SERVER['PHP_SELF'], 'job-orders.php') !== false): ?>
    <script src="/pos-system/assets/js/job-orders.js"></script>
    <?php elseif (strpos($_SERVER['PHP_SELF'], 'reports.php') !== false): ?>
    <script src="/pos-system/assets/js/reports.js"></script>
    <?php elseif (strpos($_SERVER['PHP_SELF'], 'messages.php') !== false): ?>
    <script src="/pos-system/assets/js/messages.js"></script>
    <?php elseif (strpos($_SERVER['PHP_SELF'], 'settings.php') !== false): ?>
    <script src="/pos-system/assets/js/settings.js"></script>
    <?php else: ?>
    <script src="/pos-system/assets/js/dashboard.js"></script>
    <?php endif; ?>
</body>
</html>
