import { ShoppingBag, Search, Menu, User, LogOut, X, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { MiniCart } from './MiniCart';
import { getProducts } from '@/api/products';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Fetch products for search suggestions
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
    enabled: showSearch && searchQuery.length > 0
  });

  const isActive = (path: string) => location.pathname === path;

  // Filter products for search suggestions (top 5)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !productsData?.products) {
      return [];
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = productsData.products.filter(product => 
      product.title.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
    
    return filtered.slice(0, 5);
  }, [searchQuery, productsData?.products]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Échec de la déconnexion');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (product: any) => {
    navigate(`/products/${product.id}`);
    setSearchQuery('');
    setShowSearch(false);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
          handleSuggestionClick(searchSuggestions[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.search-container')) {
          setShowDropdown(false);
          setSelectedIndex(-1);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Vanda
                </h1>
              </Link>

              {/* Mobile Navigation */}
              <nav className="flex md:hidden items-center gap-4">
                <Link
                  to="/products"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/products') ? 'text-primary' : 'text-foreground/60'
                  }`}
                >
                  Produits
                </Link>
              </nav>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/products"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/products') ? 'text-primary' : 'text-foreground/60'
                  }`}
                >
                  Produits
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar */}
              {showSearch ? (
                <div className="relative search-container">
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="pl-10 pr-10 w-48 sm:w-64"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => {
                          setSearchQuery('');
                          setShowSearch(false);
                          setShowDropdown(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                  
                  {/* Search Suggestions Dropdown */}
                  {showDropdown && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                      {searchSuggestions.map((product, index) => (
                        <div
                          key={product.id}
                          className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer ${
                            index === selectedIndex ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.title}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{product.price.toFixed(2)} TND</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                      <div className="border-t p-2">
                        <button
                          onClick={handleSearch}
                          className="w-full text-left text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
                        >
                          <Search className="h-4 w-4" />
                          Rechercher "{searchQuery}"
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden sm:inline-flex"
                  onClick={toggleSearch}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* Mobile Search Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="sm:hidden"
                onClick={toggleSearch}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />

                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin">Tableau de bord Admin</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
                  <Link to="/login">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              )}

              {/* Cart Button */}
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
            </div>
          </div>
        </div>
      </header>

      <MiniCart isOpen={showMiniCart} onClose={() => setShowMiniCart(false)} />
    </>
  );
};
