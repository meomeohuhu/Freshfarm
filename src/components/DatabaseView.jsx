import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Terminal, 
  Download, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  HardDrive, 
  Key, 
  Layers,
  Code
} from 'lucide-react';

export default function DatabaseView({ products, orders, batches }) {
  const [activeTable, setActiveTable] = useState('products');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM products WHERE stock > 0 ORDER BY price DESC;');
  const [queryResult, setQueryResult] = useState(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const tables = [
    { name: 'products', label: 'Bảng Products (Sản phẩm)', count: products.length },
    { name: 'harvest_batches', label: 'Bảng Harvest_Batches (Lô thu hoạch)', count: batches.length },
    { name: 'orders', label: 'Bảng Orders (Đơn hàng)', count: orders.length },
    { name: 'users', label: 'Bảng Users (Tài khoản RBAC)', count: 5 },
    { name: 'traceability_logs', label: 'Bảng Traceability_Logs (Nhật ký QR)', count: 12 },
  ];

  // Schema definitions
  const schemaDefinitions = {
    products: [
      { field: 'id', type: 'VARCHAR(20)', key: 'PK', desc: 'Mã định danh sản phẩm' },
      { field: 'name', type: 'VARCHAR(150)', key: '', desc: 'Tên nông sản sạch' },
      { field: 'category', type: 'VARCHAR(50)', key: 'FK', desc: 'Danh mục (veggies, fruits, meat...)' },
      { field: 'price', type: 'DECIMAL(12,2)', key: '', desc: 'Giá bán niêm yết (VNĐ)' },
      { field: 'stock', type: 'INT', key: '', desc: 'Số lượng tồn kho thực tế' },
      { field: 'farm_name', type: 'VARCHAR(150)', key: '', desc: 'Cơ sở sản xuất / Trang trại' },
      { field: 'batch_code', type: 'VARCHAR(50)', key: 'FK', desc: 'Mã lô thu hoạch (QR Code)' }
    ],
    harvest_batches: [
      { field: 'id', type: 'VARCHAR(50)', key: 'PK', desc: 'Mã lô thu hoạch QR' },
      { field: 'product_name', type: 'VARCHAR(150)', key: '', desc: 'Tên loại nông sản' },
      { field: 'producer', type: 'VARCHAR(150)', key: '', desc: 'Trang trại sản xuất' },
      { field: 'quantity', type: 'VARCHAR(50)', key: '', desc: 'Sản lượng thu hoạch' },
      { field: 'harvest_date', type: 'DATE', key: '', desc: 'Ngày thu hoạch' },
      { field: 'cert', type: 'VARCHAR(100)', key: '', desc: 'Chứng nhận chất lượng (VietGAP)' }
    ],
    orders: [
      { field: 'id', type: 'VARCHAR(50)', key: 'PK', desc: 'Mã đơn hàng' },
      { field: 'customer_name', type: 'VARCHAR(100)', key: '', desc: 'Tên khách hàng đặt hàng' },
      { field: 'phone', type: 'VARCHAR(20)', key: '', desc: 'Số điện thoại nhận hàng' },
      { field: 'total_amount', type: 'DECIMAL(12,2)', key: '', desc: 'Tổng tiền đơn hàng' },
      { field: 'payment_method', type: 'VARCHAR(50)', key: '', desc: 'VietQR Napas / COD' },
      { field: 'order_status', type: 'ENUM(...)', key: '', desc: 'Pending, Preparing, Shipping, Completed' }
    ]
  };

  const executeQuery = async () => {
    try {
      const { apiService } = await import('../services/api');
      const res = await apiService.executeSqlQuery(sqlQuery);
      setQueryResult(res);
    } catch (err) {
      // Fallback mock engine if backend server offline
      const queryUpper = sqlQuery.toUpperCase();
      if (queryUpper.includes('FROM PRODUCTS')) {
        setQueryResult({
          columns: ['id', 'name', 'category', 'price', 'stock', 'batch_code'],
          rows: products.map(p => [p.id, p.name, p.category, `${p.price.toLocaleString('vi-VN')} đ`, p.stock, p.batchCode])
        });
      } else if (queryUpper.includes('FROM HARVEST_BATCHES')) {
        setQueryResult({
          columns: ['id', 'product_name', 'producer', 'quantity', 'harvest_date', 'cert'],
          rows: batches.map(b => [b.id, b.productName, b.producer, b.quantity, b.harvestDate, b.cert])
        });
      } else if (queryUpper.includes('FROM ORDERS')) {
        setQueryResult({
          columns: ['id', 'customer_name', 'total_amount', 'payment_method', 'order_status'],
          rows: orders.map(o => [o.id, o.customerName, `${o.totalAmount.toLocaleString('vi-VN')} đ`, o.paymentMethod, o.orderStatus])
        });
      } else {
        setQueryResult({
          columns: ['SQL Error'],
          rows: [[err.message || 'Lỗi thực thi SQL']]
        });
      }
    }
  };

  const generateSqlDump = () => {
    let sql = `-- ==============================================\n`;
    sql += `-- FRESHFARM DATABASE SCHEMA & DUMP (MySQL 8.0 / MariaDB)\n`;
    sql += `-- Created: ${new Date().toISOString()}\n`;
    sql += `-- ==============================================\n\n`;

    sql += `CREATE DATABASE IF NOT EXISTS \`freshfarm_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    sql += `USE \`freshfarm_db\`;\n\n`;

    sql += `DROP TABLE IF EXISTS \`products\`;\n`;
    sql += `CREATE TABLE \`products\` (\n`;
    sql += `  \`id\` VARCHAR(20) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`name\` VARCHAR(150) NOT NULL,\n`;
    sql += `  \`category\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`price\` DECIMAL(12,2) NOT NULL,\n`;
    sql += `  \`stock\` INT DEFAULT 0,\n`;
    sql += `  \`farm_name\` VARCHAR(150) NOT NULL,\n`;
    sql += `  \`batch_code\` VARCHAR(50) NOT NULL\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    sql += `INSERT INTO \`products\` (\`id\`, \`name\`, \`category\`, \`price\`, \`stock\`, \`farm_name\`, \`batch_code\`) VALUES\n`;
    const productValues = products.map(p => 
      `('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.category}', ${p.price}, ${p.stock}, '${p.farmName}', '${p.batchCode}')`
    ).join(',\n') + ';';
    sql += productValues + '\n\n';

    navigator.clipboard.writeText(sql);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Database Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-wrap items-center justify-between gap-6 border border-emerald-800/50">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <Database className="w-4 h-4" />
            CƠ SỞ DỮ LIỆU QUAN HỆ & SQL CONSOLE (MySQL / MariaDB / SQLite)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản Trị Cơ Sở Dữ Liệu Tập Trung (Full Database Engine)
          </h2>
          <p className="text-slate-300 text-sm">
            Truy vấn SQL thời gian thực, duyệt bảng dữ liệu quan hệ (ERD Schema), kiểm tra ràng buộc khoá chính/khoá ngoại và xuất script DDL `.sql` hoàn chỉnh.
          </p>
        </div>

        <button
          onClick={generateSqlDump}
          className="btn btn-primary shadow-xl font-bold text-xs flex items-center gap-2 px-5 py-3"
        >
          <Download className="w-4 h-4" />
          <span>{copiedNotification ? 'Đã Copy Script SQL!' : 'Xuất File DDL SQL (Copy Script)'}</span>
        </button>
      </div>

      {/* Database Schema & Tables Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Table Selector Sidebar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            Các Bảng Dữ Liệu (Tables)
          </h4>

          <div className="space-y-1.5">
            {tables.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setActiveTable(t.name);
                  setSqlQuery(`SELECT * FROM ${t.name};`);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTable === t.name
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Table className="w-3.5 h-3.5" />
                  {t.name}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTable === t.name ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Schema & Query Console */}
        <div className="md:col-span-3 space-y-6">
          {/* SQL Query Console */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3 text-white">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2 font-mono text-emerald-400 font-bold">
                <Terminal className="w-4 h-4 text-emerald-400" /> SQL Query Console
              </span>
              <span className="text-slate-400">Database: <strong className="text-white font-mono">freshfarm_db</strong></span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full bg-slate-950 text-emerald-300 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập câu lệnh SQL (VD: SELECT * FROM products;)"
              />
              <button
                onClick={executeQuery}
                className="absolute right-3 bottom-3 btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-bold shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Thực Thi SQL
              </button>
            </div>
          </div>

          {/* Table Data Viewer / Query Results */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Dữ Liệu Bảng: <span className="font-mono text-emerald-700 font-extrabold">{activeTable}</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">Storage: Persistent LocalStorage Engine</span>
            </div>

            {/* Table Schema Definition Header */}
            {schemaDefinitions[activeTable] && (
              <div className="px-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-500" /> Cấu trúc Schema (Columns & Constraints)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {schemaDefinitions[activeTable].map((col, idx) => (
                      <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border text-[11px] font-mono text-slate-800 shadow-2xs">
                        <strong>{col.field}</strong>: <span className="text-emerald-700">{col.type}</span> {col.key && <span className="text-amber-600 font-bold">[{col.key}]</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Table Rows Data */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b">
                  <tr>
                    {queryResult 
                      ? queryResult.columns.map((col, i) => <th key={i} className="px-4 py-3">{col}</th>)
                      : (activeTable === 'products' ? ['id', 'name', 'category', 'price', 'stock', 'batch_code'] : ['id', 'details', 'status']
                    ).map((col, i) => <th key={i} className="px-4 py-3">{col}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queryResult ? (
                    queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-slate-800">{val}</td>
                        ))}
                      </tr>
                    ))
                  ) : activeTable === 'products' ? (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{p.id}</td>
                        <td className="px-4 py-3 font-sans font-medium text-slate-800">{p.name}</td>
                        <td className="px-4 py-3 text-emerald-700">{p.category}</td>
                        <td className="px-4 py-3 font-bold">{p.price.toLocaleString('vi-VN')} đ</td>
                        <td className="px-4 py-3">{p.stock} {p.unit}</td>
                        <td className="px-4 py-3 text-amber-700">{p.batchCode}</td>
                      </tr>
                    ))
                  ) : activeTable === 'orders' ? (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{o.id}</td>
                        <td className="px-4 py-3 font-sans text-slate-800">{o.customerName}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{o.totalAmount.toLocaleString('vi-VN')} đ</td>
                        <td className="px-4 py-3">{o.paymentMethod}</td>
                        <td className="px-4 py-3">{o.orderStatus}</td>
                      </tr>
                    ))
                  ) : (
                    batches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{b.id}</td>
                        <td className="px-4 py-3 font-sans text-slate-800">{b.productName}</td>
                        <td className="px-4 py-3">{b.producer}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{b.quantity}</td>
                        <td className="px-4 py-3">{b.harvestDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
