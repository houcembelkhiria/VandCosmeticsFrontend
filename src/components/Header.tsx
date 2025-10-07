import { ShoppingBag, Search, Menu, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import { MiniCart } from './MiniCart';

export const Header = () => {
  const location = useLocation();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [showMiniCart, setShowMiniCart] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Vanda
                </h1>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/products"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/products') ? 'text-primary' : 'text-foreground/60'
                  }`}
                >
                  Products
                </Link>
                <Link
                  to="/products?category=Makeup"
                  className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
                >
                  Makeup
                </Link>
                <Link
                  to="/products?category=Skincare"
                  className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
                >
                  Skincare
                </Link>
                <Link
                  to="/products?category=Fragrance"
                  className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
                >
                  Fragrance
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <User className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowMiniCart(!showMiniCart)}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-semibold">
                    {itemCount}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MiniCart isOpen={showMiniCart} onClose={() => setShowMiniCart(false)} />
    </>
  );
};
