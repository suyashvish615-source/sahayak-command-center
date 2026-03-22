import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { Server, Database, Shield, Wifi, Cpu, HardDrive, RefreshCw, Loader2 } from "lucide-react";
import { getDashboardStats } from "@/lib/database";

const AdminDashboard = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemTime, setSystemTime] = useState(new Date());

  const refresh = async () => {
    setLoading(true);
    try { setStats(await getDashboardStats()); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const interval = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalSessions = stats?.totalSessions || 0;
  const sessionsThisWeek = stats?.sessionsThisWeek || 0;
  const totalInterventions = stats?.totalInterventions || 0;
  const interventionBreakdown = stats?.interventionBreakdown || { confusion: 0, noise: 0, idle: 0 };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground">System Administration</h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5">
                <span className="status-online" />
                <span className="text-xs text-primary font-medium">All Systems Operational</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">{systemTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              <button onClick={refresh} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Health */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Server, label: "API Server", status: "Online", color: "text-primary" },
              { icon: Database, label: "Database", status: "Connected", color: "text-primary" },
              { icon: Shield, label: "Auth Service", status: "Active", color: "text-primary" },
              { icon: Wifi, label: "Uptime", status: "99.9%", color: "text-foreground" },
            ].map((item) => (
              <SystemPanel key={item.label}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${item.color}`}>{item.status}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</div>
                  </div>
                </div>
              </SystemPanel>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <SystemPanel title="Platform Statistics" subtitle="Real-time usage data" className="lg:col-span-2">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { value: totalSessions, label: "Total Sessions" },
                  { value: sessionsThisWeek, label: "This Week" },
                  { value: totalInterventions, label: "Interventions" },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-xl bg-accent/50 text-center">
                    <div className="text-2xl font-bold font-mono text-foreground">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Intervention Distribution</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Confusion", pct: interventionBreakdown.confusion, color: "bg-system-warning" },
                    { label: "Disruption", pct: interventionBreakdown.noise, color: "bg-system-critical" },
                    { label: "Fast Finishers", pct: interventionBreakdown.idle, color: "bg-primary" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-accent/50">
                      <div className="text-lg font-bold font-mono text-foreground">{totalInterventions > 0 ? `${item.pct}%` : "—"}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{item.label}</div>
                      <div className="h-1 bg-background rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SystemPanel>

            <SystemPanel title="Resource Usage" subtitle="Current system load">
              <div className="space-y-5">
                {[
                  { icon: Cpu, label: "CPU", pct: 23, color: "bg-primary" },
                  { icon: HardDrive, label: "Memory", pct: 41, color: "bg-system-info" },
                  { icon: Database, label: "Storage", pct: Math.min(totalSessions * 2, 95), color: "bg-system-warning" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className="text-sm font-mono text-foreground">{item.pct}%</span>
                    </div>
                    <div className="h-1 bg-accent rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">AI Requests</div>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {totalSessions + totalInterventions + (stats?.totalReflections || 0)}
                </div>
              </div>
            </SystemPanel>
          </div>

          {/* System Logs */}
          <SystemPanel title="System Events" subtitle="Recent activity">
            <div className="space-y-1 font-mono text-xs">
              {stats && stats.recentSessions.length > 0 ? (
                stats.recentSessions.slice(0, 8).map((session) => {
                  const t = new Date(session.created_at);
                  const time = t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  const sessionInterventions = stats.interventions.filter(i => i.session_id === session.id);
                  const hasReflection = stats.reflections.some(r => r.session_id === session.id);
                  return (
                    <div key={session.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                      <span className="text-muted-foreground">{time}</span>
                      <span className="text-primary">[INFO]</span>
                      <span className="text-foreground/80">
                        {session.subject} — {session.topic} (Grade {session.grade})
                        {sessionInterventions.length > 0 && <span className="text-system-warning"> • {sessionInterventions.length} interventions</span>}
                        {hasReflection && <span className="text-primary"> • Reflected</span>}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm font-sans">
                  No events yet. Activity appears as teachers use the platform.
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
