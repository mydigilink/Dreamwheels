import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { isAdmin } from '@/lib/auth';
import { readDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }) {
  if (!(await isAdmin())) redirect('/admin/login/');
  const db = await readDb();
  const counts = {
    vehicles: db.vehicles.length,
    parts: db.parts.length,
    brands: db.brands.length,
    posts: db.posts.length,
    leads: db.leads.filter((l) => l.status === 'new').length,
    orders: db.orders.filter((o) => o.status === 'new').length,
    submissions: db.submissions.filter((s) => s.status === 'pending').length,
    restorations: db.restorations.filter((r) => r.status === 'new').length,
  };
  return <AdminShell counts={counts}>{children}</AdminShell>;
}
