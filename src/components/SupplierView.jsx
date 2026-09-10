import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Boxes, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function SupplierView({ products, orders, setOrders }) {
  const [activeTab, setActiveTab] = useState('inventory'); // inventory | orders

  const updateOrderStatus = (orderId, newStatus, statusText) => {
    setOrders(orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, orderStatus: newStatus, statusText: statusText };
      }
      return o;
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-amber"><Clock className="w-3 h-3" /> Chờ xác nhận</span>;
      case 'Preparing':
        return <span className="badge badge-blue"><Boxes className="w-3 h-3" /> Đang chuẩn bị hàng</span>;
      case 'Shipping':
        return <span className="badge badge-purple"><Truck className="w-3 h-3" /> Đang giao hàng</span>;
      case 'Completed':
        return <span className="badge badge-emerald"><CheckCircle2 className="w-3 h-3" /> Hoàn thành</span>;
      default:
        return <span className="badge badge-emerald">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Supplier Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 border border-blue-700/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Store className="w-4 h-4 text-blue-400" />
            Phân Hệ Nhà Cung Cấp & Quản Lý Kho Phân Phối
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản Lý Tồn Kho & Chuỗi Đơn Hàng Giao Tới Khách
          </h2>
          <p className="text-blue-100/90 text-sm">
            Tiếp nhận nguồn hàng từ Nhà sản xuất, quản lý hạn sử dụng, điều chỉnh giá bán và cập nhật tiến độ vận chuyển đơn hàng.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-950/60 p-1.5 rounded-2xl border border-blue-700/50">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Quản Lý Kho & Tồn Kho ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Đơn Hàng Phân Phối ({orders.length})
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Doanh thu phân phối</div>
            <div className="text-xl font-extrabold text-slate-800">18.450.000 đ</div>
            <div className="text-[10px] text-emerald-600 font-semibold">+14.2% so với tuần trước</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng mặt hàng tồn kho</div>
            <div className="text-xl font-extrabold text-slate-800">475 Kg</div>
            <div className="text-[10px] text-blue-600 font-semibold">Tỉ lệ quay vòng kho: 85%</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đơn đang vận chuyển</div>
            <div className="text-xl font-extrabold text-slate-800">
              {orders.filter(o => o.orderStatus === 'Shipping' || o.orderStatus === 'Preparing').length} Đơn
            </div>
            <div className="text-[10px] text-amber-600 font-semibold">Đảm bảo giao trong 24h</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Cảnh báo tồn kho thấp</div>
            <div className="text-xl font-extrabold text-slate-800">1 Sản phẩm</div>
            <div className="text-[10px] text-rose-600 font-semibold">Cần nhập thêm hàng từ NSX</div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'inventory' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Danh Sách Sản Phẩm Trong Kho & Nguồn Nhập
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Sản Phẩm</th>
                  <th className="px-5 py-3.5">Nhà Sản Xuất Nguồn</th>
                  <th className="px-5 py-3.5">Mã Lô Nhập</th>
                  <th className="px-5 py-3.5">Tồn Kho Thật</th>
                  <th className="px-5 py-3.5">Giá Bán Lẻ</th>
                  <th className="px-5 py-3.5">Hạn Sử Dụng</th>
                  <th className="px-5 py-3.5">Trạng Thái Kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div>{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">Mã SP: {p.id}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 font-medium">{p.farmName}</td>
                    <td className="px-5 py-4 font-mono text-xs text-emerald-700">{p.batchCode}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {p.stock} {p.unit}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-emerald-700">
                      {p.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{p.expiryDate}</td>
                    <td className="px-5 py-4">
                      {p.stock > 100 ? (
                        <span className="badge badge-emerald">Dồi dào</span>
                      ) : p.stock > 50 ? (
                        <span className="badge badge-amber">Bình thường</span>
                      ) : (
                        <span className="badge bg-rose-100 text-rose-700">Sắp hết hàng</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Xử Lý Chuỗi Đơn Hàng Thương Mại Điện Tử
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-slate-50 transition-colors space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{order.id}</span>
                      <span className="text-xs text-slate-400">({order.date})</span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div className="text-xs text-slate-600">
                      Khách hàng: <strong>{order.customerName}</strong> ({order.phone}) - {order.address}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Thanh toán: <strong className="text-emerald-700">{order.paymentMethod}</strong> ({order.paymentStatus})</div>
                    <div className="text-lg font-black text-slate-900">{order.totalAmount.toLocaleString('vi-VN')} đ</div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-500">Sản phẩm trong đơn:</div>
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                        {item.name} x{item.qty} ({item.price.toLocaleString('vi-VN')} đ)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Pipeline */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {order.orderStatus === 'Pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Preparing', 'Đang chuẩn bị hàng tại kho')}
                      className="btn btn-primary text-xs"
                    >
                      Xác Nhận & Đóng Gói Tại Kho <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {order.orderStatus === 'Preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Shipping', 'Đã giao cho Đơn vị Vận chuyển')}
                      className="btn btn-amber text-xs font-bold"
                    >
                      Bàn Giao Cho Vận Chuyển <Truck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {order.orderStatus === 'Shipping' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Completed', 'Đã giao hàng thành công')}
                      className="btn btn-primary text-xs"
                    >
                      Xác Nhận Đã Giao Hàng Thành Công <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {order.orderStatus === 'Completed' && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đơn hàng đã hoàn tất
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
