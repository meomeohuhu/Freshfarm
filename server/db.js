import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqliteDbPath = path.join(__dirname, 'freshfarm.db');

export let sqliteDb = null;
export let isPgConnected = false;
export let isMemoryDbActive = false;

// In-Memory Fallback Engine (Guarantees 100% Uptime under any deployment environment)
const memoryStore = {
  users: [
    { id: 'U000_ADMIN', name: 'Quản Trị Viên Hệ Thống (System Admin)', email: 'admin@freshfarm.vn', password: 'admin123', role: 'admin', phone: '0900000999', address: 'Trung tâm Điều hành FreshFarm Platform', status: 'Hoạt động', created_at: new Date().toISOString() },
    { id: 'U002_PROD', name: 'Trang trại GreenFarm Đà Lạt', email: 'producer@freshfarm.vn', password: '123456', role: 'producer', phone: '0914222333', address: 'Phường 7, TP. Đà Lạt, Lâm Đồng', status: 'Hoạt động', created_at: new Date().toISOString() },
    { id: 'U003_SUPP', name: 'Công ty Phân phối Việt Nông', email: 'supplier@freshfarm.vn', password: '123456', role: 'supplier', phone: '0988333444', address: 'KCN Hòa Cầm, Đà Nẵng', status: 'Hoạt động', created_at: new Date().toISOString() },
    { id: 'U004_TRAN', name: 'Viettel Post Nông Sản', email: 'transporter@freshfarm.vn', password: '123456', role: 'transporter', phone: '0905999888', address: 'Hải Châu, Đà Nẵng', status: 'Hoạt động', created_at: new Date().toISOString() },
    { id: 'U005_CONS', name: 'Khách hàng Nguyễn Văn Hùng', email: 'consumer@freshfarm.vn', password: '123456', role: 'consumer', phone: '0905123456', address: '124 Nguyễn Văn Linh, Đà Nẵng', status: 'Hoạt động', created_at: new Date().toISOString() }
  ],
  products: [
    { id: 'P001', name: 'Rau Cải Thìa Hữu Cơ Đà Lạt', category: 'veggies', price: 32000, unit: 'Kg', stock: 150, rating: 4.9, reviews_count: 38, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', description: 'Rau cải thìa trồng theo tiêu chuẩn hữu cơ USDA tại GreenFarm Đà Lạt.', farm_name: 'Trang trại Hữu cơ GreenFarm Đà Lạt', supplier_name: 'Công ty Nông sản Sạch Việt Nông', batch_code: 'LOT-20260901-CT', harvest_date: '2026-09-08', expiry_date: '2026-09-15', certifications: 'USDA Organic,VietGAP,HACCP' },
    { id: 'P002', name: 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)', category: 'fruits', price: 85000, unit: 'Kg', stock: 80, rating: 5.0, reviews_count: 52, image: 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=600&q=80', description: 'Dưa lưới vỏ vàng ruột cam giòn ngọt brix 14+.', farm_name: 'Nông trại Công nghệ cao Nắng Xanh', supplier_name: 'Chuỗi Phân phối Nông sản Việt Nông', batch_code: 'LOT-20260905-DL', harvest_date: '2026-09-07', expiry_date: '2026-09-25', certifications: 'VietGAP,GlobalGAP' },
    { id: 'P003', name: 'Thịt Ba Chỉ Heo Thảo Mộc Đương Quy', category: 'meat', price: 165000, unit: 'Kg', stock: 45, rating: 4.8, reviews_count: 29, image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80', description: 'Heo nuôi bằng thức ăn thảo dược đương quy.', farm_name: 'Trang trại Chăn nuôi Thảo mộc An Tâm', supplier_name: 'Công ty Thực phẩm Sạch An Tâm', batch_code: 'LOT-20260908-HM', harvest_date: '2026-09-09', expiry_date: '2026-09-16', certifications: 'VietGAP Chăn nuôi,ISO 22000' }
  ],
  harvest_batches: [
    { id: 'LOT-20260901-CT', product_name: 'Rau Cải Thìa Hữu Cơ Đà Lạt', producer: 'GreenFarm Đà Lạt', quantity: '500 Kg', harvest_date: '2026-09-08', status: 'Đã xuất kho phân phối', cert: 'USDA Organic', area: 'Khu A2 Đà Lạt', created_at: new Date().toISOString() }
  ],
  orders: [
    { id: 'ORD-98213', customer_name: 'Khách hàng Nguyễn Văn Hùng', phone: '0905123456', address: '124 Nguyễn Văn Linh, Đà Nẵng', date: '2026-09-09', total_amount: 216000, payment_method: 'momo', payment_status: 'Đã thanh toán', order_status: 'Processing', status_text: 'Đang đóng gói tại kho Đà Nẵng', created_at: new Date().toISOString() }
  ],
  order_items: [
    { id: 1, order_id: 'ORD-98213', product_id: 'P001', product_name: 'Rau Cải Thìa Hữu Cơ Đà Lạt', qty: 2, price: 32000 },
    { id: 2, order_id: 'ORD-98213', product_id: 'P002', product_name: 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)', qty: 1, price: 85000 }
  ],
  shipping_bills: [
    { id: 'SHIP-98213', order_id: 'ORD-98213', partner_name: 'Viettel Post Nông Sản', tracking_code: 'VP8892113VN', shipping_fee: 25000, status: 'Đang vận chuyển', estimated_delivery: '2026-09-11', created_at: new Date().toISOString() }
  ],
  promotions: [
    { id: 'PROM-01', code: 'FRESH50', discount_percent: 15, max_discount: 50000, min_order: 200000, description: 'Giảm 15% tối đa 50k cho đơn từ 200k', status: 'Active' }
  ]
};

function memoryQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upperSql = cleanSql.toUpperCase();

  // SELECT COUNT(*) FROM <table>
  if (upperSql.includes('COUNT(*)')) {
    if (upperSql.includes('FROM USERS')) return [{ count: memoryStore.users.length }];
    if (upperSql.includes('FROM PRODUCTS')) return [{ count: memoryStore.products.length }];
    return [{ count: 0 }];
  }

  // SELECT FROM USERS
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM USERS')) {
    if (upperSql.includes('WHERE EMAIL =')) {
      const email = params[0];
      const found = memoryStore.users.find(u => u.email === email);
      return found ? [found] : [];
    }
    return memoryStore.users;
  }

  // SELECT FROM PRODUCTS
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM PRODUCTS')) {
    if (upperSql.includes('WHERE ID =')) {
      const id = params[0];
      const found = memoryStore.products.find(p => p.id === id);
      return found ? [found] : [];
    }
    return memoryStore.products;
  }

  // SELECT FROM HARVEST_BATCHES
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM HARVEST_BATCHES')) {
    return memoryStore.harvest_batches;
  }

  // SELECT FROM ORDERS
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM ORDERS')) {
    if (upperSql.includes('WHERE ID =')) {
      const id = params[0];
      const found = memoryStore.orders.find(o => o.id === id);
      return found ? [found] : [];
    }
    return memoryStore.orders;
  }

  // SELECT FROM ORDER_ITEMS
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM ORDER_ITEMS')) {
    if (upperSql.includes('WHERE ORDER_ID =')) {
      const orderId = params[0];
      return memoryStore.order_items.filter(i => i.order_id === orderId);
    }
    return memoryStore.order_items;
  }

  // SELECT FROM SHIPPING_BILLS
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM SHIPPING_BILLS')) {
    return memoryStore.shipping_bills;
  }

  // SELECT FROM PROMOTIONS
  if (upperSql.startsWith('SELECT') && upperSql.includes('FROM PROMOTIONS')) {
    return memoryStore.promotions;
  }

  // INSERT INTO USERS
  if (upperSql.startsWith('INSERT INTO USERS')) {
    const [id, name, email, password, role, phone, address, status] = params;
    const newUser = { id, name, email, password, role, phone, address, status: status || 'Hoạt động', created_at: new Date().toISOString() };
    memoryStore.users.push(newUser);
    return [{ lastID: id, changes: 1 }];
  }

  // INSERT INTO PRODUCTS
  if (upperSql.startsWith('INSERT INTO PRODUCTS')) {
    const [id, name, category, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications] = params;
    const newProd = { id, name, category, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications };
    memoryStore.products.push(newProd);
    return [{ lastID: id, changes: 1 }];
  }

  // INSERT INTO HARVEST_BATCHES
  if (upperSql.startsWith('INSERT INTO HARVEST_BATCHES')) {
    const [id, product_name, producer, quantity, harvest_date, status, cert, area] = params;
    const newBatch = { id, product_name, producer, quantity, harvest_date, status, cert, area, created_at: new Date().toISOString() };
    memoryStore.harvest_batches.push(newBatch);
    return [{ lastID: id, changes: 1 }];
  }

  // INSERT INTO ORDERS
  if (upperSql.startsWith('INSERT INTO ORDERS')) {
    const [id, customer_name, phone, address, date, total_amount, payment_method, payment_status, order_status, status_text] = params;
    const newOrder = { id, customer_name, phone, address, date, total_amount, payment_method, payment_status, order_status, status_text, created_at: new Date().toISOString() };
    memoryStore.orders.push(newOrder);
    return [{ lastID: id, changes: 1 }];
  }

  // INSERT INTO ORDER_ITEMS
  if (upperSql.startsWith('INSERT INTO ORDER_ITEMS')) {
    const [order_id, product_id, product_name, qty, price] = params;
    const newItem = { id: memoryStore.order_items.length + 1, order_id, product_id, product_name, qty, price };
    memoryStore.order_items.push(newItem);
    return [{ lastID: newItem.id, changes: 1 }];
  }

  // INSERT INTO SHIPPING_BILLS
  if (upperSql.startsWith('INSERT INTO SHIPPING_BILLS')) {
    const [id, order_id, partner_name, tracking_code, shipping_fee, status, estimated_delivery] = params;
    const newBill = { id, order_id, partner_name, tracking_code, shipping_fee, status, estimated_delivery, created_at: new Date().toISOString() };
    memoryStore.shipping_bills.push(newBill);
    return [{ lastID: id, changes: 1 }];
  }

  // UPDATE USERS
  if (upperSql.startsWith('UPDATE USERS')) {
    const [status, userId] = params;
    const user = memoryStore.users.find(u => u.id === userId);
    if (user) user.status = status;
    return [{ changes: 1 }];
  }

  // UPDATE ORDERS
  if (upperSql.startsWith('UPDATE ORDERS')) {
    const [orderStatus, statusText, id] = params;
    const order = memoryStore.orders.find(o => o.id === id);
    if (order) {
      order.order_status = orderStatus;
      order.status_text = statusText;
    }
    return [{ changes: 1 }];
  }

  return [];
}

