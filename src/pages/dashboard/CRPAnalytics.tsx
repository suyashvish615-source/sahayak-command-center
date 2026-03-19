import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BarChart3, Loader2, Users, BookOpen, AlertTriangle, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/database";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line } from "recharts";

const COLORS = ["hsl(45, 93%, 47%)", "hsl(0, 72%, 51%)", "hsl(217, 91%, 60%)", "hsl(142, 76%, 36%)", "hsl(199, 89%, 48%)"];

const CRPAnalytics = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <DashboardLayout role="crp">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Teacher performance: sessions + interventions per teacher
  const teacherData = stats.teacherEmails.map(email => {
    const sess = stats.sessions.filter(s => s.teacher_email === email);
    const intv = stats.interventions.filter(i => i.teacher_email === email);
    return { name: email.split("@")[0], sessions: sess.length, interventions: intv.length };
  });

  // Subject breakdown
  const subjectCounts: Record<string, number> = {};
  stats.sessions.forEach(s => { subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1; });
  const subjectData = Object.entries(subjectCounts).map(([name, value]) => ({ name, value }));

  // Intervention pie
  const pieData = [
    { name: "Confusion", value: stats.interventionBreakdown.confusion },
    { name: "Disruption", value: stats.interventionBreakdown.noise },
    { name: "Fast Finishers", value: stats.interventionBreakdown.idle },
  ].filter(d => d.value > 0);

  // Daily trend (last 7 days)
  const now = new Date();
  const dayMap: Record<string, number> = {};
  for (let d = 6; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    dayMap[date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })] = 0;
  }
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  stats.sessions.filter(s => new Date(s.created_at) >= weekAgo).forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key]++;
  });
  const dailyData = Object.entries(dayMap).map(([day, count]) => ({ day, count }));

  return (
    <DashboardLayout role="crp">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center gap-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg font-semibold text-foreground">CRP Analytics</h1>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Teachers", value: stats.teacherCount, icon: Users, color: "text-primary" },
              { label: "Total Sessions", value: stats.totalSessions, icon: BookOpen, color: "text-system-info" },
              { label: "This Week", value: stats.sessionsThisWeek, icon: TrendingUp, color: "text-system-success" },
              { label: "Interventions", value: stats.totalInterventions, icon: AlertTriangle, color: "text-system-warning" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <SystemPanel>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                </SystemPanel>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <SystemPanel title="Daily Session Trend" subtitle="Last 7 days">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ fill: "hsl(217, 91%, 60%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SystemPanel>

            {/* Intervention Pie */}
            <SystemPanel title="Intervention Distribution" subtitle="By type">
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
            </SystemPanel>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Teacher Performance */}
            <SystemPanel title="Teacher Performance" subtitle="Sessions & interventions per teacher">
              {teacherData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                      <Bar dataKey="sessions" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="interventions" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No teacher data yet</div>
              )}
            </SystemPanel>

            {/* Subject Breakdown */}
            <SystemPanel title="Subject Breakdown" subtitle="Sessions by subject across all teachers">
              {subjectData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={subjectData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
            </SystemPanel>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRPAnalytics;
