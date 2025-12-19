# 🚀 Deploy บน GitHub Pages

## ข้อดีของการใช้ GitHub Pages

- ✅ **ฟรี 100%** - ไม่ต้องจ่ายค่า hosting
- ✅ **ไม่ต้องมี Backend** - ใช้ LocalStorage เก็บข้อมูล
- ✅ **Deploy ง่าย** - Push code แล้วใช้งานได้เลย
- ✅ **HTTPS ฟรี** - มี SSL certificate ให้อัตโนมัติ
- ✅ **Custom Domain** - ใช้ domain ของคุณเองได้

## ขั้นตอนการ Deploy

### 1. เตรียม Repository

1. สร้าง repository ใหม่บน GitHub (ถ้ายังไม่มี)
2. Push โค้ดขึ้น GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dca-bitcoin-tracker.git
git push -u origin main
```

### 2. ตั้งค่า Base Path

แก้ไขไฟล์ `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dca-bitcoin-tracker/', // เปลี่ยนเป็นชื่อ repo ของคุณ
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
```

### 3. Build โปรเจค

```bash
npm run build
```

### 4. Deploy ด้วย GitHub Actions (แนะนำ)

สร้างไฟล์ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd dca-bitcoin-tracker
          npm ci
          
      - name: Build
        run: |
          cd dca-bitcoin-tracker
          npm run build
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dca-bitcoin-tracker/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### 5. เปิดใช้งาน GitHub Pages

1. ไปที่ Settings → Pages
2. เลือก Source: **GitHub Actions**
3. Save

### 6. เสร็จสิ้น!

เว็บไซต์จะอยู่ที่:
```
https://YOUR_USERNAME.github.io/dca-bitcoin-tracker/
```

## วิธีอื่น: Deploy ด้วย gh-pages (Manual)

### 1. ติดตั้ง gh-pages

```bash
npm install --save-dev gh-pages
```

### 2. เพิ่ม scripts ใน package.json

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 3. Deploy

```bash
npm run deploy
```

## การใช้ Custom Domain

### 1. เพิ่มไฟล์ CNAME

สร้างไฟล์ `public/CNAME`:

```
yourdomain.com
```

### 2. ตั้งค่า DNS

เพิ่ม DNS records:

```
Type: A
Host: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

Type: CNAME
Host: www
Value: YOUR_USERNAME.github.io
```

### 3. ตั้งค่าใน GitHub

Settings → Pages → Custom domain → ใส่ domain ของคุณ

## การจัดการข้อมูล

### ข้อมูลเก็บที่ไหน?

- ข้อมูลเก็บใน **LocalStorage** ของเบราว์เซอร์
- แต่ละเครื่อง/เบราว์เซอร์จะมีข้อมูลแยกกัน

### Export/Import ข้อมูล

ในอนาคตสามารถเพิ่มฟีเจอร์:
- Export ข้อมูลเป็น JSON file
- Import ข้อมูลจาก JSON file
- Sync ข้อมูลผ่าน GitHub Gist (ถ้าต้องการ)

## การอัพเดทเว็บไซต์

เมื่อแก้ไขโค้ด:

```bash
git add .
git commit -m "Update features"
git push
```

GitHub Actions จะ build และ deploy อัตโนมัติ!

## Troubleshooting

### ปัญหา: หน้าเว็บขาว/ไม่แสดงอะไร

แก้ไข: ตรวจสอบ `base` ใน `vite.config.js` ให้ตรงกับชื่อ repo

### ปัญหา: CSS/JS ไม่โหลด

แก้ไข: ใช้ relative path (`./`) ใน vite.config.js:

```javascript
base: './',
```

### ปัญหา: 404 Not Found

แก้ไข: ตรวจสอบว่า GitHub Pages เปิดใช้งานแล้ว และ branch ถูกต้อง

## ข้อจำกัดของ GitHub Pages

- ไม่มี backend/database server
- ข้อมูลเก็บใน LocalStorage (แต่ละเครื่องแยกกัน)
- Bandwidth limit: 100GB/เดือน
- Storage limit: 1GB

## ทางเลือกอื่น (ถ้าต้องการ Database จริง)

1. **Vercel** - Deploy ฟรี + Vercel Postgres
2. **Netlify** - Deploy ฟรี + Netlify Functions
3. **Cloudflare Pages** - Deploy ฟรี + D1 Database

แต่สำหรับการใช้งานส่วนตัว LocalStorage ก็เพียงพอแล้วครับ!
