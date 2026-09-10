import express from 'express';
import cors from 'cors';
import { initDatabase, query, queryOne, isPgConnected, sqliteDb, isMemoryDbActive } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database on startup
initDatabase();

// ----------------------------------------------------
// Healthcheck & DB Engine Status
// ----------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await queryOne('SELECT COUNT(*) as count FROM users');
    const prodCount = await queryOne('SELECT COUNT(*) as count FROM products');
    res.json({
      status: 'OK',
      message: 'FreshFarm Express Backend REST API running',
      database: isPgConnected ? 'PostgreSQL 14+ (pg Pool)' : (sqliteDb ? 'SQLite3 Fallback' : 'In-Memory Store Engine (Zero-Config Active)'),
      stats: { users: parseInt(userCount?.count || 0, 10), products: parseInt(prodCount?.count || 0, 10) },
      adminAccount: { email: 'admin@freshfarm.vn', password: 'admin123', role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M01: Auth & Users (RBAC & Admin Full Access)
// ----------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, phone, address, status, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }
    if (user.status === 'Tạm khóa') {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa bởi Admin' });
    }
    res.json({
      message: 'Đăng nhập thành công',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản' });
    }

    const userId = `U${Date.now().toString().slice(-5)}`;
    await query(
      'INSERT INTO users (id, name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, password || 'admin123', role || 'consumer', phone || '', address || '', 'Hoạt động']
    );

    res.status(201).json({
      message: 'Đăng ký tài khoản mới thành công',
      user: { id: userId, name, email, role: role || 'consumer' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/status', async (req, res) => {
  try {
    const { userId, status } = req.body;
    await query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    res.json({ message: 'Cập nhật trạng thái người dùng thành công', userId, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M02: Products & Catalog
// ----------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const products = await query('SELECT * FROM products ORDER BY id DESC');
    const formatted = products.map(p => ({
      ...p,
      price: parseFloat(p.price),
      rating: parseFloat(p.rating || 5.0),
      certifications: p.certifications ? p.certifications.split(',') : []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const p = req.body;
    const prodId = p.id || `P${Date.now().toString().slice(-4)}`;
    const certsStr = Array.isArray(p.certifications) ? p.certifications.join(',') : (p.certifications || 'VietGAP');

    await query(`
      INSERT INTO products (id, name, category, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      prodId, p.name, p.category || 'veggies', p.price, p.unit || 'Kg', p.stock || 100,
      p.rating || 5.0, p.reviewsCount || 0, p.image, p.description, p.farmName || 'GreenFarm Đà Lạt',
      p.supplierName || 'Việt Nông', p.batchCode || `LOT-${prodId}`, p.harvestDate, p.expiryDate, certsStr
    ]);

    res.status(201).json({ message: 'Tạo sản phẩm thành công', id: prodId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M06: Producer & Harvest Batches
// ----------------------------------------------------
app.get('/api/batches', async (req, res) => {
  try {
    const batches = await query('SELECT * FROM harvest_batches ORDER BY created_at DESC');
    res.json(batches.map(b => ({
      id: b.id,
      productName: b.product_name,
      producer: b.producer,
      quantity: b.quantity,
      harvestDate: b.harvest_date,
      status: b.status,
      cert: b.cert,
      area: b.area
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/batches', async (req, res) => {
  try {
    const b = req.body;
    const batchId = b.id || `LOT-${Date.now().toString().slice(-6)}`;
    await query(`
      INSERT INTO harvest_batches (id, product_name, producer, quantity, harvest_date, status, cert, area)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [batchId, b.productName, b.producer || 'GreenFarm Đà Lạt', b.quantity, b.harvestDate, b.status || 'Mới thu hoạch (Chờ kho tiếp nhận)', b.cert || 'VietGAP', b.area || 'Lô A1']);

    res.status(201).json({ message: 'Khai báo lô thu hoạch mới thành công', id: batchId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M04 & M05: Orders & Payments
// ----------------------------------------------------
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders ORDER BY created_at DESC');
    const result = [];
    for (const o of orders) {
      const items = await query('SELECT product_id as id, product_name as name, qty, price FROM order_items WHERE order_id = ?', [o.id]);
      result.push({
        id: o.id,
        customerName: o.customer_name,
        phone: o.phone,
        address: o.address,
        date: o.date,
        items,
        totalAmount: parseFloat(o.total_amount),
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
        statusText: o.status_text
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const o = req.body;
    const orderId = o.id || `ORD-${Date.now().toString().slice(-8)}`;

    await query(`
      INSERT INTO orders (id, customer_name, phone, address, date, total_amount, payment_method, payment_status, order_status, status_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [orderId, o.customerName, o.phone, o.address, o.date, o.totalAmount, o.paymentMethod, o.paymentStatus, o.orderStatus || 'Pending', o.statusText || 'Đơn mới']);

    if (Array.isArray(o.items)) {
      for (const item of o.items) {
        await query(`
          INSERT INTO order_items (order_id, product_id, product_name, qty, price)
          VALUES (?, ?, ?, ?, ?)
        `, [orderId, item.id || 'P001', item.name, item.qty, item.price]);
      }
    }

    res.status(201).json({ message: 'Đặt hàng thành công', id: orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, statusText } = req.body;
    await query('UPDATE orders SET order_status = ?, status_text = ? WHERE id = ?', [orderStatus, statusText, id]);
    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công', id, orderStatus, statusText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M08: Transporter Logistics
// ----------------------------------------------------
app.get('/api/shipping', async (req, res) => {
  try {
    const bills = await query('SELECT * FROM shipping_bills ORDER BY created_at DESC');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shipping', async (req, res) => {
  try {
    const s = req.body;
    const shipId = s.id || `SHIP-${Date.now().toString().slice(-6)}`;
    await query(`
      INSERT INTO shipping_bills (id, order_id, partner_name, tracking_code, shipping_fee, status, estimated_delivery)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [shipId, s.orderId, s.partnerName || 'Viettel Post Nông Sản', s.trackingCode, s.shippingFee || 25000, s.status || 'Đã tạo vận đơn', s.estimatedDelivery]);

    res.status(201).json({ message: 'Tạo vận đơn mới thành công', id: shipId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M13: Live SQL Query Engine (PostgreSQL Compatible)
// ----------------------------------------------------
app.post('/api/db/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'Câu lệnh SQL không hợp lệ' });
    }

    const rows = await query(sql);
    if (!rows || rows.length === 0) {
      return res.json({ columns: ['Status'], rows: [['Thực thi SQL thành công. 0 rows trả về.']] });
    }
    const columns = Object.keys(rows[0]);
    const dataRows = rows.map(r => columns.map(c => r[c]));
    res.json({ columns, rows: dataRows });
  } catch (err) {
    res.status(400).json({ error: `Lỗi SQL Engine: ${err.message}` });
  }
});

// Serve static files from 'dist' directory when built for production
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// Fallback all non-API GET requests to index.html (SPA client-side routing)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 FreshFarm Backend REST API running on http://localhost:${PORT}`);
  console.log(`🔑 Admin Full Access Account: Email [ admin@freshfarm.vn ] | Password [ admin123 ]`);
});
