import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: profile } = await supabase.from('profiles').select('role, full_name, email').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin');
  return { user, profile };
}
