import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export const useProductReviews = (productId?: string) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    if (!productId) return;

    try {
      // Fetch approved reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      setReviews((reviewsData as any) || []);

      // Calculate average rating
      if (reviewsData && reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      // Fetch user's own review if logged in
      if (user) {
        const { data: userReviewData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserReview(userReviewData as ProductReview | null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (rating: number, comment?: string) => {
    if (!user || !productId) throw new Error('User not authenticated or no product');

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;
    
    setUserReview(data as ProductReview);
    await fetchReviews();
    return data;
  };

  const updateReview = async (rating: number, comment?: string) => {
    if (!userReview) throw new Error('No review to update');

    const { data, error } = await supabase
      .from('product_reviews')
      .update({ rating, comment })
      .eq('id', userReview.id)
      .select()
      .single();

    if (error) throw error;
    
    setUserReview(data as ProductReview);
    await fetchReviews();
    return data;
  };

  const deleteReview = async () => {
    if (!userReview) throw new Error('No review to delete');

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', userReview.id);

    if (error) throw error;
    
    setUserReview(null);
    await fetchReviews();
  };

  return {
    reviews,
    userReview,
    isLoading,
    averageRating,
    reviewsCount: reviews.length,
    addReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
};
