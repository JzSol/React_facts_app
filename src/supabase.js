import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xuuuoawibgqpydaxlmtn.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dXVvYXdpYmdxcHlkYXhsbXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY4NzkzNzIsImV4cCI6MTk5MjQ1NTM3Mn0.GjKELnJ4VMwSyhpZ8FKrnIMqkHrJ5pUstd_tAUrGniI";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
