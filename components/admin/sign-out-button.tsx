'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AdminSignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 hover:bg-white/10 hover:text-white"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
