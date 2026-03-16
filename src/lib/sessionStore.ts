// Local session store for persisting classroom session data across dashboards

export interface ClassroomSession {
  id: string;
  timestamp: string;
  grade: string;
  subject: string;
  topic: string;
  duration: string;
  classType: string;
  interventions: InterventionRecord[];
  reflection?: ReflectionData;
  blueprintGenerated: boolean;
}

export interface InterventionRecord {
  type: string;
  timestamp: string;
  response: any;
}

export interface ReflectionData {
  tags: string[];
  note: string;
  aiFeedback?: any;
}

const SESSIONS_KEY = "sahayak_sessions";
const ACTIVE_SESSION_KEY = "sahayak_active_session";

export function getSessions(): ClassroomSession[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSession(session: ClassroomSession) {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.unshift(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
}

export function getActiveSession(): ClassroomSession | null {
  try {
    const data = localStorage.getItem(ACTIVE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setActiveSession(session: ClassroomSession | null) {
  if (session) localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export function getSessionStats() {
  const sessions = getSessions();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = sessions.filter((s) => new Date(s.timestamp) >= weekAgo);

  const totalInterventions = thisWeek.reduce(
    (sum, s) => sum + s.interventions.length, 0
  );

  const interventionTypes = { confusion: 0, noise: 0, idle: 0 };
  thisWeek.forEach((s) =>
    s.interventions.forEach((i) => {
      if (i.type in interventionTypes) {
        interventionTypes[i.type as keyof typeof interventionTypes]++;
      }
    })
  );

  const totalInt = Object.values(interventionTypes).reduce((a, b) => a + b, 0) || 1;

  return {
    totalSessions: sessions.length,
    sessionsThisWeek: thisWeek.length,
    totalInterventions,
    interventionBreakdown: {
      confusion: Math.round((interventionTypes.confusion / totalInt) * 100),
      noise: Math.round((interventionTypes.noise / totalInt) * 100),
      idle: Math.round((interventionTypes.idle / totalInt) * 100),
    },
    recentSessions: sessions.slice(0, 10),
  };
}
