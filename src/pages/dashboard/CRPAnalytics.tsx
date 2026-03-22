import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BarChart3, Loader2, Users, BookOpen, AlertTriangle, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/database";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line } from "recharts";

const COLORS = ["hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(160, 84%, 39%)", "hsl(142, 76%, 36%)", "hsl(210, 40%, 60%)"];
const tooltipStyle = { background: "hsl(0, 0%, 5%)", border: "1px solid hsl(0, 0%, 12%)", borderRadius: 12, color: "hsl(0, 0%, 93%)" };
const axisStyle = { fill: "hsl(0, 0%, 45%)", fontSize: 11 };

const CRPAnalytics = () => {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (<DashboardLayout role="crp"><div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></DashboardLayout>);
  }

  const teacherData = stats.teacherEmails.map(email => {
    const sess = stats.sessions.filter(s => s.teacher_email === email);
    const intv = stats.interventions.filter(i => i.teacher_email === email);
    return { name: email.split("@")[0], sessions: sess.length, interventions: intv.length };
  });

  const subjectCounts: Record<string, number> = {};
  stats.sessions.forEach(s => { subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1; });
  const subjectData = Object.entries(subjectCounts).map(([name, value]) => ({ name, value }));

  const pieData = [
    { name: "Confusion", value: stats.interventionBreakdown.confusion },
    { name: "Disruption", value: stats.interventionBreakdown.noise },
    { name: "Fast Finishers", value: stats.interventionBreakdown.idle },
  ].filter(d => d.value > 0);

  const now = new Date();
  const dayMap: Record<string, number> = {};
  for (let d = 6; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 86400000);
    dayMap[date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })] = 0;
  }
  stats.sessions.filter(s => new Date(s.created_at) >= new Date(now.getTime() - 7 * 86400000)).forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key]++;
  });
  const dailyData = Object.entries(dayMap).map(([day, count]) => ({ day, count }));

  return (
    <DashboardLayout role="crp">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center gap-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-foreground">CRP Analytics</h1>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Teachers", value: stats.teacherCount, icon: Users },
              { label: "Sessions", value: stats.totalSessions, icon: BookOpen },
              { label: "This Week", value: stats.sessionsThisWeek, icon: TrendingUp },
              { label: "Interventions", value: stats.totalInterventions, icon: AlertTriangle },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <SystemPanel>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold font-mono text-foreground">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
                    </div>
                  </div>
                </SystemPanel>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <SystemPanel title="Daily Trend" subtitle="Last 7 days">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                    <XAxis dataKey="day" tick={axisStyle} />
                    <YAxis tick={axisStyle} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="count" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ fill: "hsl(160, 84%, 39%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SystemPanel>

            <SystemPanel title="Intervention Distribution">
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <SystemPanel title="Teacher Performance" subtitle="Sessions & interventions">
              {teacherData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teacherData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                      <XAxis dataKey="name" tick={axisStyle} />
                      <YAxis tick={axisStyle} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="sessions" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="interventions" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>

            <SystemPanel title="Subject Breakdown">
              {subjectData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={subjectData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CRPAnalytics;
