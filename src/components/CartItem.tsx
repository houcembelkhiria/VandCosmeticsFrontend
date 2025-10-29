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
    <div className={`flex gap-3 sm:gap-4 ${compact ? '' : 'p-3 sm:p-4 border rounded-lg'}`}>
      <img
        src={item.image}
        alt={item.title}
        className={`${
          compact ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-20 h-20 sm:w-24 sm:h-24'
        } object-cover rounded-md flex-shrink-0`}
      />

      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} truncate`}>
          {item.title}
        </h3>
        {item.variantId && (
          <p className="text-xs text-muted-foreground mt-1">{item.variantId}</p>
        )}
        <p className={`font-semibold text-primary ${compact ? 'text-xs sm:text-sm mt-1' : 'text-sm sm:text-base mt-2'}`}>
          {item.unitPrice.toFixed(2)} TND
        </p>

        <div className="flex items-center gap-2 mt-2 sm:mt-3">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={handleDecrease}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={handleIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="text-right">
          <p className="font-semibold text-sm sm:text-base">
            {(item.unitPrice * item.quantity).toFixed(2)} TND
          </p>
        </div>
      )}
    </div>
  );
};
