import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import WatchDetail from "./pages/WatchDetail";
import Brands from "./pages/Brands";
import About from "./pages/About";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import ImportPage from "./pages/ImportPage";
import NotFound from "./pages/NotFound";
import { CurrencyProvider } from "./contexts/CurrencyContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/watch/:id" element={<WatchDetail />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/about" element={<About />} />
          <Route path="/private-dashboard" element={<Admin />} />
          <Route path="/private-dashboard/login" element={<AdminLogin />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
