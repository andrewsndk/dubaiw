import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Watch {
  brand: string;
  price: number;
  case_diameter_mm: number | null;
  case_material: string | null;
  strap: string | null;
  complications: string | null;
  condition: string | null;
}

interface Filters {
  brands: string[];
  priceRange: [number, number] | null;
  sizes: string[];
  caseMaterials: string[];
  straps: string[];
  complications: string[];
  conditions: string[];
}

interface CollectionFiltersProps {
  watches: Watch[];
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}

const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: "Under 10,000 AED", range: [0, 10000] },
  { label: "10,000 – 50,000 AED", range: [10000, 50000] },
  { label: "50,000 – 100,000 AED", range: [50000, 100000] },
  { label: "100,000 – 500,000 AED", range: [100000, 500000] },
  { label: "Over 500,000 AED", range: [500000, Infinity] },
];

const SIZE_RANGES = ["Under 36mm", "36–39mm", "40–42mm", "43–45mm", "Over 45mm"];

function getUniqueValues(watches: Watch[], key: keyof Watch): string[] {
  const vals = watches
    .map((w) => w[key])
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map(v => v!.trim());
  return [...new Set(vals)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
}

const CollectionFilters = ({
  watches,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  filters,
  onFiltersChange,
}: CollectionFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(() => getUniqueValues(watches, "brand"), [watches]);
  const caseMaterials = useMemo(() => getUniqueValues(watches, "case_material"), [watches]);
  const straps = useMemo(() => getUniqueValues(watches, "strap"), [watches]);
  const complications = useMemo(() => getUniqueValues(watches, "complications"), [watches]);
  const conditions = useMemo(() => getUniqueValues(watches, "condition"), [watches]);

  const activeCount =
    filters.brands.length +
    (filters.priceRange ? 1 : 0) +
    filters.sizes.length +
    filters.caseMaterials.length +
    filters.straps.length +
    filters.complications.length +
    filters.conditions.length;

  const toggleArrayFilter = (
    key: keyof Pick<Filters, "brands" | "sizes" | "caseMaterials" | "straps" | "complications" | "conditions">,
    value: string
  ) => {
    const arr = filters[key];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const clearAll = () => {
    onFiltersChange({
      brands: [],
      priceRange: null,
      sizes: [],
      caseMaterials: [],
      straps: [],
      complications: [],
      conditions: [],
    });
  };

  const CheckItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`text-left text-sm py-1.5 px-2 rounded transition-colors ${
        checked ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Search + Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search brand, model, reference..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground transition-colors rounded-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-border bg-background text-foreground text-sm py-3 px-4 focus:outline-none rounded-none"
          >
            <option value="created_at-desc">Newest first</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="brand-asc">Brand: A → Z</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border border-border px-4 py-3 text-sm transition-colors ${
              showFilters || activeCount > 0 ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-secondary"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filters chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.brands.map((b) => (
            <Chip key={b} label={b} onRemove={() => toggleArrayFilter("brands", b)} />
          ))}
          {filters.priceRange && (
            <Chip
              label={PRICE_RANGES.find((p) => p.range[0] === filters.priceRange![0])?.label ?? "Price"}
              onRemove={() => onFiltersChange({ ...filters, priceRange: null })}
            />
          )}
          {filters.caseMaterials.map((v) => (
            <Chip key={v} label={v} onRemove={() => toggleArrayFilter("caseMaterials", v)} />
          ))}
          {filters.straps.map((v) => (
            <Chip key={v} label={v} onRemove={() => toggleArrayFilter("straps", v)} />
          ))}
          {filters.conditions.map((v) => (
            <Chip key={v} label={v} onRemove={() => toggleArrayFilter("conditions", v)} />
          ))}
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline">
            Clear all
          </button>
        </div>
      )}

      {/* Accordion Filters */}
      {showFilters && (
        <div className="border border-border bg-background p-4">
          <Accordion type="multiple" className="w-full">
            {brands.length > 0 && (
              <AccordionItem value="brand">
                <AccordionTrigger className="text-sm font-semibold">Brand</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {brands.map((b) => (
                      <CheckItem key={b} label={b} checked={filters.brands.includes(b)} onChange={() => toggleArrayFilter("brands", b)} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="price">
              <AccordionTrigger className="text-sm font-semibold">Price, AED</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-0.5">
                  {PRICE_RANGES.map((p) => (
                    <CheckItem
                      key={p.label}
                      label={p.label}
                      checked={filters.priceRange?.[0] === p.range[0]}
                      onChange={() =>
                        onFiltersChange({
                          ...filters,
                          priceRange: filters.priceRange?.[0] === p.range[0] ? null : p.range,
                        })
                      }
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="size">
              <AccordionTrigger className="text-sm font-semibold">Size</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-0.5">
                  {SIZE_RANGES.map((s) => (
                    <CheckItem key={s} label={s} checked={filters.sizes.includes(s)} onChange={() => toggleArrayFilter("sizes", s)} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {caseMaterials.length > 0 && (
              <AccordionItem value="case_material">
                <AccordionTrigger className="text-sm font-semibold">Case material</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {caseMaterials.map((v) => (
                      <CheckItem key={v} label={v} checked={filters.caseMaterials.includes(v)} onChange={() => toggleArrayFilter("caseMaterials", v)} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {straps.length > 0 && (
              <AccordionItem value="strap">
                <AccordionTrigger className="text-sm font-semibold">Strap</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {straps.map((v) => (
                      <CheckItem key={v} label={v} checked={filters.straps.includes(v)} onChange={() => toggleArrayFilter("straps", v)} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {complications.length > 0 && (
              <AccordionItem value="complications">
                <AccordionTrigger className="text-sm font-semibold">Complications</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {complications.map((v) => (
                      <CheckItem key={v} label={v} checked={filters.complications.includes(v)} onChange={() => toggleArrayFilter("complications", v)} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {conditions.length > 0 && (
              <AccordionItem value="condition">
                <AccordionTrigger className="text-sm font-semibold">Condition</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {conditions.map((v) => (
                      <CheckItem key={v} label={v} checked={filters.conditions.includes(v)} onChange={() => toggleArrayFilter("conditions", v)} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
};

const Chip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-destructive">
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default CollectionFilters;
export type { Filters };
