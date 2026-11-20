import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reason?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm nextPath={params.next ?? '/account'} linkError={params.error === 'link'} wrongApp={params.reason === 'wrong_app'} />;
}

