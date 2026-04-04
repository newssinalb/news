"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from './actions';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await loginAdmin(password);
      if (success) {
        router.push('/admin');
      } else {
        setError('Fjalëkalim i gabuar!');
      }
    } catch (err) {
      setError('Ndodhi një gabim. Provo përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-sm w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-4">
            <span className="text-4xl font-black text-slate-900 tracking-tight">NEWS</span>
            <span className="text-4xl font-black text-red-600 tracking-tight">23</span>
            <span className="text-4xl font-black text-slate-900">/</span>
            <span className="text-4xl font-black text-red-600 tracking-tight">7</span>
          </div>
          <h1 className="text-base font-black text-slate-700 uppercase tracking-widest mb-1">Hyrja e Adminit</h1>
          <p className="text-slate-400 text-sm">Fut fjalëkalimin për të hyrë në panel.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Fjalëkalimi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 transition-all placeholder-slate-400 text-sm"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-200">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Duke hyrë…
                </>
              ) : 'Hyr në Panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
