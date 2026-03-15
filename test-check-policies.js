import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jfkppqryqsshuxbxjkxa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma3BwcXJ5cXNzaHV4Ynhqa3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTkxNTEsImV4cCI6MjA4ODYzNTE1MX0.L2UfXiTweSWB7z2XN4QH17J1SydOcnKnK26hvMdhfG4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    const email = "andriitkach2110@gmail.com";
    const password = "qwertyS21*SandakoV";
    
    // Create the test user just in case
    await supabase.auth.signUp({
        email, password
    });

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email, password
    });
    
    if (authError) {
        console.error("Auth err", authError);
        return;
    }
    
    console.log("Logged in!");
    
    // Need to give this user admin role
    const { data: watches } = await supabase.from("watches").select("*").limit(1);
    
    if (!watches?.length) {
        console.log("No watches to update.");
        return;
    }
    
    const w = watches[0];
    const { data, error } = await supabase.from("watches").update({ status: 'on_order' }).eq('id', w.id).select();
    console.log("Update via authenticated user:", error || data);
}

checkPolicies();
