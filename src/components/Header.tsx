import { Link } from "react-router-dom";
import { Menu, Search, Heart, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { useCurrency, SUPPORTED_CURRENCIES, type Currency } from "@/contexts/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4 md:px-8">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity"
        >
          <Menu className="w-5 h-5" />
          <span className="text-sm font-medium tracking-wide hidden sm:inline">MENU</span>
        </button>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-2xl md:text-3xl font-display tracking-ultra-wide font-semibold text-foreground">
            ANDII
          </h1>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-xs sm:text-sm font-medium tracking-wide text-foreground hover:opacity-70 transition-opacity focus:outline-none">
              {currency}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {SUPPORTED_CURRENCIES.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => setCurrency(c as Currency)}
                  className={c === currency ? "font-bold bg-accent" : ""}
                >
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
            <MessageCircle className="w-5 h-5 text-foreground" />
          </a>
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
            <Send className="w-5 h-5 text-foreground" />
          </a>
          <Link to="/catalog" className="hover:opacity-70 transition-opacity">
            <Search className="w-5 h-5 text-foreground" />
          </Link>
          <button className="hover:opacity-70 transition-opacity">
            <Heart className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-background animate-fade-in">
          <div className="container px-4 md:px-8 py-4 flex flex-wrap gap-6">
            <Link to="/catalog" className="text-sm font-medium tracking-wide hover:opacity-70" onClick={() => setMenuOpen(false)}>
              WATCHES
            </Link>
            <Link to="/brands" className="text-sm font-medium tracking-wide hover:opacity-70" onClick={() => setMenuOpen(false)}>
              BRANDS
            </Link>
            <Link to="/about" className="text-sm font-medium tracking-wide hover:opacity-70" onClick={() => setMenuOpen(false)}>
              ABOUT US
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
