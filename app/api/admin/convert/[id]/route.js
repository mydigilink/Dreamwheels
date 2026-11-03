import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uid, uniqueSlug, writeDb } from '@/lib/db';
import { bad } from '@/lib/api';

// Turns an approved Sell-Your-Vehicle submission into a draft marketplace listing.
export async function POST(_req, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  try {
    const vehicle = await writeDb((db) => {
      const sub = db.submissions.find((s) => s.id === id);
      if (!sub) throw new Error('Submission not found');
      if (sub.listingId && db.vehicles.some((v) => v.id === sub.listingId)) throw new Error('Already converted to a listing');
      const title = `${sub.brand} ${sub.model} (${sub.year})`;
      const v = {
        id: uid('veh'),
        slug: uniqueSlug(db.vehicles, title),
        title,
        category: sub.vehicleType === 'Car' ? 'vintage-cars' : 'vintage-bikes',
        subcategories: [],
        brand: sub.brand,
        model: sub.model,
        year: sub.year,
        condition: 'Original',
        availability: 'Available',
        price: sub.expectedPrice || null,
        engine: '',
        mileage: sub.kmsDriven ? `${sub.kmsDriven} km` : '',
        color: '',
        location: sub.city || '',
        registration: sub.registrationState ? `Registered in ${sub.registrationState}` : '',
        summary: '',
        description: sub.condition || '',
        images: sub.images || [],
        video: '',
        spin360: [],
        featured: false,
        published: false, // drafts — admin reviews and publishes
        source: 'sell-your-vehicle',
        submissionId: sub.id,
        seoTitle: '',
        seoDescription: '',
        createdAt: new Date().toISOString(),
      };
      db.vehicles.unshift(v);
      sub.status = 'approved';
      sub.listingId = v.id;
      return v;
    });
    return NextResponse.json(vehicle);
  } catch (e) {
    return bad(e.message);
  }
}
