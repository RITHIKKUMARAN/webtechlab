import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Product, Order } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { CartWidget } from './components/CartWidget.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ZeptoScratchCard } from './components/ZeptoScratchCard.tsx';
import { ProfileManagement } from './components/ProfileManagement.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ApiTester } from './components/ApiTester.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { sound } from './utils/soundEffects.ts';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Info,
  Gift,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';

function ShoppingAppContent() {
  const { token, isAuthenticated } = useAuth();
  const { addToCart, applyCoupon } = useCart();
  const [currentView, setCurrentView] = useState<'products' | 'profile' | 'admin' | 'api-tester' | 'orders'>('products');
  
  // Interactive Modals
  const [scratchCardOpen, setScratchCardOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Products State (Exercise-8 Page 3)
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock-desc' | 'name' | 'id'>('featured');
  const catalogRef = useRef<HTMLDivElement>(null);

  // Exercise-8 Page 3: Retrieve products using ONLY HTTP GET method
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/products', {
        method: 'GET',
        headers,
      });

      const data = await res.json();
      setLoadingProducts(false);

      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.reveal-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [products.length, currentView]);

  const openAuth = (mode: 'login' | 'register') => {
    sound.playClick();
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOrderSuccess = (_order: Order) => {
    sound.playTada();
    fetchProducts();
    // Prompt the user to reveal their post-purchase store offer.
    setTimeout(() => {
      setScratchCardOpen(true);
    }, 1200);
  };

  // Categories & Filtering
  const categories = ['All', 'Audio Hardware', 'Peripherals', 'Wearables', 'Accessories'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.productPrice - b.productPrice;
    if (sortBy === 'price-desc') return b.productPrice - a.productPrice;
    if (sortBy === 'stock-desc') return b.quantity - a.quantity;
    if (sortBy === 'name') return a.productName.localeCompare(b.productName);
    if (sortBy === 'id') return a.productId.localeCompare(b.productId);
    return 0;
  });

  return (
    <div className="relative min-h-screen bg-[#080711] text-[#f5f3ff] flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={openAuth}
        openScratchCard={() => setScratchCardOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main View Area */}
      <main className="relative z-10 flex-1">
        
        {/* VIEW 1: PRODUCTS DISPLAY & INTERACTIVE CATALOG (PAGE 3) */}
        {currentView === 'products' && (
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
            
            {/* Store offer */}
            <div className="store-offer reveal-section flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 animate-bounce">
                  <Gift className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-amber-950">A little extra for your next order:</span>
                  <span className="text-amber-800 ml-1.5">
                    open the store offer to reveal a cart discount.
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setScratchCardOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>View offer</span>
              </button>
            </div>

            {/* Storefront Hero */}
            <div className="hero-panel relative overflow-hidden reveal-section">
              <div className="hero-copy relative z-10">
                <div className="eyebrow"><span className="eyebrow-dot" /> Northstar Supply · Designed for everyday life</div>
                <h1 className="hero-title">
                  Technology that <em>fits your life.</em>
                </h1>
                <p className="hero-subtitle">
                  Discover dependable audio, wearables, peripherals, and accessories for work, travel, and home.
                </p>
                <div className="hero-actions">
                  <button
                    onClick={() => {
                      sound.playClick();
                      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Shop now</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    Browse collection
                  </button>
                </div>
              </div>
              <div className="hero-summary">
                <div className="hero-summary-label">SHOP WITH CONFIDENCE</div>
                <div className="hero-summary-grid">
                  <div><strong>Live</strong><span>inventory</span></div>
                  <div><strong>Secure</strong><span>checkout</span></div>
                  <div><strong>Simple</strong><span>returns</span></div>
                </div>
              </div>
            </div>

            {/* Catalog Controls: Search, Category Tabs, Multi-Sort */}
            <div ref={catalogRef} className="space-y-3.5 scroll-mt-24 reveal-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Featured collection</span>
                  <h2>Find your next essential.</h2>
                </div>
                <p>Explore thoughtfully selected products with live availability and secure checkout.</p>
              </div>
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Product Name, ID, or specs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 text-xs text-white glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        setSearchQuery('');
                      }}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Comprehensive Sorting Options */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      sound.playClick();
                      setSortBy(e.target.value as any);
                    }}
                    className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-900 border border-white/15 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="stock-desc">Highest In Stock</option>
                    <option value="name">Product Name (A-Z)</option>
                    <option value="id">Product ID (PROD-...)</option>
                  </select>
                </div>
              </div>

              {/* Segmented Category Filter Controls */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid (Exercise-8 Page 3) */}
            <div className="reveal-section">
              {loadingProducts ? (
                <div className="py-24 text-center text-xs text-slate-400 font-mono">
                  Loading Products from MongoDB Collection...
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-slate-500" />
                  </div>
                  <h3 className="text-base font-semibold text-white">No products available</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `No items match "${searchQuery}". Try clearing search or choosing another category.`
                      : 'Products collection is empty.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.productId}
                      product={product}
                      onSelect={(prod) => {
                        sound.playWhoosh();
                        setSelectedProduct(prod);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart guidance */}
            <div className="reveal-section p-4 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Info className="w-4 h-4" />
                </span>
                <span>
                  Select a product to view its details, or add it directly to your cart.
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Exercise-8 MERN Lab Spec Verified
              </span>
            </div>

          </div>
        )}

        {/* VIEW 2: USER PROFILE MANAGEMENT (EXERCISE-8 SECTION 3) */}
        {currentView === 'profile' && <ProfileManagement />}

        {/* VIEW 3: ADMIN PORTAL */}
        {currentView === 'admin' && <AdminPanel />}

        {/* VIEW 4: MY ORDERS & DIGITAL RECEIPTS */}
        {currentView === 'orders' && <OrdersView onBackToShop={() => setCurrentView('products')} />}

        {/* VIEW 5: REST API TESTER & THUNDER CLIENT (EXERCISE-8 REQUIREMENT 9) */}
        {currentView === 'api-tester' && <ApiTester />}

      </main>

      {/* Floating Drag-and-Drop Cart Widget */}
      <CartWidget onOpenCheckout={() => setCheckoutModalOpen(true)} />

      {/* Store offer modal */}
      <ZeptoScratchCard
        isOpen={scratchCardOpen}
        onClose={() => setScratchCardOpen(false)}
        onApplyReward={(code) => {
          applyCoupon(code);
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccessRedirect={() => {
          fetchProducts();
          setCurrentView('products');
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-6 rounded-2xl glass-panel border border-white/20 shadow-2xl">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedProduct(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-900 mb-4 border border-white/10">
              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.productName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2">
              <span className="text-indigo-400 font-bold">{selectedProduct.productId}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedProduct.category}</span>
              <span aria-hidden="true">·</span>
              <span>In Stock: {selectedProduct.quantity} units</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{selectedProduct.productName}</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">{selectedProduct.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-slate-400 block">Unit Price</span>
                <span className="text-2xl font-bold text-white tabular-nums font-mono">
                  ${selectedProduct.productPrice.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  sound.playSuccess();
                  addToCart(selectedProduct, 1);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.quantity <= 0}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-40"
              >
                Add to Cart ($ {selectedProduct.productPrice})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Footer */}
      <footer className="border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8 mt-12 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            <span>Northstar Supply · Secure technology marketplace</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                setScratchCardOpen(true);
              }}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Offers
            </button>
            <span>·</span>
            <span>REST API Verified</span>
            <span>·</span>
            <span>MongoDB Schema Conformant</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ShoppingAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
