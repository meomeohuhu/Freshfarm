import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL Connection Configuration (Strict PostgreSQL Driver Only)
let dbConnectionString = process.env.DATABASE_URL;
if (dbConnectionString && !dbConnectionString.includes('sslmode=')) {
  dbConnectionString += dbConnectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
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

// Initialize Pure PostgreSQL Database Schemas & Seed Data
export async function initDatabase() {
  console.log('🐘 🔄 Đang khởi tạo và kết nối cơ sở dữ liệu PostgreSQL...');

  try {
    const client = await pgPool.connect();
    console.log('🐘 ✅ Đã kết nối thành công PostgreSQL Database Server!');
    isPgConnected = true;
    client.release();

    // 1. Create Users Table (RBAC 5 Roles)
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL DEFAULT '123456',
        role VARCHAR(50) NOT NULL CHECK(role IN ('admin', 'producer', 'supplier', 'transporter', 'consumer')),
        phone VARCHAR(30),
        address TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Hoạt động',
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
        category VARCHAR(50) NOT NULL,
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
        certifications TEXT
      );

      CREATE TABLE IF NOT EXISTS harvest_batches (
        id VARCHAR(50) PRIMARY KEY,
        product_name VARCHAR(150) NOT NULL,
        producer VARCHAR(150) NOT NULL,
        quantity VARCHAR(50) NOT NULL,
        harvest_date VARCHAR(50) NOT NULL,
        status VARCHAR(100) NOT NULL,
        cert VARCHAR(150),
        area VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        address TEXT NOT NULL,
        date VARCHAR(50) NOT NULL,
        total_amount NUMERIC(12,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) NOT NULL,
        order_status VARCHAR(50) NOT NULL,
        status_text TEXT,
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
        order_id VARCHAR(50) NOT NULL,
        partner_name VARCHAR(150) NOT NULL,
        tracking_code VARCHAR(50) NOT NULL,
        shipping_fee NUMERIC(12,2) NOT NULL,
        status VARCHAR(100) NOT NULL,
        estimated_delivery VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS promotions (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent INT NOT NULL,
        max_discount NUMERIC(12,2) NOT NULL,
        min_order NUMERIC(12,2) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Active'
      );
    `);

    // 2. Seed Pre-configured RBAC 5 Role Accounts into PostgreSQL
    const adminCheck = await pgPool.query('SELECT id FROM users WHERE email = $1', ['admin@freshfarm.vn']);
    if (adminCheck.rows.length === 0) {
      console.log('🔑 Đang khởi tạo 5 Tài khoản mẫu 5 Vai trò RBAC vào PostgreSQL...');
      await pgPool.query(`
        INSERT INTO users (id, name, email, password, role, phone, address, status)
        VALUES 
        ('U000_ADMIN', 'Quản Trị Viên Hệ Thống (System Admin)', 'admin@freshfarm.vn', 'admin123', 'admin', '0900000999', 'Trung tâm Điều hành FreshFarm Platform', 'Hoạt động'),
        ('U002_PROD', 'Trang trại GreenFarm Đà Lạt', 'producer@freshfarm.vn', '123456', 'producer', '0914222333', 'Phường 7, TP. Đà Lạt, Lâm Đồng', 'Hoạt động'),
        ('U003_SUPP', 'Công ty Phân phối Việt Nông', 'supplier@freshfarm.vn', '123456', 'supplier', '0988333444', 'KCN Hòa Cầm, Đà Nẵng', 'Hoạt động'),
        ('U004_TRAN', 'Viettel Post Nông Sản', 'transporter@freshfarm.vn', '123456', 'transporter', '0905999888', 'Hải Châu, Đà Nẵng', 'Hoạt động'),
        ('U005_CONS', 'Khách hàng Nguyễn Văn Hùng', 'consumer@freshfarm.vn', '123456', 'consumer', '0905123456', '124 Nguyễn Văn Linh, Đà Nẵng', 'Hoạt động')
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log('✅ Đã nạp thành công 5 Tài khoản mẫu 5 Vai trò RBAC vào PostgreSQL!');
    }

    // 3. Seed Products if empty
    const prodCheck = await pgPool.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO products (id, name, category, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications)
        VALUES 
        ('P001', 'Rau Cải Thìa Hữu Cơ Đà Lạt', 'veggies', 32000, 'Kg', 150, 4.9, 38, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 'Rau cải thìa trồng theo tiêu chuẩn hữu cơ USDA tại GreenFarm Đà Lạt.', 'Trang trại Hữu cơ GreenFarm Đà Lạt', 'Công ty Nông sản Sạch Việt Nông', 'LOT-20260901-CT', '2026-09-08', '2026-09-15', 'USDA Organic,VietGAP,HACCP'),
        ('P002', 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)', 'fruits', 85000, 'Kg', 80, 5.0, 52, 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=600&q=80', 'Dưa lưới vỏ vàng ruột cam giòn ngọt brix 14+.', 'Nông trại Công nghệ cao Nắng Xanh', 'Chuỗi Phân phối Nông sản Việt Nông', 'LOT-20260905-DL', '2026-09-07', '2026-09-25', 'VietGAP,GlobalGAP'),
        ('P003', 'Thịt Ba Chỉ Heo Thảo Mộc Đương Quy', 'meat', 165000, 'Kg', 45, 4.8, 29, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80', 'Heo nuôi bằng thức ăn thảo dược đương quy.', 'Trang trại Chăn nuôi Thảo mộc An Tâm', 'Công ty Thực phẩm Sạch An Tâm', 'LOT-20260908-HM', '2026-09-09', '2026-09-16', 'VietGAP Chăn nuôi,ISO 22000')
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✅ Đã khởi tạo dữ liệu sản phẩm mẫu trong PostgreSQL!');
    }

    // 4. Seed Harvest Batches if empty
    const batchCheck = await pgPool.query('SELECT COUNT(*) FROM harvest_batches');
    if (parseInt(batchCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO harvest_batches (id, product_name, producer, quantity, harvest_date, status, cert, area)
        VALUES ('LOT-20260901-CT', 'Rau Cải Thìa Hữu Cơ Đà Lạt', 'GreenFarm Đà Lạt', '500 Kg', '2026-09-08', 'Đã xuất kho phân phối', 'USDA Organic', 'Khu A2 Đà Lạt')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // 5. Seed Orders & Items if empty
    const orderCheck = await pgPool.query('SELECT COUNT(*) FROM orders');
    if (parseInt(orderCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO orders (id, customer_name, phone, address, date, total_amount, payment_method, payment_status, order_status, status_text)
        VALUES ('ORD-98213', 'Khách hàng Nguyễn Văn Hùng', '0905123456', '124 Nguyễn Văn Linh, Đà Nẵng', '2026-09-09', 216000, 'momo', 'Đã thanh toán', 'Processing', 'Đang đóng gói tại kho Đà Nẵng')
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO order_items (order_id, product_id, product_name, qty, price)
        VALUES 
        ('ORD-98213', 'P001', 'Rau Cải Thìa Hữu Cơ Đà Lạt', 2, 32000),
        ('ORD-98213', 'P002', 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)', 1, 85000);
      `);
    }

    // 6. Seed Shipping Bills if empty
    const shipCheck = await pgPool.query('SELECT COUNT(*) FROM shipping_bills');
    if (parseInt(shipCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO shipping_bills (id, order_id, partner_name, tracking_code, shipping_fee, status, estimated_delivery)
        VALUES ('SHIP-98213', 'ORD-98213', 'Viettel Post Nông Sản', 'VP8892113VN', 25000, 'Đang vận chuyển', '2026-09-11')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // 7. Seed Promotions if empty
    const promoCheck = await pgPool.query('SELECT COUNT(*) FROM promotions');
    if (parseInt(promoCheck.rows[0].count, 10) === 0) {
      await pgPool.query(`
        INSERT INTO promotions (id, code, discount_percent, max_discount, min_order, description, status)
        VALUES ('PROM-01', 'FRESH50', 15, 50000, 200000, 'Giảm 15% tối đa 50k cho đơn từ 200k', 'Active')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

  } catch (err) {
    console.error('❌ Lỗi kết nối PostgreSQL Server:', err.message);
    isPgConnected = false;
  }
}
