import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CartDrawer from '@/components/site/CartDrawer';
import WaFloat from '@/components/site/WaFloat';
import { CartProvider } from '@/components/site/CartProvider';
import { getCategories, getLocations, getSettings } from '@/lib/db';
import { getCurrentUser, getUserRecord } from '@/lib/users';
import { SavedProvider } from '@/components/account/SavedProvider';

// Content is edited live from the admin, so render on request.
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const [settings, categories, locations, user] = await Promise.all([getSettings(), getCategories(), getLocations(), getCurrentUser()]);
  const member = user?.kind === 'user';
  const saved = member ? ((await getUserRecord(user.id))?.saved || []).map((s) => `${s.type}:${s.id}`) : [];
  return (
    <SavedProvider key={user?.id || 'anon'} initial={saved} signedIn={member}>
    <CartProvider settings={settings}>
      <Header settings={settings} categories={categories} locations={locations} user={user} />
      <main>{children}</main>
      <Footer settings={settings} categories={categories} />
      <CartDrawer />
      <WaFloat number={settings.whatsapp} />
    </CartProvider>
    </SavedProvider>
  );
}
