import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, MessageCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyModal from "@/components/BuyModal";
import WatchCard from "@/components/WatchCard";
import { useCurrency } from "@/contexts/CurrencyContext";

const WatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  const { data: allWatches = [] } = useQuery({
    queryKey: ["watches-all-for-recs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watches")
        .select("*")
        .neq("status", "out_of_stock");
      if (error) throw error;
      return data;
    },
  });

  const { data: watch, isLoading } = useQuery({
    queryKey: ["watch", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("watches").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const allImages = watch 
    ? [watch.image_url, ...(watch.additional_images || [])].filter((url): url is string => Boolean(url))
    : [];

  const currentImage = selectedImage || watch?.image_url;

  // Recommendation engine — score by similarity signals
  const recommendations = useMemo(() => {
    if (!watch || allWatches.length === 0) return [];
    const priceFloor = watch.price > 0 ? watch.price * 0.6 : 0;
    const priceCeil = watch.price > 0 ? watch.price * 1.4 : Infinity;

    return allWatches
      .filter((w) => w.id !== watch.id)
      // Hard filter: only recommend same gender if current watch has a gender set
      .filter((w) => !watch.sex || !w.sex || w.sex === watch.sex)
      .map((w) => {
        let score = 0;
        if (w.brand === watch.brand) score += 10;
        if (watch.price > 0 && w.price >= priceFloor && w.price <= priceCeil) score += 6;
        if (w.case_material && w.case_material === watch.case_material) score += 4;
        if (w.condition && w.condition === watch.condition) score += 3;
        if (w.strap && w.strap === watch.strap) score += 2;
        if (w.sex && w.sex === watch.sex) score += 2;
        if (w.complications && w.complications === watch.complications) score += 2;
        return { watch: w, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((r) => r.watch);
  }, [watch, allWatches]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container px-4 md:px-8 py-12">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="h-8 bg-secondary w-1/3" />
              <div className="h-6 bg-secondary w-2/3" />
              <div className="h-10 bg-secondary w-1/4 mt-4" />
            </div>
            <div className="aspect-square bg-secondary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!watch) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Watch not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const specs = [
    { label: "Brand", value: watch.brand },
    { label: "Ref", value: watch.reference },
    { label: "Sex", value: watch.sex },
    { label: "Movement", value: watch.movement },
    { label: "Case diameter, mm", value: watch.case_diameter_mm?.toString() },
    { label: "Case material", value: watch.case_material },
    { label: "Strap", value: watch.strap },
    { label: "Complications", value: watch.complications },
    { label: "Condition report", value: watch.condition_report },
    { label: "Waterproof", value: watch.waterproof },
    { label: "Caliber", value: watch.caliber },
    { label: "SKU", value: watch.sku },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Product Hero Section */}
        <section className="container px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Product Info */}
            <div className="animate-fade-in order-2 lg:order-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-wide text-foreground">
                  {watch.brand.toUpperCase()}
                </h2>
                {watch.status === "on_order" && (
                  <Badge className="bg-yellow-500 text-yellow-950 border-yellow-500 hover:bg-yellow-500 text-xs rounded-sm">ON ORDER</Badge>
                )}
                {watch.status === "out_of_stock" && (
                  <Badge className="bg-destructive text-destructive-foreground border-destructive hover:bg-destructive text-xs rounded-sm">OUT OF STOCK</Badge>
                )}
              </div>
              <p className="text-lg md:text-xl font-display font-medium text-foreground mt-1">
                {watch.model.toUpperCase()}
              </p>
              {watch.reference && (
                <p className="text-sm text-muted-foreground mt-1">REF {watch.reference}</p>
              )}

              <div className="mt-6">
                <p className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wider text-primary/80">
                  Price on request
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button
                  onClick={() => setBuyOpen(true)}
                  className="bg-primary text-primary-foreground px-10 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
                >
                  Buy
                </button>
              </div>

              {/* Condition Info */}
              <div className="mt-6 flex flex-col sm:flex-row gap-6 sm:gap-12">
                <div className="space-y-2">
                  <div className="flex gap-8">
                    <span className="text-sm text-muted-foreground w-20">Condition:</span>
                    <span className="text-sm text-foreground font-medium">{watch.condition}</span>
                  </div>
                  <div className="flex gap-8">
                    <span className="text-sm text-muted-foreground w-20">Box:</span>
                    <span className="text-sm text-foreground">{watch.box ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex gap-8">
                    <span className="text-sm text-muted-foreground w-20">Papers:</span>
                    <span className="text-sm text-foreground">{watch.papers ? "Yes" : "No"}</span>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p className="text-sm font-semibold tracking-wide text-foreground mb-3">ANY QUESTIONS?</p>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Whatsapp
                    </button>
                    <button className="flex items-center gap-2 border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                      <Send className="w-4 h-4" />
                      Telegram
                    </button>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong className="text-foreground">Please note:</strong> prices and availability may change without prior notice. 
                  Kindly confirm availability before visiting our boutique.
                </p>
              </div>
            </div>

            {/* Right: Product Images Gallery */}
            <div className="flex flex-col animate-fade-in order-1 lg:order-2" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center justify-center p-4 sm:p-8 border border-border bg-white min-h-[400px]">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${watch.brand} ${watch.model}`}
                    className="w-full max-w-md max-h-[500px] object-contain transition-all duration-300"
                  />
                ) : (
                  <div className="text-muted-foreground uppercase text-xs tracking-widest font-bold">No image available</div>
                )}
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 border transition-all ${
                        (currentImage || watch.image_url) === img 
                          ? "border-primary p-1 scale-105" 
                          : "border-border p-1 hover:border-muted-foreground opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Specifications & Delivery */}
        <section className="container px-4 md:px-8 py-8 md:py-12 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Specifications */}
            <div>
              <h3 className="text-2xl font-display font-bold tracking-wide text-foreground mb-6">
                SPECIFICATIONS
              </h3>
              <div className="divide-y divide-border">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between py-3">
                    <span className="text-sm text-muted-foreground">{spec.label}</span>
                    <span className="text-sm text-foreground font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Returns */}
            <div>
              <h3 className="text-2xl font-display font-bold tracking-wide text-foreground mb-6">
                DELIVERY & RETURNS
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  StatusWatch are confident that you will be delighted with the quality of our products. 
                  However, we understand that there can be exceptions. It is therefore important that you 
                  inspect your product(s) promptly upon receipt and check for any defects.
                </p>
                <p>
                  If you do notice any issues, please notify us within 7 working days from the day after 
                  the delivery date, and return any faulty product to us within 14 working days from the 
                  date of delivery.
                </p>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 border border-border flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">AUTHENTICITY GUARANTEE</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We guarantee that all watches displayed on our website are authentic.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 border border-border flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">FAIR PRICING</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We base our estimations and pricing on the market data and historical evidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="border-t border-border">
            <div className="container px-4 md:px-8 py-10 md:py-14">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold tracking-wide text-foreground">
                  YOU MAY ALSO LIKE
                </h3>
                <Link
                  to="/catalog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                >
                  VIEW ALL →
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                  >
                    <WatchCard watch={rec} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <BuyModal
        open={buyOpen}
        onOpenChange={setBuyOpen}
        watch={{
          brand: watch.brand,
          model: watch.model,
          reference: watch.reference,
          price: watch.price,
          currency: watch.currency,
          id: watch.id,
        }}
      />
    </div>
  );
};

export default WatchDetail;
