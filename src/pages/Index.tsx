import { useRef, useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WatchCard from "@/components/WatchCard";
import CollectionFilters, { type Filters } from "@/components/CollectionFilters";
import watchHero from "@/assets/watch-hero.png";
import type { Tables } from "@/integrations/supabase/types";

const emptyFilters: Filters = {
  brands: [], priceRange: null, sizes: [], caseMaterials: [], straps: [], complications: [], conditions: [],
};

const sizeToRange = (s: string): [number, number] => {
  if (s === "Under 36mm") return [0, 36];
  if (s === "36–39mm") return [36, 39];
  if (s === "40–42mm") return [40, 42];
  if (s === "43–45mm") return [43, 45];
  return [45, Infinity];
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const watchY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const watchRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 25, 45]);
  const watchScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 1.3, 1.5, 0.9]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);

  const { data: allWatches = [], isLoading } = useQuery({
    queryKey: ["watches-home"],
    queryFn: async () => {
      const all: Tables<"watches">[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("watches")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) {
          console.error("Error fetching watches:", error);
          throw error;
        }

        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at-desc");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [visibleCount, setVisibleCount] = useState(50);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset pagination when filters or search change
  useEffect(() => {
    setVisibleCount(50);
  }, [search, sortBy, filters]);

  const displayedWatches = useMemo(() => {
    let result = allWatches;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.brand.toLowerCase().includes(q) ||
          w.model.toLowerCase().includes(q) ||
          (w.reference?.toLowerCase().includes(q) ?? false)
      );
    }

    // Filters
    if (filters.brands.length)
      result = result.filter((w) => filters.brands.includes(w.brand));
    if (filters.priceRange)
      result = result.filter((w) => w.price >= filters.priceRange![0] && w.price <= filters.priceRange![1]);
    if (filters.sizes.length)
      result = result.filter((w) => {
        if (!w.case_diameter_mm) return false;
        return filters.sizes.some((s) => {
          const [min, max] = sizeToRange(s);
          return w.case_diameter_mm! >= min && w.case_diameter_mm! <= max;
        });
      });
    if (filters.caseMaterials.length)
      result = result.filter((w) => w.case_material && filters.caseMaterials.includes(w.case_material));
    if (filters.straps.length)
      result = result.filter((w) => w.strap && filters.straps.includes(w.strap));
    if (filters.complications.length)
      result = result.filter((w) => w.complications && filters.complications.includes(w.complications));
    if (filters.conditions.length)
      result = result.filter((w) => w.condition && filters.conditions.includes(w.condition));

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "brand-asc": return a.brand.localeCompare(b.brand);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [allWatches, search, sortBy, filters]);

  const pagedWatches = useMemo(() => {
    return displayedWatches.slice(0, visibleCount);
  }, [displayedWatches, visibleCount]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedWatches.length > visibleCount) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [displayedWatches.length, visibleCount]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Full-screen Hero */}
        <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
          </div>


          <div className="container px-4 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Text */}
              <motion.div style={{ opacity: textOpacity, y: textY }}>
                <motion.p
                  className="text-sm tracking-ultra-wide text-muted-foreground mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  LUXURY TIMEPIECES
                </motion.p>
                <motion.h2
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold text-foreground leading-[0.9]"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Curated<br />Collection
                </motion.h2>
                <motion.p
                  className="text-lg text-muted-foreground mt-6 max-w-md leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  Discover our handpicked selection of the world's finest watches.
                  Every piece authenticated and guaranteed.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <Link
                    to="/catalog"
                    className="inline-block mt-8 bg-primary text-primary-foreground px-10 py-4 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
                  >
                    EXPLORE COLLECTION
                  </Link>
                </motion.div>
              </motion.div>

              {/* Hero Watch - Flying Animation */}
              <motion.div
                className="flex justify-center mt-4 lg:mt-0"
                style={{ y: watchY, rotate: watchRotate, scale: watchScale }}
              >
                <motion.img
                  src={watchHero}
                  alt="Luxury watch"
                  className="w-full max-w-xs sm:max-w-sm lg:max-w-lg drop-shadow-2xl"
                  initial={{ opacity: 0, y: 80, rotate: -10, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.3,
                    type: "spring",
                    stiffness: 60,
                    damping: 12,
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs tracking-widest text-muted-foreground">SCROLL</span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </section>

        {/* Features Strip */}
        <section className="border-y border-border bg-secondary/30">
          <div className="container px-4 md:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "AUTHENTICITY", desc: "Every watch verified by experts" },
                { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "FAIR PRICING", desc: "Market-based transparent pricing" },
                { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", title: "SECURE SHIPPING", desc: "Insured worldwide delivery" },
              ].map((f) => (
                <div key={f.title} className="text-center">
                  <div className="w-14 h-14 mx-auto border border-border flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold tracking-wide text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid - Infinite Scroll */}
        <section className="container px-4 md:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-wide text-foreground">
              OUR COLLECTION
            </h2>
            <Link
              to="/catalog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              VIEW ALL →
            </Link>
          </div>

          <CollectionFilters
            watches={allWatches}
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={filters}
            onFiltersChange={setFilters}
          />

          <div className="flex items-center gap-2 my-6">
            <span className="text-sm text-muted-foreground">{displayedWatches.length} watches</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-secondary w-1/3" />
                    <div className="h-4 bg-secondary w-2/3" />
                    <div className="h-5 bg-secondary w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedWatches.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {pagedWatches.map((watch, i) => (
                <motion.div
                  key={watch.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                >
                  <WatchCard watch={watch} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No watches match your filters</p>
              <button 
                onClick={() => { setSearch(""); setFilters(emptyFilters); }} 
                className="text-sm text-primary mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {displayedWatches.length > visibleCount && (
            <div ref={loadMoreRef} className="mt-12 py-10 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-xs text-muted-foreground tracking-widest">LOADING MORE WATCHES...</p>
            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
