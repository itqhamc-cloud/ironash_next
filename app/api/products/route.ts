import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerProducts, saveServerProducts } from '@/lib/server-admin';
import { INITIAL_PRODUCTS } from '@/lib/initial-products';
import { Product } from '@/types/timber';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const serverProducts = getServerProducts();
    if (serverProducts !== null) {
      return NextResponse.json(
        { success: true, products: serverProducts },
        { headers: NO_CACHE_HEADERS }
      );
    }
    // If not yet saved on server, initialize with INITIAL_PRODUCTS
    saveServerProducts(INITIAL_PRODUCTS);
    return NextResponse.json(
      { success: true, products: INITIAL_PRODUCTS },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message, products: INITIAL_PRODUCTS },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: 'Products array is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Ensure all products have images array
    const sanitizedProducts: Product[] = products.map((p) => {
      const baseImages = Array.isArray(p.images) && p.images.length > 0
        ? p.images.slice(0, 4)
        : [p.imageUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=85'];

      while (baseImages.length < 4) {
        baseImages.push(baseImages[0]);
      }

      return {
        ...p,
        images: baseImages,
        imageUrl: baseImages[0] || p.imageUrl,
      };
    });

    saveServerProducts(sanitizedProducts);

    // Revalidate paths and cache tags immediately so public storefront has fresh data
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/api/products');
      revalidateTag('products');
    } catch (tagErr) {
      console.warn('Revalidation notice:', tagErr);
    }

    return NextResponse.json(
      {
        success: true,
        count: sanitizedProducts.length,
        products: sanitizedProducts,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
