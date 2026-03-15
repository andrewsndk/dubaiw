import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jfkppqryqsshuxbxjkxa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma3BwcXJ5cXNzaHV4Ynhqa3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNTEsImV4cCI6MjA4ODYzNTE1MX0.L2UfXiTweSWB7z2XN4QH17J1SydOcnKnK26hvMdhfG4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const watch = {
    brand: "Rolex",
    model: "Daytona",
    price: 10000,
    currency: "AED",
    condition: "Brand New",
    status: "available",
  };
  console.log("Inserting...", watch);
  const { error } = await supabase.from("watches").insert([watch]);
  console.log("Insert Error:", error);
  
  const { data } = await supabase.from("watches").select("*");
  console.log("Data in db:", data);
}

check();
