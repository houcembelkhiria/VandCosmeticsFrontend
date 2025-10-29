import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, Category } from '@/api/categories';

const categorySchema = z.object({
  name: z.string().min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères').max(100),
  description: z.string().optional(),
  image_url: z.string().url('URL d\'image invalide').optional().or(z.literal('')),
  parent_id: z.string().optional(),
  sort_order: z.union([
    z.number().min(0, 'L\'ordre doit être positif'),
    z.nan().transform(() => undefined)
  ]).optional(),
  is_active: z.boolean().default(true)
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onClose: () => void;
  onSave: () => void;
  category?: Category;
}

export const CategoryForm = ({ onClose, onSave, category }: CategoryFormProps) => {
  const queryClient = useQueryClient();

  // Fetch categories for parent selection
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categories = categoriesData?.categories || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active
    } : {
      name: '',
      description: '',
      image_url: '',
      parent_id: '',
      sort_order: 0,
      is_active: true
    }
  });

  const isActive = watch('is_active');

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Catégorie créée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSave();
    },
    onError: (error: any) => {
      console.error('Create category error:', error);
      toast.error('Échec de la création de la catégorie', {
        description: error.response?.data?.error || error.message || 'Veuillez réessayer.'
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => updateCategory(category!.id, data),
    onSuccess: () => {
      toast.success('Catégorie mise à jour avec succès !');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSave();
    },
    onError: (error: any) => {
      console.error('Update category error:', error);
      toast.error('Échec de la mise à jour de la catégorie', {
        description: error.response?.data?.error || error.message || 'Veuillez réessayer.'
      });
    }
  });

  const onSubmit = async (data: CategoryFormData) => {
    // Clean up the data before sending
    const cleanedData = {
      ...data,
      parent_id: data.parent_id && data.parent_id !== '' ? data.parent_id : undefined,
      image_url: data.image_url && data.image_url !== '' ? data.image_url : undefined,
      description: data.description && data.description !== '' ? data.description : undefined,
    };

    console.log('Submitting category data:', cleanedData);

    if (category) {
      updateCategoryMutation.mutate(cleanedData);
    } else {
      createCategoryMutation.mutate(cleanedData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {category ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie'}
            </CardTitle>
            <CardDescription>
              {category ? 'Modifiez les informations de la catégorie' : 'Ajoutez une nouvelle catégorie à votre catalogue'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la catégorie *</Label>
              <Input
                id="name"
                placeholder="Ex: Maquillage"
                {...register('name')}
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la catégorie..."
                {...register('description')}
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register('image_url')}
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              />
              {errors.image_url && (
                <p className="text-sm text-destructive">{errors.image_url.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_id">Catégorie parente</Label>
                <Select
                  onValueChange={(value) => setValue('parent_id', value === 'none' ? '' : value)}
                  value={watch('parent_id') || 'none'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie parente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {categories
                      .filter(cat => !category || cat.id !== category.id) // Don't allow self as parent
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.parent_id && (
                  <p className="text-sm text-destructive">{errors.parent_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Ordre d'affichage</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('sort_order', { valueAsNumber: true })}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                />
                {errors.sort_order && (
                  <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="text-sm">
                Catégorie active
              </Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                  'Sauvegarde...'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {category ? 'Mettre à jour' : 'Créer la catégorie'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
