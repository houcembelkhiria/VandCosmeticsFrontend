import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, CartItem as CartItemType } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
  compact?: boolean;
}

export const CartItem = ({ item, compact = false }: CartItemProps) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1, item.variantId);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.productId, item.quantity + 1, item.variantId);
  };

  const handleRemove = () => {
    removeItem(item.productId, item.variantId);
  };

  return (
    <div className={`flex gap-4 ${compact ? '' : 'p-4 border rounded-lg'}`}>
      <img
        src={item.image}
        alt={item.title}
        className={`${
          compact ? 'w-20 h-20' : 'w-24 h-24'
        } object-cover rounded-md flex-shrink-0`}
      />

      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${compact ? 'text-sm' : 'text-base'} truncate`}>
          {item.title}
        </h3>
        {item.variantId && (
          <p className="text-xs text-muted-foreground mt-1">{item.variantId}</p>
        )}
        <p className={`font-semibold text-primary ${compact ? 'text-sm mt-1' : 'text-base mt-2'}`}>
          ${item.unitPrice.toFixed(2)}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDecrease}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-3 text-sm font-medium">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="text-right">
          <p className="font-semibold">
            ${(item.unitPrice * item.quantity).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};
