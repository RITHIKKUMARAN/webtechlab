import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User as UserIcon, Calendar, Lock, CheckCircle2, AlertCircle, RefreshCw, Trash2, Edit3, Shield } from 'lucide-react';

export const ProfileManagement: React.FC = () => {
  const { user, token, updateUserSession, logout } = useAuth();

  // Active operation tab
  const [activeTab, setActiveTab] = useState<'put' | 'patch' | 'delete'>('put');

  // PUT Form State (Complete details)
  const [putUsername, setPutUsername] = useState(user?.username || '');
  const [putAge, setPutAge] = useState<number | ''>(user?.age || '');
  const [putPassword, setPutPassword] = useState('');

  // PATCH Form State (Selected details)
  const [patchField, setPatchField] = useState<'username' | 'age' | 'password'>('username');
  const [patchValue, setPatchValue] = useState('');

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; rawResponse?: any } | null>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-400">Please sign in to access your profile management.</p>
      </div>
    );
  }

  // A. PUT Operation — Update Complete Details
  const handlePutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!putUsername || putAge === '') {
      setStatusMessage({ type: 'error', text: 'Complete fields (username and age) are required for PUT operation.' });
      return;
    }

    setLoading(true);
    try {
      const url = `/api/users?emailId=${encodeURIComponent(user.emailId)}`;
      const payload: any = {
        username: putUsername.trim(),
        age: Number(putAge),
      };
      if (putPassword) payload.password = putPassword;

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        updateUserSession(data.user);
        setStatusMessage({
          type: 'success',
          text: data.message || 'Profile completely updated via PUT request.',
          rawResponse: data
        });
        setPutPassword('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'PUT operation failed.', rawResponse: data });
      }
    } catch (err: any) {
      setLoading(false);
      setStatusMessage({ type: 'error', text: err.message || 'Network error during PUT operation.' });
    }
  };

  // B. PATCH Operation — Update Selected Details
  const handlePatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!patchValue) {
      setStatusMessage({ type: 'error', text: `Please provide a new value for ${patchField}.` });
      return;
    }

    setLoading(true);
    try {
      const url = `/api/users?emailId=${encodeURIComponent(user.emailId)}`;
      const payload: any = {};
      if (patchField === 'age') {
        const parsed = Number(patchValue);
        if (isNaN(parsed) || parsed <= 0) {
          setLoading(false);
          setStatusMessage({ type: 'error', text: 'Age must be a valid positive number.' });
          return;
        }
        payload.age = parsed;
      } else {
        payload[patchField] = patchValue;
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        updateUserSession(data.user);
        setStatusMessage({
          type: 'success',
          text: data.message || `Field '${patchField}' updated via PATCH request.`,
          rawResponse: data
        });
        setPatchValue('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'PATCH operation failed.', rawResponse: data });
      }
    } catch (err: any) {
      setLoading(false);
      setStatusMessage({ type: 'error', text: err.message || 'Network error during PATCH operation.' });
    }
  };

  // C. DELETE Operation — Delete User Details
  const handleDeleteSubmit = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete your registration record for '${user.emailId}'? This operation cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const url = `/api/users?emailId=${encodeURIComponent(user.emailId)}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        alert(data.message || 'User registration deleted successfully.');
        logout();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to delete user record.', rawResponse: data });
      }
    } catch (err: any) {
      setLoading(false);
      setStatusMessage({ type: 'error', text: err.message || 'Network error during DELETE operation.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-indigo-400" />
          <span>User Profile Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform REST API operations (PUT, PATCH, DELETE) on the Users MongoDB collection as specified in Exercise-8 Section 3.
        </p>
      </div>

      {/* Active User Summary Card */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-2xl shadow-inner">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{user.username}</h2>
              {user.role === 'admin' ? (
                <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  Admin
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/30">
                  Standard User
                </span>
              )}
            </div>
            {/* Clean unboxed metadata with dot separators */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
              <span>{user.emailId}</span>
              <span aria-hidden="true">·</span>
              <span>Age: {user.age}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
            MongoDB Record: <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* REST API Operation Tabs */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab('put');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'put'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>A. PUT Operation (Complete Update)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('patch');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'patch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>B. PATCH Operation (Selected Fields)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('delete');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'delete'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>C. DELETE Operation (Delete User)</span>
          </button>
        </div>

        {/* Live Endpoint Preview Box */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
              activeTab === 'put' ? 'bg-amber-500/20 text-amber-300' :
              activeTab === 'patch' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {activeTab.toUpperCase()}
            </span>
            <span className="text-slate-400">Endpoint:</span>
            <span className="text-white">/api/users?emailId={user.emailId}</span>
          </div>
        </div>

        {/* Feedback Messages */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border text-xs flex flex-col gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            {statusMessage.rawResponse && (
              <pre className="p-2 rounded bg-black/50 text-[11px] font-mono text-slate-300 overflow-x-auto">
                {JSON.stringify(statusMessage.rawResponse, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* TAB A: PUT Operation Form */}
        {activeTab === 'put' && (
          <form onSubmit={handlePutSubmit} className="space-y-4 max-w-xl">
            <p className="text-xs text-slate-300">
              Update complete editable profile details by passing <code className="font-mono text-indigo-300">emailId</code> as query parameter and the full updated payload in the body.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Username</label>
                <input
                  type="text"
                  value={putUsername}
                  onChange={(e) => setPutUsername(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={putAge}
                  onChange={(e) => setPutAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password <span className="text-slate-500">(Optional: leave blank to retain current)</span>
                </label>
                <input
                  type="password"
                  placeholder="New secure password"
                  value={putPassword}
                  onChange={(e) => setPutPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Executing PUT...' : 'Submit PUT /api/users (Update Complete Details)'}
            </button>
          </form>
        )}

        {/* TAB B: PATCH Operation Form */}
        {activeTab === 'patch' && (
          <form onSubmit={handlePatchSubmit} className="space-y-4 max-w-xl">
            <p className="text-xs text-slate-300">
              Update only the selected user field by passing <code className="font-mono text-indigo-300">emailId</code> as query parameter and only the target field in the request body.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Field to Patch</label>
                <select
                  value={patchField}
                  onChange={(e) => setPatchField(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none bg-slate-900"
                >
                  <option value="username">Username only</option>
                  <option value="age">Age only</option>
                  <option value="password">Password only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Value for {patchField}
                </label>
                <input
                  type={patchField === 'password' ? 'password' : patchField === 'age' ? 'number' : 'text'}
                  placeholder={`Enter updated ${patchField}`}
                  value={patchValue}
                  onChange={(e) => setPatchValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Executing PATCH...' : 'Submit PATCH /api/users (Update Selected Field)'}
            </button>
          </form>
        )}

        {/* TAB C: DELETE Operation */}
        {activeTab === 'delete' && (
          <div className="space-y-4 max-w-xl">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-rose-300">
                <AlertCircle className="w-4 h-4" />
                Warning: Irreversible REST Action
              </p>
              This will execute <code className="font-mono font-bold">DELETE /api/users?emailId={user.emailId}</code>.
              The backend checks whether the user exists in MongoDB and completely removes the user document from the Users collection.
            </div>

            <button
              onClick={handleDeleteSubmit}
              disabled={loading}
              className="py-2.5 px-5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Executing DELETE...' : 'Execute DELETE /api/users (Delete User Record)'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
