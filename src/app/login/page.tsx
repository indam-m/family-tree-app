'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const sp = useSearchParams();
  const callbackUrl = sp.get('callbackUrl') || '/';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    if (res?.error) setErr('Invalid email or password');
    else window.location.assign(callbackUrl);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl cursor-pointer hover:bg-blue-700 transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full border border-gray-300 rounded-xl py-2 font-medium cursor-pointer hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <p className="text-sm text-center">
          No account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
