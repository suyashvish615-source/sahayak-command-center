import { supabase } from "@/integrations/supabase/client";

// ---- Types ----
export interface DBSession {
  id: string;
  teacher_email: string;
  grade: string;
  subject: string;
  topic: string;
  duration: number;
  class_type: string;
  blueprint: any;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface DBIntervention {
  id: string;
  session_id: string;
  teacher_email: string;
  type: string;
  ai_response: any;
  created_at: string;
}

export interface DBReflection {
  id: string;
  session_id: string;
  teacher_email: string;
  tags: string[];
  note: string;
  ai_feedback: any;
  created_at: string;
}

// ---- Session CRUD ----
export async function createSession(data: {
  teacher_email: string;
  grade: string;
  subject: string;
  topic: string;
  duration: number;
  class_type: string;
  blueprint?: any;
}): Promise<DBSession> {
  const { data: session, error } = await supabase
    .from("classroom_sessions")
    .insert({
      teacher_email: data.teacher_email,
      grade: data.grade,
      subject: data.subject,
      topic: data.topic,
      duration: data.duration,
      class_type: data.class_type,
      blueprint: data.blueprint || null,
      status: "planned",
    })
    .select()
    .single();
  if (error) throw error;
  return session as unknown as DBSession;
}

export async function updateSession(id: string, updates: Partial<DBSession>) {
  const { error } = await supabase
    .from("classroom_sessions")
    .update(updates as any)
    .eq("id", id);
  if (error) throw error;
}

export async function getSessions(limit = 50): Promise<DBSession[]> {
  const { data, error } = await supabase
    .from("classroom_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as DBSession[];
}

export async function getSessionsByTeacher(email: string, limit = 50): Promise<DBSession[]> {
  const { data, error } = await supabase
    .from("classroom_sessions")
    .select("*")
    .eq("teacher_email", email)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as DBSession[];
}

// ---- Interventions ----
export async function createIntervention(data: {
  session_id: string;
  teacher_email: string;
  type: string;
  ai_response?: any;
}): Promise<DBIntervention> {
  const { data: intervention, error } = await supabase
    .from("interventions")
    .insert({
      session_id: data.session_id,
      teacher_email: data.teacher_email,
      type: data.type,
      ai_response: data.ai_response || null,
    })
    .select()
    .single();
  if (error) throw error;
  return intervention as unknown as DBIntervention;
}

export async function getInterventions(limit = 100): Promise<DBIntervention[]> {
  const { data, error } = await supabase
    .from("interventions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as DBIntervention[];
}

export async function getInterventionsBySession(sessionId: string): Promise<DBIntervention[]> {
  const { data, error } = await supabase
    .from("interventions")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as DBIntervention[];
}

// ---- Reflections ----
export async function createReflection(data: {
  session_id: string;
  teacher_email: string;
  tags: string[];
  note: string;
  ai_feedback?: any;
}): Promise<DBReflection> {
  const { data: reflection, error } = await supabase
    .from("reflections")
    .insert({
      session_id: data.session_id,
      teacher_email: data.teacher_email,
      tags: data.tags,
      note: data.note,
      ai_feedback: data.ai_feedback || null,
    })
    .select()
    .single();
  if (error) throw error;
  return reflection as unknown as DBReflection;
}

export async function getReflections(limit = 50): Promise<DBReflection[]> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as DBReflection[];
}

// ---- Aggregated Stats ----
export async function getDashboardStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [sessionsRes, interventionsRes, reflectionsRes] = await Promise.all([
    supabase.from("classroom_sessions").select("*").order("created_at", { ascending: false }),
    supabase.from("interventions").select("*").order("created_at", { ascending: false }),
    supabase.from("reflections").select("*").order("created_at", { ascending: false }),
  ]);

  const sessions = (sessionsRes.data || []) as unknown as DBSession[];
  const interventions = (interventionsRes.data || []) as unknown as DBIntervention[];
  const reflections = (reflectionsRes.data || []) as unknown as DBReflection[];

  const thisWeekSessions = sessions.filter(s => new Date(s.created_at) >= weekAgo);
  const thisWeekInterventions = interventions.filter(i => new Date(i.created_at) >= weekAgo);

  const typeCounts = { confusion: 0, noise: 0, idle: 0 };
  interventions.forEach(i => {
    if (i.type in typeCounts) typeCounts[i.type as keyof typeof typeCounts]++;
  });
  const totalTyped = Object.values(typeCounts).reduce((a, b) => a + b, 0) || 1;

  // Unique teachers
  const teacherEmails = [...new Set(sessions.map(s => s.teacher_email))];

  return {
    totalSessions: sessions.length,
    sessionsThisWeek: thisWeekSessions.length,
    totalInterventions: interventions.length,
    interventionsThisWeek: thisWeekInterventions.length,
    totalReflections: reflections.length,
    teacherCount: teacherEmails.length,
    teacherEmails,
    interventionBreakdown: {
      confusion: Math.round((typeCounts.confusion / totalTyped) * 100),
      noise: Math.round((typeCounts.noise / totalTyped) * 100),
      idle: Math.round((typeCounts.idle / totalTyped) * 100),
    },
    recentSessions: sessions.slice(0, 10),
    recentInterventions: interventions.slice(0, 10),
    recentReflections: reflections.slice(0, 5),
    sessions,
    interventions,
    reflections,
  };
}
