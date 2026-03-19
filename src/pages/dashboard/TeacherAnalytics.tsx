import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BarChart3, TrendingUp, BookOpen, Loader2, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { getSessionsByTeacher, DBSession, DBIntervention } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["hsl(45, 93%, 47%)", "hsl(0, 72%, 51%)", "hsl(217, 91%, 60%)"];

const TeacherAnalytics = () => {
  const [sessions, setSessions] = useState<DBSession[]>([]);
  const [interventions, setInterventions] = useState<DBIntervention[]>([]);
  const [loading, setLoading] = useState(true);

  const teacherEmail = localStorage.getItem("sahayak_user_email") || "";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sessData = teacherEmail ? await getSessionsByTeacher(teacherEmail) : [];
      setSessions(sessData);

      if (sessData.length > 0) {
        const { data } = await supabase
          .from("interventions")
          .select("*")
          .eq("teacher_email", teacherEmail)
          .order("created_at", { ascending: false });
        setInterventions((data || []) as unknown as DBIntervention[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute analytics
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekSessions = sessions.filter(s => new Date(s.created_at) >= weekAgo);
  const thisMonthSessions = sessions.filter(s => new Date(s.created_at) >= monthAgo);

  const typeCounts = { confusion: 0, noise: 0, idle: 0 };
  interventions.forEach(i => {
    if (i.type in typeCounts) typeCounts[i.type as keyof typeof typeCounts]++;
  });

  const pieData = [
    { name: "Confusion", value: typeCounts.confusion },
    { name: "Disruption", value: typeCounts.noise },
    { name: "Fast Finishers", value: typeCounts.idle },
  ].filter(d => d.value > 0);

  // Subject distribution
  const subjectCounts: Record<string, number> = {};
  sessions.forEach(s => {
    subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
  });
  const subjectData = Object.entries(subjectCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Sessions per day (last 7 days)
  const dayMap: Record<string, number> = {};
  for (let d = 6; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    dayMap[key] = 0;
  }
  thisWeekSessions.forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key]++;
  });
  const dailyData = Object.entries(dayMap).map(([day, sessions]) => ({ day, sessions }));

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center gap-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg font-semibold text-foreground">My Analytics</h1>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Sessions", value: sessions.length, icon: BookOpen, color: "text-primary" },
              { label: "This Week", value: thisWeekSessions.length, icon: TrendingUp, color: "text-system-success" },
              { label: "Interventions", value: interventions.length, icon: AlertTriangle, color: "text-system-warning" },
              { label: "Completed", value: sessions.filter(s => s.status === "completed").length, icon: CheckCircle, color: "text-system-success" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <SystemPanel>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </SystemPanel>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sessions per Day */}
            <SystemPanel title="Sessions This Week" subtitle="Daily activity">
              {sessions.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                      <Bar dataKey="sessions" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
            </SystemPanel>

            {/* Intervention Breakdown */}
            <SystemPanel title="Intervention Types" subtitle="Distribution of classroom interventions">
              {pieData.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No interventions yet</div>
              )}
            </SystemPanel>
          </div>

          {/* Subject Distribution */}
          <SystemPanel title="Subject Distribution" subtitle="Sessions by subject">
            {subjectData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                    <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} width={100} />
                    <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                    <Bar dataKey="count" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAnalytics;
