import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, Clock, Loader2
} from "lucide-react";
import { loginUser, registerTeacher } from "@/lib/database";

type View = "login" | "register" | "pending";

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSchool, setRegSchool] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const { user, error: loginError } = await loginUser(email, password);

    if (loginError === "PENDING") { setView("pending"); setIsLoading(false); return; }
    if (loginError === "REJECTED") { setError("Registration rejected. Contact your admin."); setIsLoading(false); return; }
    if (!user) { setError(loginError || "Invalid credentials."); setIsLoading(false); return; }

    localStorage.setItem("sahayak_user_email", user.email);
    localStorage.setItem("sahayak_user_role", user.role);
    localStorage.setItem("sahayak_user_name", user.name);
    setSuccess("Access granted. Redirecting...");

    setTimeout(() => {
      if (user.role === "admin") navigate("/dashboard/admin");
      else if (user.role === "crp") navigate("/dashboard/crp");
      else navigate("/dashboard/teacher");
    }, 800);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!regName || !regEmail || !regPassword) { setError("All required fields must be filled."); setIsLoading(false); return; }

    const { success: ok, error: regError } = await registerTeacher({
      email: regEmail, name: regName, password: regPassword, school_name: regSchool, phone: regPhone,
    });

    if (!ok) { setError(regError || "Registration failed."); setIsLoading(false); return; }
    setView("pending");
    setIsLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-background flex noise-bg">
      {/* Left Panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center border-r border-border overflow-hidden">
        {/* Ambient */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(160 84% 39%), transparent 70%)" }} />

        <div className="relative z-10 px-16 max-w-lg">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">S</span>
            </div>
            <span className="font-bold text-lg tracking-tight">SAHAYAK OS</span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
            System<br />
            <span className="font-serif italic font-normal text-gradient-primary">Access</span>
          </h2>

          <p className="text-muted-foreground leading-relaxed text-sm mb-12">
            Secure authentication gateway for classroom management infrastructure.
            Role-based access for teachers, mentors, and administrators.
          </p>

          <div className="space-y-3">
            {[
              { label: "Teacher", desc: "Register & get admin approval" },
              { label: "CRP/Mentor", desc: "Analytics & oversight" },
              { label: "Admin", desc: "System management" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-xl border border-border bg-accent/30"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-foreground font-medium">{item.label}</span>
                <span className="text-muted-foreground">— {item.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 flex flex-col relative">
        <header className="p-6 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 relative z-10">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {/* PENDING */}
              {view === "pending" && (
                <motion.div key="pending" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent border border-border flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Approval Pending</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your registration has been submitted. The admin will review and approve your account.
                    </p>
                  </div>
                  <button
                    onClick={() => { setView("login"); setError(""); setSuccess(""); }}
                    className="text-sm text-primary hover:underline"
                  >
                    Back to Login
                  </button>
                </motion.div>
              )}

              {/* LOGIN */}
              {view === "login" && (
                <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Sign in</h1>
                    <p className="text-sm text-muted-foreground">Enter your credentials to access the system</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                      <Input type="email" placeholder="you@school.gov.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"} placeholder="Enter password"
                          value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </motion.div>
                      )}
                      {success && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-foreground text-background font-semibold py-3 rounded-xl text-sm hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isLoading ? "Authenticating..." : "Sign in"}
                    </button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      New teacher?{" "}
                      <button onClick={() => { setView("register"); setError(""); setSuccess(""); }} className="text-primary hover:underline font-medium">
                        Register
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* REGISTER */}
              {view === "register" && (
                <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Register</h1>
                    <p className="text-sm text-muted-foreground">Admin approval required before access</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name *</label>
                      <Input placeholder="Your name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email *</label>
                      <Input type="email" placeholder="you@school.gov.in" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password *</label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Choose a password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">School</label>
                      <Input placeholder="School name" value={regSchool} onChange={(e) => setRegSchool(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                      <Input placeholder="+91 XXXXX XXXXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                      </div>
                    )}

                    <button type="submit" disabled={isLoading}
                      className="w-full bg-foreground text-background font-semibold py-3 rounded-xl text-sm hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isLoading ? "Submitting..." : "Submit Registration"}
                    </button>
                  </form>

                  <div className="text-center">
                    <button onClick={() => { setView("login"); setError(""); setSuccess(""); }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="p-6 text-center">
          <p className="text-xs text-muted-foreground/50">Encrypted session · Sahayak OS</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
