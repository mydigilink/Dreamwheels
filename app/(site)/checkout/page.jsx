import Checkout from './Checkout';
import { getSettings } from '@/lib/db';
import { getCurrentUser, getUserRecord } from '@/lib/users';

export const metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const record = user?.kind === 'user' ? await getUserRecord(user.id) : null;
  const profile = record && { name: record.name, email: record.email, phone: record.phone || '', addresses: record.addresses || [] };
  return <Checkout codEnabled={settings.codEnabled} whatsapp={settings.whatsapp} user={user} profile={profile} />;
}
