import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import ActionTile from "@/components/ActionTile";
import { Input } from "@/components/ui/input";
import { 
  Clock, Play, CheckCircle, AlertTriangle, Volume2, Zap,
  Timer, Send, Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createSession, updateSession, createIntervention, createReflection, DBSession } from "@/lib/database";

type Mode = "before" | "during" | "after";

const TeacherDashboard = () => {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<Mode>("before");
  const [blueprintData, setBlueprintData] = useState<any>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [interventionLoading, setInterventionLoading] = useState<string | null>(null);
  const [interventionData, setInterventionData] = useState<any>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionFeedback, setReflectionFeedback] = useState<any>(null);

  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("40");
  const [classType, setClassType] = useState("regular");

  const [currentSession, setCurrentSession] = useState<DBSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [interventionCount, setInterventionCount] = useState(0);

  const [reflectionNote, setReflectionNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const teacherEmail = localStorage.getItem("sahayak_user_email") || "teacher@school.gov.in";

  useEffect(() => {
    if (activeMode === "during" && sessionStartTime) {
      const interval = setInterval(() => {
        setElapsedMinutes(Math.floor((Date.now() - sessionStartTime.getTime()) / 60000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeMode, sessionStartTime]);

  const callAI = async (type: string, payload: any) => {
    const { data, error } = await externalSupabase.functions.invoke("classroom-ai", {
      body: { type, payload },
    });
    if (error) throw new Error(error.message || "AI service error");
    if (data?.error) throw new Error(data.error);
    return data.result;
  };

  const handleGenerateBlueprint = async () => {
    if (!grade || !subject || !topic) {
      toast({ title: "Missing fields", description: "Fill in Grade, Subject, and Topic", variant: "destructive" });
      return;
    }
    setBlueprintLoading(true);
    setBlueprintData(null);
    try {
      const result = await callAI("blueprint", { grade, subject, topic, duration, classType });
      setBlueprintData(result);
      const session = await createSession({
        teacher_email: teacherEmail, grade, subject, topic,
        duration: parseInt(duration), class_type: classType, blueprint: result,
      });
      setCurrentSession(session);
      setInterventionCount(0);
      toast({ title: "Blueprint generated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setBlueprintLoading(false); }
  };

  const handleStartClass = async () => {
    setActiveMode("during");
    setSessionStartTime(new Date());
    setElapsedMinutes(0);
    setInterventionData(null);
    if (currentSession) {
      try {
        await updateSession(currentSession.id, { status: "active", started_at: new Date().toISOString() } as any);
        setCurrentSession({ ...currentSession, status: "active", started_at: new Date().toISOString() });
      } catch (err) { console.error(err); }
    }
  };

  const handleIntervention = async (type: string) => {
    setInterventionLoading(type);
    setInterventionData(null);
    try {
      const result = await callAI("intervention", {
        interventionType: type,
        grade: currentSession?.grade || grade,
        subject: currentSession?.subject || subject,
        topic: currentSession?.topic || topic,
      });
      setInterventionData({ type, ...result });
      if (currentSession) {
        await createIntervention({ session_id: currentSession.id, teacher_email: teacherEmail, type, ai_response: result });
        setInterventionCount(prev => prev + 1);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setInterventionLoading(null); }
  };

  const handleEndClass = async () => {
    setActiveMode("after");
    if (currentSession) {
      try {
        await updateSession(currentSession.id, { status: "completed", ended_at: new Date().toISOString() } as any);
        setCurrentSession({ ...currentSession, status: "completed", ended_at: new Date().toISOString() });
      } catch (err) { console.error(err); }
    }
  };

  const handleSubmitReflection = async () => {
    if (!reflectionNote && selectedTags.length === 0) {
      toast({ title: "Add reflection", description: "Add tags or notes", variant: "destructive" });
      return;
    }
    setReflectionLoading(true);
    try {
      const result = await callAI("reflection", {
        tags: selectedTags, note: reflectionNote,
        sessionSummary: {
          grade: currentSession?.grade || grade, subject: currentSession?.subject || subject,
          topic: currentSession?.topic || topic, duration: currentSession?.duration || parseInt(duration), interventionCount,
        },
      });
      setReflectionFeedback(result);
      if (currentSession) {
        await createReflection({ session_id: currentSession.id, teacher_email: teacherEmail, tags: selectedTags, note: reflectionNote, ai_feedback: result });
      }
      toast({ title: "Reflection submitted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setReflectionLoading(false); }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const reflectionTags = ["Engaged", "Challenging", "Successful", "Needs Review", "Tech Issues", "Time Constrained", "Great Questions"];

  const modes = [
    { id: "before" as Mode, label: "Before Class", icon: Clock },
    { id: "during" as Mode, label: "During Class", icon: Play },
    { id: "after" as Mode, label: "After Class", icon: CheckCircle },
  ];

  return (
    <DashboardLayout role="teacher">
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground">Classroom Control</h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-accent/50">
                <span className="status-online" />
                <span className="text-xs text-muted-foreground font-mono">
                  {currentSession ? `${currentSession.subject} — ${currentSession.topic}` : "Ready"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Timer className="w-3.5 h-3.5" />
              {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </header>

        {/* Mode Tabs */}
        <div className="border-b border-border bg-card/50">
          <div className="px-6 py-2.5 flex gap-1">
            {modes.map((mode) => (
              <button key={mode.id} onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeMode === mode.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}>
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* BEFORE CLASS */}
          {activeMode === "before" && (
            <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
              <SystemPanel title="Session Configuration" subtitle="Define classroom parameters">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grade</label>
                      <Input placeholder="e.g., 8th" value={grade} onChange={(e) => setGrade(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
                      <Input placeholder="e.g., Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Topic</label>
                    <Input placeholder="e.g., Linear Equations" value={topic} onChange={(e) => setTopic(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration (min)</label>
                      <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Type</label>
                      <select className="flex h-10 w-full rounded-xl border border-border bg-accent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={classType} onChange={(e) => setClassType(e.target.value)}>
                        <option value="regular">Regular</option>
                        <option value="remedial">Remedial</option>
                        <option value="enrichment">Enrichment</option>
                        <option value="assessment">Assessment</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleGenerateBlueprint} disabled={blueprintLoading}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {blueprintLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {blueprintLoading ? "Generating..." : "Generate Blueprint"}
                  </button>
                </div>
              </SystemPanel>

              <SystemPanel title="Classroom Blueprint" subtitle={blueprintData ? "AI-generated plan" : "Configure session to generate"}>
                {blueprintLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm">Generating with AI...</p>
                  </div>
                ) : blueprintData ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="text-[10px] uppercase tracking-widest text-primary mb-2 font-medium">Objective</div>
                      <p className="text-sm text-foreground">{blueprintData.objective}</p>
                    </div>
                    {blueprintData.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 flex-shrink-0">{idx + 1}</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{step.phase} <span className="text-muted-foreground font-normal">({step.duration})</span></div>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.activity}</p>
                        </div>
                      </div>
                    ))}
                    {blueprintData.materials && (
                      <div className="flex flex-wrap gap-1.5">
                        {blueprintData.materials.map((m: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 text-xs bg-accent text-muted-foreground rounded-lg border border-border">{m}</span>
                        ))}
                      </div>
                    )}
                    {blueprintData.difficultyAdaptations && (
                      <div className="p-3 rounded-xl bg-accent/50 space-y-1.5 text-xs text-muted-foreground">
                        <p><span className="text-system-warning font-medium">Struggling: </span>{blueprintData.difficultyAdaptations.struggling}</p>
                        <p><span className="text-primary font-medium">Advanced: </span>{blueprintData.difficultyAdaptations.advanced}</p>
                      </div>
                    )}
                    <button onClick={handleStartClass}
                      className="w-full bg-foreground text-background font-semibold py-3 rounded-xl text-sm hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" /> Start Class
                    </button>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                    Blueprint will appear here
                  </div>
                )}
              </SystemPanel>
            </div>
          )}

          {/* DURING CLASS */}
          {activeMode === "during" && (
            <div className="space-y-6 animate-fade-in">
              <SystemPanel title="Situation Response" subtitle="Select intervention type">
                <div className="grid md:grid-cols-3 gap-4">
                  <ActionTile
                    icon={interventionLoading === "confusion" ? <Loader2 className="w-7 h-7 animate-spin" /> : <AlertTriangle className="w-7 h-7" />}
                    title="Confusion Detected"
                    description="Students struggling to understand."
                    status={interventionData?.type === "confusion" ? "warning" : "idle"}
                    onClick={() => handleIntervention("confusion")}
                  />
                  <ActionTile
                    icon={interventionLoading === "noise" ? <Loader2 className="w-7 h-7 animate-spin" /> : <Volume2 className="w-7 h-7" />}
                    title="Noise / Disruption"
                    description="Classroom management needed."
                    status={interventionData?.type === "noise" ? "critical" : "idle"}
                    onClick={() => handleIntervention("noise")}
                  />
                  <ActionTile
                    icon={interventionLoading === "idle" ? <Loader2 className="w-7 h-7 animate-spin" /> : <Zap className="w-7 h-7" />}
                    title="Fast Finishers Idle"
                    description="Advanced students completed tasks."
                    status={interventionData?.type === "idle" ? "active" : "idle"}
                    onClick={() => handleIntervention("idle")}
                  />
                </div>
              </SystemPanel>

              {interventionData && (
                <SystemPanel title={interventionData.title || "System Recommendation"} subtitle="AI-generated guidance" className="border-primary/20 animate-fade-in">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                    {interventionData.urgency && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Urgency:</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                          interventionData.urgency === "high" ? "bg-destructive/20 text-destructive" :
                          interventionData.urgency === "medium" ? "bg-system-warning/20 text-system-warning" :
                          "bg-primary/20 text-primary"
                        )}>{interventionData.urgency}</span>
                      </div>
                    )}
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {interventionData.strategies?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                    {interventionData.followUp && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">Follow-up: </span>{interventionData.followUp}</p>
                      </div>
                    )}
                  </div>
                </SystemPanel>
              )}

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: elapsedMinutes, label: "Minutes Elapsed", color: "text-foreground" },
                  { value: interventionCount, label: "Interventions", color: "text-primary" },
                  { value: currentSession?.subject || "—", label: "Subject", color: "text-foreground" },
                ].map((stat) => (
                  <SystemPanel key={stat.label}>
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold font-mono", stat.color)}>{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  </SystemPanel>
                ))}
              </div>

              <div className="flex justify-center">
                <button onClick={handleEndClass}
                  className="bg-foreground text-background font-semibold px-8 py-3 rounded-xl text-sm hover:bg-foreground/90 transition-colors flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> End Class & Reflect
                </button>
              </div>
            </div>
          )}

          {/* AFTER CLASS */}
          {activeMode === "after" && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <SystemPanel title="Session Reflection" subtitle="Record insights — AI will analyze">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {reflectionTags.map((tag) => (
                        <button key={tag} onClick={() => toggleTag(tag)} className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-accent text-muted-foreground border-border hover:border-primary/40"
                        )}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                    <textarea
                      className="flex min-h-32 w-full rounded-xl border border-border bg-accent px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="What worked well? What would you do differently?"
                      value={reflectionNote} onChange={(e) => setReflectionNote(e.target.value)}
                    />
                  </div>
                  <button onClick={handleSubmitReflection} disabled={reflectionLoading}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {reflectionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {reflectionLoading ? "Analyzing..." : "Submit Reflection"}
                  </button>
                </div>
              </SystemPanel>

              {reflectionFeedback && (
                <SystemPanel title="AI Feedback" subtitle="Session analysis" className="border-primary/20 animate-fade-in">
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-sm text-foreground">{reflectionFeedback.summary}</p>
                    </div>
                    {reflectionFeedback.strengths?.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-primary mb-2 font-medium">Strengths</div>
                        <ul className="space-y-1">{reflectionFeedback.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
                      </div>
                    )}
                    {reflectionFeedback.improvements?.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-system-warning mb-2 font-medium">Growth Areas</div>
                        <ul className="space-y-1">{reflectionFeedback.improvements.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-system-warning mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
                      </div>
                    )}
                    {reflectionFeedback.nextSessionTip && (
                      <div className="p-3 rounded-xl bg-accent/50">
                        <div className="text-[10px] uppercase tracking-widest text-primary mb-1 font-medium">Next Session Tip</div>
                        <p className="text-sm text-foreground">{reflectionFeedback.nextSessionTip}</p>
                      </div>
                    )}
                  </div>
                </SystemPanel>
              )}

              <SystemPanel title="Session Summary">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Duration", value: `${currentSession?.duration || duration} min` },
                    { label: "Interventions", value: interventionCount },
                    { label: "Topic", value: currentSession?.topic || topic || "—" },
                    { label: "Type", value: currentSession?.class_type || classType },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-accent/50">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</div>
                      <div className="text-sm font-semibold text-foreground mt-1 capitalize">{item.value}</div>
                    </div>
                  ))}
                </div>
              </SystemPanel>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
