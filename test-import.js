import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Using the keys from .env
const supabaseUrl = "https://jfkppqryqsshuxbxjkxa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma3BwcXJ5cXNzaHV4Ynhqa3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNTEsImV4cCI6MjA4ODYzNTE1MX0.L2UfXiTweSWB7z2XN4QH17J1SydOcnKnK26hvMdhfG4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImport() {
  const csv = `Brand,Model,Price,Data1
Rolex,Daytona,10000,Box Papers Brand New
Omega,Speedmaster,5000,Unworn`;

  console.log("Invoking edge function...");
  const { data, error } = await supabase.functions.invoke("import-watches", {
    body: { csv, skipDuplicates: false },
  });

  if (error) {
    console.error("Invoke Error:", error);
    return;
  }

  console.log("Invoke Data:", data);

  // let's fetch from table
  const { data: watches, error: dbError } = await supabase.from("watches").select("*");
  console.log("Watches in DB:", watches?.length);
  if (watches?.length) {
    console.log("Sample:", watches[0]);
  }
}

testImport();
