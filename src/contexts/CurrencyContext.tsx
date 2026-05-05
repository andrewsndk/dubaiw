import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "AED", "GBP", "CHF", "UAH"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  AED: "د.إ",
  GBP: "£",
  CHF: "CHF",
  UAH: "₴",
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (amount: number, from: string) => number;
  formatPrice: (amount: number, from: string) => string;
  symbol: string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("display-currency");
    return SUPPORTED_CURRENCIES.includes(saved as Currency) ? (saved as Currency) : "USD";
  });
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("display-currency", currency);
  }, [currency]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        setRates(data.rates);
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const convert = useCallback(
    (amount: number, from: string) => {
      if (!rates || from === currency) return amount;
      const fromRate = rates[from] ?? 1;
      const toRate = rates[currency] ?? 1;
      return Math.round(amount / fromRate * toRate);
    },
    [rates, currency]
  );

  const formatPrice = useCallback(
    (_amount: number, _from: string) => {
      return "Price on request";
    },
    []
  );

  const setCurrency = useCallback((c: Currency) => setCurrencyState(c), []);

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, convert, formatPrice, symbol: CURRENCY_SYMBOLS[currency], loading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
