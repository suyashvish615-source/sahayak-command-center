import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BookOpen, AlertTriangle, Loader2, Eye } from "lucide-react";
import { getSessionsByTeacher, getInterventionsBySession, DBSession, DBIntervention } from "@/lib/database";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TeacherSessions = () => {
  const [sessions, setSessions] = useState<DBSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<DBSession | null>(null);
  const [interventions, setInterventions] = useState<DBIntervention[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const teacherEmail = localStorage.getItem("sahayak_user_email") || "";

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    setLoading(true);
    try { setSessions(teacherEmail ? await getSessionsByTeacher(teacherEmail) : []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const viewSession = async (session: DBSession) => {
    setSelectedSession(session);
    setLoadingDetail(true);
    try { setInterventions(await getInterventionsBySession(session.id)); }
    catch (err) { console.error(err); }
    finally { setLoadingDetail(false); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      planned: "bg-system-info/10 text-system-info border-system-info/20",
      active: "bg-system-warning/10 text-system-warning border-system-warning/20",
      completed: "bg-primary/10 text-primary border-primary/20",
    };
    return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize", map[status] || map.planned)}>{status}</span>;
  };

  return (
    <DashboardLayout role="teacher">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="font-semibold text-foreground">My Sessions</h1>
              <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full font-mono">{sessions.length}</span>
            </div>
            <button onClick={loadSessions} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Refresh</button>
          </div>
        </header>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                </div>
              ) : sessions.length === 0 ? (
                <SystemPanel>
                  <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <BookOpen className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No sessions yet.</p>
                  </div>
                </SystemPanel>
              ) : (
                sessions.map((session, i) => (
                  <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <div
                      onClick={() => viewSession(session)}
                      className={cn(
                        "p-4 rounded-xl border bg-card cursor-pointer transition-all hover:border-primary/30",
                        selectedSession?.id === session.id && "border-primary/40 bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{session.subject}</span>
                              <span className="text-xs text-muted-foreground">— {session.topic}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>Grade {session.grade}</span>
                              <span>•</span>
                              <span>{session.duration} min</span>
                              <span>•</span>
                              <span className="capitalize">{session.class_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {statusBadge(session.status)}
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(session.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div>
              <AnimatePresence mode="wait">
                {selectedSession ? (
                  <motion.div key={selectedSession.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                    <SystemPanel title="Session Detail" subtitle={selectedSession.topic}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Subject", value: selectedSession.subject },
                            { label: "Grade", value: selectedSession.grade },
                            { label: "Duration", value: `${selectedSession.duration} min` },
                            { label: "Status", value: selectedSession.status },
                          ].map((item) => (
                            <div key={item.label} className="p-3 rounded-xl bg-accent/50">
                              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</div>
                              <div className="text-sm font-medium text-foreground capitalize mt-0.5">{item.value}</div>
                            </div>
                          ))}
                        </div>

                        {selectedSession.blueprint && (
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="text-[10px] uppercase tracking-widest text-primary mb-1 font-medium">Blueprint</div>
                            <p className="text-xs text-muted-foreground">{selectedSession.blueprint.objective || "Generated"}</p>
                          </div>
                        )}

                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                            Interventions ({loadingDetail ? "..." : interventions.length})
                          </div>
                          {loadingDetail ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : interventions.length > 0 ? (
                            <div className="space-y-1.5">
                              {interventions.map((intv) => (
                                <div key={intv.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                                  <AlertTriangle className="w-3 h-3 text-system-warning flex-shrink-0" />
                                  <span className="text-xs text-foreground capitalize">{intv.type}</span>
                                  <span className="text-xs text-muted-foreground ml-auto font-mono">
                                    {new Date(intv.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-xs text-muted-foreground">No interventions</p>}
                        </div>
                      </div>
                    </SystemPanel>
                  </motion.div>
                ) : (
                  <SystemPanel>
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      Select a session
                    </div>
                  </SystemPanel>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherSessions;
