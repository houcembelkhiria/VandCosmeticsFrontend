import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProduct } from '@/api/products';
import { getOrders, updateOrderStatus, getOrderAnalytics, deleteOrder } from '@/api/orders';
import { getCategories, deleteCategory } from '@/api/categories';
import { getParameters, updateParameter, deleteParameter } from '@/api/parameters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, Package, ShoppingCart, Users, DollarSign, AlertTriangle, Search, Filter, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '@/components/ProductForm';
import { CategoryForm } from '@/components/CategoryForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getOrder } from '@/api/orders';

// Translation function for order statuses
const translateOrderStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'pending': 'En attente',
    'processing': 'En traitement',
    'shipped': 'Expédié',
    'delivered': 'Livré',
    'cancelled': 'Annulé'
  };
  return translations[status] || status;
};

// Utility function to safely parse PostgreSQL timestamps
const parsePostgreSQLDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    let date: Date;
    
    // Strategy 1: Direct parsing
    date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Strategy 2: Replace space with T for ISO format
    if (dateString.includes(' ')) {
      const isoString = dateString.replace(' ', 'T');
      date = new Date(isoString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Strategy 3: Manual regex parsing for PostgreSQL format
    const match = dateString.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}(?:\.\d+)?)([+-]\d{2}:\d{2})?/);
    if (match) {
      const [, datePart, timePart, timezone] = match;
      const isoString = `${datePart}T${timePart}${timezone || '+00:00'}`;
      date = new Date(isoString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Strategy 4: Try without timezone
    const noTzMatch = dateString.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}(?:\.\d+)?)/);
    if (noTzMatch) {
      const [, datePart, timePart] = noTzMatch;
      const isoString = `${datePart}T${timePart}Z`;
      date = new Date(isoString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to parse date:', dateString, error);
    return null;
  }
};

