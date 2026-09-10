-- ============================================================================
-- DỰ ÁN FRESHFARM: SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU POSTGRESQL (pgAdmin / SQL Query)
-- ============================================================================

-- 1. Tạo Database freshfarm_db (Chạy trên pgAdmin hoặc Query Tool)
CREATE DATABASE freshfarm_db;

-- Sau khi tạo database freshfarm_db, chuyển sang kết nối freshfarm_db và chạy toàn bộ đoạn dưới đây:

-- 2. Xóa các bảng cũ nếu đã tồn tại
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS shipping_bills CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS traceability_journey CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS harvest_batches CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Tạo Bảng Users (Phân quyền RBAC & Tài khoản)
CREATE TABLE users (
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

-- 4. Tạo Bảng Categories (Danh mục nông sản)
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL
);

-- 5. Tạo Bảng Products (Sản phẩm nông sản)
CREATE TABLE products (
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

-- 6. Tạo Bảng Harvest Batches (Lô thu hoạch & Mã QR)
CREATE TABLE harvest_batches (
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

-- 7. Tạo Bảng Orders (Đơn hàng thương mại)
CREATE TABLE orders (
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

-- 8. Tạo Bảng Order Items (Chi tiết sản phẩm trong đơn)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  qty INT NOT NULL,
  price NUMERIC(12,2) NOT NULL
);

-- 9. Tạo Bảng Shipping Bills (Vận đơn giao hàng)
CREATE TABLE shipping_bills (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  partner_name VARCHAR(150) NOT NULL,
  tracking_code VARCHAR(50) NOT NULL,
  shipping_fee NUMERIC(12,2) NOT NULL,
  status VARCHAR(100) NOT NULL,
  estimated_delivery VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tạo Bảng Promotions (Mã Voucher giảm giá)
CREATE TABLE promotions (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INT NOT NULL,
  max_discount NUMERIC(12,2) NOT NULL,
  min_order NUMERIC(12,2) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Active'
);

-- ============================================================================
-- NẠP DỮ LIỆU MẪU BAN ĐẦU (SEED DATA FOR POSTGRESQL)
-- ============================================================================

-- 1. Nạp 5 Tài khoản mẫu cho 5 Vai trò RBAC
INSERT INTO users (id, name, email, password, role, phone, address, status) VALUES 
('U000_ADMIN', 'Quản Trị Viên Hệ Thống (System Admin)', 'admin@freshfarm.vn', 'admin123', 'admin', '0900000999', 'Trung tâm Điều hành FreshFarm Platform', 'Hoạt động'),
('U002_PROD', 'Trang trại GreenFarm Đà Lạt', 'producer@freshfarm.vn', '123456', 'producer', '0914222333', 'Phường 7, TP. Đà Lạt', 'Hoạt động'),
('U003_SUPP', 'Công ty Phân phối Việt Nông', 'supplier@freshfarm.vn', '123456', 'supplier', '0988333444', 'KCN Hòa Cầm, Đà Nẵng', 'Hoạt động'),
('U004_TRAN', 'Viettel Post Nông Sản', 'transporter@freshfarm.vn', '123456', 'transporter', '0905999888', 'Hải Châu, Đà Nẵng', 'Hoạt động'),
('U005_CONS', 'Khách hàng Nguyễn Văn Hùng', 'consumer@freshfarm.vn', '123456', 'consumer', '0905123456', '124 Nguyễn Văn Linh, Đà Nẵng', 'Hoạt động')
ON CONFLICT (email) DO NOTHING;

-- 2. Nạp Danh mục Nông sản
INSERT INTO categories (id, name, icon) VALUES 
('all', 'Tất cả nông sản', 'Sprout'),
('veggies', 'Rau củ Hữu cơ', 'Carrot'),
('fruits', 'Trái cây VietGAP', 'Apple'),
('meat', 'Thịt & Trứng Sạch', 'Egg'),
('processed', 'Thực phẩm chế biến', 'PackageCheck')
ON CONFLICT (id) DO NOTHING;

-- 3. Nạp Sản phẩm Mẫu
INSERT INTO products (id, name, category, price, unit, stock, rating, reviews_count, image, description, farm_name, supplier_name, batch_code, harvest_date, expiry_date, certifications) VALUES 
('P001', 'Rau Cải Thìa Hữu Cơ Đà Lạt', 'veggies', 32000, 'Kg', 150, 4.9, 38, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 'Rau cải thìa trồng theo tiêu chuẩn hữu cơ USDA tại GreenFarm Đà Lạt.', 'Trang trại Hữu cơ GreenFarm Đà Lạt', 'Công ty Nông sản Sạch Việt Nông', 'LOT-20260901-CT', '2026-09-08', '2026-09-15', 'USDA Organic,VietGAP,HACCP'),
('P002', 'Dưa Lưới Tách Lưới Huỳnh Long (VietGAP)', 'fruits', 85000, 'Kg', 80, 5.0, 52, 'https://images.unsplash.com/photo-1598170845058-12ef4a457539?auto=format&fit=crop&w=600&q=80', 'Dưa lưới vỏ vàng ruột cam giòn ngọt brix 14+.', 'Nông trại Công nghệ cao Nắng Xanh', 'Chuỗi Phân phối Nông sản Việt Nông', 'LOT-20260905-DL', '2026-09-07', '2026-09-25', 'VietGAP,GlobalGAP'),
('P003', 'Thịt Ba Chỉ Heo Thảo Mộc Đương Quy', 'meat', 165000, 'Kg', 45, 4.8, 29, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80', 'Heo nuôi bằng thức ăn thảo dược đương quy.', 'Trang trại Chăn nuôi Thảo mộc An Tâm', 'Công ty Thực phẩm Sạch An Tâm', 'LOT-20260908-HM', '2026-09-09', '2026-09-16', 'VietGAP Chăn nuôi,ISO 22000')
ON CONFLICT (id) DO NOTHING;

-- 4. Nạp Mã Giảm Giá
INSERT INTO promotions (id, code, discount_percent, max_discount, min_order, description) VALUES 
('PR01', 'FRESH10', 10, 50000, 100000, 'Giảm 10% tối đa 50.000đ cho đơn từ 100k'),
('PR02', 'FRESH50K', 15, 50000, 300000, 'Giảm 50k cho đơn từ 300k')
ON CONFLICT (id) DO NOTHING;
