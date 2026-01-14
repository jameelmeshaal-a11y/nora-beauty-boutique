import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Target, Eye, Heart, Award, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

interface CompanyInfo {
  name: string;
  name_en: string | null;
  about: string | null;
  vision: string | null;
  mission: string | null;
}

const AboutPage = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data } = await supabase
        .from('company_info')
        .select('*')
        .maybeSingle();
      
      if (data) {
        setCompanyInfo(data);
      }
    };

    fetchCompanyInfo();
  }, []);

  const values = [
    {
      icon: Award,
      title: "الجودة العالية",
      description: "نقدم فقط المنتجات الأصلية والمعتمدة من أفضل العلامات التجارية الروسية"
    },
    {
      icon: Heart,
      title: "رضا العملاء",
      description: "نسعى دائماً لتقديم تجربة تسوق مميزة وخدمة عملاء استثنائية"
    },
    {
      icon: Users,
      title: "الثقة والمصداقية",
      description: "نبني علاقات طويلة الأمد مع عملائنا من خلال الشفافية والأمانة"
    },
    {
      icon: Sparkles,
      title: "الابتكار",
      description: "نواكب أحدث صيحات الجمال ونقدم لكِ كل ما هو جديد ومميز"
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20">
          <div className="container mx-auto px-4 text-center">
            <nav className="mb-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">الرئيسية</Link>
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span className="text-foreground">من نحن</span>
            </nav>
            
            <h1 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
              من نحن
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {companyInfo?.about || 'نورة هي وجهتك الأولى لمنتجات التجميل الروسية الفاخرة. نقدم لكِ أفضل مستحضرات التجميل المستوردة من روسيا بجودة عالية وأسعار منافسة.'}
            </p>
          </div>
        </section>
        
        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground">قصتنا</h2>
                <div className="mt-6 space-y-4 text-muted-foreground">
                  <p>
                    بدأت رحلتنا في عالم الجمال بشغف حقيقي لمساعدة المرأة العربية في الحصول على أفضل منتجات التجميل الروسية الأصلية.
                  </p>
                  <p>
                    نحن نؤمن بأن كل امرأة تستحق أن تحصل على منتجات عالية الجودة تعزز جمالها الطبيعي. لذلك، نختار بعناية كل منتج نقدمه لضمان حصولك على أفضل النتائج.
                  </p>
                  <p>
                    نعمل مع أشهر العلامات التجارية الروسية مثل Vivienne Sabo، Luxvisage، Relouis، وغيرها الكثير لنوفر لك تشكيلة واسعة من أفضل مستحضرات التجميل.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"
                  alt="Beauty products"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 rounded-xl bg-primary p-6 text-primary-foreground shadow-xl">
                  <p className="text-4xl font-bold">+1000</p>
                  <p className="text-sm">عميلة سعيدة</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Vision & Mission */}
        <section className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none bg-background shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">رؤيتنا</h3>
                  <p className="text-muted-foreground">
                    {companyInfo?.vision || 'أن نكون الوجهة الأولى لمنتجات التجميل الروسية في المنطقة العربية، ونساهم في تعزيز ثقة المرأة بجمالها الفريد.'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none bg-background shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">رسالتنا</h3>
                  <p className="text-muted-foreground">
                    {companyInfo?.mission || 'تقديم منتجات تجميل أصلية وفاخرة تعزز جمال المرأة العربية، مع توفير تجربة تسوق ممتعة وخدمة عملاء متميزة.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">قيمنا</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <Card key={index} className="group text-center transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary">
                      <value.icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Brands */}
        <section className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">علاماتنا التجارية</h2>
            <p className="mx-auto mb-12 max-w-2xl text-muted-foreground">
              نتعاون مع أشهر العلامات التجارية الروسية لنقدم لك أفضل مستحضرات التجميل
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['Vivienne Sabo', 'Luxvisage', 'Relouis', 'Eva Mosaic', 'Stellary', 'Natura Siberica', 'Organic Shop'].map((brand) => (
                <div
                  key={brand}
                  className="rounded-lg bg-background px-6 py-4 shadow-md"
                >
                  <span className="text-lg font-semibold text-foreground">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default AboutPage;
