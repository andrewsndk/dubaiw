import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://jfkppqryqsshuxbxjkxa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma3BwcXJ5cXNzaHV4Ynhqa3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNTEsImV4cCI6MjA4ODYzNTE1MX0.L2UfXiTweSWB7z2XN4QH17J1SydOcnKnK26hvMdhfG4"; // Anon Key
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
      const { data, error } = await supabase.from("watches").select('*').limit(1);
      console.log("update test", data);
      
      const { error: err2, data: checkData } = await supabase.from("watches").update({ status: 'on_order'}).eq('id', data[0].id).select();
      console.log('update result anon: ', err2, checkData);
}
check();
