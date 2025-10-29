import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/cartStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createOrder, CreateOrderData } from '@/api/orders';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { tunisianPhoneSchema } from '@/lib/validation';
import { useDeliveryFee } from '@/hooks/useParameters';
import { Truck, AlertCircle } from 'lucide-react';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis').max(100),
  email: z.string().email('Adresse e-mail invalide').max(255),
  phone: tunisianPhoneSchema,
  address: z.string().min(5, 'L\'adresse est requise').max(200),
  city: z.string().min(2, 'La ville est requise').max(100),
  state: z.string().min(2, 'L\'état/province est requis').max(100),
  zipCode: z.string().min(4, 'Le code postal est requis').max(10)
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate delivery fee
  const { deliveryFee, isFreeDelivery, isLoading: isLoadingDelivery, error: deliveryError } = useDeliveryFee(subtotal);
  
  const total = subtotal + deliveryFee;
  
  // Debug log
  useEffect(() => {
    console.log('Checkout - Subtotal:', subtotal);
    console.log('Checkout - Delivery Fee:', deliveryFee);
    console.log('Checkout - Is Free Delivery:', isFreeDelivery);
    console.log('Checkout - Total:', total);
    console.log('Checkout - Delivery Error:', deliveryError);
  }, [subtotal, deliveryFee, isFreeDelivery, total, deliveryError]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      // Create order
      const orderData: CreateOrderData = {
        customerEmail: data.email,
        customerName: data.fullName,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          title: item.title,
          image: item.image
        })),
        shipping: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: 'Tunisie',
          deliveryFee: deliveryFee,
          isFreeDelivery: isFreeDelivery
        },
        subtotal: subtotal,
        discount: 0,
        total: total
      };
      
      const order = await createOrder(orderData);

      // Clear cart
      clearCart();

      // Navigate to confirmation
      navigate(`/order/${order.id}`);
      
      toast.success('Commande passée avec succès !', {
        description: `Commande ${order.id} confirmée`
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Échec de la commande', {
        description: error.message || 'Veuillez réessayer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  return (
    <main className="container py-6 sm:py-8 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Paiement</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="border rounded-xl p-4 sm:p-6 space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Informations de livraison</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm">Nom complet *</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    className="text-sm"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="text-sm"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="text-sm"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Adresse *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  className="text-sm"
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">Ville *</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    className="text-sm"
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm">Gouvernorat *</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    className="text-sm"
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive">{errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="zipCode" className="text-sm">Code postal *</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode')}
                    className="text-sm"
                  />
                  {errors.zipCode && (
                    <p className="text-xs text-destructive">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-4 sm:p-6 sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">Résumé de la commande</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold">
                      {(item.unitPrice * item.quantity).toFixed(2)} TND
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 sm:pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Livraison
                    {!isLoadingDelivery && isFreeDelivery && (
                      <span className="text-green-600 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Gratuite!
                      </span>
                    )}
                    {!isLoadingDelivery && deliveryError && (
                      <span className="text-destructive flex items-center gap-1" title="Erreur de calcul">
                        <AlertCircle className="h-3 w-3" />
                      </span>
                    )}
                  </span>
                  <span className={`font-medium ${isFreeDelivery && !isLoadingDelivery ? 'text-green-600' : ''}`}>
                    {isLoadingDelivery ? (
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        Calcul...
                      </span>
                    ) : isFreeDelivery ? 'Gratuite' : `${deliveryFee.toFixed(2)} TND`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-base sm:text-lg font-bold pt-3 sm:pt-4 border-t">
                <span>Total</span>
                <span className="text-primary">
                  {isLoadingDelivery ? '...' : total.toFixed(2)} TND
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 sm:h-14 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Traitement...' : 'Passer la commande'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                En passant votre commande, vous acceptez nos conditions générales.
              </p>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};

export default Checkout;
