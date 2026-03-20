import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, ArrowLeft, Eye, EyeOff, User, Lock,
  AlertCircle, CheckCircle, Clock, UserPlus
} from "lucide-react";
import FloatingParticles from "@/components/ui/FloatingParticles";
import GlowingOrb from "@/components/ui/GlowingOrb";
import HexagonGrid from "@/components/ui/HexagonGrid";
import InteractiveCard from "@/components/ui/InteractiveCard";
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

    if (loginError === "PENDING") {
      setView("pending");
      setIsLoading(false);
      return;
    }

    if (loginError === "REJECTED") {
      setError("Your registration was rejected. Please contact your admin.");
      setIsLoading(false);
      return;
    }

    if (!user) {
      setError(loginError || "Invalid email or password.");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("sahayak_user_email", user.email);
    localStorage.setItem("sahayak_user_role", user.role);
    localStorage.setItem("sahayak_user_name", user.name);
    setSuccess(`${user.role.toUpperCase()} access granted. Redirecting...`);

    setTimeout(() => {
      if (user.role === "admin") navigate("/dashboard/admin");
      else if (user.role === "crp") navigate("/dashboard/crp");
      else navigate("/dashboard/teacher");
    }, 1000);

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!regName || !regEmail || !regPassword) {
      setError("Name, email, and password are required.");
      setIsLoading(false);
      return;
    }

    const { success: ok, error: regError } = await registerTeacher({
      email: regEmail,
      name: regName,
      password: regPassword,
      school_name: regSchool,
      phone: regPhone,
    });

    if (!ok) {
      setError(regError || "Registration failed.");
      setIsLoading(false);
      return;
    }

    setView("pending");
    setIsLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
  } as const;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="hidden lg:flex lg:w-1/2 relative border-r border-panel-border"
      >
        <HexagonGrid />
        <FloatingParticles count={20} />
        <GlowingOrb className="-top-32 -left-32" size="xl" color="primary" delay={0} />
        <GlowingOrb className="bottom-1/4 right-1/4" size="md" color="info" delay={2} />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center"
                animate={{ boxShadow: ["0 0 0px hsl(var(--primary)/0.3)", "0 0 30px hsl(var(--primary)/0.3)", "0 0 0px hsl(var(--primary)/0.3)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-6 h-6 text-primary" />
              </motion.div>
              <span className="font-display text-2xl font-bold tracking-tight">SAHAYAK OS</span>
            </div>

            <h2 className="font-display text-4xl font-bold text-foreground">System Access</h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Secure authentication gateway for classroom management infrastructure.
              Teachers register and are approved by the admin before accessing the system.
            </p>

            <div className="mt-12 space-y-4">
              {[
                { color: "bg-primary", label: "Teacher — register and await approval" },
                { color: "bg-primary", label: "CRP/Mentor — analytics & oversight" },
                { color: "bg-primary", label: "Admin — approves teachers, manages system" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-lg border border-border bg-accent/50 backdrop-blur-sm"
                  whileHover={{ x: 5, borderColor: "hsl(var(--primary)/0.5)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className={`w-2 h-2 rounded-full ${item.color}`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col relative"
      >
        <FloatingParticles count={10} className="lg:hidden" />

        <header className="p-6 relative z-10">
          <Link to="/">
            <motion.div
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -3 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Landing</span>
            </motion.div>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 relative z-10">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">

              {/* PENDING VIEW */}
              {view === "pending" && (
                <motion.div
                  key="pending"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6 text-center"
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-accent border border-border flex items-center justify-center mx-auto"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="w-10 h-10 text-primary" />
                  </motion.div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Approval Pending
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Your registration has been submitted. The admin will review
                      and approve your account. You'll be able to log in once approved.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-accent text-sm text-muted-foreground">
                    Please check back later or contact your school administrator.
                  </div>
                  <Button
                    variant="system-ghost"
                    className="w-full"
                    onClick={() => { setView("login"); setError(""); setSuccess(""); }}
                  >
                    Back to Login
                  </Button>
                </motion.div>
              )}

              {/* LOGIN VIEW */}
              {view === "login" && (
                <motion.div
                  key="login"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <InteractiveCard className="p-6 rounded-xl border border-border bg-card/80 backdrop-blur-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="w-5 h-5 text-primary" />
                      <div>
                        <h1 className="font-display text-xl font-bold text-foreground">System Login</h1>
                        <p className="text-xs text-muted-foreground">Authenticate to access your console</p>
                      </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email" placeholder="user@school.gov.in"
                            className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"} placeholder="Enter password"
                            className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                          </motion.div>
                        )}
                        {success && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm"
                          >
                            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button type="submit" variant="system" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Authenticating...
                          </span>
                        ) : "Access System"}
                      </Button>
                    </form>
                  </InteractiveCard>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      New teacher?{" "}
                      <button
                        onClick={() => { setView("register"); setError(""); setSuccess(""); }}
                        className="text-primary hover:underline font-medium"
                      >
                        Register for access
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* REGISTER VIEW */}
              {view === "register" && (
                <motion.div
                  key="register"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <InteractiveCard className="p-6 rounded-xl border border-border bg-card/80 backdrop-blur-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <UserPlus className="w-5 h-5 text-primary" />
                      <div>
                        <h1 className="font-display text-xl font-bold text-foreground">Teacher Registration</h1>
                        <p className="text-xs text-muted-foreground">Admin approval required before login</p>
                      </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name *</Label>
                        <Input placeholder="Your full name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address *</Label>
                        <Input type="email" placeholder="you@school.gov.in" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Password *</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"} placeholder="Choose a password"
                            value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required className="pr-10"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">School Name</Label>
                        <Input placeholder="Your school name" value={regSchool} onChange={(e) => setRegSchool(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Phone Number</Label>
                        <Input placeholder="+91 XXXXX XXXXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                      </div>

                      <AnimatePresence mode="wait">
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button type="submit" variant="system" className="w-full mt-2" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Submitting...
                          </span>
                        ) : "Submit Registration"}
                      </Button>
                    </form>
                  </InteractiveCard>

                  <div className="text-center">
                    <button
                      onClick={() => { setView("login"); setError(""); setSuccess(""); }}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        <motion.footer
          className="p-6 text-center relative z-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        >
          <p className="text-xs text-muted-foreground">
            Secure system access • Session encrypted
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Login;
