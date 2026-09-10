import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ConsumerView from './components/ConsumerView';
import ProducerView from './components/ProducerView';
import SupplierView from './components/SupplierView';
import TransporterView from './components/TransporterView';
import AdminView from './components/AdminView';
import DatabaseView from './components/DatabaseView';
import CartModal from './components/CartModal';
import TraceabilityModal from './components/TraceabilityModal';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import OrderManagementView from './components/OrderManagementView';
import { apiService } from './services/api';

export default function App() {
  const [currentRole, setRole] = useState('consumer'); // 'consumer' | 'producer' | 'supplier' | 'transporter' | 'admin' | 'database'
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories] = useState([
    { id: 'veggies', name: 'Rau Củ Hữu Cơ', icon: 'Sprout' },
    { id: 'fruits', name: 'Trái Cây VietGAP', icon: 'Apple' },
    { id: 'meat', name: 'Thịt & Hải Sản Thảo Mộc', icon: 'Beef' },
    { id: 'processed', name: 'Nông Sản Chế Biến', icon: 'Package' }
  ]);
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [shippingBills, setShippingBills] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTraceabilityProduct, setActiveTraceabilityProduct] = useState(null);

  // Fetch live real data from PostgreSQL API
  const refreshAllData = async (userOverride = currentUser) => {
    const token = localStorage.getItem('freshfarm_token');
    const tasks = [
      apiService.getProducts().then(setProducts),
      apiService.getBatches().then(setBatches)
    ];
    if (token) {
      tasks.push(apiService.getOrders().then(setOrders));
      tasks.push(apiService.getShippingBills().then(setShippingBills));
    }
    if (userOverride?.role === 'admin') tasks.push(apiService.getUsers().then(setUsersList));
    const results = await Promise.allSettled(tasks);
    results.filter(r => r.status === 'rejected').forEach(r => console.warn('⚠️ API fetch error:', r.reason?.message));
  };

  useEffect(() => {
    async function initSession() {
      const token = localStorage.getItem('freshfarm_token');
      let restoredUser = null;
      if (token) {
        try {
          const user = await apiService.getMe();
          if (user) {
            restoredUser = user;
            setCurrentUser(user);
            if (user.role) setRole(user.role);
          }
        } catch {
          localStorage.removeItem('freshfarm_token');
        }
      }
      await refreshAllData(restoredUser);
    }
    initSession();
  }, []);

  // Cart operations
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = async (newOrder) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập trước khi đặt hàng.');
      return false;
    }
    try {
      await apiService.createOrder(newOrder);
      await refreshAllData();
      return true;
    } catch (err) {
      console.error('Lỗi lưu đơn hàng vào PostgreSQL:', err.message);
      alert(`Lỗi đặt hàng: ${err.message}`);
      return false;
    }
  };

  const handleCreateBatch = async (newBatch) => {
    try {
      await apiService.createBatch(newBatch);
      await refreshAllData();
    } catch (err) {
      console.error('Lỗi lưu lô thu hoạch vào PostgreSQL:', err.message);
      alert(`Lỗi tạo lô thu hoạch: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, statusText) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus, statusText);
      await refreshAllData();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đơn hàng trong PostgreSQL:', err.message);
      alert(`Lỗi chuyển trạng thái: ${err.message}`);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Hoạt động' || currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await apiService.toggleUserStatus(userId, nextStatus);
      await refreshAllData();
    } catch (err) {
      console.error('Lỗi cập nhật người dùng trong PostgreSQL:', err.message);
      alert(`Lỗi khóa/mở khóa tài khoản: ${err.message}`);
    }
  };

  const handleCreateShippingBill = async (bill) => {
    try {
      await apiService.createShippingBill(bill);
      await refreshAllData();
    } catch (err) {
      console.error('Lỗi lưu vận đơn vào PostgreSQL:', err.message);
      alert(`Lỗi tạo vận đơn: ${err.message}`);
    }
  };

  const handleUpdateShippingStatus = async (billId, status) => {
    try {
      await apiService.updateShippingStatus(billId, status);
      await refreshAllData();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái vận đơn:', err.message);
      alert(`Lỗi cập nhật vận đơn: ${err.message}`);
    }
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    if (user.role) {
      setRole(user.role);
    }
    refreshAllData(user);
  };

  const handleProfileSaved = (user) => {
    setCurrentUser(user);
  };

  const openProfile = () => setRole('profile');

  const handleLogout = () => {
    localStorage.removeItem('freshfarm_token');
    setCurrentUser(null);
    setRole('consumer');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header with Role Switcher & Search */}
      <Header
        currentRole={currentRole}
        setRole={setRole}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openProfile={openProfile}
      />

      {/* Main Content Area based on Selected Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentRole === 'consumer' && (
          <ConsumerView
            products={products}
            categories={categories}
            searchQuery={searchQuery}
            addToCart={addToCart}
            onOpenTraceability={(prod) => setActiveTraceabilityProduct(prod)}
          />
        )}

        {currentRole === 'producer' && (
          <ProducerView
            batches={batches}
            setBatches={setBatches}
            products={products}
            onCreateBatch={handleCreateBatch}
          />
        )}

        {currentRole === 'supplier' && (
          <SupplierView
            products={products}
            orders={orders}
            setOrders={setOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {currentRole === 'transporter' && (
          <TransporterView
            orders={orders}
            shippingBills={shippingBills}
            setShippingBills={setShippingBills}
            onCreateShippingBill={handleCreateShippingBill}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateShippingStatus={handleUpdateShippingStatus}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView
            products={products}
            orders={orders}
            batches={batches}
            usersList={usersList}
            onToggleUserStatus={handleToggleUserStatus}
          />
        )}

        {currentRole === 'profile' && (
          <ProfileView currentUser={currentUser} onSaved={handleProfileSaved} onLogout={handleLogout} />
        )}

        {currentUser && ['consumer', 'producer', 'admin'].includes(currentRole) && (
          <OrderManagementView
            orders={orders}
            role={currentRole}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {currentRole === 'database' && (
          <DatabaseView
            products={products}
            orders={orders}
            batches={batches}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-200 text-sm">FRESHFARM PLATFORM - VKU 2026</div>
            <p className="text-slate-400 mt-0.5">Dự án Quản trị dự án phần mềm - Nhóm Sinh viên 23SE3 (Đại học CNTT & TT Việt - Hàn)</p>
          </div>
          <div className="text-slate-400">
            Thực hiện: Trần Dương Thái (23IT249) • Bùi Nguyễn Toàn (23IT277) • Nguyễn Thành Thịnh (23IT262) • Lê Thị Diệu Tâm (23IT244)
          </div>
        </div>
      </footer>

      {/* Cart & Payment VietQR Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Traceability Modal */}
      <TraceabilityModal
        product={activeTraceabilityProduct}
        onClose={() => setActiveTraceabilityProduct(null)}
      />

      {/* Auth Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </div>
  );
}
