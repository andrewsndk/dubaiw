import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jfkppqryqsshuxbxjkxa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma3BwcXJ5cXNzaHV4Ynhqa3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNTEsImV4cCI6MjA4ODYzNTE1MX0.L2UfXiTweSWB7z2XN4QH17J1SydOcnKnK26hvMdhfG4"; // Anon key for simulation

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  // Let's first log in as the super admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "andriitkach2110@gmail.com", // Assuming this from our first steps or test
    password: "qwertyS21*SandakoV" // User's assumed password
  });
  
  // if login fails we will just see what happens
  if (authError) {
     console.log("Login err", authError);
     return;
  }
  
  const { data: watches } = await supabase.from("watches").select("*").limit(1);
  if (!watches?.length) {
    console.log("No watches found to test update on");
    return;
  }
  
  const idToUpdate = watches[0].id;
  console.log("Attempting to update watch:", idToUpdate);
  
  const { data, error } = await supabase.from("watches").update({ status: 'on_order' }).eq('id', idToUpdate).select();
  console.log("Update Error:", error);
  console.log("Update Data:", data);
}

testUpdate();
