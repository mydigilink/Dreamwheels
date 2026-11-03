import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { getCurrentUser, safeNext } from '@/lib/users';

export const metadata = { title: 'Sign in', robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  const { next, error } = await searchParams;
  const user = await getCurrentUser();
  if (user?.kind === 'user') redirect(safeNext(next));
  return (
    <div className="wrap auth-page">
      <AuthForm mode="login" next={safeNext(next)} initialError={error} />
    </div>
  );
}
