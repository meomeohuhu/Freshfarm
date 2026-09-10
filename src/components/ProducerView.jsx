import React, { useState } from 'react';
import { 
  Tractor, 
  PlusCircle, 
  CheckCircle, 
  QrCode, 
  ShieldCheck, 
  Calendar, 
  Box, 
  Award, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function ProducerView({ batches, setBatches, products, onCreateBatch }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    productName: '',
    quantity: '',
    harvestDate: '',
    cert: 'VietGAP #VG-2026',
    area: 'Lô A1 - Khu Nông nghiệp Cao Đà Lạt'
  });

  const handleCreateBatch = (e) => {
    e.preventDefault();
    if (!newBatch.productName || !newBatch.quantity) return;

    const created = {
      id: `LOT-${Date.now().toString().slice(-6)}`,
      productName: newBatch.productName,
      producer: 'Trang trại Hữu cơ GreenFarm Đà Lạt',
      quantity: newBatch.quantity,
      harvestDate: newBatch.harvestDate || new Date().toISOString().split('T')[0],
      status: 'Mới thu hoạch (Chờ kho tiếp nhận)',
      cert: newBatch.cert,
      area: newBatch.area
    };

    if (onCreateBatch) {
      onCreateBatch(created);
    } else if (setBatches) {
      setBatches([created, ...batches]);
    }
    setShowAddModal(false);
    setNewBatch({
      productName: '',
      quantity: '',
      harvestDate: '',
      cert: 'VietGAP #VG-2026',
      area: 'Lô A1 - Khu Nông nghiệp Cao Đà Lạt'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Producer Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 border border-amber-700/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Tractor className="w-4 h-4 text-amber-400" />
            Phân Hệ Nông Hộ & Cơ Sở Sản Xuất
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản Lý Lô Thu Hoạch & Chứng Nhận Nông Sản
          </h2>
          <p className="text-amber-100/90 text-sm">
            Khai báo nguồn gốc lô hàng, ngày thu hoạch, khu vực gieo trồng và sinh mã QR truy xuất minh bạch cho Nhà cung cấp & Khách hàng.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-amber shadow-lg text-sm font-bold flex items-center gap-2 px-5 py-3"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Khai Báo Lô Thu Hoạch Mới</span>
        </button>
      </div>

      {/* Farm Profile & Certifications Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Trang trại đăng ký</div>
            <div className="font-bold text-slate-800 text-base">GreenFarm Đà Lạt</div>
            <div className="text-[11px] text-emerald-600 font-medium">Diện tích: 12.5 Ha</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Chứng nhận đã kiểm định</div>
            <div className="font-bold text-slate-800 text-base">USDA Organic & VietGAP</div>
            <div className="text-[11px] text-slate-400">Hiệu lực: 2025 - 2028</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng sản lượng xuất bán</div>
            <div className="font-bold text-slate-800 text-base">1,450 Kg / Tháng</div>
            <div className="text-[11px] text-blue-600 font-medium">3 Nhà cung cấp hợp tác</div>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              Danh Sách Lô Sản Xuất & Thu Hoạch
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {batches.length} Lô
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Dữ liệu lô hàng phục vụ tạo mã QR và chuyển cho Nhà cung cấp</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Mã Lô (QR Code)</th>
                <th className="px-5 py-3.5">Sản Phẩm</th>
                <th className="px-5 py-3.5">Sản Lượng</th>
                <th className="px-5 py-3.5">Ngày Thu Hoạch</th>
                <th className="px-5 py-3.5">Khu Vực Đất Trồng</th>
                <th className="px-5 py-3.5">Chứng Nhận</th>
                <th className="px-5 py-3.5">Trạng Thái Cung Ứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    {batch.id}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">{batch.productName}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-700">{batch.quantity}</td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-600">{batch.harvestDate}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{batch.area}</td>
                  <td className="px-5 py-4">
                    <span className="badge badge-emerald text-[10px]">
                      <ShieldCheck className="w-3 h-3" /> {batch.cert}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <Tractor className="w-5 h-5 text-amber-600" />
                Khai Báo Lô Thu Hoạch Nông Sản Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Tên Nông Sản Thu Hoạch *</label>
                <select
                  value={newBatch.productName}
                  onChange={(e) => setNewBatch({ ...newBatch, productName: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Dâu Tây Giống Nhật Mới">Dâu Tây Giống Nhật Mới</option>
                  <option value="Ổi Lợt Lá Rồng VietGAP">Ổi Lợt Lá Rồng VietGAP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1">Sản Lượng Thu Hoạch *</label>
                  <input
                    type="text"
                    placeholder="VD: 350 Kg"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1">Ngày Thu Hoạch *</label>
                  <input
                    type="date"
                    value={newBatch.harvestDate}
                    onChange={(e) => setNewBatch({ ...newBatch, harvestDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Khu Vực Đất Trồng</label>
                <input
                  type="text"
                  value={newBatch.area}
                  onChange={(e) => setNewBatch({ ...newBatch, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">Chứng Nhận Chất Lượng Ap dụng</label>
                <input
                  type="text"
                  value={newBatch.cert}
                  onChange={(e) => setNewBatch({ ...newBatch, cert: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary text-xs">Hủy</button>
                <button type="submit" className="btn btn-amber text-xs font-bold">Tạo Lô & Sinh Mã QR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
