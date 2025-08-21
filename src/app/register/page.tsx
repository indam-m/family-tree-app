'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const name = String(form.get('name') || '');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to register');
      }
      // auto sign-in after register
      await signIn('credentials', { email, password, callbackUrl: '/' });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white text-black rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">Create your account</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              name="name"
              className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
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
              minLength={6}
              className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 hover:cursor-pointer transition"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full border border-gray-300 rounded-xl py-2 font-medium hover:bg-gray-50 hover:cursor-pointer"
        >
          Continue with Google
        </button>

        <p className="text-sm text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
