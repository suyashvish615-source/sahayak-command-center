import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BarChart3, Loader2, TrendingUp, Users, BookOpen, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/database";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from "recharts";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(210, 40%, 60%)"];

const tooltipStyle = {
  background: "hsl(0, 0%, 5%)",
  border: "1px solid hsl(0, 0%, 12%)",
  borderRadius: 12,
  color: "hsl(0, 0%, 93%)",
};

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
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const now = new Date();
  const dayMap: Record<string, { sessions: number; interventions: number }> = {};
  for (let d = 13; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 86400000);
    dayMap[date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })] = { sessions: 0, interventions: 0 };
  }
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);
  stats.sessions.filter(s => new Date(s.created_at) >= twoWeeksAgo).forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key].sessions++;
  });
  stats.interventions.filter(i => new Date(i.created_at) >= twoWeeksAgo).forEach(i => {
    const key = new Date(i.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key].interventions++;
  });
  const dailyData = Object.entries(dayMap).map(([day, data]) => ({ day, ...data }));

  const gradeCounts: Record<string, number> = {};
  stats.sessions.forEach(s => { gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1; });
  const gradeData = Object.entries(gradeCounts).map(([name, value]) => ({ name: `Grade ${name}`, value }));

  const typeCounts: Record<string, number> = {};
  stats.sessions.forEach(s => { typeCounts[s.class_type] = (typeCounts[s.class_type] || 0) + 1; });
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  const pieData = [
    { name: "Confusion", value: stats.interventionBreakdown.confusion },
    { name: "Disruption", value: stats.interventionBreakdown.noise },
    { name: "Fast Finishers", value: stats.interventionBreakdown.idle },
  ].filter(d => d.value > 0);

  const aiRequests = stats.totalSessions + stats.totalInterventions + stats.totalReflections;
  const axisStyle = { fill: "hsl(0, 0%, 45%)", fontSize: 11 };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center gap-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-foreground">System Reports</h1>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Teachers", value: stats.teacherCount, icon: Users },
              { label: "Sessions", value: stats.totalSessions, icon: BookOpen },
              { label: "This Week", value: stats.sessionsThisWeek, icon: TrendingUp },
              { label: "Interventions", value: stats.totalInterventions, icon: AlertTriangle },
              { label: "AI Requests", value: aiRequests, icon: BarChart3 },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <SystemPanel>
                  <div className="text-center">
                    <s.icon className="w-4 h-4 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold font-mono text-foreground">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
                  </div>
                </SystemPanel>
              </motion.div>
            ))}
          </div>

          <SystemPanel title="Platform Activity — 14 Days" subtitle="Sessions and interventions">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                  <XAxis dataKey="day" tick={axisStyle} />
                  <YAxis tick={axisStyle} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="interventions" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.08} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SystemPanel>

          <div className="grid lg:grid-cols-3 gap-6">
            <SystemPanel title="Grade Distribution">
              {gradeData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeData}>
                      <XAxis dataKey="name" tick={axisStyle} />
                      <YAxis tick={axisStyle} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="hsl(210, 40%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>

            <SystemPanel title="Class Types">
              {typeData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>

            <SystemPanel title="Intervention Types">
              {pieData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={["hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(160, 84%, 39%)"][i]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
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
