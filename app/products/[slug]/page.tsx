import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INITIAL_PRODUCTS } from '@/lib/initial-products';
import { Product } from '@/types/timber';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = INITIAL_PRODUCTS.find((p) => p.id === slug);

  if (!product) {
    return {
      title: 'Product Not Found - IronAsh',
    };
  }

  return {
    title: `${product.title} | IronAsh Himalayan Herbs`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = INITIAL_PRODUCTS.find((p) => p.id === slug);

  if (!product) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images || [product.imageUrl],
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'IronAsh',
    },
    offers: {
      '@type': 'Offer',
      url: `https://ironash.com/products/${product.id}`,
      priceCurrency: 'PKR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'IronAsh',
      },
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewsCount,
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <h1 className="text-3xl font-bold font-serif text-stone-900 mb-4">{product.title}</h1>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-200 mb-8">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            referrerPolicy="no-referrer"
            priority
          />
        </div>
        <p className="text-lg text-stone-600 mb-6">{product.description}</p>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-2xl font-black text-emerald-700">PKR {product.price.toLocaleString()}</span>
          {product.inStock ? (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              In Stock
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-stone-900">Key Benefits</h3>
          <ul className="list-disc pl-5 space-y-2 text-stone-600">
            {product.benefits?.map((benefit, i) => (
              <li key={i}>{benefit}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8 pt-8 border-t border-stone-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
