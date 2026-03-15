import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, Upload, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import WatchForm from "@/components/WatchForm";
import AdminManager from "@/components/AdminManager";
import { Input } from "@/components/ui/input";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [editing, setEditing] = useState<Tables<"watches"> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showAdminManager, setShowAdminManager] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const csvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate("/admin/login");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session?.user?.id) return;
    setRoleLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setUserRole(null);
        } else {
          const roles = data.map((r: any) => r.role);
          setUserRole(roles.includes("super_admin") ? "super_admin" : roles.includes("admin") ? "admin" : null);
        }
        setRoleLoading(false);
      });
  }, [session?.user?.id]);

  const { data: watches, isLoading } = useQuery({
    queryKey: ["admin-watches"],
    queryFn: async () => {
      const allWatches: Tables<"watches">[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("watches")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allWatches.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return allWatches;
    },
    enabled: !!session && !!userRole,
  });

  const availableBrands = useMemo(() => {
    if (!watches) return [];
    const brands = Array.from(new Set(watches.map((w) => w.brand?.trim()).filter(Boolean)));
    return brands.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
  }, [watches]);

  const availableConditions = useMemo(() => {
    if (!watches) return [];
    const conditions = Array.from(new Set(watches.map((w) => w.condition?.trim()).filter((c): c is string => Boolean(c))));
    return conditions.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
  }, [watches]);

  const filteredWatches = useMemo(() => {
    if (!watches) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return watches.filter((w) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        w.brand.toLowerCase().includes(normalizedSearch) ||
        w.model.toLowerCase().includes(normalizedSearch) ||
        (w.reference ?? "").toLowerCase().includes(normalizedSearch) ||
        (w.sku ?? "").toLowerCase().includes(normalizedSearch);

      const matchesBrand = brandFilter === "all" || w.brand === brandFilter;
      const matchesCondition = conditionFilter === "all" || (w.condition ?? "") === conditionFilter;

      return matchesSearch && matchesBrand && matchesCondition;
    });
  }, [watches, searchTerm, brandFilter, conditionFilter]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleCount(100);
  }, [searchTerm, brandFilter, conditionFilter]);

  const pagedWatches = useMemo(() => {
    return filteredWatches.slice(0, visibleCount);
  }, [filteredWatches, visibleCount]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("watches").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("watches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success("Watch deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      // Delete in batches
      let deleted = 0;
      while (true) {
        const { data } = await supabase.from("watches").select("id").limit(500);
        if (!data || data.length === 0) break;
        const ids = data.map((w: any) => w.id);
        const { error } = await supabase.from("watches").delete().in("id", ids);
        if (error) throw error;
        deleted += ids.length;
      }
      return deleted;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success(`Deleted ${count} watches`);
      setShowDeleteAll(false);
      setDeleteConfirmText("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = async (data: TablesInsert<"watches">) => {
    if (editing) {
      const { error } = await supabase.from("watches").update(data).eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Watch updated");
    } else {
      const { error } = await supabase.from("watches").insert(data);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Watch added");
    }
    queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
    setShowForm(false);
    setEditing(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setImporting(true);
    let globalInserted = 0;
    let globalSkipped = 0;
    let globalDuplicates = 0;
    let totalFiles = files.length;

    try {
      for (let f = 0; f < files.length; f++) {
        const file = files[f];
        toast.info(`Processing file ${f + 1}/${totalFiles}: ${file.name}`);
        
        const text = await file.text();
        const lines = text.split("\n");
        const header = lines[0];
        const dataLines = lines.slice(1).filter(l => l.trim());
        
        const chunkSize = 300;
        for (let i = 0; i < dataLines.length; i += chunkSize) {
          const chunk = dataLines.slice(i, i + chunkSize);
          const csvChunk = header + "\n" + chunk.join("\n");
          
          const { data, error } = await supabase.functions.invoke("import-watches", {
            body: { csv: csvChunk, skipDuplicates: false },
          });
          
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          
          globalInserted += data.inserted || 0;
          globalSkipped += data.skipped || 0;
          globalDuplicates += data.duplicates || 0;
          
          if (dataLines.length > chunkSize) {
            toast.info(`[${file.name}] Progress: ${Math.min(i + chunkSize, dataLines.length)}/${dataLines.length} rows`);
          }
        }
      }
      
      toast.success(`Success! Imported ${globalInserted} watches from ${totalFiles} files. (${globalSkipped} skipped, ${globalDuplicates} duplicates)`);
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
    } catch (err: any) {
      toast.error("Import failed: " + err.message);
    }
    
    setImporting(false);
    if (csvRef.current) csvRef.current.value = "";
  };

  if (!session) return null;

  if (roleLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
            <button onClick={handleLogout} className="text-sm text-primary hover:underline">
              Sign out
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold tracking-wide text-foreground">ADMIN PANEL</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
                setShowAdminManager(false);
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add Watch
            </button>
            <input ref={csvRef} type="file" accept=".csv" multiple onChange={handleCsvImport} className="hidden" />
            <button
              onClick={() => csvRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 border border-border text-foreground px-4 py-2 text-sm hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> {importing ? "Importing..." : "Import CSV"}
            </button>
            <button
              onClick={() => setShowDeleteAll(true)}
              className="flex items-center gap-2 border border-destructive text-destructive px-4 py-2 text-sm hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete All
            </button>
            {userRole === "super_admin" && (
              <button
                onClick={() => {
                  setShowAdminManager(!showAdminManager);
                  setShowForm(false);
                }}
                className="flex items-center gap-2 border border-border text-foreground px-4 py-2 text-sm hover:bg-secondary transition-colors"
              >
                <Users className="w-4 h-4" /> Manage Admins
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-border text-foreground px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="mb-6 border border-border p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand, model, ref or SKU"
            />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All brands</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All conditions</option>
              {availableConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredWatches.length}</span> of{" "}
            <span className="font-medium text-foreground">{watches?.length ?? 0}</span> items
          </p>
        </div>

        {showAdminManager && userRole === "super_admin" && (
          <div className="mb-8">
            <AdminManager />
          </div>
        )}

        {showForm && (
          <div className="mb-8 border border-border p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">{editing ? "Edit Watch" : "Add New Watch"}</h3>
            <WatchForm
              watch={editing}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filteredWatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Image</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Brand</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Model</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Price</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Condition</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedWatches.map((w) => (
                  <tr key={w.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-2">
                      {w.image_url ? <img src={w.image_url} alt="" className="w-12 h-12 object-contain" /> : <div className="w-12 h-12 bg-secondary" />}
                    </td>
                    <td className="py-3 px-2 text-foreground font-medium">{w.brand}</td>
                    <td className="py-3 px-2 text-foreground">{w.model}</td>
                    <td className="py-3 px-2 text-foreground">
                      {w.price.toLocaleString()} {w.currency}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{w.condition}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => statusMutation.mutate({ id: w.id, status: (w as any).status === "on_order" ? "available" : "on_order" })}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                            (w as any).status === "on_order"
                              ? "bg-yellow-500 text-yellow-950"
                              : "bg-secondary text-muted-foreground hover:bg-yellow-500/20"
                          }`}
                        >
                          ON ORDER
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: w.id, status: (w as any).status === "out_of_stock" ? "available" : "out_of_stock" })}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                            (w as any).status === "out_of_stock"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-secondary text-muted-foreground hover:bg-destructive/20"
                          }`}
                        >
                          OUT OF STOCK
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(w);
                            setShowForm(true);
                          }}
                          className="p-2 hover:bg-secondary transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this watch?")) deleteMutation.mutate(w.id);
                          }}
                          className="p-2 hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredWatches.length > visibleCount && (
              <div className="mt-8 text-center pb-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 100)}
                  className="bg-background border border-border text-foreground px-10 py-4 text-sm font-medium tracking-wide hover:bg-secondary transition-colors"
                >
                  LOAD MORE ({filteredWatches.length - visibleCount} REMAINING)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No watches match the selected filters.</p>
          </div>
        )}
      </main>

      <AlertDialog open={showDeleteAll} onOpenChange={(open) => { setShowDeleteAll(open); if (!open) setDeleteConfirmText(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete All Watches
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>This will permanently delete <span className="font-bold text-foreground">{watches?.length ?? 0}</span> watches. This action cannot be undone.</p>
              <p>Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm:</p>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== "DELETE" || deleteAllMutation.isPending}
              onClick={(e) => { e.preventDefault(); deleteAllMutation.mutate(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleteAllMutation.isPending ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
