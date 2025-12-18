# 📊 DCA Bitcoin Tracker

แอปพลิเคชันติดตามการลงทุน Bitcoin แบบ Dollar Cost Averaging (DCA) ที่ใช้งานง่าย สวยงาม และฟรี! พร้อมเครื่องมือวิเคราะห์ขั้นสูงสำหรับนักลงทุน DCA

![DCA Bitcoin Tracker](https://img.shields.io/badge/React-19.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 📊 Dashboard & Analytics
- 💰 **Dashboard** - แสดงสถิติสำคัญ: มูลค่าพอร์ต, กำไร/ขาดทุน, ROI, ราคาเฉลี่ย
- 📈 **Performance Metrics** - วิเคราะห์ผลตอบแทนแบบละเอียด พร้อม Sharpe Ratio, Max Drawdown
- 🔍 **Purchase Analysis** - วิเคราะห์การซื้อแต่ละครั้ง ดูว่าซื้อถูกหรือแพง
- ⚖️ **Lump Sum Comparison** - เปรียบเทียบ DCA vs ลงทุนก้อนเดียว

### 📈 Charts & Visualization
- 📊 **BTC Accumulation Chart** - กราฟแสดงการสะสม BTC ตามเวลา
- 💹 **Portfolio Value Chart** - กราฟมูลค่าพอร์ตโฟลิโอ
- 📉 **ROI Chart** - กราฟแสดง Return on Investment
- 🎯 **Time Range Filters** - 1D, 1W, 1M, 3M, 6M, YTD, 1Y, ALL (แบบ TradingView)
- 🔍 **Chart Zoom & Pan** - ซูมและเลื่อนดูกราฟได้

### 🛠️ Tools & Utilities
- 🧮 **DCA Calculator** - คำนวณแผนการลงทุน DCA ล่วงหน้า
- 🎯 **Goal Tracker** - ตั้งเป้าหมายการสะสม BTC
- 🔔 **Price Alert** - ตั้งแจ้งเตือนเมื่อราคาถึงจุดที่กำหนด
- 💾 **Backup Manager** - Export/Import ข้อมูลเป็น JSON
- ⏰ **Backup Reminder** - แจ้งเตือนให้สำรองข้อมูล

### 💻 Core Features
- ✏️ **แก้ไข/ลบข้อมูล** - จัดการข้อมูลการซื้อได้ง่าย
- 💾 **LocalStorage** - ข้อมูลปลอดภัยในเครื่องของคุณ
- 🌙 **Dark Mode** - ออกแบบสวยงามแบบ modern
- 📱 **Responsive** - ใช้งานได้ทั้งมือถือและคอมพิวเตอร์
- 🔄 **Auto-save** - บันทึกอัตโนมัติทุกครั้งที่มีการเปลี่ยนแปลง

## 🚀 Quick Start

### ติดตั้งและรัน

```bash
# Clone repository
git clone https://github.com/project-sy789/DCA-BTC.git
cd DCA-BTC/dca-bitcoin-tracker

# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# Build สำหรับ production
npm run build
```

## 📦 Deploy

### Deploy บน GitHub Pages (แนะนำ - ฟรี!)

1. Fork repository นี้
2. ไปที่ Settings → Pages
3. เลือก Source: **GitHub Actions**
4. Push code → Deploy อัตโนมัติ!

อ่านรายละเอียดเพิ่มเติม: [GITHUB_PAGES_DEPLOY.md](GITHUB_PAGES_DEPLOY.md)

### Deploy บน Hosting อื่นๆ

- **Netlify**: Drag & drop โฟลเดอร์ `dist/`
- **Vercel**: Connect GitHub repository
- **Cloudflare Pages**: Connect GitHub repository

## 🛠️ Tech Stack

- **Frontend**: React 19.1 + Vite 7.1
- **Charts**: Chart.js 4.5 + react-chartjs-2 5.3
  - chartjs-plugin-annotation - สำหรับเส้นอ้างอิง
  - chartjs-plugin-zoom - สำหรับซูมกราฟ
- **Storage**: LocalStorage API
- **Styling**: CSS Variables + Modern CSS
- **Build**: Vite (Lightning fast!)

## 📖 การใช้งาน

### 1. ตั้งค่าราคา BTC ปัจจุบัน

- กรอกราคา Bitcoin ปัจจุบันเพื่อคำนวณมูลค่าพอร์ต
- รองรับการดึงราคาอัตโนมัติ (ถ้ามี API key)

### 2. เพิ่มข้อมูลการซื้อ

กรอกข้อมูลการซื้อ BTC แต่ละครั้ง:
- **วันที่**: วันที่ซื้อ BTC
- **เงินลงทุน**: จำนวนเงินที่ลงทุน (บาท)
- **ราคา BTC**: ราคา Bitcoin ณ เวลาที่ซื้อ
- **จำนวน BTC**: จำนวน BTC ที่ได้รับจริง (จาก Bitkub)

### 3. ดูสถิติและกราฟ

- **Dashboard**: ดูสถิติรวมทั้งหมด
- **Performance Metrics**: วิเคราะห์ผลตอบแทนแบบละเอียด
- **Charts**: เลือกช่วงเวลาที่ต้องการดู พร้อมซูมและเลื่อนดูกราฟ
- **Purchase Analysis**: ดูว่าการซื้อแต่ละครั้งได้กำไรหรือขาดทุน

### 4. ใช้เครื่องมือวิเคราะห์

- **DCA Calculator**: วางแผนการลงทุนในอนาคต
- **Lump Sum Comparison**: เปรียบเทียบกับการลงทุนก้อนเดียว
- **Goal Tracker**: ตั้งเป้าหมายการสะสม BTC
- **Price Alert**: ตั้งแจ้งเตือนราคา

### 5. แก้ไข/ลบข้อมูล

- คลิกปุ่ม ✏️ เพื่อแก้ไข
- คลิกปุ่ม 🗑️ เพื่อลบ

### 6. สำรองข้อมูล

- ใช้ **Backup Manager** เพื่อ Export ข้อมูลเป็น JSON
- Import ข้อมูลกลับเมื่อต้องการ
- ระบบจะแจ้งเตือนให้สำรองข้อมูลเป็นระยะ

## 📁 โครงสร้างโปรเจค

```
dca-bitcoin-tracker/
├── src/
│   ├── components/              # React components
│   │   ├── Dashboard.jsx        # แดชบอร์ดหลัก
│   │   ├── CurrentPriceInput.jsx # ช่องกรอกราคา BTC
│   │   ├── PurchaseForm.jsx     # ฟอร์มเพิ่มข้อมูลการซื้อ
│   │   ├── LogTable.jsx         # ตารางแสดงประวัติ
│   │   ├── ChartsSection.jsx    # ส่วนกราฟทั้งหมด
│   │   ├── BTCAccumulationChart.jsx
│   │   ├── PortfolioValueChart.jsx
│   │   ├── ROIChart.jsx
│   │   ├── DCACalculator.jsx    # เครื่องคำนวณ DCA
│   │   ├── GoalTracker.jsx      # ติดตามเป้าหมาย
│   │   ├── PriceAlert.jsx       # แจ้งเตือนราคา
│   │   ├── BackupManager.jsx    # จัดการ Backup
│   │   ├── PerformanceMetrics.jsx
│   │   ├── PurchaseAnalysis.jsx
│   │   └── LumpSumComparison.jsx
│   ├── services/
│   │   └── LocalStorageService.js # จัดการ LocalStorage
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
├── public/                      # Static assets
├── dist/                        # Build output
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies
```

## 🎨 Screenshots

### Dashboard
แสดงสถิติการลงทุนทั้งหมด: มูลค่าพอร์ต, กำไร/ขาดทุน, ROI, ราคาเฉลี่ย

### กราฟ
กราฟแสดงการสะสม BTC และมูลค่าพอร์ต พร้อมกรองช่วงเวลาและซูมได้

### ตาราง
ประวัติการซื้อทั้งหมด พร้อมฟังก์ชันแก้ไข/ลบ

### เครื่องมือวิเคราะห์
- DCA Calculator สำหรับวางแผนการลงทุน
- Performance Metrics แสดงผลตอบแทนแบบละเอียด
- Purchase Analysis วิเคราะห์การซื้อแต่ละครั้ง
- Lump Sum Comparison เปรียบเทียบกับการลงทุนก้อนเดียว

## 🤝 Contributing

Pull requests are welcome! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue ก่อน

## 📝 License

MIT License - ใช้งานได้ฟรี!

## 🙏 Credits

- **Chart.js** - สำหรับกราฟสวยงาม
- **React** - UI framework
- **Vite** - Build tool ที่เร็วมาก

## 📧 Contact

มีคำถามหรือข้อเสนอแนะ? เปิด issue ได้เลย!

---

Made with ❤️ for Bitcoin DCA investors
