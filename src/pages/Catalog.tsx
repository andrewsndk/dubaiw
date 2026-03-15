import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WatchCard from "@/components/WatchCard";

const Catalog = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at-desc");
  const [visibleCount, setVisibleCount] = useState(50);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset pagination when search or sort changes
  useEffect(() => {
    setVisibleCount(50);
  }, [search, sortBy]);

  const { data: watches, isLoading } = useQuery({
    queryKey: ["watches"],
    queryFn: async () => {
      const all: any[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("watches")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  const filtered = watches?.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.brand.toLowerCase().includes(q) ||
      w.model.toLowerCase().includes(q) ||
      (w.reference?.toLowerCase().includes(q) ?? false)
    );
  });

  const sorted = filtered?.sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "brand-asc": return a.brand.localeCompare(b.brand);
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const paged = sorted?.slice(0, visibleCount);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && (sorted?.length ?? 0) > visibleCount) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentRef = loadMoreRef.current;
    observer.observe(currentRef);
    return () => observer.unobserve(currentRef);
  }, [sorted?.length, visibleCount]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-wide text-foreground">
            BUY LUXURY WATCHES
          </h2>
          <span className="text-sm text-muted-foreground">{sorted?.length ?? 0} PCS</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter brand, reference, model, etc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border bg-background text-foreground text-sm py-3 px-4 focus:outline-none"
            >
              <option value="created_at-desc">New positions</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="brand-asc">Brand: A to Z</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-border animate-pulse">
                <div className="aspect-square bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary w-1/3" />
                  <div className="h-4 bg-secondary w-2/3" />
                  <div className="h-5 bg-secondary w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : paged && paged.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {paged.map((watch) => (
              <WatchCard key={watch.id} watch={watch} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground mt-2">Add watches through the admin panel</p>
          </div>
        )}

        {sorted && sorted.length > visibleCount && (
          <div ref={loadMoreRef} className="mt-12 py-10 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-xs text-muted-foreground tracking-widest">LOADING MORE WATCHES...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
