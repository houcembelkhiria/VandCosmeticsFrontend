import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/api/products';
import { getCategories } from '@/api/categories';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter } from 'lucide-react';

const Products = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts()
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories()
  });

  const allProducts = productsData?.products || [];
  const categories = categoriesData?.categories?.map(cat => cat.name) || [];

  // Filter products based on search query, category, and price
  const products = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Price filter
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'under-50':
          filtered = filtered.filter(product => product.price < 50);
          break;
        case '50-100':
          filtered = filtered.filter(product => product.price >= 50 && product.price <= 100);
          break;
        case '100-200':
          filtered = filtered.filter(product => product.price >= 100 && product.price <= 200);
          break;
        case 'over-200':
          filtered = filtered.filter(product => product.price > 200);
          break;
        case 'custom':
          if (minPrice) {
            filtered = filtered.filter(product => product.price >= parseFloat(minPrice));
          }
          if (maxPrice) {
            filtered = filtered.filter(product => product.price <= parseFloat(maxPrice));
          }
          break;
      }
    }

    // Sort products
    if (sortBy !== 'default') {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name-asc':
            return a.title.localeCompare(b.title);
          case 'name-desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategories, priceRange, minPrice, maxPrice, sortBy]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
  };

  if (productsLoading || categoriesLoading) {
    return (
      <main className="container py-8 px-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/3 mb-8" />
          <div className="flex gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-full w-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          {searchQuery ? `Résultats de recherche pour "${searchQuery}"` : 'Tous les produits'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {products.length} produit{products.length !== 1 ? 's' : ''} trouvé{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 p-6 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </h2>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Effacer les filtres
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Catégories sélectionnées ({selectedCategories.length})</Label>
            <div className="text-sm text-muted-foreground">
              {selectedCategories.length === 0 
                ? 'Aucune catégorie sélectionnée - tous les produits seront affichés'
                : `Filtrage par: ${selectedCategories.join(', ')}`
              }
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <Label>Gamme de prix</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prix</SelectItem>
                <SelectItem value="under-50">Moins de 50 TND</SelectItem>
                <SelectItem value="50-100">50 - 100 TND</SelectItem>
                <SelectItem value="100-200">100 - 200 TND</SelectItem>
                <SelectItem value="over-200">Plus de 200 TND</SelectItem>
                <SelectItem value="custom">Prix personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <Label>Trier par</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordre par défaut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Ordre par défaut</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
                <SelectItem value="name-desc">Nom Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Price Range */}
          {priceRange === 'custom' && (
            <div className="space-y-2">
              <Label>Prix personnalisé</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Category Badges */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={selectedCategories.length === 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategories([])}
          className="rounded-full"
        >
          Toutes
        </Button>
        {categories.map((cat, index) => (
          <Button
            key={`${cat}-${index}`}
            variant={selectedCategories.includes(cat) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleCategory(cat)}
            className="rounded-full"
          >
            {cat}
            {selectedCategories.includes(cat) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Button>
        ))}
      </div>

      {products.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun produit trouvé</h3>
          <p className="text-sm text-muted-foreground">
            Essayez de rechercher avec d'autres mots-clés ou parcourez tous les produits
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Products;
