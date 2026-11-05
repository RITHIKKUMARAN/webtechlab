import React, { useState } from 'react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { GripVertical, Plus, Check } from 'lucide-react';
import { sound } from '../utils/soundEffects.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onRequireAuth?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onRequireAuth }) => {
  const { addToCart, setDraggedProduct, setIsDraggingProduct } = useCart();
  const { isAuthenticated } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    sound.playWhoosh();
    e.dataTransfer.setData('text/plain', product.productId);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedProduct(product);
    setIsDraggingProduct(true);
  };

  const handleDragEnd = () => {
    setIsDraggingProduct(false);
    setDraggedProduct(null);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
    if (product.quantity <= 0) return;
    sound.playSuccess();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div
      draggable={!isOutOfStock}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect && onSelect(product)}
      data-drag-handle="true"
      className="group product-card relative flex flex-col justify-between rounded-2xl glass-panel-interactive p-4 border border-white/10 hover:border-indigo-400/30 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top Glass Aura Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />

      {/* Drag Handle Indicator */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] tracking-wider uppercase text-slate-400 hidden group-hover:inline-block font-mono">
          Drag to cart
        </span>
        <div className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      <div>
        {/* Product Image Area */}
        <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-900/80 mb-4 border border-white/5">
          {product.image ? (
            <img
              src={product.image}
              alt={product.productName}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : null}

          {/* Fallback image placeholder if loading or missing */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950/40 text-slate-600">
              <span className="text-xs font-mono">{product.category}</span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Clean Unboxed Metadata (Zero-pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
          <span className="font-mono text-indigo-300">{product.productId}</span>
          <span aria-hidden="true">·</span>
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className={product.quantity <= 5 ? 'text-amber-400 font-medium' : 'text-slate-400'}>
            Qty: {product.quantity}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-base font-semibold text-white group-hover:text-indigo-200 transition-colors line-clamp-1 mb-1">
          {product.productName}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>
      </div>

      {/* Bottom Bar: Price Baseline & Action Button */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div>
          <span className="text-xs text-slate-400 block">Price</span>
          <span className="text-lg font-bold text-white tabular-nums tracking-tight">
            ₹{product.productPrice.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            justAdded
              ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : isOutOfStock
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-white/10 hover:bg-indigo-600 text-white border border-white/15 hover:border-indigo-500 shadow-sm'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
