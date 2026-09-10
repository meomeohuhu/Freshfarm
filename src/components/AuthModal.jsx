import React, { useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, ShieldCheck, CheckCircle2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { apiService } from '../services/api';

export default function AuthModal({ isOpen, onClose, currentUser, onLoginSuccess, onLogout }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'consumer',
    phone: '',
    address: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLoginMode) {
        // Login API
        const res = await apiService.login(formData.email, formData.password);
        setSuccessMsg('Đăng nhập thành công!');
        onLoginSuccess(res.user);
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 1000);
      } else {
        // Register API
        const res = await apiService.register(formData);
        setSuccessMsg('Đăng ký tài khoản mới thành công! Vui lòng đăng nhập.');
        setIsLoginMode(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Thao tác không thành công. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {currentUser ? 'Thông Tin Tài Khoản' : isLoginMode ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 font-bold text-lg hover:text-slate-600">✕</button>
        </div>

        {/* Logged in state view */}
        {currentUser ? (
          <div className="space-y-4 py-2">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-base">{currentUser.name}</span>
                <span className="badge badge-emerald uppercase text-[10px] font-mono">{currentUser.role}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" /> {currentUser.email}</div>
                {currentUser.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {currentUser.phone}</div>}
                {currentUser.address && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {currentUser.address}</div>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <button onClick={onClose} className="btn btn-secondary text-xs">Đóng</button>
              <button onClick={onLogout} className="btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">
                Đăng Xuất
              </button>
            </div>
          </div>
        ) : (
          /* Form Login/Register */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {isLoginMode && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 text-[11px]">
                <div className="font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-purple-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Chọn nhanh Tài khoản Mẫu 5 Vai Trò:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'admin@freshfarm.vn', password: 'admin123' })}
                    className="px-2 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded font-bold"
                  >
                    👑 Admin (Full Access)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'producer@freshfarm.vn', password: '123456' })}
                    className="px-2 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded font-bold"
                  >
                    🚜 Nhà sản xuất
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'supplier@freshfarm.vn', password: '123456' })}
                    className="px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded font-bold"
                  >
                    📦 Nhà cung cấp
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'transporter@freshfarm.vn', password: '123456' })}
                    className="px-2 py-1 bg-teal-100 text-teal-800 hover:bg-teal-200 rounded font-bold"
                  >
                    🚚 Nhà vận chuyển
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, email: 'consumer@freshfarm.vn', password: '123456' })}
                    className="px-2 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-bold"
                  >
                    🛒 Khách hàng
                  </button>
                </div>
              </div>
            )}

            {!isLoginMode && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên / Tên tổ chức *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn Hùng / Trang trại GreenFarm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ Email *</label>
              <input
                type="email"
                required
                placeholder="VD: user@freshfarm.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {!isLoginMode && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vai Trò Hệ Thống (RBAC Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="consumer">Khách hàng (Người dùng mua sắm)</option>
                    <option value="producer">Nhà sản xuất (Trang trại / Nông hộ)</option>
                    <option value="supplier">Nhà cung cấp (Kho phân phối)</option>
                    <option value="transporter">Nhà vận chuyển (Đơn vị giao hàng)</option>
                    <option value="admin">Quản trị viên (Admin hệ thống)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="0905 xxx xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      placeholder="TP. Đà Nẵng"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-emerald-700 font-bold hover:underline"
              >
                {isLoginMode ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary text-xs font-bold px-5 shadow-md flex items-center gap-1.5"
              >
                {isLoginMode ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{loading ? 'Đang xử lý...' : isLoginMode ? 'Đăng Nhập' : 'Đăng Ký'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
