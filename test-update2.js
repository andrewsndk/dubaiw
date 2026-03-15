import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://jfkppqryqsshuxbxjkxa.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma3BwcXJ5cXNzaHV4Ynhqa3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNTEsImV4cCI6MjA4ODYzNTE1MX0.L2UfXiTweSWB7z2XN4QH17J1SydOcnKnK26hvMdhfG4";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
      const { data } = await supabase.from('watches').select('id, brand, status').limit(2);
      if (!data?.length) {
         console.log('No watches found!');
         return;
      }
      console.log('Got watch:', data[0]);
      
      const { error: err2, data: checkData } = await supabase.from("watches").update({ status: 'available'}).eq('id', data[0].id).select();
      console.log('update result: ', err2, checkData);
}
check();
