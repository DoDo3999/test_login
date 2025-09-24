# Unit Fullstack Test — สมัคร/ล็อกอิน/โปรไฟล์ (Node.js + PostgreSQL)

โครงงานตัวอย่างสำหรับแบบทดสอบ: หน้า **สมัครสมาชิก**, **เข้าสู่ระบบ**, **โปรไฟล์**  
สแต็กที่ใช้: **Node.js (Express) + PostgreSQL + CSS/JS **

## โครงสร้างโปรเจกต์ (โดยสรุป)

```
.
├─ public                     # SPA แบบ JS ล้วน (login / register / profile)
│  ├─ css/ styles.css
│  ├─ js/
│  │  ├─ main.js
│  │  └─ pages/ (login.js, register.js, profile.js)
│  └─ index.html
└─ server
   ├─ routes/ auth.js         # API: /api/register /api/login /api/profile /api/logout
   ├─ create_members.sql # สร้างตาราง members
   ├─ db.js                   # pg Pool
   ├─ server.js               # express app + static + CORS + cookie
   ├─ package.json
   └─ env.example
```

---

## 1) ติดตั้งเครื่องมือที่ต้องมี
- Node.js 18+  
- PostgreSQL 14+ (แนะนำ 16/17 ก็ใช้ได้) + pgAdmin

## 2) สร้าง Database/User
เข้า **pgAdmin → Query Tool** แล้วรัน (เปลี่ยนรหัสผ่านตามต้องการ):

```sql
-- สร้างผู้ใช้และ DB (ถ้ามีอยู่แล้วข้ามได้)
CREATE ROLE unit_user WITH LOGIN PASSWORD 'changeme';
CREATE DATABASE unit_test OWNER unit_user;
GRANT ALL PRIVILEGES ON DATABASE unit_test TO unit_user;
```

กด **Connect** DB `unit_test` แล้วรันไฟล์นี้ (ดูหัวข้อ 4): `server/sql/create_members.sql` เพื่อสร้างตาราง **members**  
> ถ้าเคยเจอ error `permission denied for sequence members_id_seq` ให้รันเพิ่ม:
```sql
ALTER SEQUENCE IF EXISTS public.members_id_seq OWNER TO unit_user;
GRANT USAGE, SELECT ON SEQUENCE public.members_id_seq TO unit_user;
```

## 3) ตั้งค่า Environment
คัดลอกไฟล์ `.env.example` ไปเป็น `.env` แล้วกรอกค่าตามเครื่อง:
```bash
# ภายในโฟลเดอร์ server
cp .env.example .env
```

ตัวอย่างค่า:
```
PORT=3000
CLIENT_ORIGIN=http://localhost:3000

PGHOST=localhost
PGPORT=5432
PGDATABASE=unit_test
PGUSER=unit_user
PGPASSWORD=changeme

JWT_SECRET=please_change_this_long_random_string
```

## 4) สร้างตาราง
เปิด `server/sql/create_members.sql` คัดลอกไปรันใน pgAdmin (หรือ `psql`) เพื่อสร้างตาราง `members`.

## 5) ติดตั้งแพ็กเกจ
```bash
cd server
npm i
```

## 6) รันเซิร์ฟเวอร์ (dev)
```bash
npm run dev
# หรือ
node server.js
```

เปิดเบราว์เซอร์: <http://localhost:3000/>

- สมัคร: `/#/register`
- ล็อกอิน: `/#/login`
- โปรไฟล์: `/#/profile`

## 7) ทดสอบ API 
- `POST /api/register` — สมัครสมาชิก (กำหนด cookie JWT ให้)
- `POST /api/login` — ล็อกอิน (username + password)
- `POST /api/logout` — ล็อกเอาต์ (ล้าง cookie)
- `GET  /api/profile` — ต้องมี cookie JWT


