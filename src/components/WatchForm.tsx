import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

interface WatchFormProps {
  watch: Tables<"watches"> | null;
  onSave: (data: TablesInsert<"watches">) => void;
  onCancel: () => void;
}

const WatchForm = ({ watch, onSave, onCancel }: WatchFormProps) => {
  const [form, setForm] = useState({
    brand: watch?.brand ?? "",
    model: watch?.model ?? "",
    reference: watch?.reference ?? "",
    price: watch?.price?.toString() ?? "",
    currency: watch?.currency ?? "AED",
    condition: watch?.condition ?? "Brand New",
    box: watch?.box ?? true,
    papers: watch?.papers ?? true,
    sex: watch?.sex ?? "Male",
    movement: watch?.movement ?? "",
    case_diameter_mm: watch?.case_diameter_mm?.toString() ?? "",
    case_material: watch?.case_material ?? "",
    strap: watch?.strap ?? "",
    complications: watch?.complications ?? "",
    condition_report: watch?.condition_report ?? "",
    waterproof: watch?.waterproof ?? "",
    caliber: watch?.caliber ?? "",
    sku: watch?.sku ?? "",
    image_url: watch?.image_url ?? "",
    additional_images: watch?.additional_images ?? [] as string[],
    featured: watch?.featured ?? false,
  });
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("watch-images").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("watch-images").getPublicUrl(path);
    const newUrl = urlData.publicUrl;
    
    if (!form.image_url) {
      setForm((f) => ({ ...f, image_url: newUrl }));
    } else {
      setForm((f) => ({ ...f, additional_images: [...f.additional_images, newUrl] }));
    }
    
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    
    // Split by comma in case user pasted multiple
    const urls = urlInput.split(",").map(u => u.trim()).filter(u => u.length > 0);
    
    setForm(f => {
      let mainUrl = f.image_url;
      let additional = [...f.additional_images];
      
      urls.forEach(url => {
        if (!mainUrl) {
          mainUrl = url;
        } else {
          additional.push(url);
        }
      });
      
      return { ...f, image_url: mainUrl, additional_images: additional };
    });
    
    setUrlInput("");
    toast.success(`Added ${urls.length} image(s)`);
  };

  const removeImage = (index: number) => {
    setForm(f => {
      if (index === -1) { // removing main image
        const nextMain = f.additional_images[0] || "";
        const nextAdditional = f.additional_images.slice(1);
        return { ...f, image_url: nextMain, additional_images: nextAdditional };
      } else {
        const nextAdditional = f.additional_images.filter((_, i) => i !== index);
        return { ...f, additional_images: nextAdditional };
      }
    });
  };

  const setAsMain = (index: number) => {
    setForm(f => {
      const currentMain = f.image_url;
      const newMain = f.additional_images[index];
      const newAdditional = f.additional_images.filter((_, i) => i !== index);
      if (currentMain) newAdditional.unshift(currentMain);
      
      return { ...f, image_url: newMain, additional_images: newAdditional };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.price) {
      toast.error("Brand, model and price are required");
      return;
    }
    onSave({
      brand: form.brand,
      model: form.model,
      reference: form.reference || null,
      price: parseFloat(form.price),
      currency: form.currency,
      condition: form.condition,
      box: form.box,
      papers: form.papers,
      sex: form.sex,
      movement: form.movement || null,
      case_diameter_mm: form.case_diameter_mm ? parseFloat(form.case_diameter_mm) : null,
      case_material: form.case_material || null,
      strap: form.strap || null,
      complications: form.complications || null,
      condition_report: form.condition_report || null,
      waterproof: form.waterproof || null,
      caliber: form.caliber || null,
      sku: form.sku || null,
      image_url: form.image_url || null,
      additional_images: form.additional_images.length > 0 ? form.additional_images : null,
      featured: form.featured,
    });
  };

  const inputClass = "w-full border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors";
  const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-4">
        <label className={labelClass}>Product Images</label>
        
        <div className="flex flex-wrap gap-4">
          {/* Main Image */}
          {form.image_url && (
            <div className="relative group w-32 h-32 border border-primary">
              <img src={form.image_url} alt="Main" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <span className="text-[10px] text-white font-bold bg-primary px-1">MAIN</span>
                <button 
                  type="button" 
                  onClick={() => removeImage(-1)}
                  className="text-xs text-white bg-destructive px-2 py-0.5"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Additional Images */}
          {form.additional_images.map((url, idx) => (
            <div key={idx} className="relative group w-32 h-32 border border-border">
              <img src={url} alt={`Additional ${idx}`} className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <button 
                  type="button" 
                  onClick={() => setAsMain(idx)}
                  className="text-xs text-white bg-primary px-2 py-0.5"
                >
                  Make Main
                </button>
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)}
                  className="text-xs text-white bg-destructive px-2 py-0.5"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Upload Button */}
          <div className="w-32 h-32 border border-dashed border-border flex flex-col items-center justify-center p-2 text-center">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="w-6 h-6 mx-auto mb-1" />
              <span className="text-[10px] uppercase font-bold">{uploading ? "..." : "Upload"}</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input 
            value={urlInput} 
            onChange={e => setUrlInput(e.target.value)} 
            placeholder="Paste image URL(s) or comma-separated list..." 
            className={inputClass}
          />
          <button 
            type="button" 
            onClick={handleAddUrl}
            className="bg-secondary text-foreground px-4 py-2 text-sm font-medium hover:bg-border transition-colors whitespace-nowrap"
          >
            Add URL
          </button>
        </div>
      </div>

      {/* Core Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Brand *</label>
          <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Model *</label>
          <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Reference</label>
          <input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Price *</label>
          <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className={inputClass}>
            <option value="AED">AED</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Condition</label>
          <select value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))} className={inputClass}>
            <option value="Brand New">Brand New</option>
            <option value="Unworn">Unworn</option>
            <option value="Perfect">Perfect</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Sex</label>
          <select value={form.sex} onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))} className={inputClass}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Movement</label>
          <input value={form.movement} onChange={(e) => setForm((f) => ({ ...f, movement: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Case Diameter (mm)</label>
          <input type="number" value={form.case_diameter_mm} onChange={(e) => setForm((f) => ({ ...f, case_diameter_mm: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Case Material</label>
          <input value={form.case_material} onChange={(e) => setForm((f) => ({ ...f, case_material: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Strap</label>
          <input value={form.strap} onChange={(e) => setForm((f) => ({ ...f, strap: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Complications</label>
          <input value={form.complications} onChange={(e) => setForm((f) => ({ ...f, complications: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Condition Report</label>
          <input value={form.condition_report} onChange={(e) => setForm((f) => ({ ...f, condition_report: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Waterproof</label>
          <input value={form.waterproof} onChange={(e) => setForm((f) => ({ ...f, waterproof: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Caliber</label>
          <input value={form.caliber} onChange={(e) => setForm((f) => ({ ...f, caliber: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SKU</label>
          <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className={inputClass} />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.box} onChange={(e) => setForm((f) => ({ ...f, box: e.target.checked }))} className="accent-primary" />
          <span className="text-sm text-foreground">Box included</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.papers} onChange={(e) => setForm((f) => ({ ...f, papers: e.target.checked }))} className="accent-primary" />
          <span className="text-sm text-foreground">Papers included</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
          <span className="text-sm text-foreground">Featured</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {watch ? "Update Watch" : "Add Watch"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-border text-foreground px-6 py-2 text-sm hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default WatchForm;
