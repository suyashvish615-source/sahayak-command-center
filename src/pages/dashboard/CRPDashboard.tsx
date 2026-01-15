import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";

const CRPDashboard = () => {
  // Mock data for analytics
  const teachers = [
    { name: "Priya Sharma", sessions: 12, interventions: 8, status: "active" },
    { name: "Rajesh Kumar", sessions: 10, interventions: 15, status: "needs-support" },
    { name: "Anita Devi", sessions: 14, interventions: 5, status: "excellent" },
    { name: "Suresh Yadav", sessions: 8, interventions: 12, status: "active" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-400";
      case "active": return "text-primary";
      case "needs-support": return "text-yellow-400";
      default: return "text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "excellent": return "Excellent";
      case "active": return "Active";
      case "needs-support": return "Needs Support";
      default: return "Unknown";
    }
  };

  return (
    <DashboardLayout role="crp">
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-lg font-semibold text-foreground">
                CRP Analytics Console
              </h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-panel-border bg-panel-elevated">
                <span className="status-online" />
                <span className="text-xs text-muted-foreground">Live Data</span>
              </div>
            </div>
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
                  <div className="text-2xl font-display font-bold text-foreground">24</div>
                  <div className="text-xs text-muted-foreground">Teachers Monitored</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-system-success" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">156</div>
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
                  <div className="text-2xl font-display font-bold text-foreground">42</div>
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
                  <div className="text-2xl font-display font-bold text-foreground">+12%</div>
                  <div className="text-xs text-muted-foreground">Engagement Trend</div>
                </div>
              </div>
            </SystemPanel>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Teacher Performance Table */}
            <SystemPanel 
              title="Teacher Overview" 
              subtitle="Performance metrics by teacher"
              className="lg:col-span-2"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-panel-border">
                      <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Teacher</th>
                      <th className="text-center py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Sessions</th>
                      <th className="text-center py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Interventions</th>
                      <th className="text-right py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, idx) => (
                      <tr key={idx} className="border-b border-panel-border/50 hover:bg-panel-elevated/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                              {teacher.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm text-foreground">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-sm text-foreground">{teacher.sessions}</td>
                        <td className="py-3 px-2 text-center text-sm text-foreground">{teacher.interventions}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`text-xs font-medium ${getStatusColor(teacher.status)}`}>
                            {getStatusLabel(teacher.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SystemPanel>

            {/* Intervention Heatmap */}
            <SystemPanel title="Intervention Patterns" subtitle="Usage by type">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confusion</span>
                    <span className="text-foreground">45%</span>
                  </div>
                  <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-system-warning rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Disruption</span>
                    <span className="text-foreground">30%</span>
                  </div>
                  <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                    <div className="h-full w-[30%] bg-system-critical rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Fast Finishers</span>
                    <span className="text-foreground">25%</span>
                  </div>
                  <div className="h-2 bg-panel-elevated rounded-full overflow-hidden">
                    <div className="h-full w-[25%] bg-primary rounded-full" />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-panel-border">
                <div className="text-xs text-muted-foreground mb-3">Weekly Activity</div>
                <div className="grid grid-cols-7 gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className="text-center">
                      <div 
                        className={`h-8 rounded-sm mb-1 ${
                          i < 5 
                            ? i === 2 ? 'bg-primary' : 'bg-primary/50'
                            : 'bg-panel-elevated'
                        }`}
                      />
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SystemPanel>
          </div>

          {/* Recent Activity */}
          <SystemPanel title="Recent Activity" subtitle="Latest system events">
            <div className="space-y-3">
              {[
                { teacher: "Priya Sharma", action: "Completed session", subject: "Mathematics", time: "10 min ago" },
                { teacher: "Rajesh Kumar", action: "Used intervention", subject: "Science", time: "25 min ago" },
                { teacher: "Anita Devi", action: "Generated blueprint", subject: "Hindi", time: "1 hour ago" },
                { teacher: "Suresh Yadav", action: "Submitted reflection", subject: "Social Studies", time: "2 hours ago" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-panel-elevated">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-sm text-foreground">{activity.teacher}</span>
                      <span className="text-sm text-muted-foreground"> {activity.action}</span>
                      <span className="text-sm text-foreground"> — {activity.subject}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRPDashboard;
