import { useState } from "react";
import { useNavigate } from "react-router-dom";
import illusTiramisu from "@/assets/illus-tiramisu-slice.png";
import heroBrushAbstract from "@/assets/hero-brush-abstract.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    // TODO: call supabase.auth.signInWithPassword here
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-outfit">
      <img src={heroBrushAbstract} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-none opacity-20 pointer-events-none select-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, hsla(330, 35%, 54%, 0.04) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 w-full max-w-[440px] mx-auto px-6">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img src={illusTiramisu} alt="Tiramisup" className="w-10 h-10 object-contain" />
          <span className="font-black text-xl text-foreground">Tiramisup</span>
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-t-lg border border-border/40">
          <h2 className="font-syne text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-foreground/50 mb-6">Log in to your Tiramisup account.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all placeholder:text-foreground/30" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all placeholder:text-foreground/30" />
            </div>
            {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            <button type="submit" className="w-full bg-charcoal text-primary-foreground py-3.5 rounded-xl text-sm font-black hover:-translate-y-0.5 hover:shadow-t-md transition-all active:scale-[0.98] cursor-pointer border-none">Log in →</button>
          </form>

          <button className="w-full text-sm text-p700 font-medium bg-transparent border-none cursor-pointer hover:text-p800 transition-colors mt-4">Forgot password?</button>
        </div>

        <p className="text-center text-sm text-foreground/50 mt-6">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-p700 font-bold bg-transparent border-none cursor-pointer hover:text-p800 transition-colors underline">Sign up</button>
        </p>
      </div>
    </div>
  );
}
