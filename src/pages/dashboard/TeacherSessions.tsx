import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BookOpen, Clock, AlertTriangle, CheckCircle, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = teacherEmail
        ? await getSessionsByTeacher(teacherEmail)
        : [];
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoading(false);
    }
  };

  const viewSession = async (session: DBSession) => {
    setSelectedSession(session);
    setLoadingDetail(true);
    try {
      const intv = await getInterventionsBySession(session.id);
      setInterventions(intv);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      planned: { color: "bg-system-info/20 text-system-info", label: "Planned" },
      active: { color: "bg-system-warning/20 text-system-warning", label: "Active" },
      completed: { color: "bg-system-success/20 text-system-success", label: "Completed" },
    };
    const s = map[status] || map.planned;
    return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", s.color)}>{s.label}</span>;
  };

  return (
    <DashboardLayout role="teacher">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="font-display text-lg font-semibold text-foreground">My Sessions</h1>
              <span className="text-xs text-muted-foreground bg-panel-elevated px-2 py-1 rounded-full">
                {sessions.length} total
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={loadSessions} className="text-muted-foreground">
              Refresh
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Session List */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <SystemPanel>
                  <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <BookOpen className="w-10 h-10 opacity-40" />
                    <p className="text-sm">No sessions yet. Start a class from the Dashboard to create your first session.</p>
                  </div>
                </SystemPanel>
              ) : (
                sessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <SystemPanel className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      selectedSession?.id === session.id && "border-primary/50 system-glow-subtle"
                    )}>
                      <div className="flex items-center justify-between" onClick={() => viewSession(session)}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{session.subject}</span>
                              <span className="text-xs text-muted-foreground">— {session.topic}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">Grade {session.grade}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{session.duration} min</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground capitalize">{session.class_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(session.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </SystemPanel>
                  </motion.div>
                ))
              )}
            </div>

            {/* Session Detail */}
            <div>
              <AnimatePresence mode="wait">
                {selectedSession ? (
                  <motion.div
                    key={selectedSession.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <SystemPanel title="Session Detail" subtitle={selectedSession.topic}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-md bg-panel-elevated">
                            <div className="text-xs text-muted-foreground">Subject</div>
                            <div className="text-sm font-medium text-foreground">{selectedSession.subject}</div>
                          </div>
                          <div className="p-3 rounded-md bg-panel-elevated">
                            <div className="text-xs text-muted-foreground">Grade</div>
                            <div className="text-sm font-medium text-foreground">{selectedSession.grade}</div>
                          </div>
                          <div className="p-3 rounded-md bg-panel-elevated">
                            <div className="text-xs text-muted-foreground">Duration</div>
                            <div className="text-sm font-medium text-foreground">{selectedSession.duration} min</div>
                          </div>
                          <div className="p-3 rounded-md bg-panel-elevated">
                            <div className="text-xs text-muted-foreground">Status</div>
                            <div>{getStatusBadge(selectedSession.status)}</div>
                          </div>
                        </div>

                        {/* Blueprint Preview */}
                        {selectedSession.blueprint && (
                          <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                            <div className="text-xs uppercase tracking-wide text-primary mb-2">Blueprint</div>
                            <p className="text-xs text-muted-foreground">{selectedSession.blueprint.objective || "Generated"}</p>
                          </div>
                        )}

                        {/* Interventions */}
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                            Interventions ({loadingDetail ? "..." : interventions.length})
                          </div>
                          {loadingDetail ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : interventions.length > 0 ? (
                            <div className="space-y-2">
                              {interventions.map((intv) => (
                                <div key={intv.id} className="flex items-center gap-2 p-2 rounded bg-panel-elevated">
                                  <AlertTriangle className="w-3.5 h-3.5 text-system-warning flex-shrink-0" />
                                  <span className="text-xs text-foreground capitalize">{intv.type}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {new Date(intv.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No interventions</p>
                          )}
                        </div>
                      </div>
                    </SystemPanel>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <SystemPanel>
                      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                        Select a session to view details
                      </div>
                    </SystemPanel>
                  </motion.div>
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
