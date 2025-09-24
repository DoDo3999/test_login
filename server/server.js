import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import { pool } from './db.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet()); // CSP defaults enable "script-src 'self'" (works with external JS files)
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

if (process.env.CLIENT_ORIGIN) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
}

app.get('/api/db-check', async (_req,res)=>{
  try{
    const { rows } = await pool.query('SELECT version() as v, current_database() as db, current_user as usr');
    res.json({ ok:true, db: rows[0].db, user: rows[0].usr, version: rows[0].v });
  }catch(e){
    res.status(500).json({ ok:false, error: e.message });
  }
});

app.use('/api', authRoutes);

// SPA fallback for "pages" (so /login.html, /register.html, /profile.html all serve index.html)
const indexFile = path.join(publicDir, 'index.html');
app.get(['/', '/login.html', '/register.html', '/profile.html'], (_req, res) => {
  res.sendFile(indexFile);
});

pool.query('SELECT 1').then(()=> console.log('✅ Postgres connected'))
  .catch(err => console.error('❌ Postgres connection failed:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
