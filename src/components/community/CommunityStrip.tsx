import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Eye, Play, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";

interface Post {
  id: string;
  title: string;
  title_ar: string | null;
  title_ru: string | null;
  author_name: string;
  author_avatar: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  product_tag: string | null;
  likes_count: number;
  views_count: number;
}

const CommunityStrip = () => {
  const { language, isRTL } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("community_posts")
      .select("*")
      .eq("is_approved", true)
      .order("sort_order")
      .limit(6)
      .then(({ data }) => data && setPosts(data as Post[]));
  }, []);

  if (!posts.length) return null;

  const heading =
    language === "ar"
      ? "منتدى الجمال الروسي"
      : language === "ru"
      ? "Сообщество русской красоты"
      : "Russian Beauty Community";

  const subtitle =
    language === "ar"
      ? "شاهدي تطبيقات المكياج من أجمل المشهورات الروسيات"
      : language === "ru"
      ? "Смотрите макияж от самых красивых русских звёзд"
      : "Watch makeup tutorials from top Russian beauties";

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-[hsl(var(--crimson-light))]/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Sparkles className="h-8 w-8 text-russian-gold mx-auto mb-2" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-gradient-russian mb-2">
            {heading}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {posts.map((post) => {
            const title =
              language === "ar"
                ? post.title_ar || post.title
                : language === "ru"
                ? post.title_ru || post.title
                : post.title;
            return (
              <Link
                key={post.id}
                to="/community"
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card hover:shadow-russian transition-all"
              >
                <img
                  src={post.thumbnail_url || post.media_url}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {post.media_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    {post.author_avatar && (
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        loading="lazy"
                        className="w-6 h-6 rounded-full border border-russian-gold object-cover"
                      />
                    )}
                    <span className="text-xs font-semibold truncate">{post.author_name}</span>
                  </div>
                  <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-2 drop-shadow">
                    {title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] opacity-90">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes_count > 999
                        ? `${(post.likes_count / 1000).toFixed(1)}K`
                        : post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views_count > 999
                        ? `${(post.views_count / 1000).toFixed(1)}K`
                        : post.views_count}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-6 py-3 bg-crimson text-white rounded-full font-bold hover:bg-crimson/90 transition-colors shadow-russian"
          >
            {language === "ar"
              ? "ادخلي المنتدى"
              : language === "ru"
              ? "В сообщество"
              : "Enter Community"}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunityStrip;
