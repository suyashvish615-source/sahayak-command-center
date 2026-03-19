import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { Users, Loader2, RefreshCw, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/database";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const AdminUsers = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const teacherStats = stats.teacherEmails.map(email => {
    const sess = stats.sessions.filter(s => s.teacher_email === email);
    const intv = stats.interventions.filter(i => i.teacher_email === email);
    const refl = stats.reflections.filter(r => r.teacher_email === email);
    const lastSession = sess[0];
    return { email, sessions: sess.length, interventions: intv.length, reflections: refl.length, lastActive: lastSession?.created_at };
  });

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-primary" />
              <h1 className="font-display text-lg font-semibold text-foreground">User Management</h1>
              <span className="text-xs text-muted-foreground bg-panel-elevated px-2 py-1 rounded-full">
                {stats.teacherCount} registered teachers
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => getDashboardStats().then(setStats)}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">{stats.teacherCount}</div>
                  <div className="text-xs text-muted-foreground">Total Teachers</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-system-success/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-system-success" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">{stats.totalSessions}</div>
                  <div className="text-xs text-muted-foreground">Total Sessions</div>
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
                  <div className="text-xs text-muted-foreground">Total Interventions</div>
                </div>
              </div>
            </SystemPanel>
          </div>

          {/* Users Table */}
          <SystemPanel title="Teacher Directory" subtitle="All registered teachers and their activity">
            {teacherStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-panel-border">
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wide text-muted-foreground">Email</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wide text-muted-foreground">Sessions</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wide text-muted-foreground">Interventions</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wide text-muted-foreground">Reflections</th>
                      <th className="text-right py-3 px-3 text-xs uppercase tracking-wide text-muted-foreground">Last Active</th>
                      <th className="text-right py-3 px-3 text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherStats.map((teacher, i) => (
                      <motion.tr
                        key={teacher.email}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-panel-border/50 hover:bg-panel-elevated/50"
                      >
                        <td className="py-3 px-3 text-sm text-foreground">{teacher.email}</td>
                        <td className="py-3 px-3 text-center text-sm text-foreground">{teacher.sessions}</td>
                        <td className="py-3 px-3 text-center text-sm text-foreground">{teacher.interventions}</td>
                        <td className="py-3 px-3 text-center text-sm text-foreground">{teacher.reflections}</td>
                        <td className="py-3 px-3 text-right text-xs text-muted-foreground">
                          {teacher.lastActive
                            ? new Date(teacher.lastActive).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            teacher.sessions > 0 ? "bg-system-success/20 text-system-success" : "bg-muted text-muted-foreground"
                          )}>
                            {teacher.sessions > 0 ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No users registered yet. Teachers will appear as they use the system.
              </div>
            )}
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
