import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ionenfgrlrbnvxqbmnou.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmVuZmdybHJibnZ4cWJtbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODczMjAsImV4cCI6MjA3NzY2MzMyMH0.WHruea_4tHk0HTndocBUSJ4JhFFO_tD9tAoEf1hMjzk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
