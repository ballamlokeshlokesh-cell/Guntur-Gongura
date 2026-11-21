const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'staff.db');

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);

// Check if table exists and inspect columns for migration
const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='staff'").get();
if (tableCheck) {
  const columns = db.prepare('PRAGMA table_info(staff)').all();
  const hasEmail = columns.some(c => c.name === 'email');
  const hasId = columns.some(c => c.name === 'id');
  if (!hasEmail && hasId) {
    // Migrate from legacy ID to Email schema
    db.exec(`
      CREATE TABLE staff_new (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Staff',
        created_at TEXT NOT NULL
      );
      INSERT INTO staff_new (email, password, name, role, created_at)
      SELECT 
        CASE 
          WHEN id LIKE '%@%' THEN id 
          ELSE id || '@restaurant.com' 
        END, 
        password, name, role, created_at 
      FROM staff;
      DROP TABLE staff;
      ALTER TABLE staff_new RENAME TO staff;
    `);
    console.log('🔄 Migrated SQLite staff table from ID to Email schema.');
  }
} else {
  // Create table if not exists with email primary key
  db.exec(`
    CREATE TABLE staff (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Staff',
      created_at TEXT NOT NULL
    );
  `);
}

// Seed default accounts if empty
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM staff');
const { count } = countStmt.get();
if (count === 0) {
  const insertStmt = db.prepare('INSERT INTO staff (email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?)');
  insertStmt.run('staff@restaurant.com', 'password123', 'Standard Staff', 'Staff', new Date().toISOString());
  insertStmt.run('admin@restaurant.com', 'admin123', 'Restaurant Admin', 'Manager', new Date().toISOString());
  console.log('✅ Initialized SQLite database with default staff accounts.');
}

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // API Routes
  try {
    // 1. Staff Login Authentication
    if (pathname === '/api/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const email = (body.email || body.id || '').trim();
      const password = (body.password || '').trim();

      if (!email || !password) {
        return sendJSON(res, 400, { ok: false, error: 'Email and password required' });
      }
      const stmt = db.prepare('SELECT email, name, role FROM staff WHERE LOWER(email) = LOWER(?) AND password = ?');
      const staff = stmt.get(email, password);
      if (staff) {
        return sendJSON(res, 200, { ok: true, staff });
      } else {
        return sendJSON(res, 401, { ok: false, error: 'Invalid Email or Password' });
      }
    }

    // 2. Get All Staff
    if (pathname === '/api/staff' && req.method === 'GET') {
      const stmt = db.prepare('SELECT email, password, name, role, created_at FROM staff');
      const list = stmt.all();
      return sendJSON(res, 200, { ok: true, staff: list });
    }

    // 3. Add New Staff
    if (pathname === '/api/staff' && req.method === 'POST') {
      const body = await parseBody(req);
      const email = (body.email || body.id || '').trim();
      const password = (body.password || '').trim();
      const name = (body.name || '').trim();
      const role = (body.role || 'Staff').trim();

      if (!email || !password) {
        return sendJSON(res, 400, { ok: false, error: 'Email and Password are required' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJSON(res, 400, { ok: false, error: 'Please enter a valid email address' });
      }
      const checkStmt = db.prepare('SELECT email FROM staff WHERE LOWER(email) = LOWER(?)');
      if (checkStmt.get(email)) {
        return sendJSON(res, 409, { ok: false, error: `Staff email "${email}" already exists in database!` });
      }
      const insert = db.prepare('INSERT INTO staff (email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?)');
      insert.run(email, password, name || email.split('@')[0], role, new Date().toISOString());
      return sendJSON(res, 201, { ok: true, msg: 'Staff created in SQLite database' });
    }

    // 4. Update Staff Password
    if (pathname.startsWith('/api/staff/') && req.method === 'PUT') {
      const email = decodeURIComponent(pathname.replace('/api/staff/', '')).trim();
      const { password } = await parseBody(req);
      if (!password) {
        return sendJSON(res, 400, { ok: false, error: 'New password required' });
      }
      const update = db.prepare('UPDATE staff SET password = ? WHERE LOWER(email) = LOWER(?)');
      update.run(password.trim(), email);
      return sendJSON(res, 200, { ok: true, msg: 'Password updated' });
    }

    // 5. Delete Staff
    if (pathname.startsWith('/api/staff/') && req.method === 'DELETE') {
      const email = decodeURIComponent(pathname.replace('/api/staff/', '')).trim();
      const count = db.prepare('SELECT COUNT(*) as total FROM staff').get().total;
      if (count <= 1) {
        return sendJSON(res, 400, { ok: false, error: 'Cannot delete the only remaining staff account!' });
      }
      const del = db.prepare('DELETE FROM staff WHERE LOWER(email) = LOWER(?)');
      del.run(email);
      return sendJSON(res, 200, { ok: true, msg: 'Staff deleted' });
    }

    // Static File Serving (index.html)
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
      };
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      return fs.createReadStream(filePath).pipe(res);
    }

    sendJSON(res, 404, { error: 'Not Found' });
  } catch (err) {
    console.error('Server error:', err);
    sendJSON(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🍽️ Guntur Gongura Restaurant Server is running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  SQLite Database File: ${DB_PATH}`);
  console.log(`=======================================================`);
});