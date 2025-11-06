<?php
require_once 'config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get current BTC price
            $stmt = $conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'current_btc_price'");
            $stmt->execute();
            $result = $stmt->fetch();
            
            $currentPrice = $result ? floatval($result['setting_value']) : 0;
            sendResponse(['currentBTCPrice' => $currentPrice]);
            break;

        case 'POST':
        case 'PUT':
            // Update current BTC price
            $data = getJSONInput();
            
            if (!isset($data['currentBTCPrice'])) {
                sendResponse(['error' => 'Current BTC price is required'], 400);
            }

            $stmt = $conn->prepare(
                "INSERT INTO settings (setting_key, setting_value) 
                 VALUES ('current_btc_price', :price)
                 ON DUPLICATE KEY UPDATE setting_value = :price"
            );
            
            $stmt->execute([':price' => $data['currentBTCPrice']]);

            sendResponse(['message' => 'Current BTC price updated successfully']);
            break;

        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
