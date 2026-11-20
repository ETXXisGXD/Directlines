'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function PasswordForm() {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
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
    setPassword('');
    setConfirm('');
    setMessage('Password updated.');
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-line pt-6">
      <h3 className="text-sm font-semibold text-ink">Change password</h3>
      {error ? <p className="mt-3 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}
      {message ? <p className="mt-3 rounded-lg bg-[#eaf7ef] px-3 py-2 text-[11px] text-[#1f7a4a]">{message}</p> : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="new_password">New password</label>
          <input id="new_password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" minLength={8} />
        </div>
        <div>
          <label className="label" htmlFor="confirm_password">Confirm</label>
          <input id="confirm_password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="field" minLength={8} />
        </div>
      </div>
      <button type="submit" disabled={busy} className="btn-secondary mt-3 disabled:opacity-50">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Update password
      </button>
    </form>
  );
}
