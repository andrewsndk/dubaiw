import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";

const ImportPage = () => {
  const [importing, setImporting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    setImporting(true);
    try {
      const response = await fetch("/import-data.csv");
      const csv = await response.text();
      
      // Split into chunks of ~500 lines to avoid payload limits
      const lines = csv.split("\n");
      const header = lines[0];
      const dataLines = lines.slice(1).filter(l => l.trim());
      
      let totalInserted = 0;
      let totalSkipped = 0;
      let totalDuplicates = 0;
      const chunkSize = 300;
      
      for (let i = 0; i < dataLines.length; i += chunkSize) {
        const chunk = dataLines.slice(i, i + chunkSize);
        const csvChunk = header + "\n" + chunk.join("\n");
        
        const { data, error } = await supabase.functions.invoke("import-watches", {
          body: { csv: csvChunk, skipDuplicates },
        });
        
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        totalInserted += data.inserted || 0;
        totalSkipped += data.skipped || 0;
        totalDuplicates += data.duplicates || 0;
        
        toast.info(`Progress: ${Math.min(i + chunkSize, dataLines.length)}/${dataLines.length} processed`);
      }
      
      setResult({ inserted: totalInserted, skipped: totalSkipped, duplicates: totalDuplicates });
      toast.success(`Done! Imported ${totalInserted}, skipped ${totalSkipped}, duplicates ${totalDuplicates}`);
    } catch (err: any) {
      toast.error("Import failed: " + err.message);
    }
    setImporting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-foreground">IMPORT WATCHES</h2>
          <p className="text-muted-foreground">Import all watches from the CSV file</p>
          <label className="flex items-center gap-2 justify-center text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(e) => setSkipDuplicates(e.target.checked)}
              className="accent-primary"
            />
            Skip duplicates
          </label>
          <button
            onClick={handleImport}
            disabled={importing}
            className="bg-primary text-primary-foreground px-8 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {importing ? "Importing... Please wait" : "Start Import"}
          </button>
          {result && (
            <div className="text-sm text-foreground">
              <p>✅ Inserted: {result.inserted}</p>
              <p>⏭ Skipped: {result.skipped}</p>
              <p>🔁 Duplicates: {result.duplicates}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ImportPage;
