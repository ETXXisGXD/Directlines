'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LoginForm({ nextPath, linkError, wrongApp = false }: { nextPath: string; linkError: boolean; wrongApp?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    wrongApp ? 'That account belongs to another app. Use the Directlines account for this store.' : linkError ? 'That sign-in link was invalid or expired. Try again.' : null
  );
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }
    let target = nextPath;
    if (target === '/account' && data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role === 'admin' || profile?.role === 'staff') target = '/admin';
    }
    router.push(target);
    router.refresh();
  }

  async function handleForgot() {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Enter your email first, then press Forgot password.');
      return;
    }
    setResetBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });
    setResetBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setInfo('Password reset link sent. Check your inbox and spam folder.');
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <p className="eyebrow text-signal">Customer account</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-xs text-muted">Track orders, save phones and manage your details.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 rounded-2xl border border-line bg-white p-6 sm:p-7">
        {error ? <p className="mb-4 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}
        {info ? <p className="mb-4 rounded-lg bg-[#eaf7ef] px-3 py-2 text-[11px] text-[#1f7a4a]">{info}</p> : null}

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" placeholder="Your password" />
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn-primary mt-5 w-full disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted">
          <button type="button" onClick={handleForgot} disabled={resetBusy} className="hover:text-ink">
            {resetBusy ? 'Sending...' : 'Forgot password?'}
          </button>
          <Link href="/signup" className="font-semibold text-ink hover:text-signal">Create an account</Link>
        </div>
      </form>
    </div>
  );
}


