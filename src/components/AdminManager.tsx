import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";

const AdminManager = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at");
      if (error) throw error;
      // Fetch emails for each user
      const enriched = await Promise.all(
        data.map(async (r: any) => {
          // We can't query auth.users directly, so we'll show user_id
          return { ...r };
        })
      );
      return enriched;
    },
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      // Sign up the new admin user via edge function or directly
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Failed to create user");

      // Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: signUpData.user.id, role: "admin" as any });
      if (roleError) throw roleError;

      toast.success(`Admin account created for ${email}`);
      setEmail("");
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleRemoveAdmin = async (roleId: string) => {
    if (!confirm("Remove this admin?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Admin removed");
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    }
  };

  return (
    <div className="border border-border p-6">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">Manage Admins</h3>

      <form onSubmit={handleCreateAdmin} className="flex gap-3 mb-6 flex-wrap">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-border bg-background text-foreground px-4 py-2 text-sm focus:outline-none focus:border-foreground flex-1 min-w-[200px]"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-border bg-background text-foreground px-4 py-2 text-sm focus:outline-none focus:border-foreground flex-1 min-w-[200px]"
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" /> {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : admins && admins.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">User ID</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Role</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a: any) => (
              <tr key={a.id} className="border-b border-border">
                <td className="py-2 px-2 text-foreground font-mono text-xs">{a.user_id}</td>
                <td className="py-2 px-2">
                  <span className={`text-xs px-2 py-1 ${a.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}>
                    {a.role}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  {a.role !== "super_admin" && (
                    <button
                      onClick={() => handleRemoveAdmin(a.id)}
                      className="p-1 hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted-foreground text-sm">No admin accounts found.</p>
      )}
    </div>
  );
};

export default AdminManager;
