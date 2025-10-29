import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/components/CartItem';
import { ShoppingBag, Tag, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeliveryFee } from '@/hooks/useParameters';

const Cart = () => {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getTotal());
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  // Calculate delivery fee
  const { deliveryFee, freeDeliveryThreshold, isFreeDelivery, isLoading: deliveryFeeLoading } = useDeliveryFee(subtotal);

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    if (result.success) {
      setDiscount(result.discount);
      toast.success('Code promo appliqué !', {
        description: `Vous avez économisé ${result.discount.toFixed(2)} TND`
      });
    } else {
      toast.error('Code promo invalide');
    }
  };

  if (items.length === 0) {
    return (
      <main className="container py-12 sm:py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-20 sm:h-24 w-20 sm:w-24 text-muted-foreground mx-auto mb-4 sm:mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Votre panier est vide</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Commencez à ajouter de beaux produits à votre panier !
          </p>
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link to="/products">Parcourir les produits</Link>
          </Button>
        </div>
      </main>
    );
  }

  const finalTotal = subtotal - discount + deliveryFee;

  return (
    <main className="container py-6 sm:py-8 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Panier d'achat</h1>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.variantId || 'default'}`}
              item={item}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-4 sm:p-6 sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold">Résumé de la commande</h2>

            {/* Coupon Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Avez-vous un code promo ?</label>
              <div className="flex gap-2">
                <Input
                  placeholder="CODE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="text-sm"
                />
                <Button variant="outline" size="icon" onClick={handleApplyCoupon}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {discount > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  Code promo appliqué ! Économie de {discount.toFixed(2)} TND
                </p>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">{subtotal.toFixed(2)} TND</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remise</span>
                  <span className="font-medium text-green-600">
                    -{discount.toFixed(2)} TND
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Livraison
                  {isFreeDelivery && (
                    <span className="text-green-600 flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Gratuite!
                    </span>
                  )}
                </span>
                <span className={`font-medium ${isFreeDelivery ? 'text-green-600' : ''}`}>
                  {deliveryFeeLoading ? '...' : isFreeDelivery ? 'Gratuite' : `${deliveryFee.toFixed(2)} TND`}
                </span>
              </div>

              {!isFreeDelivery && freeDeliveryThreshold > 0 && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <Truck className="h-3 w-3 inline mr-1" />
                  Ajoutez {(freeDeliveryThreshold - subtotal).toFixed(2)} TND pour la livraison gratuite
                </div>
              )}
            </div>

            <div className="flex justify-between text-base sm:text-lg font-bold pt-3 sm:pt-4 border-t">
              <span>Total</span>
              <span className="text-primary">{finalTotal.toFixed(2)} TND</span>
            </div>

            <Button size="lg" className="w-full h-12 sm:h-14 text-sm sm:text-base" asChild>
              <Link to="/checkout">Procéder au paiement</Link>
            </Button>

            <Button variant="outline" size="lg" className="w-full h-10 sm:h-12 text-sm sm:text-base" asChild>
              <Link to="/products">Continuer les achats</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
