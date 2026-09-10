import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Building2, 
  Truck,
  ArrowRight
} from 'lucide-react';
import { BANK_INFO } from '../data/mockData';

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  onPlaceOrder 
}) {
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('VietQR'); // 'VietQR' | 'COD'
  const [formData, setFormData] = useState({
    name: 'Nguyễn Văn Hùng',
    phone: '0905 123 456',
    address: '124 Nguyễn Văn Linh, Q. Thanh Khê, TP. Đà Nẵng'
  });
  const [lastOrderId, setLastOrderId] = useState('');

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const newOrderId = `ORD-${Date.now().toString().slice(-8)}`;
    setLastOrderId(newOrderId);

    const saved = await onPlaceOrder({
      id: newOrderId,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items: cartItems.map(item => ({ id: item.id, name: item.name, qty: item.quantity, price: item.price })),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod === 'VietQR' ? 'VietQR (Napas)' : 'Thanh toán COD',
      paymentStatus: paymentMethod === 'VietQR' ? 'Đã thanh toán (Mô phỏng VietQR)' : 'Chưa thanh toán (COD)',
      orderStatus: 'Pending',
      statusText: 'Đơn hàng mới - Chờ kho tiếp nhận'
    });

    if (saved !== false) setStep('success');
  };

  const handleFinish = () => {
    clearCart();
    setStep('cart');
    onClose();
  };

  // Quick QR URL simulation using QuickLink format
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNo}-compact2.png?amount=${totalAmount}&addInfo=FRESHFARM%20${lastOrderId || 'TEST'}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {step === 'cart' && 'Giỏ Hàng Nông Sản'}
              {step === 'checkout' && 'Xác Nhận Đặt Hàng & Thanh Toán'}
              {step === 'success' && 'Đặt Hàng Thành Công!'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 font-bold text-lg hover:text-slate-600">✕</button>
        </div>

        {/* Step 1: Cart Items */}
        {step === 'cart' && (
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="font-medium">Giỏ hàng của bạn đang trống.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-800 text-sm">{item.name}</h5>
                        <div className="text-xs text-emerald-700 font-extrabold">
                          {item.price.toLocaleString('vi-VN')} đ / {item.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-600 hover:text-slate-900">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-600 hover:text-slate-900">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-sm">Tổng cộng thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-700">{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button onClick={onClose} className="btn btn-secondary text-xs">Tiếp tục mua hàng</button>
                  <button onClick={() => setStep('checkout')} className="btn btn-primary text-xs font-bold">
                    Tiến Hành Đặt Hàng <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Checkout Form & VietQR Payment */}
        {step === 'checkout' && (
          <form onSubmit={handleCheckoutSubmit} className="space-y-5 text-sm">
            <div className="space-y-3">
              <h5 className="font-bold text-slate-800 text-sm">1. Thông tin giao hàng</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên người nhận</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Địa chỉ nhận nông sản</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="space-y-3 border-t pt-3">
              <h5 className="font-bold text-slate-800 text-sm">2. Phương thức thanh toán</h5>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VietQR')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    paymentMethod === 'VietQR'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Quét Mã VietQR (Napas)
                  </div>
                  <span className="text-[11px] text-slate-500">Tự động sinh QR kèm số tiền</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <Truck className="w-4 h-4 text-amber-600" />
                    Thanh Toán COD
                  </div>
                  <span className="text-[11px] text-slate-500">Thanh toán tiền mặt khi nhận nông sản</span>
                </button>
              </div>
            </div>

            {/* VietQR Generator Preview */}
            {paymentMethod === 'VietQR' && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 border border-slate-700">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> Ngân Hàng: {BANK_INFO.bankName}
                  </span>
                  <span>Mã QR Chuẩn Napas 247</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-lg">
                    <img 
                      src={qrUrl} 
                      alt="VietQR Payment Code" 
                      className="w-36 h-36 object-contain"
                      onError={(e) => {
                        // Fallback SVG QR simulator if offline
                        e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FRESHFARM_PAYMENT';
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div>Chủ tài khoản: <strong className="text-white">{BANK_INFO.accountName}</strong></div>
                    <div>Số tài khoản: <strong className="text-amber-400 font-mono">{BANK_INFO.accountNo}</strong></div>
                    <div>Số tiền: <strong className="text-emerald-400 font-black text-sm">{totalAmount.toLocaleString('vi-VN')} đ</strong></div>
                    <div className="text-[11px] text-slate-400 bg-slate-800 p-1.5 rounded border border-slate-700">
                      Nội dung CK: <span className="font-mono text-emerald-300">FRESHFARM {lastOrderId || 'ORDER'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setStep('cart')} className="btn btn-secondary text-xs">Quay lại</button>
              <button type="submit" className="btn btn-primary text-xs font-bold shadow-lg">
                Xác Nhận Đặt Hàng ({totalAmount.toLocaleString('vi-VN')} đ)
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900">Cảm Ơn Bạn Đã Đặt Hàng!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Đơn hàng <strong className="text-emerald-700 font-mono">{lastOrderId}</strong> đã được ghi nhận. Nhà cung cấp sẽ chuẩn bị nông sản và giao hàng tới bạn trong thời gian sớm nhất.
            </p>
            <div className="pt-3">
              <button onClick={handleFinish} className="btn btn-primary text-xs font-bold px-6">
                Hoàn Tất & Về Trang Chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
