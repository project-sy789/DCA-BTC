<?php
require_once 'config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get all data (purchases + current price)
        $stmt = $conn->prepare("SELECT * FROM purchases ORDER BY date DESC");
        $stmt->execute();
        $purchases = $stmt->fetchAll();

        $stmt = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'current_btc_price'");
        $stmt->execute();
        $result = $stmt->fetch();
        $currentPrice = $result ? floatval($result['setting_value']) : 0;

        sendResponse([
            'purchases' => $purchases,
            'currentBTCPrice' => $currentPrice
        ]);
    } else {
        sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
