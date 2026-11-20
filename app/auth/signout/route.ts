import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/login';
  const reason = url.searchParams.get('reason');
  const supabase = await createClient();
  await supabase.auth.signOut();
  const target = new URL(next, url.origin);
  if (reason) target.searchParams.set('reason', reason);
  return NextResponse.redirect(target);
}
