# TANK CLUB Ranking Website

ชุดไฟล์นี้พร้อมสำหรับเอาขึ้นเว็บผ่าน Vercel แบบง่ายที่สุด

## สิ่งที่มีให้แล้ว
- เชื่อม Google Sheet URL นี้ไว้แล้ว
- แสดง Top 10 Ranking หลายหมวด
- ค้นหาชื่อผู้เล่นได้
- กดดูโปรไฟล์ผู้เล่นได้
- รองรับการอ่านคอลัมน์ `Thophy` แล้วแสดงเป็น `Trophy`

## วิธีเอาขึ้นเว็บแบบคนทั่วไป

### วิธีที่ง่ายที่สุด
1. สมัคร GitHub
2. สมัคร Vercel โดยล็อกอินด้วย GitHub
3. สร้าง repository ใหม่ใน GitHub
4. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น GitHub
5. ไปที่ Vercel แล้วกด `Add New Project`
6. เลือก repository นี้
7. กด `Deploy`
8. รอให้เสร็จ แล้วจะได้ลิงก์เว็บทันที

## วิธีอัปโหลดไฟล์ขึ้น GitHub แบบไม่ใช้โค้ด
1. แตกไฟล์ zip นี้ก่อน
2. เข้า GitHub
3. กด `New repository`
4. ตั้งชื่อเช่น `tank-club-ranking`
5. กด `Create repository`
6. กด `uploading an existing file`
7. ลากไฟล์ทั้งหมดจากโฟลเดอร์นี้ใส่ลงไป
8. กด `Commit changes`

## วิธี Deploy ใน Vercel
1. เข้า Vercel
2. กด `Add New...` > `Project`
3. เลือก repo ที่เพิ่งสร้าง
4. กด `Deploy`
5. รอระบบทำงานจนเสร็จ

## เวลาข้อมูลเปลี่ยน ต้องทำยังไง
คุณแก้ข้อมูลใน Google Sheet ได้เลย
แล้วที่หน้าเว็บกดปุ่ม `Reload Data`
หรือรีเฟรชหน้าเว็บก็ได้

## ถ้าจะเปลี่ยนลิงก์ Google Sheet
เปิดไฟล์ `app/page.tsx`
หา `DEFAULT_SHEET_URL`
แล้วเปลี่ยนเป็นลิงก์ใหม่
