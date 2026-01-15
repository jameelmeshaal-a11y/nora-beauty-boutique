import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get products with missing or broken images (Unsplash URLs that may not work)
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, name, name_ar, category, image_url")
      .or("image_url.is.null,image_url.like.%unsplash%,image_url.like.%placeholder%");

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    console.log(`Found ${products?.length || 0} products to update`);

    // Map product IDs to new image URLs (generated images stored in src/assets)
    const imageUpdates: Record<string, string> = {
      // Lip products with generated images
      "334c0070-599d-4a29-a633-3d3e9a52d15b": "lip-gloss-rose-bloom",
      "9a9709c4-1f64-4670-8285-395dcc8906ca": "lip-gloss-daddy-girl",
      "18680929-a498-443c-9637-00e837797395": "lip-gloss-damn-gina",
      "d48af238-90d9-454c-802a-33acb5261d84": "matte-lip-kit-dolce",
      "f4141740-3670-4314-81e2-518cd24d19d3": "lip-oil-honey",
      "66db2bbd-419b-40c5-9919-5a7f74e44abd": "lip-oil-honey",
      "d54b6927-483a-45df-810c-3b763c6fde6a": "high-gloss-lip",
      "2272b380-67a1-4cb8-bb7d-94806bd222b2": "velvet-matte-lipstick",
      "da7c21c1-b853-484a-abe7-dd6d74ae55cb": "plumping-lip-gloss",
    };

    const results = [];

    for (const [productId, imageName] of Object.entries(imageUpdates)) {
      // Update with a publicly accessible URL pattern
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${imageName}.jpg`;
      
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: imageUrl })
        .eq("id", productId);

      if (updateError) {
        console.error(`Failed to update product ${productId}:`, updateError.message);
        results.push({ productId, success: false, error: updateError.message });
      } else {
        console.log(`Updated product ${productId} with image ${imageName}`);
        results.push({ productId, success: true, imageUrl });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Image updates completed",
        results,
        totalProducts: products?.length || 0
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
