import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { 
  Users, TrendingUp, Clock, AlertTriangle,
  CheckCircle, Activity, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionStats } from "@/lib/sessionStore";

const CRPDashboard = () => {
  const [stats, setStats] = useState(getSessionStats());

  const refresh = () => setStats(getSessionStats());

  useEffect(() => {
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, []);

  const hasData = stats.totalSessions > 0;

  const getStatusColor = (interventions: number) => {
    if (interventions > 10) return "text-system-warning";
    if (interventions < 5) return "text-system-success";
    return "text-primary";
  };

  const getStatusLabel = (interventions: number) => {
    if (interventions > 10) return "Needs Support";
    if (interventions < 5) return "Excellent";
    return "Active";
  };

  return (
    <DashboardLayout role="crp">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-lg font-semibold text-foreground">CRP Analytics Console</h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-panel-border bg-panel-elevated">
                <span className="status-online" />
                <span className="text-xs text-muted-foreground">{hasData ? "Live Data" : "No Sessions Yet"}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={refresh} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">{stats.totalSessions}</div>
                  <div className="text-xs text-muted-foreground">Total Sessions</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-system-success" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">{stats.sessionsThisWeek}</div>
                  <div className="text-xs text-muted-foreground">Sessions This Week</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-system-warning" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">{stats.totalInterventions}</div>
                  <div className="text-xs text-muted-foreground">Interventions Used</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-info/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-system-info" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {stats.sessionsThisWeek > 0 ? `${stats.interventionBreakdown.confusion}%` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">Confusion Rate</div>
                </div>
              </div>
            </SystemPanel>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Session History */}
            <SystemPanel title="Recent Sessions" subtitle="Real session data from teacher portal" className="lg:col-span-2">
              {hasData ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-panel-border">
                        <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Subject</th>
                        <th className="text-center py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Grade</th>
                        <th className="text-center py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Interventions</th>
                        <th className="text-right py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSessions.map((session) => (
                        <tr key={session.id} className="border-b border-panel-border/50 hover:bg-panel-elevated/50 transition-colors">
                          <td className="py-3 px-2">
                            <div>
                              <span className="text-sm text-foreground">{session.subject}</span>
                              <p className="text-xs text-muted-foreground">{session.topic}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center text-sm text-foreground">{session.grade}</td>
                          <td className="py-3 px-2 text-center text-sm text-foreground">{session.interventions.length}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={`text-xs font-medium ${getStatusColor(session.interventions.length)}`}>
                              {getStatusLabel(session.interventions.length)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  No sessions recorded yet. Data will appear after teachers use the system.
                </div>
              )}
            </SystemPanel>

            {/* Intervention Patterns */}
            <SystemPanel title="Intervention Patterns" subtitle="Usage by type">
              <div className="space-y-4">
                {[
                  { label: "Confusion", pct: stats.interventionBreakdown.confusion, color: "bg-system-warning" },
                  { label: "Disruption", pct: stats.interventionBreakdown.noise, color: "bg-system-critical" },
                  { label: "Fast Finishers", pct: stats.interventionBreakdown.idle, color: "bg-primary" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground">{hasData ? `${item.pct}%` : "—"}</span>
                    </div>
                    <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SystemPanel>
          </div>

          {/* Recent Activity */}
          <SystemPanel title="Recent Activity" subtitle="Latest session events">
            {hasData ? (
              <div className="space-y-3">
                {stats.recentSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-md bg-panel-elevated">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-sm text-foreground">{session.subject}</span>
                        <span className="text-sm text-muted-foreground"> — {session.topic}</span>
                        {session.reflection && <span className="text-xs text-system-success ml-2">(Reflected)</span>}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                Activity will appear as sessions are completed.
              </div>
            )}
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRPDashboard;
