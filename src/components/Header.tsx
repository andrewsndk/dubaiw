import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      // Already on home — scroll smoothly to the collection section
      const section = document.getElementById("collection");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      navigate("/");
    }
  };

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

        <button onClick={handleLogoClick} className="absolute left-1/2 -translate-x-1/2 hover:opacity-70 transition-opacity">
          <h1 className="text-2xl md:text-3xl font-display tracking-ultra-wide font-semibold text-foreground">
            ANDII
          </h1>
        </button>

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
            <Link to="/admin" className="text-sm font-medium tracking-wide hover:opacity-70" onClick={() => setMenuOpen(false)}>
              ADMIN
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