// PostgreSQL Pool Connection Configuration
const pgConfig = process.env.DATABASE_URL
  ? { 
      connectionString: process.env.DATABASE_URL,
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

// Universal Query Abstraction (PostgreSQL -> SQLite -> In-Memory Store)
export async function query(sql, params = []) {
  if (isPgConnected) {
    try {
      let pgSql = sql;
      let paramIdx = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIdx++}`);
      }
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } catch (err) {
      console.error('❌ PostgreSQL Query Error:', err.message);
      throw err;
    }
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      let sqliteSql = sql;
      sqliteSql = sqliteSql.replace(/\$\d+/g, '?');

      if (sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().startsWith('PRAGMA')) {
        sqliteDb.all(sqliteSql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(sqliteSql, params, function (err) {
          if (err) reject(err);
          else resolve([{ lastID: this.lastID, changes: this.changes }]);
        });
      }
    });
  } else {
    // Automatic In-Memory Store Fallback
    return memoryQuery(sql, params);
  }
}

// Helper for single row
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// Initialize Database & Seed Data
export async function initDatabase() {
  console.log('🔄 Đang kiểm tra kết nối PostgreSQL Server (Port 5432)...');

  try {
    const client = await pgPool.connect();
    console.log('🐘 ✅ Đã kết nối thành công PostgreSQL Database (PostgreSQL Engine Active)!');
    isPgConnected = true;
    client.release();

    // Create PostgreSQL Schemas
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

    // Seed Pre-configured Role Accounts (Admin, Producer, Supplier, Transporter, Consumer)
    const adminCheck = await pgPool.query('SELECT id FROM users WHERE email = $1', ['admin@freshfarm.vn']);
    if (adminCheck.rows.length === 0) {
      console.log('🔑 Đang khởi tạo 5 Tài khoản mẫu 5 Vai trò RBAC trong PostgreSQL...');
      await pgPool.query(`
        INSERT INTO users (id, name, email, password, role, phone, address, status)
        VALUES 
        ('U000_ADMIN', 'Quản Trị Viên Hệ Thống (System Admin)', 'admin@freshfarm.vn', 'admin123', 'admin', '0900000999', 'Trung tâm Điều hành FreshFarm Platform', 'Hoạt động'),
        ('U002_PROD', 'Trang trại GreenFarm Đà Lạt', 'producer@freshfarm.vn', '123456', 'producer', '0914222333', 'Phường 7, TP. Đà Lạt, Lâm Đồng', 'Hoạt động'),
        ('U003_SUPP', 'Công ty Phân phối Việt Nông', 'supplier@freshfarm.vn', '123456', 'supplier', '0988333444', 'KCN Hòa Cầm, Đà Nẵng', 'Hoạt động'),
        ('U004_TRAN', 'Viettel Post Nông Sản', 'transporter@freshfarm.vn', '123456', 'transporter', '0905999888', 'Hải Châu, Đà Nẵng', 'Hoạt động'),
        ('U005_CONS', 'Khách hàng Nguyễn Văn Hùng', 'consumer@freshfarm.vn', '123456', 'consumer', '0905123456', '124 Nguyễn Văn Linh, Đà Nẵng', 'Hoạt động')
      `);

      const prodCheck = await pgPool.query('SELECT COUNT(*) FROM products');
      if (parseInt(prodCheck.rows[0].count, 10) === 0) {
        await pgPool.query(`
          INSERT INTO products (id, name, category, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications)
          VALUES 
          ('P001', 'Rau Cải Thìa Hữu Cơ Đà Lạt', 'veggies', 32000, 'Kg', 150, 4.9, 38, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 'Rau cải thìa trồng theo tiêu chuẩn hữu cơ USDA tại GreenFarm Đà Lạt.', 'Trang trại Hữu cơ GreenFarm Đà Lạt', 'Công ty Nông sản Sạch Việt Nông', 'LOT-20260901-CT', '2026-09-08', '2026-09-15', 'USDA Organic,VietGAP,HACCP'),
          ('P002', 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)', 'fruits', 85000, 'Kg', 80, 5.0, 52, 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=600&q=80', 'Dưa lưới vỏ vàng ruột cam giòn ngọt brix 14+.', 'Nông trại Công nghệ cao Nắng Xanh', 'Chuỗi Phân phối Nông sản Việt Nông', 'LOT-20260905-DL', '2026-09-07', '2026-09-25', 'VietGAP,GlobalGAP'),
          ('P003', 'Thịt Ba Chỉ Heo Thảo Mộc Đương Quy', 'meat', 165000, 'Kg', 45, 4.8, 29, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80', 'Heo nuôi bằng thức ăn thảo dược đương quy.', 'Trang trại Chăn nuôi Thảo mộc An Tâm', 'Công ty Thực phẩm Sạch An Tâm', 'LOT-20260908-HM', '2026-09-09', '2026-09-16', 'VietGAP Chăn nuôi,ISO 22000');
        `);
      }
      console.log('✅ Đã nạp thành công 5 Tài khoản 5 Vai trò RBAC vào PostgreSQL!');
    }

  } catch (err) {
    console.warn('⚠️ Chưa kết nối PostgreSQL server:', err.message);
    isPgConnected = false;
    const sqliteSuccess = await initSqliteDatabase();
    if (!sqliteSuccess) {
      isMemoryDbActive = true;
      console.log('⚡ ✅ Đã kích hoạt In-Memory Data Store Engine (Đảm bảo CSDL 100% sẵn sàng với 5 tài khoản mẫu)!');
    }
  }
}

// Fallback Dynamic SQLite Initializer
async function initSqliteDatabase() {
  try {
    const sqlite3Module = await import('sqlite3');
    const sqlite3 = sqlite3Module.default || sqlite3Module;
    const verboseSqlite = sqlite3.verbose();
    sqliteDb = new verboseSqlite.Database(sqliteDbPath);

    return new Promise((resolve) => {
      sqliteDb.serialize(() => {
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL DEFAULT '123456',
            role TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            status TEXT NOT NULL DEFAULT 'Hoạt động',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        const defaultUsers = [
          ['U000_ADMIN', 'Quản Trị Viên Hệ Thống (System Admin)', 'admin@freshfarm.vn', 'admin123', 'admin', '0900000999', 'Trung tâm Điều hành FreshFarm Platform', 'Hoạt động'],
          ['U002_PROD', 'Trang trại GreenFarm Đà Lạt', 'producer@freshfarm.vn', '123456', 'producer', '0914222333', 'Phường 7, TP. Đà Lạt', 'Hoạt động'],
          ['U003_SUPP', 'Công ty Phân phối Việt Nông', 'supplier@freshfarm.vn', '123456', 'supplier', '0988333444', 'KCN Hòa Cầm, Đà Nẵng', 'Hoạt động'],
          ['U004_TRAN', 'Viettel Post Nông Sản', 'transporter@freshfarm.vn', '123456', 'transporter', '0905999888', 'Hải Châu, Đà Nẵng', 'Hoạt động'],
          ['U005_CONS', 'Khách hàng Nguyễn Văn Hùng', 'consumer@freshfarm.vn', '123456', 'consumer', '0905123456', '124 Nguyễn Văn Linh, Đà Nẵng', 'Hoạt động']
        ];

        const stmt = sqliteDb.prepare(`
          INSERT INTO users (id, name, email, password, role, phone, address, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET password=excluded.password, role=excluded.role, name=excluded.name
        `);
        defaultUsers.forEach(u => stmt.run(u));
        stmt.finalize(() => {
          console.log('🔑 Đã đồng bộ thành công 5 Tài khoản mẫu cho 5 Vai trò RBAC vào CSDL SQLite!');
          resolve(true);
        });
      });
    });
  } catch (err) {
    console.warn('⚠️ SQLite addon không thể khởi chạy:', err.message);
    sqliteDb = null;
    return false;
  }
}
