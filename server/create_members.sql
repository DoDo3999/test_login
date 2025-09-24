-- สร้างตารางเก็บสมาชิก
CREATE TABLE IF NOT EXISTS public.members (
  id            BIGSERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,

  member_type   TEXT NOT NULL,
  company_name  TEXT NOT NULL,
  tax_id        TEXT,

  house_no      TEXT NOT NULL,
  moo           TEXT,
  building      TEXT,
  alley         TEXT,
  road          TEXT NOT NULL,
  subdistrict   TEXT NOT NULL,
  district      TEXT NOT NULL,
  province      TEXT NOT NULL,
  postal_code   TEXT NOT NULL,

  contact_title  TEXT NOT NULL,
  contact_fname  TEXT NOT NULL,
  contact_lname  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT NOT NULL,
  ref_code       TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ดัชนีที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_members_username ON public.members (username);
CREATE INDEX IF NOT EXISTS idx_members_email    ON public.members (email);

-- จัดการ owner/permission ของ sequence (กัน error permission denied)
DO $$
BEGIN
  PERFORM 1 FROM pg_roles WHERE rolname = 'unit_user';
  IF FOUND THEN
    ALTER SEQUENCE IF EXISTS public.members_id_seq OWNER TO unit_user;
    GRANT USAGE, SELECT ON SEQUENCE public.members_id_seq TO unit_user;
  END IF;
END$$;
