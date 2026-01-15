import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle grid background */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 border-b border-panel-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold text-foreground tracking-tight">
              SAHAYAK OS
            </span>
          </div>
          <Link to="/login">
            <Button variant="system-ghost" size="sm">
              System Access
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* System Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-panel-border bg-panel-elevated animate-fade-in">
              <span className="status-online" />
              <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                System Online
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-fade-in">
              Sahayak OS
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide animate-fade-in">
              Stabilize Classrooms. Sustain Pedagogy.
            </p>

            {/* Description */}
            <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto leading-relaxed animate-fade-in">
              Mission-critical classroom management infrastructure for government school educators. 
              Real-time decision support when every moment matters.
            </p>

            {/* CTA */}
            <div className="pt-4 animate-fade-in">
              <Link to="/login">
                <Button variant="system" size="xl" className="group">
                  Enter System
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* System Stats */}
            <div className="pt-12 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-foreground">v1.0</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Build</div>
              </div>
              <div className="text-center border-x border-panel-border">
                <div className="text-2xl font-display font-bold text-foreground">3</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-system-success">Active</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Status</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-panel-border py-6">
        <div className="container mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Classroom Survival Operating System</span>
          <span>Designed for Mission-Critical Education</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
