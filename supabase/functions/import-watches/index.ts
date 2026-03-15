import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parsePrice(priceStr: string): number | null {
  const cleaned = priceStr.replace(/[^\d]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

function parseCondition(data: string): string {
  const d = data.trim().toUpperCase();
  if (d === "BRAND NEW") return "Brand New";
  if (d === "UNWORN") return "Unworn";
  if (d === "PERFECT") return "Perfect";
  if (d === "MINT") return "Mint";
  if (d === "EXCELLENT") return "Excellent";
  if (d === "GOOD") return "Good";
  return data.trim() || "Brand New";
}

function hasBoxAndPapers(data: string): { box: boolean; papers: boolean } {
  const cleaned = data.replace(/\s+/g, " ").trim().toUpperCase();
  const hasBox = cleaned.includes("BOX");
  const hasPapers = cleaned.includes("PAPERS");
  return { box: hasBox, papers: hasPapers };
}

interface ColumnMap {
  price: number;
  brand: number;
  model: number;
  condition: number;
  boxPapers: number;
  image: number;
  ref: number;
  sex: number;
  movement: number;
  diameter: number;
  material: number;
  strap: number;
  complications: number;
  conditionReport: number;
  waterproof: number;
  caliber: number;
  sku: number;
}

function detectColumns(headerCols: string[]): ColumnMap | null {
  const map: Partial<ColumnMap> = {};
  
  for (let i = 0; i < headerCols.length; i++) {
    const col = headerCols[i].toLowerCase().trim().replace(/^\uFEFF/, "");
    
    if (col === "price") map.price = i;
    else if (col === "brand") map.brand = i;
    else if (col === "name" || col === "model") map.model = i;
    else if (col === "image" || col === "image_url") map.image = i;
    else if (col === "ref") map.ref = i;
    else if (col === "sex") map.sex = i;
    else if (col === "movement") map.movement = i;
    else if (col === "case diametr, mm" || col === "case_diameter_mm") map.diameter = i;
    else if (col === "case material" || col === "case_material") map.material = i;
    else if (col === "strap") map.strap = i;
    else if (col === "complications") map.complications = i;
    else if (col === "condition report" || col === "condition_report") map.conditionReport = i;
    else if (col === "waterproof") map.waterproof = i;
    else if (col === "caliber") map.caliber = i;
    else if (col === "sku") map.sku = i;
  }
  
  // Find condition and box/papers columns (data, data2, data3, data4)
  const dataColumns: number[] = [];
  for (let i = 0; i < headerCols.length; i++) {
    const col = headerCols[i].toLowerCase().trim();
    if (col.startsWith("data")) {
      dataColumns.push(i);
    }
  }
  
  if (map.price === undefined || map.brand === undefined || map.model === undefined) {
    return null;
  }
  
  // Condition is usually in first or second data column that has condition text
  // Box/papers is usually in last data column before image
  if (dataColumns.length >= 1) {
    map.condition = dataColumns[0]; // Will check content later
    map.boxPapers = dataColumns[dataColumns.length - 1];
  }
  
  if (map.image === undefined) map.image = -1;
  if (map.condition === undefined) map.condition = -1;
  if (map.boxPapers === undefined) map.boxPapers = -1;
  if (map.ref === undefined) map.ref = -1;
  if (map.sex === undefined) map.sex = -1;
  if (map.movement === undefined) map.movement = -1;
  if (map.diameter === undefined) map.diameter = -1;
  if (map.material === undefined) map.material = -1;
  if (map.strap === undefined) map.strap = -1;
  if (map.complications === undefined) map.complications = -1;
  if (map.conditionReport === undefined) map.conditionReport = -1;
  if (map.waterproof === undefined) map.waterproof = -1;
  if (map.caliber === undefined) map.caliber = -1;
  if (map.sku === undefined) map.sku = -1;
  
  return map as ColumnMap;
}

function extractConditionFromRow(cols: string[], dataColumns: number[]): string {
  // Look through data columns for condition keywords
  const conditionKeywords = ["BRAND NEW", "UNWORN", "PERFECT", "MINT", "EXCELLENT", "GOOD"];
  
  for (const idx of dataColumns) {
    const val = (cols[idx] || "").trim().toUpperCase();
    if (conditionKeywords.includes(val)) {
      return parseCondition(cols[idx]);
    }
  }
  
  return "Brand New";
}

function extractBoxPapersFromRow(cols: string[], dataColumns: number[]): { box: boolean; papers: boolean } {
  // Look through data columns for box/papers info
  for (const idx of dataColumns) {
    const val = (cols[idx] || "").toUpperCase();
    if (val.includes("BOX") || val.includes("PAPERS")) {
      return hasBoxAndPapers(cols[idx]);
    }
  }
  
  return { box: true, papers: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { csv, skipDuplicates = true } = await req.json();
    if (!csv) {
      return new Response(JSON.stringify({ error: "No CSV provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lines = csv.split("\n").filter((l: string) => l.trim());
    if (lines.length < 2) {
      return new Response(JSON.stringify({ error: "CSV must have header and data rows" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse header to detect column positions
    const headerCols = parseCsvLine(lines[0]);
    const columnMap = detectColumns(headerCols);
    
    if (!columnMap) {
      return new Response(JSON.stringify({ error: "Could not detect required columns (price, brand, name/model)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find all data columns for condition/box extraction
    const dataColumns: number[] = [];
    for (let i = 0; i < headerCols.length; i++) {
      const col = headerCols[i].toLowerCase().trim();
      if (col.startsWith("data")) {
        dataColumns.push(i);
      }
    }

    const dataLines = lines.slice(1);
    const watches: any[] = [];
    let skipped = 0;

    for (const line of dataLines) {
      const cols = parseCsvLine(line);
      
      const priceStr = cols[columnMap.price]?.trim() || "";
      const price = parsePrice(priceStr);
      const isOnRequest = !price; // "On request" or empty price

      const brand = cols[columnMap.brand]?.trim() || "";
      const model = cols[columnMap.model]?.trim() || "";
      if (!brand || !model) { skipped++; continue; }

      const condition = extractConditionFromRow(cols, dataColumns);
      const { box, papers } = extractBoxPapersFromRow(cols, dataColumns);
      
      let image_url = null;
      let additional_images = null;
      
      const rawImages = columnMap.image >= 0 ? cols[columnMap.image]?.trim() || "" : "";
      if (rawImages) {
        if (rawImages.includes(",")) {
          const allImgs = rawImages.split(",").map(u => u.trim()).filter(u => u.length > 0);
          image_url = allImgs[0] || null;
          additional_images = allImgs.slice(1).length > 0 ? allImgs.slice(1) : null;
        } else {
          image_url = rawImages;
        }
      }
      
      const reference = columnMap.ref >= 0 ? cols[columnMap.ref]?.trim() || null : null;
      const sex = columnMap.sex >= 0 ? cols[columnMap.sex]?.trim() || null : null;
      const movement = columnMap.movement >= 0 ? cols[columnMap.movement]?.trim() || null : null;
      const case_diameter_mm = columnMap.diameter >= 0 ? parseFloat(cols[columnMap.diameter]) || null : null;
      const case_material = columnMap.material >= 0 ? cols[columnMap.material]?.trim() || null : null;
      const strap = columnMap.strap >= 0 ? cols[columnMap.strap]?.trim() || null : null;
      const complications = columnMap.complications >= 0 ? cols[columnMap.complications]?.trim() || null : null;
      const condition_report = columnMap.conditionReport >= 0 ? cols[columnMap.conditionReport]?.trim() || null : null;
      const waterproof = columnMap.waterproof >= 0 ? cols[columnMap.waterproof]?.trim() || null : null;
      const caliber = columnMap.caliber >= 0 ? cols[columnMap.caliber]?.trim() || null : null;
      const sku = columnMap.sku >= 0 ? cols[columnMap.sku]?.trim() || null : null;

      watches.push({
        brand,
        model,
        price: isOnRequest ? 0 : price,
        currency: "AED",
        condition,
        box,
        papers,
        image_url,
        additional_images,
        reference,
        sex,
        movement,
        case_diameter_mm,
        case_material,
        strap,
        complications,
        condition_report,
        waterproof,
        caliber,
        sku,
        status: isOnRequest ? "on_order" : "available",
      });
    }

    // Check for duplicates if requested
    let duplicates = 0;
    let toInsert = watches;

    if (skipDuplicates) {
      const uniqueWatches: any[] = [];
      for (const w of watches) {
        const { data: existing } = await supabase
          .from("watches")
          .select("id")
          .eq("brand", w.brand)
          .eq("model", w.model)
          .eq("price", w.price)
          .limit(1);

        if (existing && existing.length > 0) {
          duplicates++;
        } else {
          uniqueWatches.push(w);
        }
      }
      toInsert = uniqueWatches;
    }

    // Batch insert in chunks of 500
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += 500) {
      const chunk = toInsert.slice(i, i + 500);
      const { data: insertedData, error } = await supabase.from("watches").insert(chunk).select();
      if (error) {
        console.error("Insert error at batch", i, error);
        return new Response(
          JSON.stringify({ error: error.message, inserted, total: toInsert.length }),
        );
      }
      inserted += chunk.length;
    }

    return new Response(
      JSON.stringify({ success: true, inserted, skipped, duplicates, total: dataLines.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
