import { requireAdmin } from '@/lib/auth';
import { COLLECTIONS, readDb } from '@/lib/db';
import { bad } from '@/lib/api';

const COLUMNS = {
  leads: ['createdAt', 'type', 'module', 'itemName', 'category', 'pageUrl', 'name', 'phone', 'email', 'message', 'status'],
  submissions: ['createdAt', 'status', 'vehicleType', 'brand', 'model', 'year', 'registrationState', 'kmsDriven', 'expectedPrice', 'condition', 'name', 'phone', 'email', 'city', 'images'],
  restorations: ['createdAt', 'status', 'vehicleType', 'brand', 'model', 'year', 'condition', 'requirements', 'name', 'phone', 'email', 'city', 'images'],
  orders: ['createdAt', 'number', 'status', 'payment', 'total', 'items', 'customer.name', 'customer.phone', 'customer.email', 'customer.address', 'customer.city', 'customer.state', 'customer.pincode'],
};

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
function cell(v) {
  if (v == null) return '';
  if (Array.isArray(v)) v = v.map((x) => (typeof x === 'object' ? `${x.qty || ''}× ${x.title || JSON.stringify(x)}` : x)).join(' | ');
  else if (typeof v === 'object') v = JSON.stringify(v);
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(_req, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { collection } = await params;
  if (!COLLECTIONS[collection]) return bad('Unknown collection', 404);
  const rows = (await readDb())[collection];
  const cols = COLUMNS[collection] || Object.keys(rows[0] || { id: '' });
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(get(r, c))).join(','))].join('\n');
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="dreamwheels-${collection}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
