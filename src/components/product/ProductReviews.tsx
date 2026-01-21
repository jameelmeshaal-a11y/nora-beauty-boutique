import { useState } from "react";
import { useProductReviews } from "@/hooks/useProductReviews";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    reviews,
    userReview,
    isLoading,
    averageRating,
    reviewsCount,
    addReview,
    updateReview,
    deleteReview,
  } = useProductReviews(productId);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    return {
      rating,
      count,
      percentage: reviewsCount > 0 ? (count / reviewsCount) * 100 : 0,
    };
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: language === "ar" ? "يرجى تسجيل الدخول" : "Please Login",
        description: language === "ar" ? "سجل دخولك لإضافة تقييم" : "Login to add a review",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && userReview) {
        await updateReview(newRating, newComment);
        toast({
          title: language === "ar" ? "تم التحديث" : "Updated",
          description: language === "ar" ? "تم تحديث تقييمك بنجاح" : "Your review has been updated",
        });
      } else {
        await addReview(newRating, newComment);
        toast({
          title: language === "ar" ? "شكراً لك!" : "Thank you!",
          description: language === "ar" 
            ? "تم إرسال تقييمك وسيظهر بعد المراجعة" 
            : "Your review has been submitted and will appear after moderation",
        });
      }
      setNewComment("");
      setNewRating(5);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "حدث خطأ أثناء إرسال التقييم" : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    try {
      await deleteReview();
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description: language === "ar" ? "تم حذف تقييمك" : "Your review has been deleted",
      });
    } catch (error) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل حذف التقييم" : "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const startEditing = () => {
    if (userReview) {
      setNewRating(userReview.rating);
      setNewComment(userReview.comment || "");
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-secondary/30 rounded-lg" />
        <div className="h-20 bg-secondary/30 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-border p-6">
          <div className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}</div>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.floor(averageRating) ? "fill-accent text-accent" : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === "ar" ? `من ${reviewsCount} تقييم` : `Based on ${reviewsCount} reviews`}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 fill-accent text-accent" />
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="w-8 text-sm text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Review Form */}
      {user && (!userReview || isEditing) && (
        <div className="rounded-lg border border-border p-6 space-y-4">
          <h3 className="font-semibold">
            {isEditing 
              ? (language === "ar" ? "تعديل تقييمك" : "Edit Your Review")
              : (language === "ar" ? "أضف تقييمك" : "Write a Review")}
          </h3>
          
          {/* Star Rating Input */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {language === "ar" ? "تقييمك:" : "Your Rating:"}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      (hoveredStar || newRating) >= star
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={language === "ar" ? "شاركنا رأيك في هذا المنتج..." : "Share your thoughts about this product..."}
            rows={4}
          />

          <div className="flex gap-2">
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting 
                ? (language === "ar" ? "جاري الإرسال..." : "Submitting...")
                : isEditing
                  ? (language === "ar" ? "تحديث التقييم" : "Update Review")
                  : (language === "ar" ? "إرسال التقييم" : "Submit Review")}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* User's Existing Review */}
      {userReview && !isEditing && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                {language === "ar" ? "تقييمك" : "Your Review"}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < userReview.rating ? "fill-accent text-accent" : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              {userReview.comment && (
                <p className="mt-2 text-muted-foreground">{userReview.comment}</p>
              )}
              {!userReview.is_approved && (
                <p className="mt-2 text-xs text-amber-600">
                  {language === "ar" ? "قيد المراجعة" : "Pending approval"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={startEditing}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={handleDeleteReview}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt */}
      {!user && (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-muted-foreground">
            {language === "ar" ? "سجل دخولك لإضافة تقييم" : "Login to write a review"}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <a href="/auth">{language === "ar" ? "تسجيل الدخول" : "Login"}</a>
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="font-semibold">
          {language === "ar" ? "جميع التقييمات" : "All Reviews"} ({reviewsCount})
        </h3>
        
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {language === "ar" ? "لا توجد تقييمات بعد. كن أول من يقيم!" : "No reviews yet. Be the first to review!"}
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {review.profiles?.full_name || (language === "ar" ? "عميل" : "Customer")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "dd MMM yyyy", {
                          locale: language === "ar" ? ar : enUS,
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating ? "fill-accent text-accent" : "fill-muted text-muted"
                          )}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
