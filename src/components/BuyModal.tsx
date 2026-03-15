import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const countryCodes = [
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+380", country: "Ukraine", flag: "🇺🇦" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

interface BuyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watch: {
    brand: string;
    model: string;
    reference?: string | null;
    price: number;
    currency: string;
    id: string;
  };
}

const BuyModal = ({ open, onOpenChange, watch }: BuyModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrency();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const watchUrl = `${window.location.origin}/watch/${watch.id}`;

      const { data, error } = await supabase.functions.invoke("send-inquiry", {
        body: {
          name: name.trim(),
          phone: phone.trim(),
          countryCode,
          watchBrand: watch.brand,
          watchModel: watch.model,
          watchRef: watch.reference,
          watchPrice: watch.price,
          watchCurrency: watch.currency,
          watchUrl,
        },
      });

      if (error) throw error;

      toast({ title: "Your inquiry has been sent!", description: "We will contact you shortly." });
      setName("");
      setPhone("");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send inquiry", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">
            BUY {watch.brand.toUpperCase()} {watch.model.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[140px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                required
                maxLength={15}
              />
            </div>
          </div>

          <div className="bg-secondary p-3 text-sm space-y-1">
            <p className="text-muted-foreground">Watch:</p>
            <p className="font-medium text-foreground">
              {watch.brand} {watch.model}
              {watch.reference && <span className="text-muted-foreground ml-2">Ref. {watch.reference}</span>}
            </p>
            <p className="font-bold text-foreground">
              {watch.price > 0 ? formatPrice(watch.price, watch.currency) : "PRICE ON REQUEST"}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Sending..." : "Send Inquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BuyModal;
