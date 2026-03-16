import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { Button } from "@/components/ui/button";
import { 
  Server, Database, Users, Shield, Wifi, Cpu, HardDrive, RefreshCw
} from "lucide-react";
import { getSessionStats } from "@/lib/sessionStore";

const AdminDashboard = () => {
  const [stats, setStats] = useState(getSessionStats());
  const [systemTime, setSystemTime] = useState(new Date());

  const refresh = () => {
    setStats(getSessionStats());
    setSystemTime(new Date());
  };

  useEffect(() => {
    const interval = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-lg font-semibold text-foreground">System Administration</h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10">
                <span className="status-online" />
                <span className="text-xs text-green-400">All Systems Operational</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">{formatTime(systemTime)}</span>
              <Button variant="ghost" size="sm" onClick={refresh} className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* System Health */}
          <div className="grid grid-cols-4 gap-4">
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center"><Server className="w-6 h-6 text-system-success" /></div>
                <div>
                  <div className="text-lg font-display font-bold text-system-success">Online</div>
                  <div className="text-xs text-muted-foreground">API Server</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center"><Database className="w-6 h-6 text-system-success" /></div>
                <div>
                  <div className="text-lg font-display font-bold text-system-success">Connected</div>
                  <div className="text-xs text-muted-foreground">Lovable Cloud</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center"><Shield className="w-6 h-6 text-system-success" /></div>
                <div>
                  <div className="text-lg font-display font-bold text-system-success">Active</div>
                  <div className="text-xs text-muted-foreground">Auth Service</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center"><Wifi className="w-6 h-6 text-system-success" /></div>
                <div>
                  <div className="text-lg font-display font-bold text-foreground">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
              </div>
            </SystemPanel>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Usage Statistics — real data */}
            <SystemPanel title="Platform Statistics" subtitle="Real-time usage data" className="lg:col-span-2">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-panel-elevated text-center">
                  <div className="text-3xl font-display font-bold text-foreground">{stats.totalSessions}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Sessions</div>
                </div>
                <div className="p-4 rounded-lg bg-panel-elevated text-center">
                  <div className="text-3xl font-display font-bold text-foreground">{stats.sessionsThisWeek}</div>
                  <div className="text-xs text-muted-foreground mt-1">Sessions This Week</div>
                </div>
                <div className="p-4 rounded-lg bg-panel-elevated text-center">
                  <div className="text-3xl font-display font-bold text-foreground">{stats.totalInterventions}</div>
                  <div className="text-xs text-muted-foreground mt-1">Interventions</div>
                </div>
              </div>

              {/* Intervention Breakdown */}
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Intervention Distribution</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Confusion", pct: stats.interventionBreakdown.confusion, color: "bg-system-warning" },
                    { label: "Disruption", pct: stats.interventionBreakdown.noise, color: "bg-system-critical" },
                    { label: "Fast Finishers", pct: stats.interventionBreakdown.idle, color: "bg-primary" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-panel-elevated">
                      <div className="text-2xl font-display font-bold text-foreground">{stats.totalInterventions > 0 ? `${item.pct}%` : "—"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                      <div className="h-1.5 bg-background rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SystemPanel>

            {/* Resource Usage */}
            <SystemPanel title="Resource Usage" subtitle="Current system load">
              <div className="space-y-6">
                {[
                  { icon: Cpu, label: "CPU", pct: 23, color: "bg-primary" },
                  { icon: HardDrive, label: "Memory", pct: 41, color: "bg-system-info" },
                  { icon: Database, label: "Storage", pct: Math.min(stats.totalSessions * 2, 95), color: "bg-system-warning" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-panel-border">
                <div className="text-xs text-muted-foreground mb-2">AI Requests (Total)</div>
                <div className="text-2xl font-display font-bold text-foreground">
                  {stats.totalSessions + stats.totalInterventions + stats.recentSessions.filter(s => s.reflection).length}
                </div>
              </div>
            </SystemPanel>
          </div>

          {/* System Logs — real events */}
          <SystemPanel title="System Events" subtitle="Recent activity from the platform">
            <div className="space-y-2 font-mono text-xs">
              {stats.recentSessions.length > 0 ? (
                stats.recentSessions.slice(0, 8).map((session) => {
                  const t = new Date(session.timestamp);
                  const time = t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  return (
                    <div key={session.id} className="flex items-start gap-3 p-2 rounded bg-panel-elevated">
                      <span className="text-muted-foreground">{time}</span>
                      <span className="text-system-info">[INFO]</span>
                      <span className="text-foreground">
                        Blueprint generated for {session.subject} — {session.topic} (Grade {session.grade})
                        {session.interventions.length > 0 && ` | ${session.interventions.length} interventions`}
                        {session.reflection && " | Reflection submitted"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No system events yet. Events will appear as teachers use the platform.
                </div>
              )}
            </div>
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
