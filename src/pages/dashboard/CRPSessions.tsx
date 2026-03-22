import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { Users, BookOpen, Loader2, RefreshCw } from "lucide-react";
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
    try { setStats(await getDashboardStats()); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredSessions = stats
    ? selectedTeacher ? stats.sessions.filter(s => s.teacher_email === selectedTeacher) : stats.sessions
    : [];

  if (loading) {
    return (<DashboardLayout role="crp"><div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></DashboardLayout>);
  }

  return (
    <DashboardLayout role="crp">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-foreground">Teacher Sessions</h1>
              <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full font-mono">
                {stats?.teacherCount || 0} teachers • {stats?.totalSessions || 0} sessions
              </span>
            </div>
            <button onClick={loadData} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-medium">Teachers</div>
              <button onClick={() => setSelectedTeacher(null)}
                className={cn("w-full text-left p-3 rounded-xl text-sm transition-all border",
                  !selectedTeacher ? "bg-primary/10 border-primary/20 text-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
                All ({stats?.totalSessions || 0})
              </button>
              {stats?.teacherEmails.map((email) => {
                const count = stats.sessions.filter(s => s.teacher_email === email).length;
                return (
                  <button key={email} onClick={() => setSelectedTeacher(email)}
                    className={cn("w-full text-left p-3 rounded-xl text-sm transition-all border",
                      selectedTeacher === email ? "bg-primary/10 border-primary/20 text-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
                    <div className="truncate">{email}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono">{count} sessions</div>
                  </button>
                );
              })}
              {!stats?.teacherEmails.length && <p className="text-xs text-muted-foreground p-3">No teachers yet.</p>}
            </div>

            <div className="lg:col-span-3">
              <SystemPanel title={selectedTeacher ? `Sessions — ${selectedTeacher}` : "All Sessions"} subtitle={`${filteredSessions.length} found`}>
                {filteredSessions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Teacher", "Subject", "Topic", "Grade", "Status", "Date"].map(h => (
                            <th key={h} className="text-left py-3 px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSessions.map((session, i) => (
                          <motion.tr key={session.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                            className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                            <td className="py-3 px-2 text-xs text-muted-foreground truncate max-w-[150px]">{session.teacher_email}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{session.subject}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">{session.topic}</td>
                            <td className="py-3 px-2 text-sm text-foreground">{session.grade}</td>
                            <td className="py-3 px-2">
                              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                session.status === "completed" ? "bg-primary/10 text-primary border-primary/20" :
                                session.status === "active" ? "bg-system-warning/10 text-system-warning border-system-warning/20" :
                                "bg-system-info/10 text-system-info border-system-info/20"
                              )}>{session.status}</span>
                            </td>
                            <td className="py-3 px-2 text-xs text-muted-foreground font-mono">
                              {new Date(session.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No sessions found.</div>
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
