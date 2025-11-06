<?php
require_once 'config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all purchases
            $stmt = $conn->prepare("SELECT * FROM purchases ORDER BY date DESC");
            $stmt->execute();
            $purchases = $stmt->fetchAll();
            sendResponse(['purchases' => $purchases]);
            break;

        case 'POST':
            // Add new purchase
            $data = getJSONInput();
            
            if (!isset($data['date']) || !isset($data['investmentAmount']) || 
                !isset($data['btcPrice']) || !isset($data['btcReceived'])) {
                sendResponse(['error' => 'Missing required fields'], 400);
            }

            $stmt = $conn->prepare(
                "INSERT INTO purchases (date, investment_amount, btc_price, btc_received) 
                 VALUES (:date, :investment_amount, :btc_price, :btc_received)"
            );
            
            $stmt->execute([
                ':date' => $data['date'],
                ':investment_amount' => $data['investmentAmount'],
                ':btc_price' => $data['btcPrice'],
                ':btc_received' => $data['btcReceived']
            ]);

            $id = $conn->lastInsertId();
            sendResponse([
                'message' => 'Purchase added successfully',
                'id' => $id
            ], 201);
            break;

        case 'PUT':
            // Update purchase
            $data = getJSONInput();
            
            if (!isset($data['id'])) {
                sendResponse(['error' => 'Purchase ID is required'], 400);
            }

            $stmt = $conn->prepare(
                "UPDATE purchases 
                 SET date = :date, 
                     investment_amount = :investment_amount, 
                     btc_price = :btc_price, 
                     btc_received = :btc_received 
                 WHERE id = :id"
            );
            
            $stmt->execute([
                ':id' => $data['id'],
                ':date' => $data['date'],
                ':investment_amount' => $data['investmentAmount'],
                ':btc_price' => $data['btcPrice'],
                ':btc_received' => $data['btcReceived']
            ]);

            sendResponse(['message' => 'Purchase updated successfully']);
            break;

        case 'DELETE':
            // Delete purchase
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                sendResponse(['error' => 'Purchase ID is required'], 400);
            }

            $stmt = $conn->prepare("DELETE FROM purchases WHERE id = :id");
            $stmt->execute([':id' => $id]);

            sendResponse(['message' => 'Purchase deleted successfully']);
            break;

        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
