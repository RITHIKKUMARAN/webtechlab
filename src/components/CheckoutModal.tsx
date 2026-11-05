import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { X, CheckCircle2, ShieldCheck, MapPin, Phone, CreditCard } from 'lucide-react';
import { Order } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, totalAmount, discount, clearCart } = useCart();
  const { token, user } = useAuth();

  const [fullName, setFullName] = useState(user?.username || '');
  const [address, setAddress] = useState('42 Tech Corridor, OMR Road');
  const [city, setCity] = useState('Chennai');
  const [postalCode, setPostalCode] = useState('603110');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery (COD)');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !address || !city || !postalCode || !phone) {
      setErrorMessage('Please fill out all shipping fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.product.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName,
          address,
          city,
          postalCode,
          phone,
        },
        paymentMethod,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to complete checkout.');
        return;
      }

      setPlacedOrder(data.order);
      clearCart();
      onOrderSuccess(data.order);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Network error during checkout.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 rounded-2xl glass-panel border border-white/20 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {placedOrder ? (
          /* Order Confirmation Receipt Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
                Order Confirmed
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Thank you for your purchase!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Receipt generated for <span className="text-white font-medium">{placedOrder.emailId}</span>
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="text-left p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-indigo-300 font-bold">{placedOrder.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-200">{new Date(placedOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Delivery To:</span>
                <span className="text-slate-200 text-right">
                  {placedOrder.shippingAddress.fullName}, {placedOrder.shippingAddress.city} ({placedOrder.shippingAddress.postalCode})
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 block mb-1">Purchased Items:</span>
                {placedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300 pl-2">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="tabular-nums">₹{item.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                <span>Total Paid:</span>
                <span className="text-emerald-400 tabular-nums">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPlacedOrder(null);
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Finish Purchase & Checkout</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review your items and enter shipping coordinates to finalize your order.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none bg-slate-900"
                    >
                      <option value="Cash On Delivery (COD)">Cash On Delivery (COD)</option>
                      <option value="Encrypted Credit/Debit Card">Credit/Debit Card</option>
                      <option value="UPI / Instant Wire">UPI / Net Banking</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Amount Baseline */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Cart Items ({cart.length})</span>
                  <span className="tabular-nums font-mono">₹{(totalAmount + discount).toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Applied Coupon</span>
                    <span className="tabular-nums font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                  <span>Payable Total:</span>
                  <span className="text-indigo-300 tabular-nums font-mono text-sm">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Processing Order...' : 'Confirm Order & Deduct Stock'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
