import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Eye, Play, Sparkles, Tag, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Post {
  id: string;
  title: string;
  title_ar: string | null;
  title_ru: string | null;
  content: string | null;
  content_ar: string | null;
  content_ru: string | null;
  author_name: string;
  author_avatar: string | null;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  product_tag: string | null;
  likes_count: number;
  views_count: number;
}

const CommunityPage = () => {
  const { language, isRTL } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [selected, setSelected] = useState<Post | null>(null);

  useEffect(() => {
    supabase
      .from("community_posts")
      .select("*")
      .eq("is_approved", true)
      .order("sort_order")
      .then(({ data }) => data && setPosts(data as Post[]));
  }, []);

  const filtered = filter === "all" ? posts : posts.filter((p) => p.media_type === filter);

  const t = (ar: string, en: string, ru?: string) =>
    language === "ar" ? ar : language === "ru" ? ru || en : en;

  const getTitle = (p: Post) =>
    language === "ar" ? p.title_ar || p.title : language === "ru" ? p.title_ru || p.title : p.title;
  const getContent = (p: Post) =>
    language === "ar" ? p.content_ar : language === "ru" ? p.content_ru : p.content;

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <CartDrawer />
      <main>
        {/* Hero header */}
        <section className="relative bg-gradient-russian py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 slavic-pattern opacity-10" />
          <div className="container mx-auto px-4 text-center relative z-10 text-white">
            <Sparkles className="h-10 w-10 text-russian-gold mx-auto mb-3" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow">
              {t("منتدى الجمال الروسي", "Russian Beauty Community", "Сообщество красоты")}
            </h1>
            <p className="text-lg opacity-95 max-w-2xl mx-auto">
              {t(
                "ألهمي نفسك بتطبيقات المكياج والعناية من أجمل وأشهر الفنانات الروسيات",
                "Get inspired by makeup tutorials from the most beautiful Russian artists",
                "Вдохновляйтесь уроками макияжа от лучших русских звёзд"
              )}
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="border-b bg-background/95 backdrop-blur sticky top-16 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2">
            {(["all", "image", "video"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === f
                    ? "bg-crimson text-white shadow-russian"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {f === "all"
                  ? t("الكل", "All", "Все")
                  : f === "image"
                  ? t("صور", "Photos", "Фото")
                  : t("فيديو", "Videos", "Видео")}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry grid */}
        <section className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelected(post)}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card hover:shadow-russian transition-all"
              >
                <img
                  src={post.thumbnail_url || post.media_url}
                  alt={getTitle(post)}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                {post.media_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-start">
                  <div className="flex items-center gap-2 mb-1.5">
                    {post.author_avatar && (
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        loading="lazy"
                        className="w-7 h-7 rounded-full border-2 border-russian-gold object-cover"
                      />
                    )}
                    <span className="text-xs font-bold truncate">{post.author_name}</span>
                  </div>
                  <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-2 drop-shadow">
                    {getTitle(post)}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] opacity-95">
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
              </button>
            ))}
          </div>
        </section>

        {/* Detail dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            {selected && (
              <div className="grid md:grid-cols-2">
                <div className="aspect-[3/4] md:aspect-auto bg-black">
                  {selected.media_type === "video" ? (
                    <video
                      src={selected.media_url}
                      controls
                      autoPlay
                      poster={selected.thumbnail_url || undefined}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={selected.media_url}
                      alt={getTitle(selected)}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    {selected.author_avatar && (
                      <img
                        src={selected.author_avatar}
                        alt={selected.author_name}
                        className="w-12 h-12 rounded-full border-2 border-russian-gold object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold">{selected.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("خبيرة جمال", "Beauty Expert", "Бьюти-эксперт")}
                      </p>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{getTitle(selected)}</h2>
                  {getContent(selected) && (
                    <p className="text-sm text-muted-foreground mb-4">{getContent(selected)}</p>
                  )}
                  {selected.product_tag && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-russian-soft border border-russian-gold/30 rounded-lg mb-4 self-start">
                      <Tag className="h-4 w-4 text-crimson" />
                      <span className="text-sm font-semibold">{selected.product_tag}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t text-sm">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-crimson" />
                      <strong>
                        {selected.likes_count > 999
                          ? `${(selected.likes_count / 1000).toFixed(1)}K`
                          : selected.likes_count}
                      </strong>{" "}
                      {t("إعجاب", "likes", "лайков")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-russian-gold" />
                      <strong>
                        {selected.views_count > 999
                          ? `${(selected.views_count / 1000).toFixed(1)}K`
                          : selected.views_count}
                      </strong>{" "}
                      {t("مشاهدة", "views", "просмотров")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityPage;
