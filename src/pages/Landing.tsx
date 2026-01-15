import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Cpu, Database, Lock, Zap } from "lucide-react";
import FloatingParticles from "@/components/ui/FloatingParticles";
import GlowingOrb from "@/components/ui/GlowingOrb";
import HexagonGrid from "@/components/ui/HexagonGrid";
import TypewriterText from "@/components/ui/TypewriterText";
import InteractiveCard from "@/components/ui/InteractiveCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const Landing = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const gridOpacity = useTransform(scrollY, [0, 200], [0.02, 0.08]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  } as const;

  const features = [
    { icon: Cpu, title: "Real-Time Analysis", desc: "Instant classroom insights" },
    { icon: Database, title: "Data-Driven", desc: "Evidence-based decisions" },
    { icon: Lock, title: "Secure & Private", desc: "Government-grade security" },
    { icon: Zap, title: "Instant Response", desc: "Sub-second interventions" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Background Effects */}
      <HexagonGrid />
      <FloatingParticles count={30} />
      
      {/* Glowing Orbs */}
      <GlowingOrb className="-top-32 -left-32" size="xl" color="primary" delay={0} />
      <GlowingOrb className="top-1/3 -right-48" size="lg" color="info" delay={2} />
      <GlowingOrb className="bottom-1/4 left-1/4" size="md" color="primary" delay={4} />
      
      {/* Animated Grid Background */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{ opacity: gridOpacity }}
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </motion.div>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-panel-border backdrop-blur-md bg-background/50"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div 
              className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 0px hsl(var(--primary) / 0.3)",
                  "0 0 20px hsl(var(--primary) / 0.3)",
                  "0 0 0px hsl(var(--primary) / 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="font-display font-semibold text-foreground tracking-tight">
              SAHAYAK OS
            </span>
          </motion.div>
          <Link to="/login">
            <Button variant="system-ghost" size="sm" className="group">
              System Access
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-20">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto px-6"
        >
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* System Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-panel-border bg-panel-elevated/80 backdrop-blur-sm"
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ 
                  boxShadow: [
                    "0 0 0px hsl(var(--system-success))",
                    "0 0 10px hsl(var(--system-success))",
                    "0 0 0px hsl(var(--system-success))",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                System Online • v1.0
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              variants={itemVariants}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
            >
              <span className="text-gradient-primary">Sahayak</span> OS
            </motion.h1>

            {/* Tagline with Typewriter */}
            <motion.div variants={itemVariants}>
              <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
                <TypewriterText 
                  texts={[
                    "Stabilize Classrooms.",
                    "Sustain Pedagogy.",
                    "Empower Teachers.",
                    "Transform Education."
                  ]}
                />
              </p>
            </motion.div>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-sm text-muted-foreground/70 max-w-xl mx-auto leading-relaxed"
            >
              Mission-critical classroom management infrastructure for government school educators. 
              Real-time decision support when every moment matters.
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants} className="pt-4">
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="system" size="xl" className="group relative overflow-hidden">
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    Enter System
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* System Stats */}
            <motion.div 
              variants={itemVariants}
              className="pt-12 grid grid-cols-3 gap-8 max-w-md mx-auto"
            >
              <InteractiveCard className="p-4 rounded-lg border border-panel-border bg-panel-elevated/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-foreground">v1.0</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Build</div>
                </div>
              </InteractiveCard>
              <InteractiveCard className="p-4 rounded-lg border-x border-panel-border bg-panel-elevated/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-foreground">
                    <AnimatedCounter value={3} />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Modules</div>
                </div>
              </InteractiveCard>
              <InteractiveCard className="p-4 rounded-lg border border-panel-border bg-panel-elevated/50 backdrop-blur-sm">
                <div className="text-center">
                  <motion.div 
                    className="text-2xl font-display font-bold text-system-success"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Active
                  </motion.div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Status</div>
                </div>
              </InteractiveCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-20 border-t border-panel-border">
        <div className="container mx-auto px-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={itemVariants}>
                <InteractiveCard className="p-6 rounded-lg border border-panel-border bg-panel-elevated/50 backdrop-blur-sm h-full">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-8 h-8 text-primary mb-4" />
                  </motion.div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </InteractiveCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 border-t border-panel-border py-6 backdrop-blur-sm bg-background/50"
      >
        <div className="container mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Classroom Survival Operating System</span>
          <span>Designed for Mission-Critical Education</span>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing;
