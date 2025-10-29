import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from './CartItem';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniCart = ({ isOpen, onClose }: MiniCartProps) => {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Panier d'achat</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Votre panier est vide</p>
              <p className="text-sm text-muted-foreground mb-6">
                Commencez à ajouter de beaux produits !
              </p>
              <Button onClick={onClose} asChild>
                <Link to="/products">Parcourir les produits</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  item={item}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">{total.toFixed(2)} TND</span>
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg" asChild onClick={onClose}>
                <Link to="/cart">Voir le panier</Link>
              </Button>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                asChild
                onClick={onClose}
              >
                <Link to="/checkout">Commander</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
