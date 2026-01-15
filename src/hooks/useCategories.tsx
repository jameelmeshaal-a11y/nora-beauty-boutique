import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  children?: Category[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const allCategories = (data || []) as Category[];
      setCategories(allCategories);

      // Build tree structure
      const tree = buildCategoryTree(allCategories);
      setCategoriesTree(tree);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildCategoryTree = (flatCategories: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    // First pass: create map of all categories
    flatCategories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    flatCategories.forEach(cat => {
      const category = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        const parent = map.get(cat.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(category);
      } else if (!cat.parent_id) {
        roots.push(category);
      }
    });

    return roots;
  };

  const getCategoryBySlug = (slug: string): Category | undefined => {
    return categories.find(c => c.slug === slug);
  };

  const getChildCategories = (parentId: string): Category[] => {
    return categories.filter(c => c.parent_id === parentId);
  };

  const getParentCategory = (categoryId: string): Category | undefined => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.parent_id) {
      return categories.find(c => c.id === category.parent_id);
    }
    return undefined;
  };

  const getCategoryPath = (categoryId: string): Category[] => {
    const path: Category[] = [];
    let current = categories.find(c => c.id === categoryId);
    
    while (current) {
      path.unshift(current);
      current = current.parent_id 
        ? categories.find(c => c.id === current!.parent_id)
        : undefined;
    }
    
    return path;
  };

  return {
    categories,
    categoriesTree,
    isLoading,
    getCategoryBySlug,
    getChildCategories,
    getParentCategory,
    getCategoryPath,
    refetch: fetchCategories,
  };
};
