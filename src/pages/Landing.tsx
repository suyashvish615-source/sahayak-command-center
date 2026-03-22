import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div ref={containerRef} className="min-h-[200vh] bg-background overflow-x-hidden noise-bg">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(160 84% 39%), transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(160 84% 39%), transparent 70%)" }} />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 glass glass-border"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">S</span>
            </div>
            <span className="font-semibold text-sm text-foreground tracking-tight">SAHAYAK</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-accent/50 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
              Now live — v1.0
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.95] text-foreground mb-8"
          >
            Classroom<br />
            <span className="font-serif italic font-normal text-gradient-primary">intelligence</span>
            {" "}for<br />
            every teacher
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed mb-12"
          >
            Real-time AI that stabilizes classrooms, sustains pedagogy,
            and empowers government school educators.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all"
            >
              Enter System
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-3.5"
            >
              Learn more
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            className="mt-20 grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden max-w-md mx-auto"
          >
            {[
              { value: "3", label: "Modules" },
              { value: "AI", label: "Powered" },
              { value: "Live", label: "Status" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card px-6 py-5 text-center">
                <div className="text-xl font-bold text-foreground font-mono">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Built for the <span className="font-serif italic font-normal text-gradient-primary">real</span> classroom
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Not another EdTech toy. A mission-critical system designed for teachers under pressure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {[
              { title: "Before Class", desc: "AI generates structured lesson blueprints tailored to your grade, subject, and topic.", accent: "bg-primary" },
              { title: "During Class", desc: "One-tap interventions for confusion, disruption, and fast finishers. Instant AI strategies.", accent: "bg-system-warning" },
              { title: "After Class", desc: "Structured reflection with AI feedback. Track growth across sessions.", accent: "bg-system-info" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="bg-card p-8 group hover:bg-accent/50 transition-colors duration-300"
              >
                <div className={`w-2 h-2 rounded-full ${feature.accent} mb-6`} />
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-[8px]">S</span>
            </div>
            <span>Sahayak OS</span>
          </div>
          <span>Classroom Survival Operating System</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
