import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Product, User, Order } from '../types/index.ts';
import { Shield, Plus, Edit2, Trash2, Users, Package, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { token, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Product Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProductId, setNewProductId] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState('Audio Hardware');
  const [newQuantity, setNewQuantity] = useState<number | ''>('');
  const [newDescription, setNewDescription] = useState('');

  const fetchData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);

    try {
      // 1. Fetch products
      const pRes = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }

      // 2. Fetch users
      const uRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }

      // 3. Fetch orders
      const oRes = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrders(oData.orders || []);
      }
    } catch (e: any) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-slate-400 mt-2">
          Administrator privileges are required to view this portal. Please sign in with the configured administrator account.
        </p>
      </div>
    );
  }

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      productId: editingProduct ? editingProduct.productId : (newProductId.trim() || `PROD-${Date.now().toString().slice(-4)}`),
      productName: newProductName.trim(),
      productPrice: Number(newProductPrice),
      category: newCategory,
      quantity: Number(newQuantity),
      description: newDescription.trim(),
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.productId}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: data.message || 'Product saved successfully!' });
        setShowAddModal(false);
        setEditingProduct(null);
        resetProductForm();
        fetchData();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Operation failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error.' });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm(`Are you sure you want to delete product '${productId}'?`)) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: data.message || 'Product deleted.' });
        fetchData();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete product.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Network error.' });
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset all collections (Products, Users, Orders) to initial lab seeds?')) return;

    try {
      const res = await fetch('/api/admin/reset-db', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: data.message });
        fetchData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setNewProductId(prod.productId);
    setNewProductName(prod.productName);
    setNewProductPrice(prod.productPrice);
    setNewCategory(prod.category);
    setNewQuantity(prod.quantity);
    setNewDescription(prod.description);
    setShowAddModal(true);
  };

  const resetProductForm = () => {
    setNewProductId('');
    setNewProductName('');
    setNewProductPrice('');
    setNewCategory('Audio Hardware');
    setNewQuantity('');
    setNewDescription('');
    setEditingProduct(null);
  };

  const totalStockUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Elevated privileges: manage Products & Users collections, monitor live order telemetry, and reset store seeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDatabase}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors cursor-pointer"
            title="Reset database to default seed records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>

          <button
            onClick={() => {
              resetProductForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip (Single elevation) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <span className="text-xs text-slate-400 block">Catalog Products</span>
          <span className="text-2xl font-bold text-white tabular-nums">{products.length}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <span className="text-xs text-slate-400 block">Available Units</span>
          <span className="text-2xl font-bold text-white tabular-nums">{totalStockUnits}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <span className="text-xs text-slate-400 block">Registered Users</span>
          <span className="text-2xl font-bold text-white tabular-nums">{users.length}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <span className="text-xs text-slate-400 block">Total Orders Revenue</span>
          <span className="text-2xl font-bold text-emerald-400 tabular-nums">${totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Products Collection ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users Collection ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Orders ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: Products Management Table */}
      {activeTab === 'products' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-mono tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Available Quantity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => (
                  <tr key={p.productId} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-indigo-300 font-semibold">{p.productId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{p.productName}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.category}</td>
                    <td className="px-4 py-3 tabular-nums font-mono font-medium text-white">
                      ${p.productPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono tabular-nums font-semibold ${
                        p.quantity === 0 ? 'text-rose-400' : p.quantity <= 5 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {p.quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditProduct(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.productId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Users Collection Table */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-mono tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email ID</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.emailId} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{u.username}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{u.emailId}</td>
                    <td className="px-4 py-3 tabular-nums font-mono">{u.age}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        u.role === 'admin'
                          ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                          : 'bg-indigo-400/10 text-indigo-300 border border-indigo-400/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Orders List */}
      {activeTab === 'orders' && (
        <div className="glass-panel rounded-2xl border border-white/10 p-6">
          {orders.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No customer orders placed yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.orderId} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-indigo-300">{o.orderId}</span>
                      <span className="text-slate-400">{o.username} ({o.emailId})</span>
                    </div>
                    <span className="text-emerald-400 font-bold tabular-nums font-mono">
                      ${o.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Ship to: {o.shippingAddress.fullName}, {o.shippingAddress.address}, {o.shippingAddress.city} · Payment: {o.paymentMethod}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Items: {o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-2xl glass-panel border border-white/20 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
            </h3>

            <form onSubmit={handleCreateOrUpdateProduct} className="space-y-3.5">
              {!editingProduct && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Product ID (Unique)</label>
                  <input
                    type="text"
                    placeholder="e.g. PROD-107"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lumina Prism Acoustic Monitor"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="199"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Available Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="15"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none bg-slate-900"
                >
                  <option value="Audio Hardware">Audio Hardware</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed product specifications..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-4 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
