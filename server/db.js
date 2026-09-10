import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'crypto';

// Password Hashing Helper (SHA256 + Salt)
export function hashPassword(password) {
  if (!password) return '';
  return crypto.createHash('sha256').update(password + 'freshfarm_salt_2026').digest('hex');
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  // Support both hashed and legacy plain text fallback during migration
  if (storedHash === password) return true;
  return hashPassword(password) === storedHash;
}

// Simple JWT Token Sign & Verify Helpers (Zero External Dependency)
const JWT_SECRET = process.env.JWT_SECRET || 'freshfarm_jwt_secret_vku_2026';

export function generateToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('base64url');
  return `${str}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [str, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// PostgreSQL Connection Configuration (Strict PostgreSQL Driver Only)
let dbConnectionString = process.env.DATABASE_URL;
if (dbConnectionString) {
  // Strip any sslmode query parameter to prevent pg-connection-string from overriding rejectUnauthorized: false (fixes self-signed certificate error on Render)
  dbConnectionString = dbConnectionString.replace(/([?&])sslmode=[^&]*&?/g, '$1').replace(/[?&]$/, '');
}

const pgConfig = dbConnectionString
  ? { 
      connectionString: dbConnectionString,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'admin',
      database: process.env.PGDATABASE || 'freshfarm_db',
      port: parseInt(process.env.PGPORT || '5432', 10),
    };

export const pgPool = new Pool(pgConfig);
export let isPgConnected = false;

// Universal PostgreSQL Query Wrapper
export async function query(sql, params = []) {
  try {
    // Convert ? placeholders to PostgreSQL $1, $2 if needed
    let pgSql = sql;
    let paramIdx = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIdx++}`);
    }
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } catch (err) {
    console.error('❌ PostgreSQL Query Execution Error:', err.message);
    throw err;
  }
}

