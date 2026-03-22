import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { BarChart3, TrendingUp, BookOpen, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { getSessionsByTeacher, DBSession, DBIntervention } from "@/lib/database";
import { externalSupabase as supabase } from "@/lib/supabaseExternal";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const COLORS = ["hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(160, 84%, 39%)"];
const tooltipStyle = { background: "hsl(0, 0%, 5%)", border: "1px solid hsl(0, 0%, 12%)", borderRadius: 12, color: "hsl(0, 0%, 93%)" };
const axisStyle = { fill: "hsl(0, 0%, 45%)", fontSize: 11 };

const TeacherAnalytics = () => {
  const [sessions, setSessions] = useState<DBSession[]>([]);
  const [interventions, setInterventions] = useState<DBIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const teacherEmail = localStorage.getItem("sahayak_user_email") || "";

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sessData = teacherEmail ? await getSessionsByTeacher(teacherEmail) : [];
      setSessions(sessData);
      if (sessData.length > 0) {
        const { data } = await supabase.from("interventions").select("*").eq("teacher_email", teacherEmail).order("created_at", { ascending: false });
        setInterventions((data || []) as unknown as DBIntervention[]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const thisWeekSessions = sessions.filter(s => new Date(s.created_at) >= weekAgo);

  const typeCounts = { confusion: 0, noise: 0, idle: 0 };
  interventions.forEach(i => { if (i.type in typeCounts) typeCounts[i.type as keyof typeof typeCounts]++; });

  const pieData = [
    { name: "Confusion", value: typeCounts.confusion },
    { name: "Disruption", value: typeCounts.noise },
    { name: "Fast Finishers", value: typeCounts.idle },
  ].filter(d => d.value > 0);

  const subjectCounts: Record<string, number> = {};
  sessions.forEach(s => { subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1; });
  const subjectData = Object.entries(subjectCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const dayMap: Record<string, number> = {};
  for (let d = 6; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 86400000);
    dayMap[date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })] = 0;
  }
  thisWeekSessions.forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayMap) dayMap[key]++;
  });
  const dailyData = Object.entries(dayMap).map(([day, sessions]) => ({ day, sessions }));

  if (loading) {
    return (<DashboardLayout role="teacher"><div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></DashboardLayout>);
  }

  return (
    <DashboardLayout role="teacher">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center gap-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-foreground">My Analytics</h1>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Sessions", value: sessions.length, icon: BookOpen },
              { label: "This Week", value: thisWeekSessions.length, icon: TrendingUp },
              { label: "Interventions", value: interventions.length, icon: AlertTriangle },
              { label: "Completed", value: sessions.filter(s => s.status === "completed").length, icon: CheckCircle },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <SystemPanel>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold font-mono text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                    </div>
                  </div>
                </SystemPanel>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <SystemPanel title="Sessions This Week">
              {sessions.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                      <XAxis dataKey="day" tick={axisStyle} />
                      <YAxis tick={axisStyle} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="sessions" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
            </SystemPanel>

            <SystemPanel title="Intervention Types">
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

          <SystemPanel title="Subject Distribution">
            {subjectData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 12%)" />
                    <XAxis type="number" tick={axisStyle} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={axisStyle} width={100} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>}
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAnalytics;
