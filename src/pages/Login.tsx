import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Eye, EyeOff, User, Lock, AlertCircle, CheckCircle } from "lucide-react";
import FloatingParticles from "@/components/ui/FloatingParticles";
import GlowingOrb from "@/components/ui/GlowingOrb";
import HexagonGrid from "@/components/ui/HexagonGrid";
import InteractiveCard from "@/components/ui/InteractiveCard";

// Fixed credentials for CRP and Admin
const FIXED_CREDENTIALS = {
  crp: {
    email: "2403n9p6ccsuyash@viva-technology.org",
    password: "suyash0903"
  },
  admin: {
    email: "suyash.svish06@gmail.com",
    password: "SUYASH0903"
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store email for session tracking
    localStorage.setItem("sahayak_user_email", email);

    // Check for CRP credentials
    if (email === FIXED_CREDENTIALS.crp.email && password === FIXED_CREDENTIALS.crp.password) {
      localStorage.setItem("sahayak_user_role", "crp");
      setSuccess("CRP access granted. Redirecting...");
      setTimeout(() => navigate("/dashboard/crp"), 1000);
      return;
    }
    
    // Check for Admin credentials
    if (email === FIXED_CREDENTIALS.admin.email && password === FIXED_CREDENTIALS.admin.password) {
      localStorage.setItem("sahayak_user_role", "admin");
      setSuccess("Admin access granted. Redirecting...");
      setTimeout(() => navigate("/dashboard/admin"), 1000);
      return;
    }
    
    // Default to teacher dashboard for any other credentials
    if (email && password) {
      localStorage.setItem("sahayak_user_role", "teacher");
      setSuccess("Teacher access granted. Redirecting...");
      setTimeout(() => navigate("/dashboard/teacher"), 1000);
      return;
    }
    
    setError("Please enter valid credentials");
    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 },
    },
  } as const;

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.3 },
    },
  } as const;

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="hidden lg:flex lg:w-1/2 relative border-r border-panel-border"
      >
        {/* Background Effects */}
        <HexagonGrid />
        <FloatingParticles count={20} />
        <GlowingOrb className="-top-32 -left-32" size="xl" color="primary" delay={0} />
        <GlowingOrb className="bottom-1/4 right-1/4" size="md" color="info" delay={2} />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
              <motion.div 
                className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    "0 0 0px hsl(var(--primary) / 0.3)",
                    "0 0 30px hsl(var(--primary) / 0.3)",
                    "0 0 0px hsl(var(--primary) / 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-6 h-6 text-primary" />
              </motion.div>
              <span className="font-display text-2xl font-bold tracking-tight">SAHAYAK OS</span>
            </motion.div>
            
            <motion.h2 
              variants={itemVariants}
              className="font-display text-4xl font-bold text-foreground mb-4"
            >
              System Access
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground max-w-md leading-relaxed"
            >
              Secure authentication gateway for classroom management infrastructure. 
              Role-based access control ensures appropriate system permissions.
            </motion.p>
            
            {/* Access Levels */}
            <motion.div variants={itemVariants} className="mt-12 space-y-4">
              {[
                { color: "bg-primary", label: "Teacher — Full classroom control", role: "teacher" },
                { color: "bg-system-info", label: "CRP/Mentor — Analytics & oversight", role: "crp" },
                { color: "bg-system-warning", label: "Admin — System management", role: "admin" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-lg border border-panel-border bg-panel-elevated/50 backdrop-blur-sm"
                  whileHover={{ x: 5, borderColor: "hsl(var(--primary) / 0.5)" }}
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
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col relative"
      >
        <FloatingParticles count={10} className="lg:hidden" />
        
        {/* Header */}
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

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 relative z-10">
          <motion.div 
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-sm space-y-8"
          >
            {/* Mobile Logo */}
            <motion.div 
              className="lg:hidden flex items-center gap-3 justify-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    "0 0 0px hsl(var(--primary) / 0.3)",
                    "0 0 20px hsl(var(--primary) / 0.3)",
                    "0 0 0px hsl(var(--primary) / 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="font-display text-xl font-bold tracking-tight">SAHAYAK OS</span>
            </motion.div>

            <InteractiveCard className="p-6 rounded-xl border border-panel-border bg-panel-elevated/80 backdrop-blur-lg">
              <div className="space-y-2 text-center lg:text-left mb-6">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Authenticate
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access the system
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@school.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all focus:scale-[1.01]"
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 transition-all focus:scale-[1.01]"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Error/Success Messages */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit" 
                    variant="system" 
                    className="w-full relative overflow-hidden" 
                    size="lg"
                    disabled={isLoading}
                  >
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div 
                          className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Authenticating...
                      </span>
                    ) : (
                      "Access System"
                    )}
                  </Button>
                </motion.div>
              </form>
            </InteractiveCard>

            {/* Demo Access */}
            <motion.div 
              className="pt-4 border-t border-panel-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-muted-foreground text-center mb-4">Quick Access (Demo)</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Teacher", path: "/dashboard/teacher" },
                  { label: "CRP", path: "/dashboard/crp" },
                  { label: "Admin", path: "/dashboard/admin" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="system-secondary" 
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(item.path)}
                    >
                      {item.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer 
          className="p-6 text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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
