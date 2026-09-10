import React, { useState } from 'react';
import { 
  Sprout, 
  ShoppingCart, 
  User, 
  ShieldCheck, 
  Search, 
  Tractor, 
  Store, 
  Truck,
  LayoutDashboard, 
  Bell,
  CheckCircle2,
  Database,
  LogIn,
  Lock
} from 'lucide-react';

export default function Header({ 
  currentRole, 
  setRole, 
  cartCount, 
  openCart, 
  searchQuery, 
  setSearchQuery,
  currentUser,
  openAuthModal,
  openProfile
}) {
  const [rbacAlert, setRbacAlert] = useState(null);

  const roles = [
    { id: 'consumer', label: 'Khách hàng', icon: User },
    { id: 'producer', label: 'Nhà sản xuất', icon: Tractor },
    { id: 'supplier', label: 'Nhà cung cấp', icon: Store },
    { id: 'transporter', label: 'Nhà vận chuyển', icon: Truck },
    { id: 'admin', label: 'Quản trị viên', icon: LayoutDashboard },
    { id: 'database', label: 'CSDL SQL', icon: Database }
  ];

  // RBAC Permission Check Matrix
  const isAllowedRole = (targetRoleId) => {
    // Guest (not logged in): Can view consumer or switch tabs with alert
    if (!currentUser) {
      if (targetRoleId === 'consumer') return true;
      return false; // Lock management tabs until logged in as Admin or appropriate role
    }

    const userRole = currentUser.role;
    if (userRole === 'admin') return true; // Admin has Full Access to all views
    if (userRole === targetRoleId) return true; // Matches assigned role
    if (targetRoleId === 'consumer') return true; // Everyone can view public shop catalog

    return false; // Denied
  };

  const handleRoleClick = (targetRole) => {
    if (isAllowedRole(targetRole.id)) {
      setRole(targetRole.id);
      setRbacAlert(null);
    } else {
      const userRoleTitle = currentUser 
        ? (currentUser.role === 'consumer' ? 'Khách hàng' : currentUser.role === 'producer' ? 'Nhà sản xuất' : currentUser.role === 'supplier' ? 'Nhà cung cấp' : currentUser.role === 'transporter' ? 'Nhà vận chuyển' : 'Khách hàng')
        : 'Khách hàng (Khách vãng lai)';

      setRbacAlert({
        targetName: targetRole.label,
        currentRoleTitle: userRoleTitle
      });

      // Auto dismiss alert after 5s
      setTimeout(() => setRbacAlert(null), 5000);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> RBAC PERMISSION ENFORCED
          </span>
          <span className="hidden md:inline text-slate-400">
            {currentUser ? `Đang đăng nhập: ${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Chọn phân hệ làm việc:'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {roles.filter(r => isAllowedRole(r.id)).map((r) => {
            const Icon = r.icon;
            const active = currentRole === r.id;

            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                title={`Xem phân hệ ${r.label}`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold text-xs relative ${
                  active 
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {active && <CheckCircle2 className="w-3 h-3 text-emerald-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="glass-nav px-4 lg:px-8 py-3.5 text-white flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRole('consumer')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              FreshFarm <span className="text-xs bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded font-mono font-normal">v1.0</span>
            </h1>
            <p className="text-[11px] text-emerald-200/80 hidden sm:block">Thương mại điện tử & Chuỗi cung ứng Nông sản Sạch</p>
          </div>
        </div>

        {/* Search Bar (Consumer/Global) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nông sản, sản phẩm hữu cơ, nhà sản xuất..."
              className="w-full bg-emerald-950/50 text-white placeholder-emerald-200/60 text-sm rounded-full pl-10 pr-4 py-2 border border-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-800/50 rounded-lg relative transition-all"
            title="Thông báo hệ thống"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"></span>
          </button>

          {currentRole === 'consumer' && (
            <button
              onClick={openCart}
              className="btn btn-amber relative shadow-lg flex items-center gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="bg-white text-amber-700 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center ml-0.5 shadow-inner">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <div 
            onClick={currentUser && openProfile ? openProfile : openAuthModal}
            className="flex items-center gap-2 pl-2 border-l border-emerald-700/60 cursor-pointer hover:opacity-90 transition-opacity"
            title="Đăng nhập / Xem tài khoản"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-200">
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : (currentRole === 'consumer' ? 'KH' : currentRole === 'producer' ? 'NSX' : currentRole === 'supplier' ? 'NCC' : currentRole === 'transporter' ? 'VC' : currentRole === 'admin' ? 'AD' : 'DB')}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-emerald-100 flex items-center gap-1">
                <span>{currentUser ? currentUser.name : (currentRole === 'consumer' ? 'Khách hàng' : currentRole === 'producer' ? 'GreenFarm' : currentRole === 'supplier' ? 'Việt Nông' : currentRole === 'transporter' ? 'Viettel Post' : currentRole === 'admin' ? 'Quản trị viên' : 'DB Manager')}</span>
                {!currentUser && <LogIn className="w-3 h-3 text-emerald-300" />}
              </div>
              <div className="text-[10px] text-emerald-300/80 capitalize">{currentUser ? currentUser.role : currentRole}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
