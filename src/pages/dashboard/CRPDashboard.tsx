import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { Users, TrendingUp, AlertTriangle, CheckCircle, Activity, RefreshCw, Loader2 } from "lucide-react";
import { getDashboardStats } from "@/lib/database";

const CRPDashboard = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try { setStats(await getDashboardStats()); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const hasData = stats && stats.totalSessions > 0;

  const getStatusColor = (interventions: number) => {
    if (interventions > 10) return "text-system-warning";
    if (interventions < 5) return "text-primary";
    return "text-foreground";
  };

  const getStatusLabel = (interventions: number) => {
    if (interventions > 10) return "Needs Support";
    if (interventions < 5) return "Excellent";
    return "Active";
  };

  if (loading && !stats) {
    return (
      <DashboardLayout role="crp">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="crp">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground">CRP Analytics</h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-accent/50">
                <span className="status-online" />
                <span className="text-xs text-muted-foreground">{hasData ? "Live Data" : "No Sessions"}</span>
              </div>
            </div>
            <button onClick={refresh} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Users, value: stats?.totalSessions || 0, label: "Total Sessions", color: "text-primary" },
              { icon: CheckCircle, value: stats?.sessionsThisWeek || 0, label: "This Week", color: "text-primary" },
              { icon: AlertTriangle, value: stats?.totalInterventions || 0, label: "Interventions", color: "text-system-warning" },
              { icon: TrendingUp, value: stats && stats.sessionsThisWeek > 0 ? `${stats.interventionBreakdown.confusion}%` : "—", label: "Confusion Rate", color: "text-system-info" },
            ].map((item) => (
              <SystemPanel key={item.label}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono text-foreground">{item.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</div>
                  </div>
                </div>
              </SystemPanel>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <SystemPanel title="Recent Sessions" subtitle="Real session data" className="lg:col-span-2">
              {hasData && stats ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Subject", "Teacher", "Grade", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left py-3 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSessions.map((session) => {
                        const si = stats.interventions.filter(i => i.session_id === session.id);
                        return (
                          <tr key={session.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                            <td className="py-3 px-2">
                              <div className="text-sm text-foreground">{session.subject}</div>
                              <div className="text-xs text-muted-foreground">{session.topic}</div>
                            </td>
                            <td className="py-3 px-2 text-xs text-muted-foreground truncate max-w-[120px]">{session.teacher_email}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{session.grade}</td>
                            <td className="py-3 px-2">
                              <span className={`text-xs font-medium ${getStatusColor(si.length)}`}>{getStatusLabel(si.length)}</span>
                            </td>
                            <td className="py-3 px-2 text-xs text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No sessions yet.</div>
              )}
            </SystemPanel>

            <SystemPanel title="Intervention Patterns" subtitle="Usage by type">
              <div className="space-y-4">
                {[
                  { label: "Confusion", pct: stats?.interventionBreakdown.confusion || 0, color: "bg-system-warning" },
                  { label: "Disruption", pct: stats?.interventionBreakdown.noise || 0, color: "bg-system-critical" },
                  { label: "Fast Finishers", pct: stats?.interventionBreakdown.idle || 0, color: "bg-primary" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-mono">{hasData ? `${item.pct}%` : "—"}</span>
                    </div>
                    <div className="h-1 bg-accent rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SystemPanel>
          </div>

          <SystemPanel title="Recent Activity" subtitle="Latest events">
            {hasData && stats ? (
              <div className="space-y-2">
                {stats.recentSessions.slice(0, 5).map((session) => {
                  const ref = stats.reflections.find(r => r.session_id === session.id);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-primary" />
                        <div>
                          <span className="text-sm text-foreground">{session.subject}</span>
                          <span className="text-sm text-muted-foreground"> — {session.topic}</span>
                          {ref && <span className="text-xs text-primary ml-2">(Reflected)</span>}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(session.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Activity appears as sessions complete.</div>
            )}
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRPDashboard;
