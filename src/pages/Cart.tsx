import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/components/CartItem';
import { ShoppingBag, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Cart = () => {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    if (result.success) {
      setDiscount(result.discount);
      toast.success('Coupon applied!', {
        description: `You saved $${result.discount.toFixed(2)}`
      });
    } else {
      toast.error('Invalid coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <main className="container py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Start adding some beautiful products to your cart!
          </p>
          <Button size="lg" asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </main>
    );
  }

  const subtotal = total;
  const finalTotal = subtotal - discount;

  return (
    <main className="container py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.variantId || 'default'}`}
              item={item}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 sticky top-24 space-y-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            {/* Coupon Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Have a coupon?</label>
              <div className="flex gap-2">
                <Input
                  placeholder="CODE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="outline" onClick={handleApplyCoupon}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {discount > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  Coupon applied! Saving ${discount.toFixed(2)}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-green-600">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold pt-4 border-t">
              <span>Total</span>
              <span className="text-primary">${finalTotal.toFixed(2)}</span>
            </div>

            <Button size="lg" className="w-full" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
