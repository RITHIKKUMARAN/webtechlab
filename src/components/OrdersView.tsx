import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Order } from '../types/index.ts';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';

interface OrdersViewProps {
  onBackToShop: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onBackToShop }) => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            <span>My Purchase History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Confirmed orders, delivery coordinates, and itemized receipts for {user?.emailId}.
          </p>
        </div>

        <button
          onClick={onBackToShop}
          className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 transition-all cursor-pointer"
        >
          Explore Catalog
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading order records...</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center text-slate-400 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-white">No orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Drag items into your cart and complete checkout to see your verified order receipts here.
          </p>
          <button
            onClick={onBackToShop}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-indigo-300">{order.orderId}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{order.status}</span>
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums font-mono pl-2">
                    ${order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-400 block">Items Purchased:</span>
                  <div className="space-y-1.5 pl-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-200">
                        <span>{item.quantity}x {item.productName}</span>
                        <span className="tabular-nums font-mono text-slate-400">${item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="font-medium text-slate-300 block mb-1">Shipping & Payment:</span>
                  <p className="text-slate-200">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                  <p className="pt-1 text-[11px] font-mono text-slate-400">Payment: {order.paymentMethod}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
