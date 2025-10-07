import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/api/products';
import { categories } from '@/data/dummyData';

const Products = () => {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts()
  });

  return (
    <main className="container py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">All Products</h1>
      
      <div className="flex gap-4 mb-8">
        {categories.map(cat => (
          <button key={cat} className="px-4 py-2 rounded-full border hover:bg-primary hover:text-primary-foreground transition-colors">
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};

export default Products;
