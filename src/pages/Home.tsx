import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/api/products';
import heroImage from '@/assets/hero-image.jpg';

const Home = () => {
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', { featured: true, limit: 4 }],
    queryFn: () => getProducts({ limit: 20 }), // Get more to filter featured
    select: (data) => data.products.filter(p => p.featured).slice(0, 4)
  });

  const featuredProducts = productsData || [];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/60" />
        </div>
        
        <div className="container relative z-10 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Découvrez Votre Beauté
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Cosmétiques de luxe sélectionnés pour l'enthousiaste de beauté moderne
          </p>
          <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3" asChild>
            <Link to="/products">Acheter maintenant</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Produits en vedette</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-muted rounded mb-2"></div>
                <div className="h-5 sm:h-6 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Échec du chargement des produits en vedette</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
