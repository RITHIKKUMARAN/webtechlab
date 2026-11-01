import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Terminal, Play, Send, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface EndpointPreset {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  defaultBody?: string;
  requiresAuth?: boolean;
}

const PRESETS: EndpointPreset[] = [
  {
    name: '1. Register User (POST /api/users)',
    method: 'POST',
    path: '/api/users',
    description: 'Exercise-8 Page 1: Store new user in Users collection and return personalized welcome message.',
    defaultBody: JSON.stringify(
      {
        username: 'Kiran Kumar',
        emailId: 'kiran@example.com',
        age: 22,
        password: 'securePass123',
      },
      null,
      2
    ),
  },
  {
    name: '2. User Login (POST /api/login)',
    method: 'POST',
    path: '/api/login',
    description: 'Exercise-8 Page 2: Validate against Users collection ("User Not Registered." / "Invalid Password.").',
    defaultBody: JSON.stringify(
      {
        emailId: 'user@example.com',
        password: 'user123',
      },
      null,
      2
    ),
  },
  {
    name: '3. Products Display (GET /api/products)',
    method: 'GET',
    path: '/api/products',
    description: 'Exercise-8 Page 3: Retrieve products using ONLY HTTP GET. Requires auth token.',
    requiresAuth: true,
  },
  {
    name: '4. PUT Profile (PUT /api/users?emailId=...)',
    method: 'PUT',
    path: '/api/users?emailId=user@example.com',
    description: 'Exercise-8 Section 3A: Update complete editable profile details.',
    defaultBody: JSON.stringify(
      {
        username: 'Raghavendra Sharma',
        age: 25,
        password: 'updatedPassword456',
      },
      null,
      2
    ),
  },
  {
    name: '5. PATCH Profile (PATCH /api/users?emailId=...)',
    method: 'PATCH',
    path: '/api/users?emailId=user@example.com',
    description: 'Exercise-8 Section 3B: Update only selected profile fields.',
    defaultBody: JSON.stringify(
      {
        age: 26,
      },
      null,
      2
    ),
  },
  {
    name: '6. DELETE User (DELETE /api/users?emailId=...)',
    method: 'DELETE',
    path: '/api/users?emailId=kiran@example.com',
    description: 'Exercise-8 Section 3C: Check if user exists and delete registration record.',
  },
];

export const ApiTester: React.FC = () => {
  const { token } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset>(PRESETS[0]);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>(PRESETS[0].method);
  const [pathInput, setPathInput] = useState(PRESETS[0].path);
  const [bodyInput, setBodyInput] = useState(PRESETS[0].defaultBody || '');
  const [includeAuth, setIncludeAuth] = useState(true);

  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedPreset(preset);
    setMethod(preset.method);
    setPathInput(preset.path);
    setBodyInput(preset.defaultBody || '');
    if (preset.requiresAuth) setIncludeAuth(true);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (includeAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyInput.trim()) {
        options.body = bodyInput;
      }

      const res = await fetch(pathInput, options);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const headerObj: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headerObj[k] = v;
      });
      setResponseHeaders(headerObj);

      try {
        const json = await res.json();
        setResponseBody(json);
      } catch {
        const text = await res.text();
        setResponseBody(text);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody({ error: err.message || 'Execution error.' });
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    let curl = `curl -X ${method} "http://localhost:3000${pathInput}"`;
    if (includeAuth && token) {
      curl += ` \\\n  -H "Authorization: Bearer ${token}"`;
    }
    if (['POST', 'PUT', 'PATCH'].includes(method) && bodyInput.trim()) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyInput.replace(/\n/g, '')}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <span>Interactive REST API Explorer & Thunder Client</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Directly execute and evaluate all 6 required Exercise-8 endpoints with status codes, headers, and real JSON payloads.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSelectPreset(p)}
            className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedPreset.name === p.name
                ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'glass-panel border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                p.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300' :
                p.method === 'POST' ? 'bg-indigo-500/20 text-indigo-300' :
                p.method === 'PUT' ? 'bg-amber-500/20 text-amber-300' :
                p.method === 'PATCH' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {p.method}
              </span>
              <span className="text-xs font-semibold text-white truncate">{p.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>
          </button>
        ))}
      </div>

      {/* Request Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Request Configuration */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold">
              HTTP Request Builder
            </h3>
            <button
              onClick={copyCurl}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied cURL' : 'Copy cURL'}</span>
            </button>
          </div>

          {/* URL & Method Row */}
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono text-white glass-input rounded-xl focus:outline-none"
            />

            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Sending...' : 'Send'}</span>
            </button>
          </div>

          {/* Auth Header Toggle */}
          <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
            <input
              type="checkbox"
              id="authCheck"
              checked={includeAuth}
              onChange={(e) => setIncludeAuth(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="authCheck" className="cursor-pointer font-mono text-[11px]">
              Include Authorization Bearer token {token ? '(Active)' : '(None - Unauthenticated)'}
            </label>
          </div>

          {/* JSON Body editor if applicable */}
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                JSON Request Body
              </label>
              <textarea
                rows={9}
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                className="w-full p-3 text-xs font-mono text-slate-200 glass-input rounded-xl focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Right: Response Inspector */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold">
                Server Response
              </h3>
              {responseStatus !== null && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : responseStatus === 404
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    Status: {responseStatus}
                  </span>
                  {executionTime !== null && (
                    <span className="text-slate-400">{executionTime}ms</span>
                  )}
                </div>
              )}
            </div>

            {/* Response Body Output */}
            <div className="mt-4">
              {responseBody !== null ? (
                <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  {typeof responseBody === 'object'
                    ? JSON.stringify(responseBody, null, 2)
                    : responseBody}
                </pre>
              ) : (
                <div className="h-64 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                  <Send className="w-8 h-8 text-slate-600 mb-2" />
                  <span>Click "Send" to execute the HTTP request</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Server: Express.js + MERN Stack</span>
            <span>Content-Type: application/json</span>
          </div>
        </div>

      </div>
    </div>
  );
};
