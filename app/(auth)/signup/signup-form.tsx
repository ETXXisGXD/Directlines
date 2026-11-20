'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.push('/account');
      router.refresh();
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold text-ink">Check your inbox</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We sent a confirmation link to <span className="font-semibold text-ink">{email}</span>. Open it, then sign in.
        </p>
        <Link href="/login" className="btn-primary mt-6 w-full">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <p className="eyebrow text-signal">Customer account</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Create an account</h1>
        <p className="mt-2 text-xs text-muted">Save phones, follow orders and check your loyalty points.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-7 rounded-2xl border border-line bg-white p-6 sm:p-7">
        {error ? <p className="mb-4 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input id="phone" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="field" placeholder="0801 234 5678" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" placeholder="At least 8 characters" />
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-primary mt-5 w-full disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create account
        </button>
        <p className="mt-4 text-center text-[11px] text-muted">
          Already have an account? <Link href="/login" className="font-semibold text-ink hover:text-signal">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
