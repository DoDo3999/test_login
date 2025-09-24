import { Router } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = Router();

/** REGISTER */
router.post(
  '/register',
  [
    body('username').isLength({ min: 4, max: 20 }).matches(/^[A-Za-z][A-Za-z0-9_]{3,19}$/),
    body('password').isLength({ min: 8, max: 72 }),
    body('member_type').notEmpty(),
    body('company_name').notEmpty(),
    body('house_no').notEmpty(),
    body('road').notEmpty(),
    body('subdistrict').notEmpty(),
    body('district').notEmpty(),
    body('province').notEmpty(),
    body('postal_code').notEmpty(),
    body('contact_title').notEmpty(),
    body('contact_fname').notEmpty(),
    body('contact_lname').notEmpty(),
    body('phone').notEmpty(),
    body('email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // normalize + trim
    const d = {};
    for (const [k, v] of Object.entries(req.body || {})) d[k] = (v == null ? '' : String(v)).trim();

    const required = [
      'username','password','member_type','company_name','house_no','road','subdistrict',
      'district','province','postal_code','contact_title','contact_fname','contact_lname',
      'phone','email'
    ];
    const missing = required.filter(k => !d[k]);
    if (missing.length) return res.status(400).json({ error: 'missing required fields', fields: missing });

    const safe = x => (x && x !== '' ? x : null);

    try {
      const ex = await pool.query('SELECT 1 FROM members WHERE username=$1', [d.username]);
      if (ex.rowCount) return res.status(409).json({ error: 'Username already exists' });

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Server error', detail: 'JWT_SECRET is missing' });
      }

      const hash = await bcrypt.hash(d.password, 12);

      const vals = [
        d.username,               
        hash,                     
        d.member_type,            
        d.company_name,           
        safe(d.tax_id),           
        d.house_no,               
        safe(d.moo),              
        safe(d.building),         
        safe(d.alley),            
        d.road,                   
        d.subdistrict,            
        d.district,               
        d.province,               
        d.postal_code,            
        d.contact_title,          
        d.contact_fname,          
        d.contact_lname,          
        d.phone,                  
        d.email,                  
        safe(d.ref_code),         
      ];

      const mustNotNullIdx = [1,2,3,4,6,10,11,12,13,14,15,16,17,18,19];
      const bad = mustNotNullIdx.filter(i => vals[i-1] == null);
      if (bad.length) return res.status(400).json({ error: 'invalid/null values for NOT NULL columns', indexes: bad });

      const sql = `
        INSERT INTO members (
          username, password_hash, member_type, company_name, tax_id,
          house_no, moo, building, alley, road,
          subdistrict, district, province, postal_code,
          contact_title, contact_fname, contact_lname, phone, email, ref_code
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
        ) RETURNING id, username
      `;

      const ins = await pool.query(sql, vals);
      const payload = { id: ins.rows[0].id, username: ins.rows[0].username };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7*24*60*60*1000 });
      res.json({ message: 'Registered', user: payload });

    } catch (e) {
      console.error('REGISTER ERROR:', e);
      if (e.code === '23505') return res.status(409).json({ error: 'Username already exists' });
      if (e.code === '23502') return res.status(400).json({ error: 'Some required fields are null' });
      if (e.code === '42703') return res.status(500).json({ error: 'Server error', detail: 'DB column name mismatch' });
      return res.status(500).json({ error: 'Server error', detail: e.message });
    }
  }
);

/** LOGIN */
router.post('/login', [ body('username').notEmpty(), body('password').notEmpty() ], async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

  const { username, password } = req.body;
  try{
    const q = await pool.query('SELECT * FROM members WHERE username=$1', [username]);
    if(!q.rowCount) return res.status(401).json({error:'Invalid credentials'});
    const u = q.rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});

    const token = jwt.sign({id:u.id, username:u.username}, process.env.JWT_SECRET, {expiresIn:'7d'});
    res.cookie('token', token, { httpOnly:true, sameSite:'lax', maxAge: 7*24*60*60*1000 });
    res.json({ message:'Logged in' });
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Server error'});
  }
});

/** LOGOUT */
router.post('/logout', (req,res)=>{
  res.clearCookie('token');
  res.json({ message:'Logged out' });
});

/** PROFILE */
router.get('/profile', async (req,res)=>{
  const token = req.cookies?.token;
  if(!token) return res.status(401).json({error:'Unauthorized'});

  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const q = await pool.query('SELECT * FROM members WHERE id=$1', [payload.id]);
    if(!q.rowCount) return res.status(404).json({error:'Not found'});
    const { password_hash, ...safe } = q.rows[0];
    res.json(safe);
  }catch(e){
    res.status(401).json({error:'Invalid token'});
  }
});

export default router;
