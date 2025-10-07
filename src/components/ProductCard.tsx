import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/dummyData';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      title: product.title,
      image: product.images[0],
      unitPrice: product.price
    });

    toast.success('Added to cart!', {
      description: product.title
    });
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product.slug}`} className="group">
      <div className="relative overflow-hidden rounded-xl bg-card border transition-all duration-300 hover:shadow-[var(--shadow-elegant)]">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge variant="default" className="bg-primary">
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick add button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              className="w-full shadow-lg"
              onClick={handleQuickAdd}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-semibold text-sm mb-2 line-clamp-1">{product.title}</h3>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {product.stock < 10 && product.stock > 0 && (
            <p className="text-xs text-destructive mt-2">
              Only {product.stock} left in stock
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
};
