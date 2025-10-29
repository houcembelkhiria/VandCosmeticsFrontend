// Single source of truth for all dummy data
// Replace this with real API calls when backend is ready

import productLipstick from '@/assets/product-lipstick-1.jpg';
import productSerum from '@/assets/product-serum-1.jpg';
import productPalette from '@/assets/product-palette-1.jpg';
import productPerfume from '@/assets/product-perfume-1.jpg';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants?: { id: string; name: string; price?: number; sku?: string }[];
  attributes?: Record<string, string>;
  category: string;
  stock: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    title: string;
  }>;
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const categories = ['Makeup', 'Skincare', 'Fragrance', 'Gifts'];

export const products: Product[] = [
  {
    id: 'vanda-lip-rose',
    title: 'Rose Velvet Lipstick',
    slug: 'rose-velvet-lipstick',
    description: 'Smooth long-lasting lipstick with velvet finish. Enriched with vitamin E and shea butter for ultimate hydration. Available in 12 stunning shades.',
    price: 24.99,
    compareAtPrice: 32.99,
    images: [productLipstick],
    category: 'Makeup',
    stock: 48,
    featured: true,
    variants: [
      { id: 'rose-001', name: 'Rose Nude', sku: 'VANDA-LIP-ROSE-001' },
      { id: 'rose-002', name: 'Deep Rose', sku: 'VANDA-LIP-ROSE-002' },
      { id: 'rose-003', name: 'Pink Blush', sku: 'VANDA-LIP-ROSE-003' }
    ],
    attributes: {
      finish: 'Velvet Matte',
      coverage: 'Full',
      formula: 'Paraben-free'
    },
    createdAt: '2025-09-01T12:00:00Z',
    updatedAt: '2025-09-01T12:00:00Z'
  },
  {
    id: 'vanda-serum-glow',
    title: 'Radiance Glow Serum',
    slug: 'radiance-glow-serum',
    description: 'A luxurious facial serum infused with vitamin C, hyaluronic acid, and botanical extracts. Brightens, hydrates, and reduces fine lines for radiant, youthful skin.',
    price: 68.00,
    compareAtPrice: 89.00,
    images: [productSerum],
    category: 'Skincare',
    stock: 32,
    featured: true,
    attributes: {
      skinType: 'All skin types',
      keyIngredients: 'Vitamin C, Hyaluronic Acid',
      volume: '30ml'
    },
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-08-15T10:00:00Z'
  },
  {
    id: 'vanda-palette-sunset',
    title: 'Sunset Dream Palette',
    slug: 'sunset-dream-palette',
    description: '12 highly pigmented eyeshadow shades in warm tones. Includes matte, shimmer, and metallic finishes for endless creative looks. Cruelty-free and vegan.',
    price: 52.00,
    images: [productPalette],
    category: 'Makeup',
    stock: 18,
    featured: true,
    attributes: {
      shades: '12',
      finish: 'Matte, Shimmer, Metallic',
      formula: 'Vegan, Cruelty-free'
    },
    createdAt: '2025-08-20T14:30:00Z',
    updatedAt: '2025-08-20T14:30:00Z'
  },
  {
    id: 'vanda-perfume-bloom',
    title: 'Eternal Bloom Eau de Parfum',
    slug: 'eternal-bloom-parfum',
    description: 'A sophisticated floral fragrance with notes of rose, jasmine, and sandalwood. Long-lasting scent that evolves beautifully throughout the day.',
    price: 95.00,
    images: [productPerfume],
    category: 'Fragrance',
    stock: 24,
    featured: true,
    variants: [
      { id: 'bloom-50ml', name: '50ml', price: 95.00, sku: 'VANDA-PERF-BLOOM-50' },
      { id: 'bloom-100ml', name: '100ml', price: 145.00, sku: 'VANDA-PERF-BLOOM-100' }
    ],
    attributes: {
      scentFamily: 'Floral',
      topNotes: 'Rose, Bergamot',
      baseNotes: 'Sandalwood, Musk'
    },
    createdAt: '2025-07-10T09:00:00Z',
    updatedAt: '2025-07-10T09:00:00Z'
  },
  {
    id: 'vanda-blush-peachy',
    title: 'Peachy Keen Cream Blush',
    slug: 'peachy-keen-blush',
    description: 'Buildable cream blush that blends seamlessly for a natural, healthy glow. Long-wearing formula with a dewy finish.',
    price: 28.00,
    images: ['https://picsum.photos/seed/blush1/800/800'],
    category: 'Makeup',
    stock: 42,
    variants: [
      { id: 'blush-peachy', name: 'Peachy Pink', sku: 'VANDA-BLUSH-01' },
      { id: 'blush-coral', name: 'Coral Glow', sku: 'VANDA-BLUSH-02' }
    ],
    createdAt: '2025-08-25T11:00:00Z',
    updatedAt: '2025-08-25T11:00:00Z'
  },
  {
    id: 'vanda-moisturizer-cloud',
    title: 'Cloud Nine Moisturizer',
    slug: 'cloud-nine-moisturizer',
    description: 'Ultra-lightweight gel moisturizer that provides intense hydration without greasiness. Perfect for day and night use.',
    price: 45.00,
    images: ['https://picsum.photos/seed/moist1/800/800'],
    category: 'Skincare',
    stock: 36,
    attributes: {
      skinType: 'Normal to Oily',
      texture: 'Gel',
      volume: '50ml'
    },
    createdAt: '2025-08-10T08:00:00Z',
    updatedAt: '2025-08-10T08:00:00Z'
  },
  {
    id: 'vanda-mascara-lash',
    title: 'Lash Luxury Mascara',
    slug: 'lash-luxury-mascara',
    description: 'Volumizing and lengthening mascara with a unique hourglass brush. Clump-free, smudge-proof formula that lasts all day.',
    price: 32.00,
    images: ['https://picsum.photos/seed/mascara1/800/800'],
    category: 'Makeup',
    stock: 55,
    createdAt: '2025-09-05T13:00:00Z',
    updatedAt: '2025-09-05T13:00:00Z'
  },
  {
    id: 'vanda-cleanser-gentle',
    title: 'Gentle Glow Cleanser',
    slug: 'gentle-glow-cleanser',
    description: 'pH-balanced gel cleanser that removes makeup and impurities while maintaining skin\'s natural moisture barrier.',
    price: 34.00,
    images: ['https://picsum.photos/seed/cleanser1/800/800'],
    category: 'Skincare',
    stock: 28,
    attributes: {
      skinType: 'All skin types',
      pH: '5.5',
      volume: '150ml'
    },
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-01T10:00:00Z'
  },
  {
    id: 'vanda-highlighter-glow',
    title: 'Golden Hour Highlighter',
    slug: 'golden-hour-highlighter',
    description: 'Silky powder highlighter that adds a luminous glow to cheekbones, brow bones, and décolletage. Buildable intensity.',
    price: 38.00,
    images: ['https://picsum.photos/seed/highlight1/800/800'],
    category: 'Makeup',
    stock: 31,
    createdAt: '2025-08-28T15:00:00Z',
    updatedAt: '2025-08-28T15:00:00Z'
  },
  {
    id: 'vanda-sunscreen-daily',
    title: 'Daily Defense SPF 50',
    slug: 'daily-defense-spf50',
    description: 'Broad-spectrum sunscreen with SPF 50. Lightweight, non-greasy formula that doubles as a perfect makeup primer.',
    price: 42.00,
    images: ['https://picsum.photos/seed/sunscreen1/800/800'],
    category: 'Skincare',
    stock: 44,
    attributes: {
      SPF: '50',
      protection: 'UVA/UVB',
      volume: '50ml'
    },
    createdAt: '2025-07-15T09:30:00Z',
    updatedAt: '2025-07-15T09:30:00Z'
  },
  {
    id: 'vanda-brush-set',
    title: 'Essential Brush Collection',
    slug: 'essential-brush-collection',
    description: 'Complete set of 8 professional makeup brushes with soft synthetic bristles. Includes face and eye brushes in a chic travel case.',
    price: 89.00,
    compareAtPrice: 120.00,
    images: ['https://picsum.photos/seed/brushes1/800/800'],
    category: 'Gifts',
    stock: 15,
    createdAt: '2025-08-05T12:00:00Z',
    updatedAt: '2025-08-05T12:00:00Z'
  },
  {
    id: 'vanda-gift-deluxe',
    title: 'Deluxe Beauty Box',
    slug: 'deluxe-beauty-box',
    description: 'Curated gift set featuring our bestsellers: Rose Velvet Lipstick, Radiance Serum, and Cloud Nine Moisturizer. Perfect for gifting.',
    price: 135.00,
    compareAtPrice: 165.00,
    images: ['https://picsum.photos/seed/giftbox1/800/800'],
    category: 'Gifts',
    stock: 12,
    createdAt: '2025-09-01T16:00:00Z',
    updatedAt: '2025-09-01T16:00:00Z'
  }
];

export const users: User[] = [
  {
    id: 'admin',
    email: 'admin@vanda.test',
    name: 'Vanda Admin',
    isAdmin: true
  },
  {
    id: 'demo-customer',
    email: 'customer@example.com',
    name: 'Demo Customer',
    isAdmin: false
  }
];

export let orders: Order[] = [];
