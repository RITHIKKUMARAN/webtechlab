import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { ShoppingBag, ArrowRight, X, Trash2, Tag, Check, Sparkles } from 'lucide-react';

interface CartWidgetProps {
  onOpenCheckout: () => void;
}

export const CartWidget: React.FC<CartWidgetProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    totalItems,
    subtotal,
    discount,
    totalAmount,
    couponCode,
    applyCoupon,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    isDraggingProduct,
    draggedProduct,
    handleDropToCart,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [isOverDropZone, setIsOverDropZone] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isOverDropZone) setIsOverDropZone(true);
  };

  const handleDragLeave = () => {
    setIsOverDropZone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverDropZone(false);
    handleDropToCart();
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(false);
    setCouponSuccess(false);

    if (applyCoupon(inputCoupon)) {
      setCouponSuccess(true);
      setTimeout(() => setCouponSuccess(false), 2500);
    } else {
      setCouponError(true);
      setTimeout(() => setCouponError(false), 2500);
    }
  };

  return (
    <>
      {/* FLOATING GLASS DROP ZONE & QUICK CART DOCK (Bottom Right) */}
      <div
        data-drop-zone="true"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => setIsCartOpen(true)}
        className={`fixed bottom-6 right-6 z-40 transition-all duration-300 cursor-pointer ${
          isDraggingProduct
            ? 'scale-110 -translate-y-2'
            : 'hover:scale-105'
        }`}
      >
        <div
          className={`flex items-center gap-3.5 p-3.5 rounded-2xl backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
            isOverDropZone
              ? 'bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.5)] scale-110'
              : isDraggingProduct
              ? 'bg-indigo-950/80 border-2 border-dashed border-indigo-400 shadow-[0_0_35px_rgba(99,102,241,0.5)] animate-pulse'
              : 'bg-slate-900/80 border border-white/20 hover:border-white/40'
          }`}
        >
          {/* Cart Icon / Suction Indicator */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              isOverDropZone
                ? 'bg-emerald-500 text-slate-950'
                : isDraggingProduct
                ? 'bg-indigo-500 text-white'
                : 'bg-white/10 text-white'
            }`}
          >
            {isOverDropZone ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </div>

          <div className="pr-1 text-left">
            {isOverDropZone ? (
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Drop Here!
                </p>
                <p className="text-[11px] text-emerald-100">Add to shopping bag</p>
              </div>
            ) : isDraggingProduct ? (
              <div>
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Drop Target
                </p>
                <p className="text-[11px] text-indigo-100 max-w-[130px] truncate">
                  {draggedProduct?.productName || 'Release card'}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Cart</span>
                  <span className="text-[11px] font-mono text-indigo-300">({totalItems} items)</span>
                </div>
                <p className="text-xs font-semibold text-slate-200 tabular-nums">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL GLASS CART DRAWER / SLIDE-OVER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-md h-full flex flex-col glass-panel border-l border-white/20 p-6 shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
                <span className="text-xs font-mono text-slate-400">({totalItems})</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Your cart is empty</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Drag and drop any product card onto the cart widget, or click "Add" in the catalog.
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.productId}
                    className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-white/5">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.productName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">
                          IMG
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-white truncate">
                          {product.productName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-mono text-indigo-300">{product.productId}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">${product.productPrice} each</span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Removal */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(product.productId, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-medium text-white tabular-nums">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.productId, quantity + 1)}
                            disabled={quantity >= product.quantity}
                            className="w-6 h-6 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded cursor-pointer disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-white tabular-nums">
                            ${(product.productPrice * quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(product.productId)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                {/* Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Try code 'LUMINA20'"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs text-white glass-input rounded-lg focus:outline-none placeholder:text-slate-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/15 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {couponSuccess && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 20% discount coupon applied!
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-400">
                    Invalid coupon. Use 'LUMINA20' for 20% off.
                  </p>
                )}

                {/* Subtotals */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-mono">${subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({couponCode})</span>
                      <span className="tabular-nums font-mono">-${discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="tabular-nums font-mono text-base text-indigo-300">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onOpenCheckout();
                  }}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Finish Purchase</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
