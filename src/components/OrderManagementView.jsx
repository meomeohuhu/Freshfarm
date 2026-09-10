import React from 'react';
import { ClipboardList, CheckCircle2, XCircle, ArrowRight, Truck } from 'lucide-react';

const statusLabels = {
  Pending: 'Chờ xác nhận',
  Preparing: 'Đang chuẩn bị',
  Shipping: 'Đang giao hàng',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã huỷ'
};

export default function OrderManagementView({ orders = [], role, currentUser, onUpdateStatus }) {
  const visibleOrders = role === 'consumer'
    ? orders.filter(o => o.customerId === currentUser?.id || o.customerName === currentUser?.name)
    : role === 'transporter'
      ? orders.filter(o => ['Preparing', 'Shipping'].includes(o.orderStatus))
      : orders;

  const actionFor = (order) => {
    if (role === 'supplier' && order.orderStatus === 'Pending') return ['Preparing', 'Xác nhận & đóng gói'];
    if (role === 'supplier' && order.orderStatus === 'Preparing') return ['Shipping', 'Bàn giao vận chuyển'];
    if (role === 'transporter' && order.orderStatus === 'Shipping') return ['Completed', 'Xác nhận đã giao'];
    if (role === 'admin') {
      if (order.orderStatus === 'Pending') return ['Preparing', 'Chuyển chuẩn bị'];
      if (order.orderStatus === 'Preparing') return ['Shipping', 'Chuyển vận chuyển'];
      if (order.orderStatus === 'Shipping') return ['Completed', 'Hoàn tất đơn'];
    }
    return null;
  };

  const canCancel = role === 'consumer';

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-5 border-b flex items-center justify-between">
        <div><h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><ClipboardList className="w-5 h-5 text-emerald-600" /> Quản lý đơn hàng</h3><p className="text-xs text-slate-500 mt-1">{role === 'consumer' ? 'Các đơn hàng của bạn' : `Đơn hàng theo vai trò ${role}`}</p></div>
        <span className="badge badge-emerald">{visibleOrders.length} đơn</span>
      </div>
      {visibleOrders.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">Chưa có đơn hàng phù hợp.</div> : (
        <div className="divide-y divide-slate-100">
          {visibleOrders.map(order => {
            const action = actionFor(order);
            return <div key={order.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><div className="font-mono font-bold text-slate-900">{order.id}</div><div className="text-xs text-slate-500">{order.date} · {order.customerName}</div></div>
                <span className="badge badge-blue">{statusLabels[order.orderStatus] || order.orderStatus}</span>
              </div>
              <div className="text-xs text-slate-600 flex flex-wrap gap-3"><span>{order.items?.map(i => `${i.name} x${i.qty}`).join(', ')}</span><strong>{Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ</strong></div>
              <div className="flex justify-end gap-2">
                {canCancel && order.orderStatus === 'Pending' && <button onClick={() => onUpdateStatus(order.id, 'Cancelled', 'Đơn hàng đã bị huỷ bởi khách hàng')} className="btn btn-secondary text-xs text-rose-600"><XCircle className="w-3.5 h-3.5" /> Huỷ đơn</button>}
                {action && <button onClick={() => onUpdateStatus(order.id, action[0], action[1])} className="btn btn-primary text-xs">{action[1]} <ArrowRight className="w-3.5 h-3.5" /></button>}
                {order.orderStatus === 'Completed' && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Đã hoàn tất</span>}
                {role === 'transporter' && order.orderStatus === 'Shipping' && <Truck className="w-4 h-4 text-teal-600" />}
              </div>
            </div>;
          })}
        </div>
      )}
    </section>
  );
}
