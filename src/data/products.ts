import lipGloss1 from "@/assets/products/lip-gloss-1.jpg";
import lipGloss2 from "@/assets/products/lip-gloss-2.jpg";
import lipGloss3 from "@/assets/products/lip-gloss-3.jpg";
import lipstick1 from "@/assets/products/lipstick-1.jpg";
import lipstick2 from "@/assets/products/lipstick-2.jpg";
import lipstick3 from "@/assets/products/lipstick-3.jpg";
import lipOil1 from "@/assets/products/lip-oil-1.jpg";

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  shades: number;
  badge?: "bestseller" | "new" | "sale";
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  supplierName?: string;
  supplierNameAr?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "ملمع شفاه لامع وردي",
    nameEn: "Pink Shimmer Lip Gloss",
    category: "lip-gloss",
    price: 89,
    image: lipGloss1,
    shades: 12,
    badge: "bestseller",
    description: "ملمع شفاه فاخر بلمعة وردية ساحرة، تركيبة روسية فريدة غنية بالفيتامينات",
    rating: 4.8,
    reviews: 234,
    inStock: true
  },
  {
    id: "2",
    name: "أحمر شفاه مخملي أحمر",
    nameEn: "Red Velvet Matte Lipstick",
    category: "lipstick",
    price: 120,
    originalPrice: 150,
    image: lipstick1,
    shades: 8,
    badge: "sale",
    description: "أحمر شفاه مخملي ثابت طوال اليوم، لون أحمر كلاسيكي جريء",
    rating: 4.9,
    reviews: 456,
    inStock: true
  },
  {
    id: "3",
    name: "ملمع شفاه نيود طبيعي",
    nameEn: "Natural Nude Lip Gloss",
    category: "lip-gloss",
    price: 85,
    image: lipGloss2,
    shades: 15,
    description: "ملمع شفاه بدرجة نيود طبيعية، مثالي للإطلالة اليومية",
    rating: 4.7,
    reviews: 189,
    inStock: true
  },
  {
    id: "4",
    name: "أحمر شفاه بيري بلام",
    nameEn: "Berry Plum Lipstick",
    category: "lipstick",
    price: 115,
    image: lipstick2,
    shades: 6,
    badge: "new",
    description: "أحمر شفاه بدرجة التوت الداكن، تركيبة مرطبة طويلة الأمد",
    rating: 4.6,
    reviews: 98,
    inStock: true
  },
  {
    id: "5",
    name: "ملمع شفاه لامع روز جولد",
    nameEn: "Rose Gold Shimmer Gloss",
    category: "lip-gloss",
    price: 95,
    image: lipGloss3,
    shades: 10,
    badge: "bestseller",
    description: "ملمع شفاه براق بلون روز جولد، مثالي للسهرات",
    rating: 4.9,
    reviews: 312,
    inStock: true
  },
  {
    id: "6",
    name: "أحمر شفاه بيتش نيود",
    nameEn: "Peachy Nude Lipstick",
    category: "lipstick",
    price: 110,
    image: lipstick3,
    shades: 9,
    description: "أحمر شفاه بدرجة الخوخ الناعمة، مظهر طبيعي وأنيق",
    rating: 4.5,
    reviews: 167,
    inStock: true
  },
  {
    id: "7",
    name: "زيت شفاه بالعسل",
    nameEn: "Honey Lip Oil",
    category: "lip-oil",
    price: 75,
    image: lipOil1,
    shades: 5,
    badge: "new",
    description: "زيت شفاه مغذي بخلاصة العسل الطبيعي، ترطيب مكثف",
    rating: 4.8,
    reviews: 87,
    inStock: true
  },
  {
    id: "8",
    name: "ملمع شفاه كريستال",
    nameEn: "Crystal Clear Gloss",
    category: "lip-gloss",
    price: 79,
    image: lipGloss1,
    shades: 3,
    description: "ملمع شفاه شفاف لامع، يضفي لمعاناً طبيعياً",
    rating: 4.4,
    reviews: 145,
    inStock: false
  }
];

export const categories = [
  { id: "all", name: "جميع المنتجات", nameEn: "All Products" },
  { id: "lip-gloss", name: "ملمع الشفاه", nameEn: "Lip Gloss" },
  { id: "lipstick", name: "أحمر الشفاه", nameEn: "Lipstick" },
  { id: "lip-oil", name: "زيت الشفاه", nameEn: "Lip Oil" }
];
