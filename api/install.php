<?php
session_start();

// Check if already installed
if (file_exists('config.php') && !isset($_GET['reinstall'])) {
    $config_content = file_get_contents('config.php');
    if (strpos($config_content, 'your_username') === false) {
        header('Location: ../index.html');
        exit();
    }
}

$step = isset($_GET['step']) ? intval($_GET['step']) : 1;
$error = '';
$success = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($step === 1) {
        // Step 1: Test database connection
        $host = $_POST['db_host'] ?? '';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_pass'] ?? '';
        $name = $_POST['db_name'] ?? '';

        try {
            $conn = new PDO(
                "mysql:host=$host;charset=utf8mb4",
                $user,
                $pass,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            
            // Store in session
            $_SESSION['db_host'] = $host;
            $_SESSION['db_user'] = $user;
            $_SESSION['db_pass'] = $pass;
            $_SESSION['db_name'] = $name;
            
            header('Location: install.php?step=2');
            exit();
        } catch (PDOException $e) {
            $error = 'การเชื่อมต่อฐานข้อมูลล้มเหลว: ' . $e->getMessage();
        }
    } elseif ($step === 2) {
        // Step 2: Create database and tables
        try {
            $host = $_SESSION['db_host'];
            $user = $_SESSION['db_user'];
            $pass = $_SESSION['db_pass'];
            $name = $_SESSION['db_name'];

            $conn = new PDO(
                "mysql:host=$host;charset=utf8mb4",
                $user,
                $pass,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );

            // Create database
            $conn->exec("CREATE DATABASE IF NOT EXISTS `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $conn->exec("USE `$name`");

            // Create tables
            $sql = file_get_contents('database.sql');
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    $conn->exec($statement);
                }
            }

            // Create config.php
            $config_template = file_get_contents('config.template.php');
            $config_content = str_replace(
                ['{{DB_HOST}}', '{{DB_USER}}', '{{DB_PASS}}', '{{DB_NAME}}'],
                [$host, $user, $pass, $name],
                $config_template
            );
            file_put_contents('config.php', $config_content);

            header('Location: install.php?step=3');
            exit();
        } catch (Exception $e) {
            $error = 'การติดตั้งล้มเหลว: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ติดตั้ง DCA Bitcoin Tracker</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 14px;
        }

        .progress {
            display: flex;
            padding: 20px 30px;
            background: #f7f7f7;
            border-bottom: 1px solid #e0e0e0;
        }

        .progress-step {
            flex: 1;
            text-align: center;
            position: relative;
            padding: 10px;
        }

        .progress-step::before {
            content: attr(data-step);
            display: block;
            width: 40px;
            height: 40px;
            background: #ddd;
            border-radius: 50%;
            margin: 0 auto 10px;
            line-height: 40px;
            font-weight: bold;
            color: #666;
        }

        .progress-step.active::before {
            background: #667eea;
            color: white;
        }

        .progress-step.completed::before {
            background: #10b981;
            color: white;
            content: '✓';
        }

        .progress-step span {
            font-size: 12px;
            color: #666;
        }

        .progress-step.active span {
            color: #667eea;
            font-weight: 600;
        }

        .content {
            padding: 40px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        .form-group small {
            display: block;
            margin-top: 5px;
            color: #666;
            font-size: 12px;
        }

        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }

        .alert-error {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
        }

        .alert-success {
            background: #efe;
            border: 1px solid #cfc;
            color: #3c3;
        }

        .alert-info {
            background: #eef;
            border: 1px solid #ccf;
            color: #33c;
        }

        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            text-decoration: none;
        }

        .btn:hover {
            background: #5568d3;
        }

        .btn-success {
            background: #10b981;
        }

        .btn-success:hover {
            background: #059669;
        }

        .text-center {
            text-align: center;
        }

        .success-icon {
            font-size: 64px;
            color: #10b981;
            margin-bottom: 20px;
        }

        h2 {
            color: #333;
            margin-bottom: 20px;
        }

        ul {
            list-style: none;
            padding-left: 0;
        }

        ul li {
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        ul li:last-child {
            border-bottom: none;
        }

        ul li strong {
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DCA Bitcoin Tracker</h1>
            <p>ติดตั้งระบบติดตามการลงทุน Bitcoin แบบ DCA</p>
        </div>

        <div class="progress">
            <div class="progress-step <?php echo $step >= 1 ? 'active' : ''; ?> <?php echo $step > 1 ? 'completed' : ''; ?>" data-step="1">
                <span>ฐานข้อมูล</span>
            </div>
            <div class="progress-step <?php echo $step >= 2 ? 'active' : ''; ?> <?php echo $step > 2 ? 'completed' : ''; ?>" data-step="2">
                <span>ติดตั้ง</span>
            </div>
            <div class="progress-step <?php echo $step >= 3 ? 'active' : ''; ?>" data-step="3">
                <span>เสร็จสิ้น</span>
            </div>
        </div>

        <div class="content">
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <?php if ($step === 1): ?>
                <h2>ขั้นตอนที่ 1: ตั้งค่าฐานข้อมูล</h2>
                <p style="margin-bottom: 20px; color: #666;">กรุณากรอกข้อมูลการเชื่อมต่อฐานข้อมูล MySQL</p>

                <form method="POST">
                    <div class="form-group">
                        <label>Database Host</label>
                        <input type="text" name="db_host" value="localhost" required>
                        <small>โดยปกติจะเป็น localhost</small>
                    </div>

                    <div class="form-group">
                        <label>Database Name</label>
                        <input type="text" name="db_name" value="dca_bitcoin_tracker" required>
                        <small>ชื่อฐานข้อมูลที่ต้องการสร้าง</small>
                    </div>

                    <div class="form-group">
                        <label>Database Username</label>
                        <input type="text" name="db_user" required>
                        <small>ชื่อผู้ใช้ฐานข้อมูล</small>
                    </div>

                    <div class="form-group">
                        <label>Database Password</label>
                        <input type="password" name="db_pass">
                        <small>รหัสผ่านฐานข้อมูล (เว้นว่างได้ถ้าไม่มี)</small>
                    </div>

                    <button type="submit" class="btn">ถัดไป →</button>
                </form>

            <?php elseif ($step === 2): ?>
                <h2>ขั้นตอนที่ 2: กำลังติดตั้ง...</h2>
                <div class="alert alert-info">
                    <strong>กำลังสร้างฐานข้อมูลและตาราง</strong><br>
                    กรุณารอสักครู่...
                </div>

                <form method="POST">
                    <button type="submit" class="btn">เริ่มติดตั้ง</button>
                </form>

            <?php elseif ($step === 3): ?>
                <div class="text-center">
                    <div class="success-icon">✓</div>
                    <h2>ติดตั้งสำเร็จ!</h2>
                    <p style="margin-bottom: 30px; color: #666;">ระบบพร้อมใช้งานแล้ว</p>

                    <div class="alert alert-success" style="text-align: left;">
                        <strong>ข้อมูลการติดตั้ง:</strong>
                        <ul style="margin-top: 10px;">
                            <li><strong>Database:</strong> <?php echo htmlspecialchars($_SESSION['db_name']); ?></li>
                            <li><strong>Host:</strong> <?php echo htmlspecialchars($_SESSION['db_host']); ?></li>
                            <li><strong>สถานะ:</strong> <span style="color: #10b981;">เชื่อมต่อสำเร็จ</span></li>
                        </ul>
                    </div>

                    <a href="../index.html" class="btn btn-success">เริ่มใช้งาน →</a>
                </div>

                <?php
                // Clear session
                session_destroy();
                ?>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
