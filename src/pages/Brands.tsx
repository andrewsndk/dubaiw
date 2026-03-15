import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const Brands = () => {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const { data: watches, isLoading } = useQuery({
    queryKey: ["watches-brands"],
    queryFn: async () => {
      const all: { brand: string }[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("watches")
          .select("brand")
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

  const brandCounts = useMemo(() => {
    if (!watches) return new Map<string, number>();
    const map = new Map<string, number>();
    watches.forEach((w) => {
      const normalizedBrand = w.brand?.trim() || "Unknown";
      map.set(normalizedBrand, (map.get(normalizedBrand) || 0) + 1);
    });
    return map;
  }, [watches]);

  const sortedBrands = useMemo(
    () => [...brandCounts.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base', numeric: true })),
    [brandCounts]
  );

  const filteredBrands = useMemo(
    () =>
      activeLetter
        ? sortedBrands.filter(([name]) => name[0].toUpperCase() === activeLetter)
        : sortedBrands,
    [sortedBrands, activeLetter]
  );

  const availableLetters = useMemo(
    () => new Set(sortedBrands.map(([name]) => name[0].toUpperCase())),
    [sortedBrands]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-10">
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-wide text-foreground mb-8">
          BRANDS
        </h2>

        {/* Alphabet navigation */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-10">
          <button
            onClick={() => setActiveLetter(null)}
            className={`px-3 py-1.5 text-sm font-medium border transition-colors ${
              activeLetter === null
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All brands
          </button>
          {ALPHABET.map((letter) => {
            const available = availableLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => available && setActiveLetter(letter)}
                disabled={!available}
                className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors ${
                  activeLetter === letter
                    ? "bg-foreground text-background"
                    : available
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/30 cursor-not-allowed"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-6 bg-secondary animate-pulse rounded w-3/4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2">
            {filteredBrands.map(([name, count]) => (
              <Link
                key={name}
                to={`/catalog?brand=${encodeURIComponent(name)}`}
                className="group flex items-baseline gap-2 py-1.5 transition-colors"
              >
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {name}
                </span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredBrands.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No brands found</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Brands;
