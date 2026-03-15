const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, countryCode, watchBrand, watchModel, watchRef, watchPrice, watchCurrency, watchUrl } = await req.json();

    if (!name || !phone || !countryCode) {
      return new Response(JSON.stringify({ error: 'Name, phone and country code are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    const NOTIFICATION_EMAIL = Deno.env.get('NOTIFICATION_EMAIL');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram configuration');
      return new Response(JSON.stringify({ error: 'System configuration error: Missing Telegram credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fullPhone = `${countryCode}${phone}`;
    
    // HTML escaping to avoid Telegram parsing errors
    const escapeHtml = (text: string) => (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const message = `🕐 <b>New Watch Inquiry</b>\n\n` +
      `👤 <b>Name:</b> ${escapeHtml(name)}\n` +
      `📱 <b>Phone:</b> ${escapeHtml(fullPhone)}\n` +
      `⌚ <b>Watch:</b> ${escapeHtml(watchBrand)} ${escapeHtml(watchModel)}\n` +
      (watchRef ? `🔖 <b>Ref:</b> ${escapeHtml(watchRef)}\n` : '') +
      `💰 <b>Price:</b> ${watchPrice?.toLocaleString() || 0} ${escapeHtml(watchCurrency)}\n` +
      `🔗 <b>Link:</b> <a href="${watchUrl}">${escapeHtml(watchUrl)}</a>`;

    // Send Telegram message
    const telegramResult = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    );
    
    const telegramData = await telegramResult.json();
    
    if (!telegramResult.ok) {
        console.error('Telegram API error:', telegramData);
        throw new Error(`Telegram notification failed: ${telegramData.description || 'Unknown error'}`);
    }

    console.log('Successfully sent notification to Telegram');
    if (NOTIFICATION_EMAIL) {
        console.log('Should also notify email:', NOTIFICATION_EMAIL);
        // Note: For actual email sending, integration with Resend/SendGrid would be added here
    }

    return new Response(
      JSON.stringify({ success: true, telegramSent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Request processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
