import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BarChart3, Loader2, TrendingUp, Users, BookOpen, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/database";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(142, 76%, 36%)", "hsl(45, 93%, 47%)", "hsl(0, 72%, 51%)", "hsl(199, 89%, 48%)"];

const AdminReports = () => {
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

  // Daily sessions (last 14 days)
  const now = new Date();
  const dayMap: Record<string, { sessions: number; interventions: number }> = {};
  for (let d = 13; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    dayMap[key] = { sessions: 0, interventions: 0 };
  }
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  stats.sessions.filter(s => new Date(s.created_at) >= twoWeeksAgo).forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key].sessions++;
  });
  stats.interventions.filter(i => new Date(i.created_at) >= twoWeeksAgo).forEach(i => {
    const key = new Date(i.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key].interventions++;
  });
  const dailyData = Object.entries(dayMap).map(([day, data]) => ({ day, ...data }));

  // Grade distribution
  const gradeCounts: Record<string, number> = {};
  stats.sessions.forEach(s => { gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1; });
  const gradeData = Object.entries(gradeCounts).map(([name, value]) => ({ name: `Grade ${name}`, value }));

  // Class type distribution
  const typeCounts: Record<string, number> = {};
  stats.sessions.forEach(s => { typeCounts[s.class_type] = (typeCounts[s.class_type] || 0) + 1; });
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  // Intervention breakdown
  const pieData = [
    { name: "Confusion", value: stats.interventionBreakdown.confusion },
    { name: "Disruption", value: stats.interventionBreakdown.noise },
    { name: "Fast Finishers", value: stats.interventionBreakdown.idle },
  ].filter(d => d.value > 0);

  // AI usage stats
  const aiRequests = stats.totalSessions + stats.totalInterventions + stats.totalReflections;

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        <header className="border-b border-panel-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center gap-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg font-semibold text-foreground">System Reports</h1>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Teachers", value: stats.teacherCount, icon: Users },
              { label: "Sessions", value: stats.totalSessions, icon: BookOpen },
              { label: "This Week", value: stats.sessionsThisWeek, icon: TrendingUp },
              { label: "Interventions", value: stats.totalInterventions, icon: AlertTriangle },
              { label: "AI Requests", value: aiRequests, icon: BarChart3 },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <SystemPanel>
                  <div className="text-center">
                    <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </SystemPanel>
              </motion.div>
            ))}
          </div>

          {/* Activity Trend (14 days) */}
          <SystemPanel title="Platform Activity — Last 14 Days" subtitle="Sessions and interventions over time">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 18%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="interventions" stroke="hsl(45, 93%, 47%)" fill="hsl(45, 93%, 47%)" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SystemPanel>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Grade Distribution */}
            <SystemPanel title="Grade Distribution" subtitle="Sessions by grade level">
              {gradeData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeData}>
                      <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                      <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>

            {/* Class Type */}
            <SystemPanel title="Class Types" subtitle="Regular vs specialized">
              {typeData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>

            {/* Interventions */}
            <SystemPanel title="Intervention Types" subtitle="Distribution">
              {pieData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={["hsl(45, 93%, 47%)", "hsl(0, 72%, 51%)", "hsl(217, 91%, 60%)"][i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(222, 47%, 7%)", border: "1px solid hsl(222, 47%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
