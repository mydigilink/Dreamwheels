import { notFound } from 'next/navigation';
import CategoryListing from '@/components/CategoryListing';
import { getCategories, getSettings, getVehicles } from '@/lib/db';

const LANDING = 'vintage-bikes';

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.h1 || category.name,
    description: category.intro,
    alternates: { canonical: `/${category.slug}/` },
    openGraph: { title: category.h1, description: category.intro, url: `/${category.slug}/`, images: category.image ? [category.image] : undefined },
  };
}

export default async function CategoryPage({ params }) {
  const { category: slug } = await params;
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const vehicles = await getVehicles({ category: slug });
  // /vintage-bikes/ is the marketplace entry point: it also surfaces featured vehicles from the other categories.
  const others = slug === LANDING ? (await getVehicles({ featured: true })).filter((v) => v.category !== slug).slice(0, 3) : [];

  return <CategoryListing category={category} categories={categories} vehicles={vehicles} others={others} settings={settings} />;
}
