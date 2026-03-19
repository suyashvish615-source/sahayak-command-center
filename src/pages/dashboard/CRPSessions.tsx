import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { Users, BookOpen, Loader2, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/database";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CRPSessions = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setStats(await getDashboardStats());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = stats
    ? selectedTeacher
      ? stats.sessions.filter(s => s.teacher_email === selectedTeacher)
      : stats.sessions
    : [];

  if (loading) {
    return (
      <DashboardLayout role="crp">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="crp">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-primary" />
              <h1 className="font-display text-lg font-semibold text-foreground">Teacher Sessions</h1>
              <span className="text-xs text-muted-foreground bg-panel-elevated px-2 py-1 rounded-full">
                {stats?.teacherCount || 0} teachers • {stats?.totalSessions || 0} sessions
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Teacher List */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Teachers</div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className={cn(
                  "w-full text-left p-3 rounded-lg text-sm transition-all border",
                  !selectedTeacher
                    ? "bg-primary/10 border-primary/30 text-foreground"
                    : "bg-panel-elevated border-panel-border text-muted-foreground hover:text-foreground"
                )}
              >
                All Teachers ({stats?.totalSessions || 0})
              </button>
              {stats?.teacherEmails.map((email) => {
                const count = stats.sessions.filter(s => s.teacher_email === email).length;
                return (
                  <button
                    key={email}
                    onClick={() => setSelectedTeacher(email)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg text-sm transition-all border",
                      selectedTeacher === email
                        ? "bg-primary/10 border-primary/30 text-foreground"
                        : "bg-panel-elevated border-panel-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="truncate">{email}</div>
                    <div className="text-xs text-muted-foreground mt-1">{count} sessions</div>
                  </button>
                );
              })}
              {(stats?.teacherEmails.length || 0) === 0 && (
                <p className="text-xs text-muted-foreground p-3">No teachers have used the system yet.</p>
              )}
            </div>

            {/* Sessions Table */}
            <div className="lg:col-span-3">
              <SystemPanel title={selectedTeacher ? `Sessions — ${selectedTeacher}` : "All Sessions"} subtitle={`${filteredSessions.length} sessions found`}>
                {filteredSessions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-panel-border">
                          <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground">Teacher</th>
                          <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground">Subject</th>
                          <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground">Topic</th>
                          <th className="text-center py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground">Grade</th>
                          <th className="text-center py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-2 text-xs uppercase tracking-wide text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSessions.map((session, i) => (
                          <motion.tr
                            key={session.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-panel-border/50 hover:bg-panel-elevated/50 transition-colors"
                          >
                            <td className="py-3 px-2 text-xs text-muted-foreground truncate max-w-[150px]">{session.teacher_email}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{session.subject}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">{session.topic}</td>
                            <td className="py-3 px-2 text-center text-sm text-foreground">{session.grade}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                session.status === "completed" ? "bg-system-success/20 text-system-success" :
                                session.status === "active" ? "bg-system-warning/20 text-system-warning" :
                                "bg-system-info/20 text-system-info"
                              )}>
                                {session.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-xs text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No sessions found. Data will appear as teachers use the system.
                  </div>
                )}
              </SystemPanel>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRPSessions;
