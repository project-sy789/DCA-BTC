-- Create database
CREATE DATABASE IF NOT EXISTS dca_bitcoin_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dca_bitcoin_tracker;

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  investment_amount DECIMAL(15, 2) NOT NULL,
  btc_price DECIMAL(15, 2) NOT NULL,
  btc_received DECIMAL(16, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create settings table for storing current BTC price
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default current BTC price setting
INSERT INTO settings (setting_key, setting_value) 
VALUES ('current_btc_price', '0')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
