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
import { apiService } from './services/api';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_BATCHES, 
  INITIAL_ORDERS 
} from './data/mockData';

export default function App() {
  const [currentRole, setRole] = useState('consumer'); // 'consumer' | 'producer' | 'supplier' | 'transporter' | 'admin' | 'database'
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories] = useState(INITIAL_CATEGORIES);
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [cart, setCart] = useState([
    { ...INITIAL_PRODUCTS[0], quantity: 2 },
    { ...INITIAL_PRODUCTS[1], quantity: 1 }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTraceabilityProduct, setActiveTraceabilityProduct] = useState(null);

  // Load live data from Express Backend SQLite Database
  useEffect(() => {
    async function loadData() {
      try {
        const fetchedProds = await apiService.getProducts();
        if (fetchedProds && fetchedProds.length > 0) setProducts(fetchedProds);

        const fetchedBatches = await apiService.getBatches();
        if (fetchedBatches && fetchedBatches.length > 0) setBatches(fetchedBatches);

        const fetchedOrders = await apiService.getOrders();
        if (fetchedOrders && fetchedOrders.length > 0) setOrders(fetchedOrders);
      } catch (err) {
        console.warn('⚠️ Server backend chưa phản hồi hoặc chưa chạy, hệ thống đang dùng dữ liệu khởi tạo local state:', err.message);
      }
    }
    loadData();
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
    setOrders([newOrder, ...orders]);
    try {
      await apiService.createOrder(newOrder);
    } catch (err) {
      console.warn('Sync order to DB failed:', err.message);
    }
  };

  const handleCreateBatch = async (newBatch) => {
    setBatches([newBatch, ...batches]);
    try {
      await apiService.createBatch(newBatch);
    } catch (err) {
      console.warn('Sync batch to DB failed:', err.message);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role) {
      setRole(user.role);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
          />
        )}

        {currentRole === 'transporter' && (
          <TransporterView
            orders={orders}
            setOrders={setOrders}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView
            products={products}
            orders={orders}
            batches={batches}
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
