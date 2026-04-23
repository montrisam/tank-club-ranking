# วิธีใช้งานแบบง่าย

## 1) ติดตั้ง
เปิด Terminal ในโฟลเดอร์นี้ แล้วพิมพ์:

```bash
npm install
```

## 2) รันในเครื่อง
```bash
npm run dev
```

จากนั้นเปิด:
```bash
http://localhost:3000
```

## 3) ไฟล์สำคัญ
- หน้าเว็บหลัก: `app/page.tsx`
- backend ดึง Google Sheet: `app/api/rankings/route.ts`
- สไตล์รวม: `app/globals.css`

## 4) เปลี่ยนลิงก์ Google Sheet
แก้ที่ไฟล์:
- `app/api/rankings/route.ts`

ตัวแปร:
```ts
const SHEET_CSV_URL = "..."
```

## 5) Deploy ขึ้น Vercel
- อัปไฟล์ทั้งหมดขึ้น GitHub
- ไป Vercel
- Import repository
- กด Deploy

## 6) จุดสำคัญ
เว็บนี้ดึงข้อมูลจาก Google Sheet ผ่าน backend API แล้ว
จึงไม่ต้องกด Allow network access ที่หน้าเว็บอีก
