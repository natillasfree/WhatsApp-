import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hkuzucfgjiyuyrjpvtrt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdXp1Y2Znaml5dXlyanB2dHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMTUyNDksImV4cCI6MjA0Njg5MTI0OX0.npU6zO4AgME2q1P2jfGCD21QqAiGwgM78cunQgpPjwQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
