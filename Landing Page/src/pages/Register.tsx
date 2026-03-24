import { useState } from "react";
import { useNavigate } from "react-router-dom";
import illusTiramisu from "@/assets/illus-tiramisu-slice.png";
import heroBrushAbstract from "@/assets/hero-brush-abstract.png";

const PRODUCT_TYPES = ["SaaS", "Mobile App", "E-commerce", "Other"];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [productType, setProductType] = useState("SaaS");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) { setError("Please fill in all fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email."); return; }
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    // TODO: call supabase.auth.signUp here
    setStep(3);
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.length < 4) { setError("Please enter the verification code."); return; }
    // TODO: call supabase.auth.verifyOtp here
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-outfit">
      {/* Background abstract */}
      <img src={heroBrushAbstract} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-none opacity-20 pointer-events-none select-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, hsla(330, 35%, 54%, 0.04) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 w-full max-w-[440px] mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img src={illusTiramisu} alt="Tiramisup" className="w-10 h-10 object-contain" />
          <span className="font-black text-xl text-foreground">Tiramisup</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-charcoal text-primary-foreground" : "bg-border text-foreground/40"}`}>{s}</div>
              {s < 3 && <div className={`w-8 h-0.5 rounded-full transition-all ${step > s ? "bg-charcoal" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-t-lg border border-border/40">
          {step === 1 && (
            <>
              <h2 className="font-syne text-2xl font-bold text-foreground mb-1">Create your account</h2>
              <p className="text-sm text-foreground/50 mb-6">Start your launch journey today.</p>
              <form onSubmit={handleStep1} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all placeholder:text-foreground/30" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Product Type</label>
                  <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all cursor-pointer">
                    {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all placeholder:text-foreground/30" />
                </div>
                {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                <button type="submit" className="w-full bg-charcoal text-primary-foreground py-3.5 rounded-xl text-sm font-black hover:-translate-y-0.5 hover:shadow-t-md transition-all active:scale-[0.98] cursor-pointer border-none">Continue →</button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-syne text-2xl font-bold text-foreground mb-1">Set your password</h2>
              <p className="text-sm text-foreground/50 mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleStep2} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all placeholder:text-foreground/30" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all placeholder:text-foreground/30" />
                </div>
                {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                <button type="submit" className="w-full bg-charcoal text-primary-foreground py-3.5 rounded-xl text-sm font-black hover:-translate-y-0.5 hover:shadow-t-md transition-all active:scale-[0.98] cursor-pointer border-none">Create Account →</button>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-foreground/50 font-medium bg-transparent border-none cursor-pointer hover:text-foreground transition-colors">← Back</button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-syne text-2xl font-bold text-foreground mb-1">Verify your email</h2>
              <p className="text-sm text-foreground/50 mb-6">We sent a verification code to <strong className="text-foreground">{email}</strong></p>
              <form onSubmit={handleStep3} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-foreground/60 mb-1 block uppercase tracking-wider">Verification Code</label>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all placeholder:text-foreground/30 text-center text-lg tracking-[.3em]" maxLength={6} />
                </div>
                {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                <button type="submit" className="w-full bg-charcoal text-primary-foreground py-3.5 rounded-xl text-sm font-black hover:-translate-y-0.5 hover:shadow-t-md transition-all active:scale-[0.98] cursor-pointer border-none">Verify →</button>
                <button type="button" className="text-sm text-p700 font-medium bg-transparent border-none cursor-pointer hover:text-p800 transition-colors">Resend code</button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-foreground/50 mt-6">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-p700 font-bold bg-transparent border-none cursor-pointer hover:text-p800 transition-colors underline">Log in</button>
        </p>
      </div>
    </div>
  );
}
