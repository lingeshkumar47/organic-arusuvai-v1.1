import CategoryContent from './CategoryContent';

export const dynamic = 'force-dynamic';

export default function CategoryPage({ params }) {
  return <CategoryContent slug={params.slug} />;
}
