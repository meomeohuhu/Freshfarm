import express from 'express';
import cors from 'cors';
import { 
  initDatabase, 
  query, 
  queryOne, 
  isPgConnected, 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken, 
  createAuditLog 
} from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(distPath));

// Initialize 12 PostgreSQL Tables on startup. API requests wait for the
// compatibility migration so older Render databases cannot receive an order
// before columns such as orders.customer_id have been added.
const databaseReady = initDatabase();

// ----------------------------------------------------
// Auth & RBAC Middlewares
// ----------------------------------------------------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  req.user = decoded;
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để thực hiện thao tác này (401 Unauthorized)' });
  }
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yêu cầu đăng nhập để thực hiện thao tác này (401 Unauthorized)' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Bạn không có quyền truy cập chức năng này (Quyền yêu cầu: ${roles.join(', ')}) (403 Forbidden)` });
    }
    next();
  };
};

app.use(authMiddleware);
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await databaseReady;
    next();
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Healthcheck & DB Engine Status
// ----------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await queryOne('SELECT COUNT(*) as count FROM users');
    const prodCount = await queryOne('SELECT COUNT(*) as count FROM products');
    res.json({
      status: 'OK',
      message: 'FreshFarm Express Backend REST API running (Pure PostgreSQL 12 Schemas)',
      database: isPgConnected ? 'PostgreSQL 14+ (Active)' : 'PostgreSQL Connecting...',
      stats: { users: parseInt(userCount?.count || 0, 10), products: parseInt(prodCount?.count || 0, 10) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M01: Auth & Users (JWT & RBAC 5 Roles)
// ----------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ Tên, Email và Mật khẩu' });
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản' });
    }

    // Spec Enforced: Public self-registration is strictly consumer ONLY
    const safeRole = 'consumer';
    const userId = `U${Date.now().toString().slice(-6)}`;
    const passHash = hashPassword(password);

    await query(
      'INSERT INTO users (id, name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, passHash, safeRole, phone || '', address || '', 'active']
    );

    const userObj = { id: userId, name, email, role: safeRole, phone, address };
    const token = generateToken(userObj);

    await createAuditLog(userId, 'USER_REGISTER', email, `Đăng ký tài khoản Khách hàng thành công`);

    res.status(201).json({
      message: 'Đăng ký tài khoản Khách hàng mới thành công',
      user: userObj,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    if (user.status === 'blocked' || user.status === 'Tạm khóa') {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên' });
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      status: user.status
    };
    const token = generateToken(userObj);

    await createAuditLog(user.id, 'USER_LOGIN', email, `Đăng nhập thành công với vai trò ${user.role}`);

    res.json({
      message: 'Đăng nhập thành công',
      user: userObj,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user = await queryOne('SELECT id, name, email, role, phone, address, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/me', requireAuth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Họ tên không được để trống' });
    }
    await query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [String(name).trim(), phone || '', address || '', req.user.id]
    );
    await createAuditLog(req.user.id, 'UPDATE_PROFILE', req.user.id, 'Cập nhật thông tin cá nhân');
    const user = await queryOne('SELECT id, name, email, role, phone, address, status, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/me/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    const user = await queryOne('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!user || !verifyPassword(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
    }
    await query('UPDATE users SET password = ? WHERE id = ?', [hashPassword(newPassword), req.user.id]);
    await createAuditLog(req.user.id, 'CHANGE_PASSWORD', req.user.id, 'Đổi mật khẩu thành công');
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', requireRole('admin'), async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, phone, address, status, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/status', requireRole('admin'), async (req, res) => {
  try {
    const { userId, status } = req.body;
    await query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    await createAuditLog(req.user.id, 'UPDATE_USER_STATUS', userId, `Đổi trạng thái tài khoản ${userId} thành ${status}`);
    res.json({ message: 'Cập nhật trạng thái người dùng thành công', userId, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/role', requireRole('admin'), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!['admin', 'producer', 'supplier', 'transporter', 'consumer'].includes(role)) {
      return res.status(400).json({ error: 'Role không hợp lệ' });
    }
    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    await createAuditLog(req.user.id, 'ASSIGN_ROLE', userId, `Gán vai trò ${role} cho tài khoản ${userId}`);
    res.json({ message: 'Cập nhật vai trò người dùng thành công', userId, role });
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
      category: p.category || p.category_id || 'veggies',
      price: parseFloat(p.price),
      rating: parseFloat(p.rating || 5.0),
      reviewsCount: parseInt(p.reviews_count || p.reviewsCount || 0, 10),
      farmName: p.farm_name || p.farmName || '',
      supplierName: p.supplier_name || p.supplierName || '',
      batchCode: p.batch_code || p.batchCode || '',
      harvestDate: p.harvest_date || p.harvestDate || '',
      expiryDate: p.expiry_date || p.expiryDate || '',
      certifications: p.certifications ? (Array.isArray(p.certifications) ? p.certifications : p.certifications.split(',')) : []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', requireRole('admin', 'producer', 'supplier'), async (req, res) => {
  try {
    const p = req.body;
    const prodId = p.id || `P${Date.now().toString().slice(-4)}`;
    const certsStr = Array.isArray(p.certifications) ? p.certifications.join(',') : (p.certifications || 'VietGAP');

    await query(`
      INSERT INTO products (id, name, category_id, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      prodId, p.name, p.category || p.category_id || 'veggies', p.price, p.unit || 'Kg', p.stock || 100,
      p.rating || 5.0, p.reviewsCount || 0, p.image, p.description, p.farmName || 'GreenFarm Đà Lạt',
      p.supplierName || 'Việt Nông', p.batchCode || `LOT-${prodId}`, p.harvestDate || '2026-09-08', p.expiryDate || '2026-09-25', certsStr
    ]);

    await createAuditLog(req.user.id, 'CREATE_PRODUCT', prodId, `Tạo sản phẩm mới ${p.name}`);
    res.status(201).json({ message: 'Tạo sản phẩm mới thành công', id: prodId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M06: Producer & Harvest Batches & Traceability
// ----------------------------------------------------
app.get('/api/batches', async (req, res) => {
  try {
    const batches = await query('SELECT * FROM harvest_batches ORDER BY created_at DESC');
    res.json(batches.map(b => ({
      id: b.id,
      productName: b.product_name,
      producerId: b.producer_id,
      producer: b.producer_name || b.producer || '',
      quantity: b.quantity,
      harvestDate: b.harvest_date,
      status: b.status,
      cert: b.cert,
      area: b.area,
      createdAt: b.created_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/batches', requireRole('admin', 'producer'), async (req, res) => {
  try {
    const b = req.body;
    const batchId = b.id || `LOT-${Date.now().toString().slice(-6)}`;
    const status = b.status || 'Draft';

    await query(`
      INSERT INTO harvest_batches (id, product_name, producer_id, producer_name, quantity, harvest_date, status, cert, area)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [batchId, b.productName, req.user.id, req.user.name || b.producer || 'GreenFarm Đà Lạt', b.quantity, b.harvestDate, status, b.cert || 'VietGAP', b.area || 'Lô A1']);

    // Log traceability event for batch creation
    await query(
      'INSERT INTO traceability_events (batch_id, event_type, description, location, actor_name) VALUES (?, ?, ?, ?, ?)',
      [batchId, 'Gieo Trồng & Thu Hoạch', `Khai báo lô thu hoạch ${b.productName} (${b.quantity})`, b.area || 'Nông trại', req.user.name]
    );

    await createAuditLog(req.user.id, 'CREATE_BATCH', batchId, `Khai báo lô thu hoạch ${batchId}`);
    res.status(201).json({ message: 'Khai báo lô thu hoạch mới thành công', id: batchId, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/batches/:id/approve', requireRole('admin', 'supplier'), async (req, res) => {
  try {
    const { id } = req.params;
    await query("UPDATE harvest_batches SET status = 'Approved' WHERE id = ?", [id]);
    await query(
      'INSERT INTO traceability_events (batch_id, event_type, description, location, actor_name) VALUES (?, ?, ?, ?, ?)',
      [id, 'Kiểm Định & Nhập Kho', `Đã duyệt lô thu hoạch và nhập kho phân phối`, 'Kho Phân Phối', req.user.name]
    );
    await createAuditLog(req.user.id, 'APPROVE_BATCH', id, `Duyệt lô thu hoạch ${id}`);
    res.json({ message: 'Đã duyệt lô thu hoạch thành công', id, status: 'Approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/traceability/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await queryOne('SELECT * FROM harvest_batches WHERE id = ?', [batchId]);
    const events = await query('SELECT * FROM traceability_events WHERE batch_id = ? ORDER BY created_at ASC', [batchId]);
    res.json({ batch, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M11: Promotions & Vouchers
// ----------------------------------------------------
app.get('/api/promotions', async (req, res) => {
  try {
    const promos = await query("SELECT * FROM promotions WHERE status = 'Active' ORDER BY id ASC");
    res.json(promos.map(p => ({
      id: p.id,
      code: p.code,
      discountPercent: p.discount_percent,
      maxDiscount: parseFloat(p.max_discount),
      minOrder: parseFloat(p.min_order),
      usageLimit: p.usage_limit,
      timesUsed: p.times_used,
      description: p.description
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' });

    const promo = await queryOne("SELECT * FROM promotions WHERE UPPER(code) = UPPER(?) AND status = 'Active'", [code]);
    if (!promo) {
      return res.status(404).json({ error: 'Mã giảm giá không tồn tại hoặc đã hết hiệu lực' });
    }

    const amount = parseFloat(orderAmount || 0);
    const minOrder = parseFloat(promo.min_order);
    if (amount < minOrder) {
      return res.status(400).json({ error: `Đơn hàng tối thiểu phải từ ${minOrder.toLocaleString('vi-VN')} đ để áp dụng mã ${promo.code}` });
    }

    if (promo.usage_limit && promo.times_used >= promo.usage_limit) {
      return res.status(400).json({ error: `Mã giảm giá ${promo.code} đã hết lượt sử dụng` });
    }

    const rawDiscount = (amount * promo.discount_percent) / 100;
    const maxDiscount = parseFloat(promo.max_discount);
    const discountAmount = Math.min(rawDiscount, maxDiscount);

    res.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discount_percent,
      discountAmount,
      finalAmount: Math.max(0, amount - discountAmount),
      description: promo.description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M03, M04, M05: Orders & Pipeline Enforcement
// ----------------------------------------------------
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    let sql = 'SELECT * FROM orders ORDER BY created_at DESC';
    let params = [];
    // If consumer role, only return their own orders
    if (req.user && req.user.role === 'consumer') {
      sql = 'SELECT * FROM orders WHERE customer_id = ? OR customer_name = ? ORDER BY created_at DESC';
      params = [req.user.id, req.user.name];
    }
    const orders = await query(sql, params);
    const result = [];
    for (const o of orders) {
      const items = await query('SELECT product_id as id, product_name as name, qty, price FROM order_items WHERE order_id = ?', [o.id]);
      result.push({
        id: o.id,
        customerId: o.customer_id,
        customerName: o.customer_name,
        phone: o.phone,
        address: o.address,
        date: o.date,
        items,
        totalAmount: parseFloat(o.total_amount),
        discountAmount: parseFloat(o.discount_amount || 0),
        voucherCode: o.voucher_code,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
        statusText: o.status_text,
        createdAt: o.created_at
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const o = req.body;
    if (!o.items || !Array.isArray(o.items) || o.items.length === 0) {
      return res.status(400).json({ error: 'Đơn hàng không có sản phẩm' });
    }

    const orderId = o.id || `ORD-${Date.now().toString().slice(-8)}`;
    const customerId = req.user.id;
    const customerName = req.user.name;

    // Recalculate price & check stock on Backend (Do not trust frontend total)
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of o.items) {
      const prod = await queryOne('SELECT * FROM products WHERE id = ?', [item.id]);
      if (!prod) {
        return res.status(400).json({ error: `Sản phẩm ${item.name || item.id} không tồn tại` });
      }
      const itemQty = parseInt(item.qty || 1, 10);
      const itemPrice = parseFloat(prod.price);
      if (prod.stock < itemQty) {
        return res.status(400).json({ error: `Sản phẩm [${prod.name}] chỉ còn ${prod.stock} ${prod.unit} trong kho, không đủ cung ứng!` });
      }
      calculatedTotal += itemPrice * itemQty;
      validatedItems.push({
        id: prod.id,
        name: prod.name,
        qty: itemQty,
        price: itemPrice
      });
    }

    // Process Voucher if present
    let discountAmount = 0;
    let voucherCode = null;
    if (o.voucherCode) {
      const promo = await queryOne("SELECT * FROM promotions WHERE UPPER(code) = UPPER(?) AND status = 'Active'", [o.voucherCode]);
      if (promo && calculatedTotal >= parseFloat(promo.min_order)) {
        voucherCode = promo.code;
        const rawDiscount = (calculatedTotal * promo.discount_percent) / 100;
        discountAmount = Math.min(rawDiscount, parseFloat(promo.max_discount));
        // Increment voucher usage
        await query('UPDATE promotions SET times_used = times_used + 1 WHERE id = ?', [promo.id]);
      }
    }

    const finalAmount = Math.max(0, calculatedTotal - discountAmount);

    // Create Order Record in PostgreSQL
    await query(`
      INSERT INTO orders (id, customer_id, customer_name, phone, address, date, total_amount, payment_method, payment_status, order_status, status_text, voucher_code, discount_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId, customerId, customerName, o.phone || '0905123456', o.address || 'Đà Nẵng',
      o.date || new Date().toISOString().split('T')[0], finalAmount, o.paymentMethod || 'COD',
      'unpaid', 'Pending', 'Đơn hàng mới tạo (Chờ NCC xác nhận)', voucherCode, discountAmount
    ]);

    // Insert Order Items & Reserve Inventory
    for (const item of validatedItems) {
      await query(`
        INSERT INTO order_items (order_id, product_id, product_name, qty, price)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.id, item.name, item.qty, item.price]);

      // Reserve stock in inventory_reservations
      await query(`
        INSERT INTO inventory_reservations (order_id, product_id, qty, status)
        VALUES (?, ?, ?, 'RESERVED')
      `, [orderId, item.id, item.qty]);
    }

    await createAuditLog(customerId, 'CREATE_ORDER', orderId, `Tạo đơn hàng mới tổng tiền ${finalAmount.toLocaleString('vi-VN')} đ`);

    res.status(201).json({
      message: 'Đặt hàng thành công',
      id: orderId,
      totalAmount: finalAmount,
      orderStatus: 'Pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pipeline Strict Transition Enforcer
app.put('/api/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, statusText } = req.body;

    const currentOrder = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!currentOrder) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    if (req.user.role === 'consumer' && currentOrder.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Ban khong co quyen thao tac tren don hang nay' });
    }

    const prevStatus = currentOrder.order_status;

    // Strict Pipeline Validation Rules
    // Valid Pipeline: Pending -> Preparing -> Shipping -> Completed
    if (orderStatus === 'Preparing') {
      if (prevStatus !== 'Pending') {
        return res.status(400).json({ error: `Không thể chuyển đơn từ [${prevStatus}] sang [Preparing]` });
      }
      if (!['admin', 'supplier'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Chỉ Nhà cung cấp hoặc Admin mới có quyền xác nhận đơn sang Preparing' });
      }
    } else if (orderStatus === 'Shipping') {
      if (prevStatus !== 'Preparing') {
        return res.status(400).json({ error: `Không thể chuyển đơn từ [${prevStatus}] sang [Shipping]. Đơn phải ở trạng thái Preparing!` });
      }
      if (!['admin', 'supplier', 'transporter'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Chỉ Đơn vị Vận chuyển hoặc Supplier mới có quyền chuyển đơn sang Shipping' });
      }
    } else if (orderStatus === 'Completed') {
      if (prevStatus !== 'Shipping') {
        return res.status(400).json({ error: `Không thể chuyển đơn từ [${prevStatus}] sang [Completed]. Đơn phải ở trạng thái Shipping!` });
      }
      if (!['admin', 'transporter', 'consumer'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Chỉ Vận chuyển hoặc Khách hàng mới có quyền xác nhận hoàn thành đơn' });
      }
    } else if (orderStatus === 'Cancelled') {
      if (prevStatus !== 'Pending' && req.user.role !== 'admin') {
        return res.status(400).json({ error: 'Đơn hàng chỉ có thể hủy khi đang ở trạng thái Pending (Chờ xác nhận)' });
      }
      // Release inventory reservation upon cancellation
      await query("UPDATE inventory_reservations SET status = 'RELEASED' WHERE order_id = ?", [id]);
    }

    await query('UPDATE orders SET order_status = ?, status_text = ? WHERE id = ?', [orderStatus, statusText || orderStatus, id]);
    await createAuditLog(req.user.id, 'UPDATE_ORDER_STATUS', id, `Chuyển trạng thái đơn từ ${prevStatus} -> ${orderStatus}`);

    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công', id, orderStatus, statusText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M08: Transporter & Shipping Bills
// ----------------------------------------------------
app.get('/api/shipping', requireAuth, async (req, res) => {
  try {
    const bills = req.user.role === 'consumer'
      ? await query('SELECT sb.* FROM shipping_bills sb JOIN orders o ON o.id = sb.order_id WHERE o.customer_id = ? ORDER BY sb.created_at DESC', [req.user.id])
      : await query('SELECT * FROM shipping_bills ORDER BY created_at DESC');
    res.json(bills.map(b => ({
      id: b.id,
      orderId: b.order_id,
      partnerName: b.partner_name,
      trackingCode: b.tracking_code,
      shippingFee: parseFloat(b.shipping_fee),
      status: b.status,
      estimatedDelivery: b.estimated_delivery,
      createdAt: b.created_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shipping', requireRole('admin', 'transporter', 'supplier'), async (req, res) => {
  try {
    const s = req.body;
    if (!s.orderId) return res.status(400).json({ error: 'Vui lòng chọn Mã đơn hàng' });

    const targetOrder = await queryOne('SELECT * FROM orders WHERE id = ?', [s.orderId]);
    if (!targetOrder) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng tương ứng' });
    }

    // Spec Enforced: Can only create shipping bill if order is in Preparing status
    if (targetOrder.order_status !== 'Preparing' && targetOrder.order_status !== 'Pending') {
      return res.status(400).json({ error: `Chỉ có thể tạo vận đơn cho đơn hàng ở trạng thái [Preparing]. Đơn hiện tại đang ở [${targetOrder.order_status}]` });
    }

    const shipId = s.id || `SHIP-${Date.now().toString().slice(-6)}`;
    const trackingCode = s.trackingCode || `VTP-${Math.floor(100000 + Math.random() * 900000)}`;

    await query(`
      INSERT INTO shipping_bills (id, order_id, partner_name, tracking_code, shipping_fee, status, estimated_delivery)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [shipId, s.orderId, s.partnerName || 'Viettel Post Nông Sản', trackingCode, s.shippingFee || 25000, 'Đang vận chuyển', s.estimatedDelivery || '24h tới']);

    // Auto transition Order to Shipping
    await query("UPDATE orders SET order_status = 'Shipping', status_text = 'Đã bàn giao cho đơn vị vận chuyển' WHERE id = ?", [s.orderId]);

    await createAuditLog(req.user.id, 'CREATE_SHIPPING_BILL', shipId, `Tạo vận đơn ${trackingCode} cho đơn ${s.orderId}`);

    res.status(201).json({ message: 'Tạo vận đơn mới thành công', id: shipId, trackingCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shipping/:id/status', requireRole('admin', 'transporter'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bill = await queryOne('SELECT * FROM shipping_bills WHERE id = ?', [id]);
    if (!bill) return res.status(404).json({ error: 'Không tìm thấy vận đơn' });

    await query('UPDATE shipping_bills SET status = ? WHERE id = ?', [status, id]);

    if (status.includes('thành công') || status === 'Delivered') {
      await query("UPDATE orders SET order_status = 'Completed', status_text = 'Giao hàng thành công' WHERE id = ?", [bill.order_id]);
    }

    await createAuditLog(req.user.id, 'UPDATE_SHIPPING_STATUS', id, `Cập nhật vận đơn ${id} thành ${status}`);
    res.json({ message: 'Cập nhật vận đơn thành công', id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// M13: Strict Read-Only SQL Console Engine (Admin Only)
// ----------------------------------------------------
app.post('/api/db/query', requireRole('admin'), async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'Câu lệnh SQL không hợp lệ' });
    }

    const trimmedSql = sql.trim();
    const upperSql = trimmedSql.toUpperCase();

    // Spec Enforced: Strictly allow ONLY SELECT or EXPLAIN statements
    if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('EXPLAIN')) {
      return res.status(403).json({ 
        error: 'Lỗi An Ninh SQL Console: SQL Console chỉ cho phép các câu lệnh ĐỌC dữ liệu (SELECT hoặc EXPLAIN). Các câu lệnh INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE bị BẮT BUỘC CHẶN 100%!' 
      });
    }

    // Block dangerous keywords anywhere in statement
    const forbiddenKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC'];
    for (const kw of forbiddenKeywords) {
      if (upperSql.includes(` ${kw} `) || upperSql.includes(`\n${kw} `)) {
        return res.status(403).json({ error: `Lỗi An Ninh: Phát hiện từ khóa bị cấm [${kw}] trong SQL Console!` });
      }
    }

    // Limit maximum rows returned to 200
    let querySql = trimmedSql;
    if (!upperSql.includes('LIMIT')) {
      querySql += ' LIMIT 200';
    }

    const rows = await query(querySql);
    await createAuditLog(req.user.id, 'EXECUTE_SQL_QUERY', 'SQL_CONSOLE', `Thực thi SQL: ${trimmedSql.slice(0, 100)}`);

    if (!rows || rows.length === 0) {
      return res.json({ columns: ['Status'], rows: [['Thực thi SELECT thành công. 0 rows trả về.']] });
    }

    // Filter out password hashes from SQL console output
    const rawColumns = Object.keys(rows[0]);
    const columns = rawColumns.filter(c => c !== 'password' && c !== 'password_hash');
    const dataRows = rows.map(r => columns.map(c => r[c]));

    res.json({ columns, rows: dataRows });
  } catch (err) {
    res.status(400).json({ error: `Lỗi SQL Engine: ${err.message}` });
  }
});

// Fallback SPA Router middleware
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 FreshFarm Backend REST API running on http://localhost:${PORT}`);
  console.log(`🔑 Admin Full Access Account: Email [ admin@freshfarm.vn ] | Password [ admin123 ]`);
});
