
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'teacher',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Classroom sessions table
CREATE TABLE public.classroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_email text NOT NULL,
  grade text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  duration integer NOT NULL DEFAULT 40,
  class_type text NOT NULL DEFAULT 'regular',
  blueprint jsonb,
  status text NOT NULL DEFAULT 'planned',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions are viewable by everyone" ON public.classroom_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sessions" ON public.classroom_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.classroom_sessions FOR UPDATE USING (true);

-- Interventions table
CREATE TABLE public.interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.classroom_sessions(id) ON DELETE CASCADE NOT NULL,
  teacher_email text NOT NULL,
  type text NOT NULL,
  ai_response jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interventions are viewable by everyone" ON public.interventions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert interventions" ON public.interventions FOR INSERT WITH CHECK (true);

-- Reflections table
CREATE TABLE public.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.classroom_sessions(id) ON DELETE CASCADE NOT NULL,
  teacher_email text NOT NULL,
  tags text[] DEFAULT '{}',
  note text,
  ai_feedback jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reflections are viewable by everyone" ON public.reflections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reflections" ON public.reflections FOR INSERT WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interventions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reflections;
