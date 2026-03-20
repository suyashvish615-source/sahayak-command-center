// Custom Supabase client pointing to the user's own Supabase project
import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = "https://oqgfxodavmhgdyfvscox.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZ2Z4b2Rhdm1oZ2R5ZnZzY294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTE2MDcsImV4cCI6MjA4OTQ4NzYwN30.3p0KzFoZERWvYO2P2ptRhTyIh20Is6JOWL-8wMpI1xA";

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const EXTERNAL_PROJECT_ID = "oqgfxodavmhgdyfvscox";
