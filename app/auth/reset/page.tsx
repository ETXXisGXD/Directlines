'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push('/account');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="eyebrow text-signal">Account recovery</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Set a new password</h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-7 rounded-2xl border border-line bg-white p-6 sm:p-7">
          {error ? <p className="mb-4 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="password">New password</label>
              <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="confirm">Confirm password</label>
              <input id="confirm" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="field" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary mt-5 w-full disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save password
          </button>
          <p className="mt-4 text-center text-[11px] text-muted">
            <Link href="/login" className="hover:text-ink">Back to sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
