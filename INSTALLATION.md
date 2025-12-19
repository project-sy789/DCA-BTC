# คู่มือการติดตั้ง DCA Bitcoin Tracker บน Hosting (PHP + MySQL)

## ข้อกำหนดของ Hosting

- PHP 7.4 หรือสูงกว่า
- MySQL 5.7 หรือสูงกว่า
- PDO Extension (มักติดตั้งมาพร้อม PHP)

## ขั้นตอนการติดตั้ง (แบบง่าย - มีตัวติดตั้งอัตโนมัติ)

### 1. Build Frontend

ในเครื่องของคุณ (local), รันคำสั่ง:

```bash
cd dca-bitcoin-tracker
npm install
npm run build
```

### 2. Upload ไฟล์ไปยัง Hosting

Upload ไฟล์ทั้งหมดไปยัง hosting:

```
public_html/
├── index.html              (จาก dist/)
├── assets/                 (จาก dist/assets/)
├── vite.svg               (จาก dist/)
└── api/
    ├── config.template.php
    ├── install.php
    ├── purchases.php
    ├── settings.php
    ├── data.php
    └── database.sql
```

**โครงสร้างไฟล์:**
- ไฟล์ใน `dist/` ทั้งหมด → upload ไปที่ root ของ public_html
- โฟลเดอร์ `api/` → upload ไปที่ public_html/api/

### 3. รันตัวติดตั้งอัตโนมัติ

1. เปิดเว็บเบราว์เซอร์ไปที่: `https://yourdomain.com/api/install.php`
2. กรอกข้อมูล Database:
   - **Database Host**: localhost (โดยปกติ)
   - **Database Name**: dca_bitcoin_tracker (หรือชื่ือที่ต้องการ)
   - **Database Username**: ชื่อผู้ใช้ database จาก hosting
   - **Database Password**: รหัสผ่าน database
3. คลิก "ถัดไป" และรอให้ระบบติดตั้งอัตโนมัติ
4. เมื่อเสร็จแล้ว คลิก "เริ่มใช้งาน"

### 4. เสร็จสิ้น!

เปิดเว็บไซต์: `https://yourdomain.com` และเริ่มใช้งานได้เลย!

---

## ขั้นตอนการติดตั้ง (แบบ Manual - สำหรับผู้ที่ต้องการควบคุมเอง)

### 1. สร้าง Database ด้วยตนเอง

1. เข้าไปที่ phpMyAdmin
2. สร้าง database ใหม่ชื่อ `dca_bitcoin_tracker`
3. Import ไฟล์ `api/database.sql`

### 2. สร้างไฟล์ config.php

คัดลอก `api/config.template.php` เป็น `api/config.php` และแก้ไข:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'dca_bitcoin_tracker');
```

### 3. Upload และทดสอบ

Upload ไฟล์ทั้งหมดและเปิดเว็บไซต์

## การแก้ปัญหา

### ปัญหา: CORS Error

ถ้าเจอ CORS error, ตรวจสอบว่าไฟล์ `api/config.php` มี header ที่ถูกต้อง:

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### ปัญหา: Database Connection Failed

1. ตรวจสอบข้อมูล database ใน `api/config.php`
2. ตรวจสอบว่า database ถูกสร้างแล้ว
3. ตรวจสอบว่า user มีสิทธิ์เข้าถึง database

### ปัญหา: 404 Not Found สำหรับ API

ตรวจสอบว่า:
1. โฟลเดอร์ `api/` อยู่ในตำแหน่งที่ถูกต้อง
2. ไฟล์ `.htaccess` ไม่ได้บล็อก PHP files
3. PHP ทำงานได้บน hosting

## การอัพเดทข้อมูล

เมื่อต้องการอัพเดทโค้ด:

1. แก้ไขโค้ดในเครื่อง local
2. รัน `npm run build`
3. Upload ไฟล์ใน `dist/` ไปแทนที่ไฟล์เดิมบน hosting

## Security Notes

**สำคัญ:** ในการใช้งานจริง ควร:

1. เปลี่ยน CORS ให้เฉพาะเจาะจง:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

2. ใช้ HTTPS เสมอ
3. ตั้งรหัสผ่าน database ที่แข็งแรง
4. จำกัดสิทธิ์ user database ให้เหมาะสม

## ติดต่อ & Support

หากมีปัญหาในการติดตั้ง สามารถตรวจสอบ:
- PHP error log ใน hosting
- Browser console สำหรับ JavaScript errors
- Network tab ใน Developer Tools
