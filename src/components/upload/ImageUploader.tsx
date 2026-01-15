import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploaderProps {
  bucket: string;
  folder?: string;
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  onRemove?: (url: string) => void;
  className?: string;
}

const ImageUploader = ({
  bucket,
  folder = '',
  onUpload,
  maxFiles = 5,
  existingImages = [],
  onRemove,
  className,
}: ImageUploaderProps) => {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - existingImages.length;
    if (remainingSlots <= 0) {
      alert(language === 'ar' 
        ? `الحد الأقصى هو ${maxFiles} صور` 
        : `Maximum ${maxFiles} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    const totalFiles = filesToUpload.length;

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    if (uploadedUrls.length > 0) {
      onUpload(uploadedUrls);
    }

    setUploading(false);
    setUploadProgress(0);
  }, [bucket, folder, maxFiles, existingImages.length, onUpload, language]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const handleRemove = async (url: string) => {
    if (onRemove) {
      onRemove(url);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'rounded-lg border-2 border-dashed p-6',
          'transition-colors duration-200',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {language === 'ar' ? `جاري الرفع... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`}
            </span>
            <div className="h-2 w-48 rounded-full bg-secondary">
              <div 
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {language === 'ar' ? 'اسحب الصور هنا أو' : 'Drag images here or'}
              </p>
              <label className="cursor-pointer">
                <span className="text-sm text-primary hover:underline">
                  {language === 'ar' ? 'اختر من جهازك' : 'choose from device'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' 
                ? `PNG, JPG, WEBP (الحد الأقصى ${maxFiles} صور)`
                : `PNG, JPG, WEBP (max ${maxFiles} images)`}
            </p>
          </>
        )}
      </div>

      {/* Preview grid */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {existingImages.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className={cn(
                  'absolute top-1 h-6 w-6 opacity-0 transition-opacity',
                  'group-hover:opacity-100',
                  language === 'ar' ? 'left-1' : 'right-1'
                )}
                onClick={() => handleRemove(url)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 right-1 rounded bg-primary/80 px-1 py-0.5 text-center text-xs text-primary-foreground">
                  {language === 'ar' ? 'رئيسية' : 'Main'}
                </span>
              )}
            </div>
          ))}

          {/* Add more placeholder */}
          {existingImages.length < maxFiles && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary/50">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
