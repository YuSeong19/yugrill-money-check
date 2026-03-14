# YuGrill — ระบบบันทึกเงินร้าน (Next.js)

## โครงสร้างโปรเจกต์
```
src/
├── app/
│   ├── layout.js        ← root layout + fonts
│   ├── page.js          ← entry point
│   └── globals.css      ← CSS ทั้งหมด
├── components/
│   ├── App.jsx          ← ตัวหลัก: state + routing
│   ├── Header.jsx       ← หัวเว็บ + นาฬิกา
│   ├── RecordPage.jsx   ← หน้าบันทึกเงิน
│   ├── HistoryPage.jsx  ← หน้าประวัติ + export Excel
│   ├── EditModal.jsx    ← popup แก้ไขรายการ
│   ├── PinModal.jsx     ← popup รหัส PIN
│   └── Calculator.jsx   ← เครื่องคิดเลข
└── lib/
    ├── firebase.js      ← Firebase config
    └── useStore.js      ← hook: records, save, delete
```

## วิธีใช้งาน

### 1. ติดตั้ง
```bash
npm install
```

### 2. ตั้งค่า Firebase
แก้ `SECRET_KEY` ใน `src/lib/firebase.js` แล้วอัปเดต Firebase Rules:
```json
{
  "rules": {
    "shops": {
      "$shopKey": {
        ".read": "$shopKey === 'YOUR_SECRET_KEY'",
        ".write": "$shopKey === 'YOUR_SECRET_KEY'"
      }
    }
  }
}
```

### 3. รันบนเครื่อง
```bash
npm run dev
```

### 4. Deploy บน Vercel
```bash
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/YOUR_USER/yugrill.git
git push -u origin main
```
จากนั้น import repo บน vercel.com → Deploy อัตโนมัติ
