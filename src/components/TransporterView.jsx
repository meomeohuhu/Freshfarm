import React, { useState } from 'react';
import { Truck, PlusCircle, CheckCircle2, Clock, MapPin, DollarSign, Package, Search, ShieldCheck, ArrowRight } from 'lucide-react';

export default function TransporterView({ orders, setOrders }) {
  const [shippingBills, setShippingBills] = useState([
    {
      id: 'SHIP-20260910-01',
      orderId: 'ORD-20260910-88',
      customerName: 'Nguyễn Văn Hùng',
      address: '124 Nguyễn Văn Linh, Đà Nẵng',
      partnerName: 'Viettel Post Nông Sản',
      trackingCode: 'VTP-982144',
      shippingFee: 25000,
      status: 'Đang vận chuyển',
      estimatedDelivery: '2026-09-11 15:00'
    },
    {
      id: 'SHIP-20260909-02',
      orderId: 'ORD-20260909-12',
      customerName: 'Lê Thị Diệu Tâm',
      address: '45 Trần Phú, Hải Châu, Đà Nẵng',
      partnerName: 'Giao Hàng Nhanh Express',
      trackingCode: 'GHN-771029',
      shippingFee: 20000,
      status: 'Đã giao hàng thành công',
      estimatedDelivery: '2026-09-10 11:30'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBill, setNewBill] = useState({
    orderId: '',
    partnerName: 'Viettel Post Nông Sản',
    trackingCode: '',
    shippingFee: 25000,
    estimatedDelivery: ''
  });

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!newBill.orderId) return;

    const created = {
      id: `SHIP-${Date.now().toString().slice(-6)}`,
      orderId: newBill.orderId,
      customerName: 'Khách hàng FreshFarm',
      address: 'TP. Đà Nẵng',
      partnerName: newBill.partnerName,
      trackingCode: newBill.trackingCode || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      shippingFee: Number(newBill.shippingFee),
      status: 'Mới tạo vận đơn',
      estimatedDelivery: newBill.estimatedDelivery || '24h tới'
    };

    setShippingBills([created, ...shippingBills]);
    setShowAddModal(false);

    // Sync order status to Shipping
    if (setOrders) {
      setOrders(prev => prev.map(o => o.id === newBill.orderId ? { ...o, orderStatus: 'Shipping', statusText: 'Đã giao cho Vận chuyển' } : o));
    }
  };

  const updateBillStatus = (billId, newStatus) => {
    setShippingBills(shippingBills.map(b => {
      if (b.id === billId) {
        return { ...b, status: newStatus };
      }
      return b;
    }));
  };

  const totalFees = shippingBills.reduce((sum, b) => sum + b.shippingFee, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Transporter Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 border border-teal-700/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Truck className="w-4 h-4 text-teal-400" />
            Phân Hệ Đơn Vị Vận Chuyển & Logistics Nông Sản
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản Lý Vận Đơn & Cước Phí Giao Hàng Chuyên Dụng
          </h2>
          <p className="text-teal-100/90 text-sm">
            Tạo mã vận đơn tracking, phân công tài xế giao hàng lạnh 2-4°C, cập nhật trạng thái vận chuyển thời gian thực.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-2 px-5 py-3 rounded-2xl"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tạo Vận Đơn Giao Hàng Mới</span>
        </button>
      </div>

      {/* Logistics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tổng vận đơn quản lý</span>
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{shippingBills.length} Vận đơn</div>
          <div className="text-[11px] text-teal-600 font-semibold">Tỷ lệ đúng giờ: 98%</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Đang vận chuyển lạnh</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {shippingBills.filter(b => b.status.includes('vận chuyển') || b.status.includes('Mới')).length} Đơn
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">Bảo quản lạnh 4°C</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Giao hàng thành công</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {shippingBills.filter(b => b.status.includes('thành công')).length} Đơn
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Xác nhận ký nhận QR</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tổng phí vận chuyển</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalFees.toLocaleString('vi-VN')} đ</div>
          <div className="text-[11px] text-blue-600 font-semibold">Đối soát phí hàng tuần</div>
        </div>
      </div>

      {/* Shipping Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-600" />
              Danh Sách Vận Đơn & Mã Mã Tracking Giao Hàng
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi lịch trình giao nhận giữa Nhà cung cấp và Người tiêu dùng</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Mã Vận Đơn</th>
                <th className="px-5 py-3.5">Mã Đơn Hàng</th>
                <th className="px-5 py-3.5">Đối Tác Vận Chuyển</th>
                <th className="px-5 py-3.5">Mã Tracking</th>
                <th className="px-5 py-3.5">Cước Phí Vận Chuyển</th>
                <th className="px-5 py-3.5">Dự Kiến Giao</th>
                <th className="px-5 py-3.5">Trạng Thái Vận Chuyển</th>
                <th className="px-5 py-3.5 text-right">Cập Nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shippingBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">{bill.id}</td>
                  <td className="px-5 py-4 font-mono text-xs text-emerald-700 font-bold">{bill.orderId}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{bill.partnerName}</td>
                  <td className="px-5 py-4 font-mono text-xs bg-slate-100 rounded px-2 py-1">{bill.trackingCode}</td>
                  <td className="px-5 py-4 font-bold text-slate-900">{bill.shippingFee.toLocaleString('vi-VN')} đ</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{bill.estimatedDelivery}</td>
                  <td className="px-5 py-4">
                    {bill.status.includes('thành công') ? (
                      <span className="badge badge-emerald"><CheckCircle2 className="w-3 h-3" /> {bill.status}</span>
                    ) : (
                      <span className="badge badge-amber"><Clock className="w-3 h-3" /> {bill.status}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!bill.status.includes('thành công') && (
                      <button
                        onClick={() => updateBillStatus(bill.id, 'Đã giao hàng thành công')}
                        className="btn btn-primary text-xs py-1 px-2.5"
                      >
                        Đã Giao <CheckCircle2 className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shipping Bill Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" />
                Tạo Vận Đơn Vận Chuyển Nông Sản Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã Đơn Hàng Cần Giao *</label>
                <select
                  value={newBill.orderId}
                  onChange={(e) => setNewBill({ ...newBill, orderId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders ? orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.customerName} ({o.totalAmount.toLocaleString('vi-VN')} đ)</option>
                  )) : (
                    <option value="ORD-20260910-88">ORD-20260910-88 - Nguyễn Văn Hùng</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đơn Vị Vận Chuyển Đối Tác</label>
                <select
                  value={newBill.partnerName}
                  onChange={(e) => setNewBill({ ...newBill, partnerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Viettel Post Nông Sản">Viettel Post Nông Sản</option>
                  <option value="Giao Hàng Nhanh Express">Giao Hàng Nhanh Express (GHN)</option>
                  <option value="Ahamove Chuỗi Lạnh">Ahamove Chuỗi Lạnh (Giao 2h)</option>
                  <option value="Đội Xe Trang Trại FreshFarm">Đội Xe Trang Trại FreshFarm</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã Tracking</label>
                  <input
                    type="text"
                    placeholder="VD: VTP-992188"
                    value={newBill.trackingCode}
                    onChange={(e) => setNewBill({ ...newBill, trackingCode: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cước Phí Vận Chuyển (đ)</label>
                  <input
                    type="number"
                    value={newBill.shippingFee}
                    onChange={(e) => setNewBill({ ...newBill, shippingFee: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời Gian Dự Kiến Giao Hàng</label>
                <input
                  type="text"
                  placeholder="VD: 2026-09-11 16:00"
                  value={newBill.estimatedDelivery}
                  onChange={(e) => setNewBill({ ...newBill, estimatedDelivery: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary text-xs">Hủy</button>
                <button type="submit" className="btn btn-primary text-xs font-bold shadow-md">Tạo Vận Đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
