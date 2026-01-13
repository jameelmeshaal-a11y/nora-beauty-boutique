import { Truck, Shield, Sparkles, CreditCard } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "شحن سريع",
    description: "توصيل خلال 2-5 أيام عمل"
  },
  {
    icon: Shield,
    title: "منتجات أصلية",
    description: "مستحضرات روسية 100% أصلية"
  },
  {
    icon: Sparkles,
    title: "جودة عالية",
    description: "أفضل الخامات والتركيبات"
  },
  {
    icon: CreditCard,
    title: "دفع آمن",
    description: "طرق دفع متعددة وآمنة"
  }
];

const FeaturesSection = () => {
  return (
    <section className="border-y border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 text-center sm:text-right">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
