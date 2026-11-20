'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:border-ink hover:text-ink"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
