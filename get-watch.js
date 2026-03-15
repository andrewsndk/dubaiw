import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://jfkppqryqsshuxbxjkxa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma3BwcXJ5cXNzaHV4Ynhqa3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNTEsImV4cCI6MjA4ODYzNTE1MX0.L2UfXiTweSWB7z2XN4QH17J1SydOcnKnK26hvMdhfG4";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from("watches").select("*").eq("id", "4fbbb879-b9c9-42d2-9bd0-ea3ebae1908e").maybeSingle();
  console.log(JSON.stringify(data || error, null, 2));
}
check();
