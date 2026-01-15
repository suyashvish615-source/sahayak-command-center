import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import ActionTile from "@/components/ActionTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Volume2, 
  Zap,
  BookOpen,
  Users,
  Timer,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "before" | "during" | "after";

const TeacherDashboard = () => {
  const [activeMode, setActiveMode] = useState<Mode>("before");
  const [blueprintGenerated, setBlueprintGenerated] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState<string | null>(null);

  // Form states for Before Class
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("40");
  const [classType, setClassType] = useState("regular");

  // Reflection state
  const [reflectionNote, setReflectionNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleGenerateBlueprint = () => {
    setBlueprintGenerated(true);
  };

  const handleIntervention = (type: string) => {
    setActiveIntervention(type);
    // This would trigger API call
    setTimeout(() => setActiveIntervention(null), 3000);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const reflectionTags = [
    "Engaged", "Challenging", "Successful", "Needs Review", 
    "Tech Issues", "Time Constrained", "Great Questions"
  ];

  return (
    <DashboardLayout role="teacher">
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-panel-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-lg font-semibold text-foreground">
                Classroom Control
              </h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-panel-border bg-panel-elevated">
                <span className="status-online" />
                <span className="text-xs text-muted-foreground">System Ready</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* Mode Switcher */}
        <div className="border-b border-panel-border bg-panel">
          <div className="px-6 py-3 flex gap-2">
            {[
              { id: "before" as Mode, label: "Before Class", icon: Clock },
              { id: "during" as Mode, label: "During Class", icon: Play },
              { id: "after" as Mode, label: "After Class", icon: CheckCircle },
            ].map((mode) => (
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
          {/* BEFORE CLASS MODE */}
          {activeMode === "before" && (
            <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Planning Form */}
              <SystemPanel title="Session Configuration" subtitle="Define your classroom parameters">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Grade</Label>
                      <Input 
                        placeholder="e.g., 8th" 
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Subject</Label>
                      <Input 
                        placeholder="e.g., Mathematics" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Topic</Label>
                    <Input 
                      placeholder="e.g., Linear Equations" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Duration (min)</Label>
                      <Input 
                        type="number" 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Class Type</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-panel-border bg-panel-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={classType}
                        onChange={(e) => setClassType(e.target.value)}
                      >
                        <option value="regular">Regular</option>
                        <option value="remedial">Remedial</option>
                        <option value="enrichment">Enrichment</option>
                        <option value="assessment">Assessment</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      variant="system" 
                      className="w-full"
                      onClick={handleGenerateBlueprint}
                    >
                      <BookOpen className="w-4 h-4" />
                      Generate Classroom Blueprint
                    </Button>
                  </div>
                </div>
              </SystemPanel>

              {/* Blueprint Output */}
              <SystemPanel 
                title="Classroom Blueprint" 
                subtitle={blueprintGenerated ? "System-generated teaching plan" : "Configure session to generate"}
              >
                {blueprintGenerated ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 rounded-md border border-primary/30 bg-primary/5">
                      <div className="text-xs uppercase tracking-wide text-primary mb-2">Learning Objective</div>
                      <p className="text-sm text-foreground">
                        Students will solve linear equations with one variable using balancing method.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-md bg-panel-elevated">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">1</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">Hook (5 min)</div>
                          <p className="text-xs text-muted-foreground">Real-world problem: Age calculation puzzle</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-md bg-panel-elevated">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">2</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">Instruction (15 min)</div>
                          <p className="text-xs text-muted-foreground">Demonstrate balancing with physical manipulatives</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-md bg-panel-elevated">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">3</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">Practice (15 min)</div>
                          <p className="text-xs text-muted-foreground">Paired problem-solving with peer support</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-md bg-panel-elevated">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">4</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">Closure (5 min)</div>
                          <p className="text-xs text-muted-foreground">Exit ticket: Solve one equation independently</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Blueprint will appear here</p>
                  </div>
                )}
              </SystemPanel>
            </div>
          )}

          {/* DURING CLASS MODE */}
          {activeMode === "during" && (
            <div className="space-y-6 animate-fade-in">
              <SystemPanel title="Situation Response" subtitle="Select intervention type">
                <div className="grid md:grid-cols-3 gap-4">
                  <ActionTile
                    icon={<AlertTriangle className="w-8 h-8" />}
                    title="Confusion Detected"
                    description="Students struggling to understand current concept. Request alternative explanation."
                    status={activeIntervention === "confusion" ? "warning" : "idle"}
                    onClick={() => handleIntervention("confusion")}
                  />
                  <ActionTile
                    icon={<Volume2 className="w-8 h-8" />}
                    title="Noise / Disruption"
                    description="Classroom management needed. Request attention-recovery protocol."
                    status={activeIntervention === "noise" ? "critical" : "idle"}
                    onClick={() => handleIntervention("noise")}
                  />
                  <ActionTile
                    icon={<Zap className="w-8 h-8" />}
                    title="Fast Finishers Idle"
                    description="Advanced students completed tasks. Request extension activities."
                    status={activeIntervention === "idle" ? "active" : "idle"}
                    onClick={() => handleIntervention("idle")}
                  />
                </div>
              </SystemPanel>

              {/* System Response Panel */}
              {activeIntervention && (
                <SystemPanel 
                  title="System Recommendation" 
                  subtitle="Immediate action guidance"
                  className="border-primary/30 animate-fade-in"
                >
                  <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
                    {activeIntervention === "confusion" && (
                      <div className="space-y-3">
                        <p className="text-sm text-foreground font-medium">Alternative Approach Detected</p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li>• Use visual representation: Draw a balance scale on the board</li>
                          <li>• Reduce complexity: Start with single-step equations</li>
                          <li>• Pair struggling students with peers who understood</li>
                        </ul>
                      </div>
                    )}
                    {activeIntervention === "noise" && (
                      <div className="space-y-3">
                        <p className="text-sm text-foreground font-medium">Attention Recovery Protocol</p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li>• Silent signal: Raise hand, wait for mimicry</li>
                          <li>• Quick transition: "In 10 seconds, everyone eyes on me"</li>
                          <li>• Engagement hook: "Who can tell me one thing they just learned?"</li>
                        </ul>
                      </div>
                    )}
                    {activeIntervention === "idle" && (
                      <div className="space-y-3">
                        <p className="text-sm text-foreground font-medium">Extension Activities</p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li>• Challenge: Create word problems for classmates</li>
                          <li>• Peer teaching: Explain their method to struggling student</li>
                          <li>• Advanced problem: Multi-step equation with fractions</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </SystemPanel>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <SystemPanel>
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-foreground">32</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Minutes Elapsed</div>
                  </div>
                </SystemPanel>
                <SystemPanel>
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-system-success">2</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Interventions</div>
                  </div>
                </SystemPanel>
                <SystemPanel>
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-primary">High</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Engagement</div>
                  </div>
                </SystemPanel>
              </div>
            </div>
          )}

          {/* AFTER CLASS MODE */}
          {activeMode === "after" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <SystemPanel title="Session Reflection" subtitle="Record insights for continuous improvement">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quick Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {reflectionTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                            selectedTags.includes(tag)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-panel-elevated text-muted-foreground border-panel-border hover:border-primary/50"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Reflection Notes</Label>
                    <textarea
                      className="flex min-h-32 w-full rounded-md border border-panel-border bg-panel-elevated px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="What worked well? What would you do differently? Any student insights?"
                      value={reflectionNote}
                      onChange={(e) => setReflectionNote(e.target.value)}
                    />
                  </div>

                  <Button variant="system" className="w-full">
                    <Send className="w-4 h-4" />
                    Submit Reflection
                  </Button>
                </div>
              </SystemPanel>

              {/* Session Summary */}
              <SystemPanel title="Session Summary" subtitle="Auto-generated from this session" className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="text-lg font-display font-semibold text-foreground">40 min</div>
                  </div>
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Interventions</div>
                    <div className="text-lg font-display font-semibold text-foreground">2</div>
                  </div>
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Topic</div>
                    <div className="text-lg font-display font-semibold text-foreground">Linear Eq.</div>
                  </div>
                  <div className="p-3 rounded-md bg-panel-elevated">
                    <div className="text-xs text-muted-foreground mb-1">Class Type</div>
                    <div className="text-lg font-display font-semibold text-foreground">Regular</div>
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