const Admin = () => {
  const queryClient = useQueryClient();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingParameter, setEditingParameter] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Filter states for products
  const [productFilters, setProductFilters] = useState({
    search: '',
    category: 'all',
    stockStatus: 'all',
    priceRange: 'all',
    sortBy: 'title',
    sortOrder: 'asc'
  });

  // Filter states for orders
  const [orderFilters, setOrderFilters] = useState({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Fetch data
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ limit: 100 })
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders({ limit: 50 })
  });

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics'],
    queryFn: getOrderAnalytics,
    retry: false,
    enabled: false // Disable analytics for now to prevent errors
  });

  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];

  // Calculate analytics from local data
  const localAnalytics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(order => {
      const createdAt = (order as any).created_at || order.createdAt;
      const orderDate = parsePostgreSQLDate(createdAt);
      return orderDate && orderDate >= thirtyDaysAgo;
    }).length;

    const undeliveredOrders = orders.filter(order => 
      order.status !== 'delivered' && order.status !== 'cancelled'
    ).length;

    return {
      totalOrders,
      totalRevenue,
      recentOrders,
      undeliveredOrders
    };
  }, [orders]);

  // Fetch categories from database
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Fetch parameters from database
  const { data: parametersData, error: parametersError, isLoading: parametersLoading } = useQuery({
    queryKey: ['parameters'],
    queryFn: getParameters,
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Catégorie supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error('Delete category error:', error);
      toast.error('Échec de la suppression de la catégorie', {
        description: error.response?.data?.error || error.message || 'Veuillez réessayer.'
      });
    }
  });

  // Get unique categories for filter (fallback to product categories if database categories not available)
  const categories = categoriesData?.categories?.map(cat => cat.name) || [...new Set(products.map(p => p.category))].filter(Boolean);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (productFilters.search) {
      const searchLower = productFilters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (productFilters.category && productFilters.category !== 'all') {
      filtered = filtered.filter(product => product.category === productFilters.category);
    }

    // Stock status filter
    if (productFilters.stockStatus && productFilters.stockStatus !== 'all') {
      if (productFilters.stockStatus === 'in_stock') {
        filtered = filtered.filter(product => product.stock > 0);
      } else if (productFilters.stockStatus === 'low_stock') {
        filtered = filtered.filter(product => product.stock > 0 && product.stock < 10);
      } else if (productFilters.stockStatus === 'out_of_stock') {
        filtered = filtered.filter(product => product.stock === 0);
      }
    }

    // Price range filter
    if (productFilters.priceRange && productFilters.priceRange !== 'all') {
      const [min, max] = productFilters.priceRange.split('-').map(Number);
      if (max) {
        filtered = filtered.filter(product => product.price >= min && product.price <= max);
      } else {
        filtered = filtered.filter(product => product.price >= min);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[productFilters.sortBy];
      let bVal = b[productFilters.sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (productFilters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [products, productFilters]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (orderFilters.search) {
      const searchLower = orderFilters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchLower) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        order.customerEmail.toLowerCase().includes(searchLower) ||
        order.shipping?.fullName?.toLowerCase().includes(searchLower) ||
        order.shipping?.email?.toLowerCase().includes(searchLower) ||
        order.shipping?.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (orderFilters.status && orderFilters.status !== 'all') {
      filtered = filtered.filter(order => order.status === orderFilters.status);
    }

    // Date range filter
    if (orderFilters.dateRange && orderFilters.dateRange !== 'all') {
      const now = new Date();
      const daysAgo = parseInt(orderFilters.dateRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(order => {
        const createdAt = (order as any).created_at || order.createdAt;
        const orderDate = parsePostgreSQLDate(createdAt);
        return orderDate && orderDate >= cutoffDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[orderFilters.sortBy];
      let bVal = b[orderFilters.sortBy];
      
      // Handle date sorting
      if (orderFilters.sortBy === 'createdAt' || orderFilters.sortBy === 'created_at') {
        const aCreatedAt = (a as any).created_at || a.createdAt;
        const bCreatedAt = (b as any).created_at || b.createdAt;
        const aDate = parsePostgreSQLDate(aCreatedAt);
        const bDate = parsePostgreSQLDate(bCreatedAt);
        aVal = aDate ? aDate.getTime() : 0;
        bVal = bDate ? bDate.getTime() : 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (orderFilters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, orderFilters]);

  // Mutations
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit supprimé');
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Statut de la commande mis à jour');
    }
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success('Commande supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      console.error('Delete order error:', error);
      toast.error('Échec de la suppression de la commande', {
        description: error.response?.data?.error || error.message || 'Veuillez réessayer.'
      });
    }
  });

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    handleCloseProductForm();
  };

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCategorySaved = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    handleCloseCategoryForm();
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ? Cette action est irréversible.`)) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  // Update parameter mutation
  const updateParameterMutation = useMutation({
    mutationFn: ({ parameterId, data }: { parameterId: string; data: any }) =>
      updateParameter(parameterId, data),
    onSuccess: () => {
      toast.success('Paramètre mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['parameters'] });
      setEditingParameter(null);
    },
    onError: (error: any) => {
      console.error('Update parameter error:', error);
      toast.error('Échec de la mise à jour du paramètre', {
        description: error.response?.data?.error || error.message || 'Veuillez réessayer.'
      });
    }
  });

  // Delete parameter mutation
  const deleteParameterMutation = useMutation({
    mutationFn: deleteParameter,
    onSuccess: () => {
      toast.success('Paramètre supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['parameters'] });
    },
    onError: (error: any) => {
      console.error('Delete parameter error:', error);
      toast.error('Échec de la suppression du paramètre', {
        description: error.response?.data?.error || error.message || 'Veuillez réessayer.'
      });
    }
  });

  const handleEditParameter = (parameter: any) => {
    setEditingParameter(parameter);
  };

  const handleSaveParameter = () => {
    if (editingParameter) {
      updateParameterMutation.mutate({
        parameterId: editingParameter.id,
        data: {
          value: editingParameter.value,
          description: editingParameter.description,
          is_active: editingParameter.is_active
        }
      });
    }
  };

  const handleDeleteParam = (parameterId: string, parameterKey: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le paramètre "${parameterKey}" ? Cette action est irréversible.`)) {
      deleteParameterMutation.mutate(parameterId);
    }
  };

  const handleDeleteOrder = (orderId: string, customerName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la commande de "${customerName}" (${orderId}) ? Cette action est irréversible.`)) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleViewOrderDetails = async (orderId: string) => {
    try {
      const order = await getOrder(orderId);
      
      // Fetch product images for each item
      const itemsWithImages = await Promise.all(
        order.items.map(async (item: any) => {
          try {
            const product = products.find(p => p.id === item.productId);
            return {
              ...item,
              image: product?.images?.[0] || '/placeholder.svg'
            };
          } catch (error) {
            console.error('Error fetching product image:', error);
            return {
              ...item,
              image: '/placeholder.svg'
            };
          }
        })
      );
      
      setSelectedOrder({
        ...order,
        items: itemsWithImages
      });
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Impossible de charger les détails de la commande');
    }
  };

  const clearProductFilters = () => {
    setProductFilters({
      search: '',
      category: 'all',
      stockStatus: 'all',
      priceRange: 'all',
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

  const clearOrderFilters = () => {
    setOrderFilters({
      search: '',
      status: 'all',
      dateRange: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  return (
    <main className="container py-6 sm:py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Tableau de bord Admin</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setShowCategoryForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajouter une catégorie</span>
            <span className="sm:hidden">Catégorie</span>
          </Button>
          <Button onClick={() => setShowProductForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajouter un produit</span>
            <span className="sm:hidden">Produit</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localAnalytics.totalRevenue.toFixed(2)} TND
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localAnalytics.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes récentes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localAnalytics.recentOrders}
            </div>
            <p className="text-xs text-muted-foreground">30 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles en rupture</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productsLoading ? '...' : products.filter(p => p.stock < 10).length}
            </div>
            <p className="text-xs text-muted-foreground">Articles avec stock &lt; 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes non livrées</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localAnalytics.undeliveredOrders}
            </div>
            <p className="text-xs text-muted-foreground">En attente de livraison</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="products" className="text-xs sm:text-sm">Produits</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm">Commandes</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">Catégories</TabsTrigger>
          <TabsTrigger value="parameters" className="text-xs sm:text-sm">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des produits</CardTitle>
              <CardDescription>Gérez votre catalogue de produits</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Product Filters */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium text-sm sm:text-base">Filtres</span>
                  <Button variant="ghost" size="sm" onClick={clearProductFilters} className="text-xs sm:text-sm">
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Effacer
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="product-search" className="text-xs sm:text-sm">Rechercher</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="product-search"
                        placeholder="Rechercher des produits..."
                        value={productFilters.search}
                        onChange={(e) => setProductFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={productFilters.category} onValueChange={(value) => setProductFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={categoriesLoading ? "Chargement des catégories..." : "Toutes les catégories"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>Chargement des catégories...</SelectItem>
                        ) : categoriesError ? (
                          <SelectItem value="error" disabled>Erreur de chargement des catégories</SelectItem>
                        ) : (
                          categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stock Status */}
                  <div className="space-y-2">
                    <Label>Statut du stock</Label>
                    <Select value={productFilters.stockStatus} onValueChange={(value) => setProductFilters(prev => ({ ...prev, stockStatus: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les niveaux de stock" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les niveaux de stock</SelectItem>
                        <SelectItem value="in_stock">En stock</SelectItem>
                        <SelectItem value="low_stock">Stock faible (&lt;10)</SelectItem>
                        <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label>Gamme de prix</Label>
                    <Select value={productFilters.priceRange} onValueChange={(value) => setProductFilters(prev => ({ ...prev, priceRange: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les prix" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les prix</SelectItem>
                        <SelectItem value="0-25">0 - 25 TND</SelectItem>
                        <SelectItem value="25-50">25 - 50 TND</SelectItem>
                        <SelectItem value="50-100">50 - 100 TND</SelectItem>
                        <SelectItem value="100-">100+ TND</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Label>Trier par :</Label>
                    <Select value={productFilters.sortBy} onValueChange={(value) => setProductFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Titre</SelectItem>
                        <SelectItem value="price">Prix</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="created_at">Date d'ajout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={productFilters.sortOrder} onValueChange={(value) => setProductFilters(prev => ({ ...prev, sortOrder: value }))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Croissant</SelectItem>
                      <SelectItem value="desc">Décroissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Affichage de {filteredProducts.length} sur {products.length} produits
                    </p>
                  </div>
                  <div className="border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4">Produit</th>
                        <th className="text-left p-4">Catégorie</th>
                        <th className="text-left p-4">Prix</th>
                        <th className="text-left p-4">Stock</th>
                        <th className="text-left p-4">Statut</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-t">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={product.images?.[0] || '/placeholder.svg'} 
                                alt={product.title} 
                                className="w-12 h-12 object-cover rounded" 
                              />
                              <div>
                                <span className="font-medium">{product.title}</span>
                                {product.featured && (
                                  <Badge variant="secondary" className="ml-2">En vedette</Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{product.category}</td>
                          <td className="p-4">{product.price.toFixed(2)} TND</td>
                          <td className="p-4">
                            <span className={product.stock < 10 ? 'text-destructive' : ''}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                              {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteProductMutation.mutate(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
            <CardTitle>Gestion des commandes</CardTitle>
            <CardDescription>Voir et gérer les commandes des clients</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Order Filters */}
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Filtres</span>
                  <Button variant="ghost" size="sm" onClick={clearOrderFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Effacer
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="order-search">Rechercher</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="order-search"
                        placeholder="Rechercher commandes, clients, emails, téléphones..."
                        value={orderFilters.search}
                        onChange={(e) => setOrderFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={orderFilters.status} onValueChange={(value) => setOrderFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="shipped">Expédié</SelectItem>
                        <SelectItem value="delivered">Livré</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label>Période</Label>
                    <Select value={orderFilters.dateRange} onValueChange={(value) => setOrderFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toute période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toute période</SelectItem>
                        <SelectItem value="1">Dernières 24 heures</SelectItem>
                        <SelectItem value="7">7 derniers jours</SelectItem>
                        <SelectItem value="30">30 derniers jours</SelectItem>
                        <SelectItem value="90">90 derniers jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <Label>Trier par</Label>
                    <div className="flex gap-2">
                      <Select value={orderFilters.sortBy} onValueChange={(value) => setOrderFilters(prev => ({ ...prev, sortBy: value }))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_at">Date</SelectItem>
                          <SelectItem value="total">Total</SelectItem>
                          <SelectItem value="customer_name">Client</SelectItem>
                          <SelectItem value="status">Statut</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={orderFilters.sortOrder} onValueChange={(value) => setOrderFilters(prev => ({ ...prev, sortOrder: value }))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">↓</SelectItem>
                          <SelectItem value="asc">↑</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Affichage de {filteredOrders.length} sur {orders.length} commandes
                    </p>
                  </div>
                  <div className="border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4">ID Commande</th>
                        <th className="text-left p-4">Client</th>
                        <th className="text-left p-4">Téléphone</th>
                        <th className="text-left p-4">Articles</th>
                        <th className="text-left p-4">Total</th>
                        <th className="text-left p-4">Statut</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-t">
                          <td className="p-4 font-mono text-sm">{order.id}</td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">
                                {order.shipping?.fullName || order.shipping?.email || 'N/A'}
                              </div>
                              {order.shipping?.fullName && order.shipping?.email && (
                                <div className="text-sm text-muted-foreground">
                                  {order.shipping.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {order.shipping?.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="p-4">{order.items.length} articles</td>
                          <td className="p-4">{order.total.toFixed(2)} TND</td>
                          <td className="p-4">
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' :
                              order.status === 'processing' ? 'outline' :
                              order.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {translateOrderStatus(order.status)}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {(() => {
                              const createdAt = (order as any).created_at || order.createdAt;
                              const date = parsePostgreSQLDate(createdAt);
                              return date ? date.toLocaleDateString() : 'N/A';
                            })()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewOrderDetails(order.id)}
                                title="Voir les détails"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select
                                value={order.status}
                                onValueChange={(status) => 
                                  updateOrderStatusMutation.mutate({ orderId: order.id, status })
                                }
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">En attente</SelectItem>
                                  <SelectItem value="shipped">Expédié</SelectItem>
                                  <SelectItem value="delivered">Livré</SelectItem>
                                  <SelectItem value="cancelled">Annulé</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteOrder(order.id, order.shipping?.fullName || order.customerName || 'client')}
                                disabled={deleteOrderMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des catégories</CardTitle>
              <CardDescription>
                Gérez les catégories de produits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {categoriesData?.categories?.length || 0} catégorie(s) trouvée(s)
                  </p>
                </div>
                <Button onClick={() => setShowCategoryForm(true)}>
                  Ajouter une catégorie
                </Button>
              </div>

              {categoriesLoading ? (
                <div className="text-center py-8">
                  <p>Chargement des catégories...</p>
                </div>
              ) : categoriesData?.categories?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune catégorie trouvée</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowCategoryForm(true)}
                  >
                    Créer la première catégorie
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Nom</th>
                        <th className="text-left p-4">Description</th>
                        <th className="text-left p-4">Catégorie parente</th>
                        <th className="text-left p-4">Ordre</th>
                        <th className="text-left p-4">Statut</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesData?.categories?.map((category) => (
                        <tr key={category.id} className="border-b">
                          <td className="p-4">
                            <div className="font-medium">{category.name}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground">
                              {category.description || 'Aucune description'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {category.parent_id ? 
                                categoriesData?.categories?.find(c => c.id === category.parent_id)?.name || 'Catégorie parente' 
                                : 'Aucune'
                              }
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">{category.sort_order}</div>
                          </td>
                          <td className="p-4">
                            <Badge variant={category.is_active ? "default" : "secondary"}>
                              {category.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setShowCategoryForm(true);
                                }}
                              >
                                Modifier
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                disabled={deleteCategoryMutation.isPending}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des paramètres</CardTitle>
              <CardDescription>
                Gérez les paramètres système (frais de livraison, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parametersLoading ? (
                <div className="text-center py-8">
                  <p>Chargement des paramètres...</p>
                </div>
              ) : parametersData?.parameters?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun paramètre trouvé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {parametersData?.parameters?.length || 0} paramètre(s) trouvé(s)
                  </p>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4">Clé</th>
                          <th className="text-left p-4">Valeur</th>
                          <th className="text-left p-4">Description</th>
                          <th className="text-left p-4">Type</th>
                          <th className="text-left p-4">Statut</th>
                          <th className="text-right p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parametersData?.parameters?.map((parameter) => (
                          <tr key={parameter.id} className="border-t">
                            <td className="p-4">
                              <div className="font-medium font-mono text-sm">{parameter.key}</div>
                            </td>
                            <td className="p-4">
                              {editingParameter?.id === parameter.id ? (
                                <Input
                                  value={editingParameter.value}
                                  onChange={(e) => setEditingParameter({ ...editingParameter, value: e.target.value })}
                                  className="w-48"
                                />
                              ) : (
                                <div className="text-sm">{parameter.value}</div>
                              )}
                            </td>
                            <td className="p-4">
                              {editingParameter?.id === parameter.id ? (
                                <Input
                                  value={editingParameter.description || ''}
                                  onChange={(e) => setEditingParameter({ ...editingParameter, description: e.target.value })}
                                  className="w-64"
                                  placeholder="Description optionnelle"
                                />
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  {parameter.description || 'Aucune description'}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">{parameter.type}</Badge>
                            </td>
                            <td className="p-4">
                              {editingParameter?.id === parameter.id ? (
                                <Select
                                  value={editingParameter.is_active.toString()}
                                  onValueChange={(value) => 
                                    setEditingParameter({ ...editingParameter, is_active: value === 'true' })
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">Actif</SelectItem>
                                    <SelectItem value="false">Inactif</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant={parameter.is_active ? "default" : "secondary"}>
                                  {parameter.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              {editingParameter?.id === parameter.id ? (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveParameter}
                                    disabled={updateParameterMutation.isPending}
                                  >
                                    Enregistrer
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingParameter(null)}
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditParameter(parameter)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseProductForm}
          onSave={handleProductSaved}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCloseCategoryForm}
          onSave={handleCategorySaved}
        />
      )}

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>Informations complètes de la commande</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informations de commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Numéro:</span>
                      <span className="font-mono font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <Badge variant={
                        selectedOrder.status === 'delivered' ? 'default' :
                        selectedOrder.status === 'shipped' ? 'secondary' :
                        selectedOrder.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {translateOrderStatus(selectedOrder.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>
                        {(() => {
                          const createdAt = (selectedOrder as any).created_at || selectedOrder.createdAt;
                          const date = parsePostgreSQLDate(createdAt);
                          return date ? date.toLocaleString('fr-FR') : 'N/A';
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-lg">{selectedOrder.total.toFixed(2)} TND</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom:</span>
                      <span className="font-medium">{selectedOrder.shipping?.fullName || selectedOrder.customerName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedOrder.shipping?.email || selectedOrder.customerEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone:</span>
                      <span>{selectedOrder.shipping?.phone || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 pb-3 border-b last:border-0">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          {item.variantId && (
                            <p className="text-sm text-muted-foreground">Variante: {item.variantId}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                        </div>
                        
                        {/* Price */}
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
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total:</span>
                      <span className="font-medium">{selectedOrder.subtotal.toFixed(2)} TND</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remise:</span>
                        <span className="font-medium text-green-600">
                          -{selectedOrder.discount.toFixed(2)} TND
                        </span>
                      </div>
                    )}
                    {selectedOrder.shipping?.deliveryFee !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Livraison:</span>
                        <span className="font-medium">
                          {selectedOrder.shipping.isFreeDelivery ? 'Gratuite' : `${selectedOrder.shipping.deliveryFee.toFixed(2)} TND`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{selectedOrder.total.toFixed(2)} TND</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Adresse de livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{selectedOrder.shipping?.fullName}</p>
                    <p>{selectedOrder.shipping?.address}</p>
                    <p>
                      {selectedOrder.shipping?.city}, {selectedOrder.shipping?.state} {selectedOrder.shipping?.zipCode}
                    </p>
                    <p>{selectedOrder.shipping?.country || 'Tunisie'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Admin;
