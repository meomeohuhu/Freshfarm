import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  BarChart3, 
  Building2, 
  Tractor,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminView({ products, orders, batches, usersList = [], onToggleUserStatus }) {
  const toggleUserStatus = (userId, currentStatus) => {
    if (onToggleUserStatus) {
      onToggleUserStatus(userId, currentStatus);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6 border border-purple-700/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            Trung Tâm Điều Hành Quản Trị Hệ Thống FreshFarm
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Báo Cáo & Phân Quyền Người Dùng (RBAC)
          </h2>
          <p className="text-purple-100/90 text-sm">
            Giám sát toàn bộ hoạt động chuỗi cung ứng, doanh thu thương mại, quản lý tác nhân hệ thống và duyệt sản phẩm minh bạch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              let csvContent = "data:text/csv;charset=utf-8,Mã Đơn,Khách Hàng,Tổng Tiền,Thanh Toán,Trạng Thái\n";
              orders.forEach(o => {
                csvContent += `${o.id},"${o.customerName}",${o.totalAmount},"${o.paymentMethod}","${o.orderStatus}"\n`;
              });
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Bao_Cao_Doanh_Thu_FreshFarm_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="btn bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Xuất Báo Cáo Doanh Thu (CSV/Excel)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tổng doanh thu nền tảng</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRevenue.toLocaleString('vi-VN')} đ</div>
          <div className="text-[11px] text-emerald-600 font-semibold">+18.5% so với tháng trước</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tổng đơn hàng giao dịch</span>
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{orders.length} Đơn</div>
          <div className="text-[11px] text-purple-600 font-semibold">Tỷ lệ hoàn tất 100%</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Cơ sở sản xuất & Kho</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Tractor className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">12 Đối tác</div>
          <div className="text-[11px] text-amber-600 font-semibold">4 Trang trại + 8 Nhà cung cấp</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tổng tài khoản hệ thống</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{usersList.length} Người dùng</div>
          <div className="text-[11px] text-blue-600 font-semibold">Phân quyền RBAC hoạt động</div>
        </div>
      </div>

      {/* Analytics Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Thống Kê Doanh Thu Theo Danh Mục Nông Sản
            </h3>
            <span className="text-xs text-slate-400 font-medium">Cập nhật thời gian thực</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Rau củ Hữu cơ Đà Lạt</span>
                <span className="text-emerald-700">45% (8.300.000 đ)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Trái cây VietGAP Nắng Xanh</span>
                <span className="text-amber-700">30% (5.535.000 đ)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Thịt & Trứng Sạch Thảo Mộc</span>
                <span className="text-blue-700">25% (4.615.000 đ)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b pb-3">
            <Layers className="w-5 h-5 text-purple-600" />
            Tỷ Lệ Tác Nhân Chuỗi Cung Ứng
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
              <span className="font-medium text-slate-700">Người tiêu dùng (Khách hàng)</span>
              <span className="font-bold text-emerald-700">65%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
              <span className="font-medium text-slate-700">Nhà cung cấp (Đơn vị phân phối)</span>
              <span className="font-bold text-blue-700">20%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
              <span className="font-medium text-slate-700">Nhà sản xuất (Trang trại)</span>
              <span className="font-bold text-amber-700">12%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border">
              <span className="font-medium text-slate-700">Quản trị viên (Admin)</span>
              <span className="font-bold text-purple-700">3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management & RBAC Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Quản Lý Tài Khoản & Phân Quyền Vai Trò (RBAC)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Kiểm soát quyền truy cập của Admin, Nhà sản xuất, Nhà cung cấp và Khách hàng</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Mã ND</th>
                <th className="px-5 py-3.5">Họ & Tên / Tên Đơn Vị</th>
                <th className="px-5 py-3.5">Email Liên Hệ</th>
                <th className="px-5 py-3.5">Vai Trò (Role)</th>
                <th className="px-5 py-3.5">Trạng Thái Tài Khoản</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">{user.id}</td>
                  <td className="px-5 py-4 font-bold text-slate-900">{user.name}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{user.email}</td>
                  <td className="px-5 py-4">
                    {user.role === 'Admin' && <span className="badge badge-purple">Admin</span>}
                    {user.role === 'Producer' && <span className="badge badge-amber">Nhà Sản Xuất</span>}
                    {user.role === 'Supplier' && <span className="badge badge-blue">Nhà Cung Cấp</span>}
                    {user.role === 'Consumer' && <span className="badge badge-emerald">Khách Hàng</span>}
                  </td>
                  <td className="px-5 py-4">
                    {user.status === 'Hoạt động' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                        <Lock className="w-3.5 h-3.5" /> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      className={`btn text-xs py-1.5 px-3 ${
                        user.status === 'Hoạt động' 
                          ? 'btn-secondary text-rose-600 hover:bg-rose-50' 
                          : 'btn-primary'
                      }`}
                    >
                      {user.status === 'Hoạt động' ? (
                        <> <Lock className="w-3.5 h-3.5" /> Khoá </>
                      ) : (
                        <> <Unlock className="w-3.5 h-3.5" /> Mở khoá </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
