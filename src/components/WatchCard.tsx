import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";

interface WatchCardProps {
  watch: Tables<"watches">;
}

const WatchCard = ({ watch }: WatchCardProps) => {
  const { formatPrice } = useCurrency();
  return (
    <Link
      to={`/watch/${watch.id}`}
      className="group block bg-background hover:shadow-xl hover:shadow-foreground/5 transition-all duration-300"
    >
      <div className="aspect-square flex items-center justify-center overflow-hidden p-4 sm:p-6 relative">
        {watch.status === "on_order" && (
          <Badge className="absolute top-2 left-2 z-10 bg-yellow-500 text-yellow-950 border-yellow-500 hover:bg-yellow-500 text-[10px] sm:text-xs rounded-sm">ON ORDER</Badge>
        )}
        {watch.status === "out_of_stock" && (
          <Badge className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground border-destructive hover:bg-destructive text-[10px] sm:text-xs rounded-sm">OUT OF STOCK</Badge>
        )}
        {watch.image_url ? (
          <img
            src={watch.image_url}
            alt={`${watch.brand} ${watch.model}`}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="text-muted-foreground text-sm">No image</div>
        )}
      </div>
      <div className="p-2 sm:p-4 border-t border-transparent group-hover:border-border transition-colors">
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-foreground">{watch.brand.toUpperCase()}</p>
        <p className="text-xs sm:text-sm text-foreground mt-0.5 line-clamp-2 h-8 sm:h-10">{watch.model.toUpperCase()}</p>
        <p className="text-sm sm:text-base font-semibold mt-1 sm:mt-2 text-foreground">
          {watch.price > 0 ? formatPrice(watch.price, watch.currency) : "PRICE ON REQUEST"}
        </p>
        <div className="flex items-center justify-between mt-1 sm:mt-2">
          <span className="text-[10px] sm:text-xs border border-border px-1 sm:px-2 py-0.5 text-muted-foreground">
            {watch.condition?.toUpperCase()}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
            {watch.box && watch.papers ? "BOX & PAPERS" : watch.box ? "BOX" : watch.papers ? "PAPERS" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default WatchCard;
