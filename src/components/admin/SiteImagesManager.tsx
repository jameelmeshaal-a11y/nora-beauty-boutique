import { useState, useEffect } from "react";
import { Image, Upload, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface SiteImage {
  id: string;
  key: string;
  image_url: string;
  title: string | null;
  title_ar: string | null;
  is_active: boolean;
}

const SiteImagesManager = () => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .order('key');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (imageKey: string, file: File) => {
    setUploading(imageKey);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `site-images/${imageKey}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('site_images')
        .update({ image_url: urlData.publicUrl })
        .eq('key', imageKey);

      if (updateError) throw updateError;

      toast({
        title: language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
      });
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: language === 'ar' ? 'حدث خطأ أثناء رفع الصورة' : 'Error uploading image',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const handleUrlChange = async (imageKey: string, newUrl: string) => {
    try {
      const { error } = await supabase
        .from('site_images')
        .update({ image_url: newUrl })
        .eq('key', imageKey);

      if (error) throw error;

      toast({
        title: language === 'ar' ? 'تم تحديث الرابط' : 'URL updated',
      });
      fetchImages();
    } catch (error) {
      console.error('Error updating URL:', error);
      toast({
        title: language === 'ar' ? 'حدث خطأ' : 'Error',
        variant: 'destructive',
      });
    }
  };

  const getImageLabel = (key: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      hero_main: { ar: 'صورة البانر الرئيسية', en: 'Hero Banner' },
      category_lip_gloss: { ar: 'فئة ملمع الشفاه', en: 'Lip Gloss Category' },
      category_lipstick: { ar: 'فئة أحمر الشفاه', en: 'Lipstick Category' },
      category_lip_oil: { ar: 'فئة زيت الشفاه', en: 'Lip Oil Category' },
    };
    return labels[key]?.[language === 'ar' ? 'ar' : 'en'] || key;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Image className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold">
          {language === 'ar' ? 'إدارة صور الواجهة' : 'Site Images Management'}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {images.map((image) => (
          <Card key={image.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {getImageLabel(image.key)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview */}
              <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt={image.title || image.key}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'رابط الصورة' : 'Image URL'}</Label>
                <div className="flex gap-2">
                  <Input
                    value={image.image_url}
                    onChange={(e) => {
                      setImages(prev =>
                        prev.map(img =>
                          img.id === image.id
                            ? { ...img, image_url: e.target.value }
                            : img
                        )
                      );
                    }}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleUrlChange(image.key, image.image_url)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Upload Button */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'أو ارفع صورة' : 'Or upload image'}</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(image.key, file);
                      }
                    }}
                    disabled={uploading === image.key}
                    className="flex-1"
                  />
                  {uploading === image.key && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Image Button */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'لإضافة صورة جديدة، تواصل مع المطور' 
              : 'To add a new image slot, contact the developer'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteImagesManager;
