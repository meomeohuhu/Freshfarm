import React, { useState } from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Save, LockKeyhole } from 'lucide-react';
import { apiService } from '../services/api';

export default function ProfileView({ currentUser, onSaved, onLogout }) {
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    return <div className="bg-white rounded-2xl p-8 text-center text-slate-500">Vui lòng đăng nhập để xem trang cá nhân.</div>;
  }

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const updated = await apiService.updateMe(profile);
      onSaved(updated);
      setMessage('Đã cập nhật thông tin cá nhân.');
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      await apiService.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Đã đổi mật khẩu.');
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 flex items-center justify-center"><ShieldCheck /></div>
          <div>
            <h2 className="text-2xl font-extrabold">Trang cá nhân</h2>
            <p className="text-emerald-100 text-sm">Quản lý thông tin tài khoản FreshFarm</p>
          </div>
        </div>
      </div>

      {(message || error) && <div className={`rounded-xl p-3 text-sm ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg">Thông tin tài khoản</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500"><Mail className="w-4 h-4" /> {currentUser.email}</div>
          <div><label className="block text-xs font-semibold mb-1">Họ và tên</label><input required value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-semibold mb-1">Số điện thoại</label><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" /></div></div>
          <div><label className="block text-xs font-semibold mb-1">Địa chỉ</label><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" /></div></div>
          <div className="text-xs text-slate-500">Vai trò: <strong className="uppercase">{currentUser.role}</strong></div>
          <div className="flex gap-2"><button disabled={saving} className="btn btn-primary text-xs flex items-center gap-2"><Save className="w-4 h-4" /> Lưu thông tin</button><button type="button" onClick={onLogout} className="btn btn-secondary text-xs">Đăng xuất</button></div>
        </form>

        <form onSubmit={changePassword} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><LockKeyhole className="w-5 h-5 text-emerald-600" /> Đổi mật khẩu</h3>
          <div><label className="block text-xs font-semibold mb-1">Mật khẩu hiện tại</label><input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-semibold mb-1">Mật khẩu mới</label><input type="password" minLength={6} required value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm" /></div>
          <button disabled={saving} className="btn btn-secondary text-xs">Đổi mật khẩu</button>
        </form>
      </div>
    </div>
  );
}
