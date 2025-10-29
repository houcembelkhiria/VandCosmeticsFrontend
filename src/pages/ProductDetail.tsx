import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct, getProducts } from '@/api/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug!),
    enabled: !!slug
  });

  // Fetch featured products
  const { data: featuredProductsData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ featured: true, limit: 4 } as any),
    enabled: !!product
  });

  // Fetch related products (same category, excluding current product)
  const { data: relatedProductsData } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: () => getProducts({ category: product?.category, limit: 4 }),
    enabled: !!product?.category
  });

  if (isLoading) {
    return (
      <div className="container py-16 px-4">
        <div className="animate-pulse">
          <div className="h-96 bg-muted rounded-xl mb-8" />
          <div className="h-8 bg-muted rounded w-1/2 mb-4" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Button asChild>
          <Link to="/products">Retour aux produits</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const selectedVariantData = product.variants?.find(v => v.id === selectedVariant);
    
    addItem({
      productId: product.id,
      variantId: selectedVariant,
      title: product.title,
      image: product.images[0],
      unitPrice: selectedVariantData?.price || product.price,
      quantity
    });

    toast.success('Ajouté au panier !', {
      description: `${quantity}x ${product.title}`
    });
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <main className="container py-6 sm:py-8 px-4">
      <Button variant="ghost" asChild className="mb-4 sm:mb-6">
        <Link to="/products">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour aux produits
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.featured && (
              <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 text-xs sm:text-sm">En vedette</Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="absolute top-2 sm:top-4 right-2 sm:right-4 text-xs sm:text-sm">
                -{discount}%
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{product.category}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{product.title}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-primary">
                {product.price.toFixed(2)} TND
              </span>
              {product.compareAtPrice && (
                <span className="text-lg sm:text-xl text-muted-foreground line-through">
                  {product.compareAtPrice.toFixed(2)} TND
                </span>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="text-sm font-semibold mb-3 block">
                Sélectionner une variante
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant === variant.id ? 'default' : 'outline'}
                    onClick={() => setSelectedVariant(variant.id)}
                    className="text-xs sm:text-sm"
                  >
                    {variant.name}
                    {variant.price && ` - ${variant.price.toFixed(2)} TND`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Quantité</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10"
              >
                -
              </Button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="h-10 w-10"
              >
                +
              </Button>
            </div>
          </div>

          {/* Stock */}
          {product.stock < 10 && product.stock > 0 && (
            <p className="text-xs sm:text-sm text-destructive">
              Plus que {product.stock} en stock - commandez bientôt !
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="w-full h-12 sm:h-14 text-sm sm:text-base"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </Button>
          </div>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Détails du produit</h3>
              <dl className="space-y-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:gap-4">
                    <dt className="text-muted-foreground capitalize text-xs sm:text-sm min-w-0 sm:min-w-32">{key}:</dt>
                    <dd className="font-medium text-xs sm:text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProductsData?.products && featuredProductsData.products.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Produits en vedette</h2>
            <Button variant="outline" asChild>
              <Link to="/products?featured=true">Voir tous</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProductsData.products
              .filter(p => p.id !== product?.id) // Exclude current product
              .slice(0, 4)
              .map((featuredProduct) => (
                <ProductCard key={featuredProduct.id} product={featuredProduct} />
              ))}
          </div>
        </section>
      )}

      {/* Related Products Section */}
      {relatedProductsData?.products && relatedProductsData.products.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Produits similaires</h2>
            <Button variant="outline" asChild>
              <Link to={`/products?category=${product?.category}`}>Voir tous</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProductsData.products
              .filter(p => p.id !== product?.id) // Exclude current product
              .slice(0, 4)
              .map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;
