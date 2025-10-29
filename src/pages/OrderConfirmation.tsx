import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/api/orders';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Mail } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId
  });

  if (isLoading) {
    return (
      <div className="container py-16 px-4">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-32 bg-muted rounded-xl mb-8" />
          <div className="h-8 bg-muted rounded w-1/2 mb-4" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Commande non trouvée</h1>
        <Button asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="container py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Commande Confirmée !</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Merci pour votre achat, {order.shipping.fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            Commande #{order.id}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="border rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">E-mail de confirmation envoyé</h3>
              <p className="text-sm text-muted-foreground">
                Nous avons envoyé une confirmation à {order.shipping.email}
              </p>
            </div>
          </div>

          <div className="border rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Traitement de la commande</h3>
              <p className="text-sm text-muted-foreground">
                Nous vous informerons lorsque votre commande sera expédiée
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Détails de la commande</h2>

          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  {item.variantId && (
                    <p className="text-sm text-muted-foreground">{item.variantId}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Quantité : {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {(item.unitPrice * item.quantity).toFixed(2)} TND
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.unitPrice.toFixed(2)} TND chacun
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium">{order.subtotal.toFixed(2)} TND</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remise</span>
                <span className="font-medium text-green-600">
                  -{order.discount.toFixed(2)} TND
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              <span className="font-medium">Gratuite</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{order.total.toFixed(2)} TND</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.shipping.fullName}</p>
            <p>{order.shipping.address}</p>
            <p>
              {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
            </p>
            <p>{order.shipping.country}</p>
            <p className="pt-2">{order.shipping.phone}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="flex-1" asChild>
            <Link to="/products">Continuer mes achats</Link>
          </Button>
          <Button size="lg" variant="outline" className="flex-1" asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
