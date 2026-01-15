import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { 
  Server, 
  Database, 
  Users, 
  Activity,
  Shield,
  Cpu,
  HardDrive,
  Wifi
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-lg font-semibold text-foreground">
                System Administration
              </h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10">
                <span className="status-online" />
                <span className="text-xs text-green-400">All Systems Operational</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-4 gap-4">
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center">
                  <Server className="w-6 h-6 text-system-success" />
                </div>
                <div>
                  <div className="text-lg font-display font-bold text-system-success">Online</div>
                  <div className="text-xs text-muted-foreground">API Server</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center">
                  <Database className="w-6 h-6 text-system-success" />
                </div>
                <div>
                  <div className="text-lg font-display font-bold text-system-success">Connected</div>
                  <div className="text-xs text-muted-foreground">Database</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-system-success" />
                </div>
                <div>
                  <div className="text-lg font-display font-bold text-system-success">Active</div>
                  <div className="text-xs text-muted-foreground">Auth Service</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-system-success" />
                </div>
                <div>
                  <div className="text-lg font-display font-bold text-foreground">98.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
              </div>
            </SystemPanel>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* User Statistics */}
            <SystemPanel title="User Statistics" subtitle="Current system users" className="lg:col-span-2">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-panel-elevated text-center">
                  <div className="text-3xl font-display font-bold text-foreground">247</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Teachers</div>
                </div>
                <div className="p-4 rounded-lg bg-panel-elevated text-center">
                  <div className="text-3xl font-display font-bold text-foreground">18</div>
                  <div className="text-xs text-muted-foreground mt-1">CRP/Mentors</div>
                </div>
                <div className="p-4 rounded-lg bg-panel-elevated text-center">
                  <div className="text-3xl font-display font-bold text-foreground">5</div>
                  <div className="text-xs text-muted-foreground mt-1">Administrators</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Active Sessions Today</div>
                <div className="h-32 rounded-lg bg-panel-elevated p-4 flex items-end justify-between gap-2">
                  {[35, 42, 65, 78, 92, 88, 75, 60, 45, 38, 28, 22].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-primary/60 rounded-t-sm transition-all hover:bg-primary"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {8 + i}:00
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SystemPanel>

            {/* Resource Usage */}
            <SystemPanel title="Resource Usage" subtitle="Current system load">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">CPU</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">34%</span>
                  </div>
                  <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                    <div className="h-full w-[34%] bg-primary rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-system-info" />
                      <span className="text-sm text-foreground">Memory</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">62%</span>
                  </div>
                  <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                    <div className="h-full w-[62%] bg-system-info rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-system-warning" />
                      <span className="text-sm text-foreground">Storage</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">48%</span>
                  </div>
                  <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                    <div className="h-full w-[48%] bg-system-warning rounded-full" />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-panel-border">
                <div className="text-xs text-muted-foreground mb-2">Last 24h Requests</div>
                <div className="text-2xl font-display font-bold text-foreground">12,847</div>
              </div>
            </SystemPanel>
          </div>

          {/* System Logs */}
          <SystemPanel title="System Events" subtitle="Recent system activity">
            <div className="space-y-2 font-mono text-xs">
              {[
                { time: "14:32:18", level: "INFO", message: "User authentication successful: teacher@school.gov.in" },
                { time: "14:31:45", level: "INFO", message: "Blueprint generated for session ID: sess_abc123" },
                { time: "14:30:12", level: "INFO", message: "Intervention triggered: confusion_detection" },
                { time: "14:28:56", level: "WARN", message: "Rate limit approaching for IP: 192.168.1.45" },
                { time: "14:25:33", level: "INFO", message: "Database backup completed successfully" },
                { time: "14:20:01", level: "INFO", message: "Scheduled maintenance check completed" },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded bg-panel-elevated">
                  <span className="text-muted-foreground">{log.time}</span>
                  <span className={
                    log.level === "WARN" ? "text-system-warning" :
                    log.level === "ERROR" ? "text-system-critical" :
                    "text-system-info"
                  }>
                    [{log.level}]
                  </span>
                  <span className="text-foreground">{log.message}</span>
                </div>
              ))}
            </div>
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
