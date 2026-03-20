import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import ActionTile from "@/components/ActionTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, Play, CheckCircle, AlertTriangle, Volume2, Zap,
  BookOpen, Timer, Send, Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { externalSupabase } from "@/lib/supabaseExternal";
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

  // Form states
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("40");
  const [classType, setClassType] = useState("regular");

  // Session tracking
  const [currentSession, setCurrentSession] = useState<DBSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [interventionCount, setInterventionCount] = useState(0);

  // Reflection state
  const [reflectionNote, setReflectionNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const teacherEmail = localStorage.getItem("sahayak_user_email") || "teacher@school.gov.in";

  // Timer for during class
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
      toast({ title: "Missing fields", description: "Please fill in Grade, Subject, and Topic", variant: "destructive" });
      return;
    }
    setBlueprintLoading(true);
    setBlueprintData(null);
    try {
      const result = await callAI("blueprint", { grade, subject, topic, duration, classType });
      setBlueprintData(result);

      // Create session in database
      const session = await createSession({
        teacher_email: teacherEmail,
        grade, subject, topic,
        duration: parseInt(duration),
        class_type: classType,
        blueprint: result,
      });
      setCurrentSession(session);
      setInterventionCount(0);
      toast({ title: "Blueprint Generated", description: "Your classroom blueprint is ready" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBlueprintLoading(false);
    }
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
      } catch (err) {
        console.error("Failed to update session status", err);
      }
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

      // Save to database
      if (currentSession) {
        await createIntervention({
          session_id: currentSession.id,
          teacher_email: teacherEmail,
          type,
          ai_response: result,
        });
        setInterventionCount(prev => prev + 1);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setInterventionLoading(null);
    }
  };

  const handleEndClass = async () => {
    setActiveMode("after");
    if (currentSession) {
      try {
        await updateSession(currentSession.id, { status: "completed", ended_at: new Date().toISOString() } as any);
        setCurrentSession({ ...currentSession, status: "completed", ended_at: new Date().toISOString() });
      } catch (err) {
        console.error("Failed to update session status", err);
      }
    }
  };

  const handleSubmitReflection = async () => {
    if (!reflectionNote && selectedTags.length === 0) {
      toast({ title: "Add reflection", description: "Please add tags or notes", variant: "destructive" });
      return;
    }
    setReflectionLoading(true);
    try {
      const result = await callAI("reflection", {
        tags: selectedTags,
        note: reflectionNote,
        sessionSummary: {
          grade: currentSession?.grade || grade,
          subject: currentSession?.subject || subject,
          topic: currentSession?.topic || topic,
          duration: currentSession?.duration || parseInt(duration),
          interventionCount,
        },
      });
      setReflectionFeedback(result);

      // Save to database
      if (currentSession) {
        await createReflection({
          session_id: currentSession.id,
          teacher_email: teacherEmail,
          tags: selectedTags,
          note: reflectionNote,
          ai_feedback: result,
        });
      }
      toast({ title: "Reflection Submitted", description: "AI feedback generated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setReflectionLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const reflectionTags = ["Engaged", "Challenging", "Successful", "Needs Review", "Tech Issues", "Time Constrained", "Great Questions"];

  return (
    <DashboardLayout role="teacher">
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-panel-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-lg font-semibold text-foreground">Classroom Control</h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-panel-border bg-panel-elevated">
                <span className="status-online" />
                <span className="text-xs text-muted-foreground">
                  {currentSession ? `Session: ${currentSession.subject} — ${currentSession.topic}` : "System Ready"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </header>

        {/* Mode Switcher */}
        <div className="border-b border-panel-border bg-panel">
          <div className="px-6 py-3 flex gap-2">
            {([
              { id: "before" as Mode, label: "Before Class", icon: Clock },
              { id: "during" as Mode, label: "During Class", icon: Play },
              { id: "after" as Mode, label: "After Class", icon: CheckCircle },
            ]).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  activeMode === mode.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <mode.icon className="w-4 h-4" />
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
              <SystemPanel title="Session Configuration" subtitle="Define your classroom parameters">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Grade</Label>
                      <Input placeholder="e.g., 8th" value={grade} onChange={(e) => setGrade(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Subject</Label>
                      <Input placeholder="e.g., Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Topic</Label>
                    <Input placeholder="e.g., Linear Equations" value={topic} onChange={(e) => setTopic(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Duration (min)</Label>
                      <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Class Type</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-panel-border bg-panel-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={classType} onChange={(e) => setClassType(e.target.value)}
                      >
                        <option value="regular">Regular</option>
                        <option value="remedial">Remedial</option>
                        <option value="enrichment">Enrichment</option>
                        <option value="assessment">Assessment</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="system" className="w-full" onClick={handleGenerateBlueprint} disabled={blueprintLoading}>
                      {blueprintLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Classroom Blueprint</>}
                    </Button>
                  </div>
                </div>
              </SystemPanel>

              <SystemPanel title="Classroom Blueprint" subtitle={blueprintData ? "AI-generated teaching plan" : "Configure session to generate"}>
                {blueprintLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm">Generating blueprint with Gemini AI...</p>
                  </div>
                ) : blueprintData ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 rounded-md border border-primary/30 bg-primary/5">
                      <div className="text-xs uppercase tracking-wide text-primary mb-2">Learning Objective</div>
                      <p className="text-sm text-foreground">{blueprintData.objective}</p>
                    </div>
                    {blueprintData.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-md bg-panel-elevated">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{idx + 1}</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{step.phase} ({step.duration})</div>
                          <p className="text-xs text-muted-foreground">{step.activity}</p>
                        </div>
                      </div>
                    ))}
                    {blueprintData.materials && (
                      <div className="p-3 rounded-md bg-panel-elevated">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Materials Needed</div>
                        <div className="flex flex-wrap gap-2">
                          {blueprintData.materials.map((m: string, i: number) => (
                            <span key={i} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {blueprintData.difficultyAdaptations && (
                      <div className="p-3 rounded-md bg-panel-elevated space-y-2">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Adaptations</div>
                        <p className="text-xs text-muted-foreground"><span className="text-system-warning font-medium">Struggling: </span>{blueprintData.difficultyAdaptations.struggling}</p>
                        <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">Advanced: </span>{blueprintData.difficultyAdaptations.advanced}</p>
                      </div>
                    )}
                    <Button variant="system" className="w-full mt-2" onClick={handleStartClass}>
                      <Play className="w-4 h-4" /> Start Class Session
                    </Button>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Blueprint will appear here</p>
                  </div>
                )}
              </SystemPanel>
            </div>
          )}

          {/* DURING CLASS */}
          {activeMode === "during" && (
            <div className="space-y-6 animate-fade-in">
              <SystemPanel title="Situation Response" subtitle="Select intervention type — AI will provide real-time strategies">
                <div className="grid md:grid-cols-3 gap-4">
                  <ActionTile
                    icon={interventionLoading === "confusion" ? <Loader2 className="w-8 h-8 animate-spin" /> : <AlertTriangle className="w-8 h-8" />}
                    title="Confusion Detected"
                    description="Students struggling to understand current concept."
                    status={interventionLoading === "confusion" ? "warning" : interventionData?.type === "confusion" ? "warning" : "idle"}
                    onClick={() => handleIntervention("confusion")}
                  />
                  <ActionTile
                    icon={interventionLoading === "noise" ? <Loader2 className="w-8 h-8 animate-spin" /> : <Volume2 className="w-8 h-8" />}
                    title="Noise / Disruption"
                    description="Classroom management needed."
                    status={interventionLoading === "noise" ? "critical" : interventionData?.type === "noise" ? "critical" : "idle"}
                    onClick={() => handleIntervention("noise")}
                  />
                  <ActionTile
                    icon={interventionLoading === "idle" ? <Loader2 className="w-8 h-8 animate-spin" /> : <Zap className="w-8 h-8" />}
                    title="Fast Finishers Idle"
                    description="Advanced students completed tasks."
                    status={interventionLoading === "idle" ? "active" : interventionData?.type === "idle" ? "active" : "idle"}
                    onClick={() => handleIntervention("idle")}
                  />
                </div>
              </SystemPanel>

              {interventionData && (
                <SystemPanel title={interventionData.title || "System Recommendation"} subtitle="AI-generated action guidance" className="border-primary/30 animate-fade-in">
                  <div className="p-4 rounded-md bg-primary/5 border border-primary/20 space-y-3">
                    {interventionData.urgency && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Urgency:</span>
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
                      <div className="pt-3 border-t border-panel-border">
                        <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">Follow-up: </span>{interventionData.followUp}</p>
                      </div>
                    )}
                  </div>
                </SystemPanel>
              )}

              <div className="grid grid-cols-3 gap-4">
                <SystemPanel>
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-foreground">{elapsedMinutes}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Minutes Elapsed</div>
                  </div>
                </SystemPanel>
                <SystemPanel>
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-system-success">{interventionCount}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Interventions Used</div>
                  </div>
                </SystemPanel>
                <SystemPanel>
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-primary">{currentSession?.subject || "—"}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Current Subject</div>
                  </div>
                </SystemPanel>
              </div>

              <div className="flex justify-center">
                <Button variant="system" onClick={handleEndClass}>
                  <CheckCircle className="w-4 h-4" /> End Class & Reflect
                </Button>
              </div>
            </div>
          )}

          {/* AFTER CLASS */}
          {activeMode === "after" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <SystemPanel title="Session Reflection" subtitle="Record insights — AI will analyze and provide feedback">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quick Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {reflectionTags.map((tag) => (
                        <button key={tag} onClick={() => toggleTag(tag)} className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-panel-elevated text-muted-foreground border-panel-border hover:border-primary/50"
                        )}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Reflection Notes</Label>
                    <textarea
                      className="flex min-h-32 w-full rounded-md border border-panel-border bg-panel-elevated px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="What worked well? What would you do differently?"
                      value={reflectionNote} onChange={(e) => setReflectionNote(e.target.value)}
                    />
                  </div>
                  <Button variant="system" className="w-full" onClick={handleSubmitReflection} disabled={reflectionLoading}>
                    {reflectionLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Send className="w-4 h-4" /> Submit Reflection</>}
                  </Button>
                </div>
              </SystemPanel>

              {reflectionFeedback && (
                <SystemPanel title="AI Feedback" subtitle="Analysis of your session" className="mt-6 border-primary/30 animate-fade-in">
                  <div className="space-y-4">
                    <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                      <p className="text-sm text-foreground">{reflectionFeedback.summary}</p>
                    </div>
                    {reflectionFeedback.strengths?.length > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-system-success mb-2">Strengths</div>
                        <ul className="space-y-1">{reflectionFeedback.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-system-success mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
                      </div>
                    )}
                    {reflectionFeedback.improvements?.length > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-system-warning mb-2">Areas for Growth</div>
                        <ul className="space-y-1">{reflectionFeedback.improvements.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-system-warning mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
                      </div>
                    )}
                    {reflectionFeedback.nextSessionTip && (
                      <div className="p-3 rounded-md bg-panel-elevated">
                        <div className="text-xs uppercase tracking-wide text-primary mb-1">Next Session Tip</div>
                        <p className="text-sm text-foreground">{reflectionFeedback.nextSessionTip}</p>
                      </div>
                    )}
                    {reflectionFeedback.encouragement && (
                      <p className="text-sm text-primary italic">{reflectionFeedback.encouragement}</p>
                    )}
                  </div>
                </SystemPanel>
              )}

              {/* Session Summary */}
              <SystemPanel title="Session Summary" subtitle="Data from this session" className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="text-lg font-display font-semibold text-foreground">{currentSession?.duration || duration} min</div>
                  </div>
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Interventions</div>
                    <div className="text-lg font-display font-semibold text-foreground">{interventionCount}</div>
                  </div>
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Topic</div>
                    <div className="text-lg font-display font-semibold text-foreground">{currentSession?.topic || topic || "—"}</div>
                  </div>
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Class Type</div>
                    <div className="text-lg font-display font-semibold text-foreground capitalize">{currentSession?.class_type || classType}</div>
                  </div>
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
