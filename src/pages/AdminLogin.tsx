import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/private-dashboard");
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/private-dashboard");
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-8">ADMIN LOGIN</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:border-foreground"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:border-foreground"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
