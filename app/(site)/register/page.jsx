import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { getCurrentUser, safeNext } from '@/lib/users';

export const metadata = { title: 'Create account', robots: { index: false } };

export default async function RegisterPage({ searchParams }) {
  const { next, error } = await searchParams;
  const user = await getCurrentUser();
  if (user?.kind === 'user') redirect(safeNext(next));
  return (
    <div className="wrap auth-page">
      <AuthForm mode="register" next={safeNext(next)} initialError={error} />
    </div>
  );
}
