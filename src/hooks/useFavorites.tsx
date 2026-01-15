import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FavoritesContextType {
  favorites: string[];
  isLoading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFavorites(data?.map(f => f.product_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "سجل دخولك لإضافة المنتجات للمفضلة",
        variant: "destructive"
      });
      return;
    }

    const isCurrentlyFavorite = isFavorite(productId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        
        setFavorites(prev => prev.filter(id => id !== productId));
        toast({
          title: "تمت الإزالة",
          description: "تم إزالة المنتج من المفضلة"
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;
        
        setFavorites(prev => [...prev, productId]);
        toast({
          title: "تمت الإضافة",
          description: "تم إضافة المنتج للمفضلة"
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المفضلة",
        variant: "destructive"
      });
    }
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      isLoading, 
      isFavorite, 
      toggleFavorite,
      favoritesCount: favorites.length 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
