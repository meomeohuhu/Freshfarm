import React from 'react';
import { 
  QrCode, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Award, 
  CheckCircle2, 
  CheckCircle, 
  Tractor, 
  Truck, 
  Store, 
  UserCheck 
} from 'lucide-react';

export default function TraceabilityModal({ product, onClose }) {
  if (!product) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `FRESHFARM_TRACEABILITY:${product.batchCode}:${product.farmName}`
  )}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-900/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="badge badge-emerald text-[10px]">Xác Thực Mã Lô Chuẩn Số Hóa</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Truy Xuất Nguồn Gốc Nông Sản</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 font-bold text-xl hover:text-slate-600">✕</button>
        </div>

        {/* QR Code & Batch Overview Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 border border-slate-800 shadow-xl">
          <div className="bg-white p-2.5 rounded-2xl shadow-md border-2 border-emerald-400">
            <img src={qrCodeUrl} alt="Mã QR Truy Xuất" className="w-32 h-32 object-contain" />
          </div>

          <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded-md border border-emerald-500/30">
              MÃ LÔ: {product.batchCode}
            </div>
            <h4 className="text-lg font-bold text-white">{product.name}</h4>
            <div className="text-slate-300 flex items-center justify-center sm:justify-start gap-1">
              <Tractor className="w-3.5 h-3.5 text-emerald-400" />
              <span>{product.farmName}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {product.certifications.map((cert, idx) => (
                <span key={idx} className="badge bg-emerald-600 text-white text-[10px]">
                  <Award className="w-3 h-3" /> {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Journey (Farm to Table) */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Hành Trình Chuỗi Cung Ứng Minh Bạch (4 Bước)
          </h4>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
            {product.journeySteps.map((step) => (
              <div key={step.step} className="relative group">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md ring-4 ring-white">
                  {step.step}
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-50/50 transition-all space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 text-sm">{step.title}</span>
                    <span className="text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" /> {step.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector Digital Verification Stamp */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-emerald-900">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-bold">Đã kiểm định bởi Ban Quản lý An toàn Thực phẩm</div>
              <div className="text-[11px] text-emerald-700">Mã chữ ký số: <span className="font-mono">SIG-FRESHFARM-2026-VKU</span></div>
            </div>
          </div>
          <span className="badge badge-emerald">Đạt chuẩn 100%</span>
        </div>

        <div className="flex justify-end border-t pt-3">
          <button onClick={onClose} className="btn btn-secondary text-xs font-bold px-5">
            Đóng Cửa Sổ Truy Xuất
          </button>
        </div>
      </div>
    </div>
  );
}