// Helper for single row query
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function hasColumn(tableName, columnName) {
  const row = await queryOne(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = ?`,
    [tableName, columnName]
  );
  return Boolean(row);
}

async function ensureColumn(tableName, columnName, definition) {
  if (!(await hasColumn(tableName, columnName))) {
    await query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function runCompatibilityMigrations() {
  // CREATE TABLE IF NOT EXISTS does not alter databases created by older builds.
  // Keep legacy columns during the transition and backfill the new canonical ones.
  await ensureColumn('products', 'category_id', 'VARCHAR(50)');
  if (await hasColumn('products', 'category')) {
    await query("UPDATE products SET category_id = COALESCE(category_id, category) WHERE category_id IS NULL");
  }

  await ensureColumn('harvest_batches', 'producer_id', 'VARCHAR(50)');
  await ensureColumn('harvest_batches', 'producer_name', 'VARCHAR(150)');
  if (await hasColumn('harvest_batches', 'producer')) {
    await query("UPDATE harvest_batches SET producer_name = COALESCE(producer_name, producer) WHERE producer_name IS NULL");
  }

  await ensureColumn('orders', 'customer_id', 'VARCHAR(50)');
  await ensureColumn('orders', 'voucher_code', 'VARCHAR(50)');
  await ensureColumn('orders', 'discount_amount', 'NUMERIC(12,2) DEFAULT 0');
  await query("UPDATE orders o SET customer_id = u.id FROM users u WHERE o.customer_id IS NULL AND o.customer_name = u.name");
  await query("UPDATE orders SET discount_amount = 0 WHERE discount_amount IS NULL");

  await ensureColumn('promotions', 'usage_limit', 'INT DEFAULT 100');
  await ensureColumn('promotions', 'times_used', 'INT DEFAULT 0');
  await query("UPDATE promotions SET usage_limit = 100 WHERE usage_limit IS NULL");
  await query("UPDATE promotions SET times_used = 0 WHERE times_used IS NULL");
}

// Audit Logger Helper
export async function createAuditLog(userId, action, target, details = '') {
  try {
    await query(
      'INSERT INTO audit_logs (user_id, action, target, details) VALUES (?, ?, ?, ?)',
      [userId || 'SYSTEM', action, target, typeof details === 'object' ? JSON.stringify(details) : String(details)]
    );
  } catch (err) {
    console.warn('⚠️ Could not write audit log:', err.message);
  }
}

// Initialize Pure PostgreSQL Database Schemas (12 Tables) & Seed Data
export async function initDatabase() {
  console.log('🐘 🔄 Đang khởi tạo CSDL PostgreSQL 12 Bảng Chuẩn...');

  try {
    const client = await pgPool.connect();
    console.log('🐘 ✅ Đã kết nối thành công PostgreSQL Database Server!');
    isPgConnected = true;
    client.release();

    // 1. Create All 12 PostgreSQL Schemas
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK(role IN ('admin', 'producer', 'supplier', 'transporter', 'consumer')),
        phone VARCHAR(30),
        address TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category_id VARCHAR(50) NOT NULL,
        price NUMERIC(12,2) NOT NULL,
        unit VARCHAR(30) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        rating NUMERIC(3,1) DEFAULT 5.0,
        reviews_count INT DEFAULT 0,
        image TEXT,
        description TEXT,
        farm_name VARCHAR(150),
        supplier_name VARCHAR(150),
        batch_code VARCHAR(50),
        harvest_date VARCHAR(50),
        expiry_date VARCHAR(50),
        certifications TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS harvest_batches (
        id VARCHAR(50) PRIMARY KEY,
        product_name VARCHAR(150) NOT NULL,
        producer_id VARCHAR(50),
        producer_name VARCHAR(150) NOT NULL,
        quantity VARCHAR(50) NOT NULL,
        harvest_date VARCHAR(50) NOT NULL,
        status VARCHAR(100) NOT NULL DEFAULT 'Draft',
        cert VARCHAR(150),
        area VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        batch_id VARCHAR(50),
        movement_type VARCHAR(50) NOT NULL CHECK(movement_type IN ('IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUST')),
        qty INT NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory_reservations (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        qty INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'RESERVED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50),
        customer_name VARCHAR(150) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        address TEXT NOT NULL,
        date VARCHAR(50) NOT NULL,
        total_amount NUMERIC(12,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
        order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        status_text TEXT,
        voucher_code VARCHAR(50),
        discount_amount NUMERIC(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(150) NOT NULL,
        qty INT NOT NULL,
        price NUMERIC(12,2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS shipping_bills (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
        partner_name VARCHAR(150) NOT NULL,
        tracking_code VARCHAR(50) UNIQUE NOT NULL,
        shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 25000,
        status VARCHAR(100) NOT NULL DEFAULT 'Created',
        estimated_delivery VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS promotions (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent INT NOT NULL,
        max_discount NUMERIC(12,2) NOT NULL,
        min_order NUMERIC(12,2) NOT NULL,
        usage_limit INT DEFAULT 100,
        times_used INT DEFAULT 0,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Active'
      );

      CREATE TABLE IF NOT EXISTS promotion_usages (
        id SERIAL PRIMARY KEY,
        promo_id VARCHAR(50) NOT NULL REFERENCES promotions(id),
        order_id VARCHAR(50) NOT NULL REFERENCES orders(id),
        user_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS traceability_events (
        id SERIAL PRIMARY KEY,
        batch_id VARCHAR(50) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(150),
        actor_name VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        target VARCHAR(150),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runCompatibilityMigrations();

    // Seed Categories if empty
    const catCheck = await pgPool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO categories (id, name, icon) VALUES
        ('veggies', 'Rau Củ Hữu Cơ', 'Sprout'),
        ('fruits', 'Trái Cây VietGAP', 'Apple'),
        ('meat', 'Thịt & Hải Sản Thảo Mộc', 'Beef'),
        ('processed', 'Nông Sản Chế Biến', 'Package')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Seed Pre-configured RBAC 5 Role Accounts into PostgreSQL with Hashed Passwords
    const adminCheck = await pgPool.query('SELECT id FROM users WHERE email = $1', ['admin@freshfarm.vn']);
    if (adminCheck.rows.length === 0) {
      console.log('🔑 Đang khởi tạo 5 Tài khoản mẫu 5 Vai trò RBAC (mã hóa password_hash) vào PostgreSQL...');
      const adminPass = hashPassword('admin123');
      const defaultPass = hashPassword('123456');

      await pgPool.query(`
        INSERT INTO users (id, name, email, password, role, phone, address, status)
        VALUES 
        ('U000_ADMIN', 'Quản Trị Viên Hệ Thống (System Admin)', 'admin@freshfarm.vn', '${adminPass}', 'admin', '0900000999', 'Trung tâm Điều hành FreshFarm Platform', 'active'),
        ('U002_PROD', 'Trang trại GreenFarm Đà Lạt', 'producer@freshfarm.vn', '${defaultPass}', 'producer', '0914222333', 'Phường 7, TP. Đà Lạt, Lâm Đồng', 'active'),
        ('U003_SUPP', 'Công ty Phân phối Việt Nông', 'supplier@freshfarm.vn', '${defaultPass}', 'supplier', '0988333444', 'KCN Hòa Cầm, Đà Nẵng', 'active'),
        ('U004_TRAN', 'Viettel Post Nông Sản', 'transporter@freshfarm.vn', '${defaultPass}', 'transporter', '0905999888', 'Hải Châu, Đà Nẵng', 'active'),
        ('U005_CONS', 'Khách hàng Nguyễn Văn Hùng', 'consumer@freshfarm.vn', '${defaultPass}', 'consumer', '0905123456', '124 Nguyễn Văn Linh, Đà Nẵng', 'active')
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log('✅ Đã nạp thành công 5 Tài khoản mẫu 5 Vai trò RBAC vào PostgreSQL!');
    }

    // Seed Products if empty
    const prodCheck = await pgPool.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO products (id, name, category_id, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications)
        VALUES 
        ('P001', 'Rau Cải Thìa Hữu Cơ Đà Lạt', 'veggies', 32000, 'Kg', 150, 4.9, 38, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 'Rau cải thìa trồng theo tiêu chuẩn hữu cơ USDA tại GreenFarm Đà Lạt.', 'Trang trại Hữu cơ GreenFarm Đà Lạt', 'Công ty Nông sản Sạch Việt Nông', 'LOT-20260901-CT', '2026-09-08', '2026-09-15', 'USDA Organic,VietGAP,HACCP'),
        ('P002', 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)', 'fruits', 85000, 'Kg', 80, 5.0, 52, 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=600&q=80', 'Dưa lưới vỏ vàng ruột cam giòn ngọt brix 14+.', 'Nông trại Công nghệ cao Nắng Xanh', 'Chuỗi Phân phối Nông sản Việt Nông', 'LOT-20260905-DL', '2026-09-07', '2026-09-25', 'VietGAP,GlobalGAP'),
        ('P003', 'Thịt Ba Chỉ Heo Thảo Mộc Đương Quy', 'meat', 165000, 'Kg', 45, 4.8, 29, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80', 'Heo nuôi bằng thức ăn thảo dược đương quy.', 'Trang trại Chăn nuôi Thảo mộc An Tâm', 'Công ty Thực phẩm Sạch An Tâm', 'LOT-20260908-HM', '2026-09-09', '2026-09-16', 'VietGAP Chăn nuôi,ISO 22000')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Seed Harvest Batches if empty
    const batchCheck = await pgPool.query('SELECT COUNT(*) FROM harvest_batches');
    if (parseInt(batchCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO harvest_batches (id, product_name, producer_id, producer_name, quantity, harvest_date, status, cert, area)
        VALUES ('LOT-20260901-CT', 'Rau Cải Thìa Hữu Cơ Đà Lạt', 'U002_PROD', 'GreenFarm Đà Lạt', '500 Kg', '2026-09-08', 'Approved', 'USDA Organic', 'Khu A2 Đà Lạt')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Seed Traceability Events if empty
    const traceCheck = await pgPool.query('SELECT COUNT(*) FROM traceability_events');
    if (parseInt(traceCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO traceability_events (batch_id, event_type, description, location, actor_name)
        VALUES 
        ('LOT-20260901-CT', 'Gieo Trồng Hữu Cơ', 'Sử dụng phân bón hữu cơ sinh học đạt chuẩn USDA', 'Lô A2 GreenFarm Đà Lạt', 'Trang trại GreenFarm Đà Lạt'),
        ('LOT-20260901-CT', 'Thu Hoạch & Kiểm Định', 'Đạt chứng nhận tiêu chuẩn VietGAP & Kiểm định Dư lượng 0%', 'Khu A2 Đà Lạt', 'Chi cục Kiểm định Nông nghiệp'),
        ('LOT-20260901-CT', 'Nhập Kho Phân Phối', 'Bàn giao 500Kg cho kho bảo quản lạnh 4°C Việt Nông', 'Kho Hòa Cầm Đà Nẵng', 'Công ty Phân phối Việt Nông');
      `);
    }

    // Seed Promotions if empty
    const promoCheck = await pgPool.query('SELECT COUNT(*) FROM promotions');
    if (parseInt(promoCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO promotions (id, code, discount_percent, max_discount, min_order, usage_limit, times_used, description, status)
        VALUES 
        ('PROM-01', 'FRESH50', 15, 50000, 200000, 100, 2, 'Giảm 15% tối đa 50k cho đơn từ 200k', 'Active'),
        ('PROM-02', 'GREEN10', 10, 30000, 100000, 200, 5, 'Giảm 10% cho đơn nông sản sạch từ 100k', 'Active')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

  } catch (err) {
    console.error('❌ Lỗi kết nối PostgreSQL Server:', err.message);
    isPgConnected = false;
  }
}
