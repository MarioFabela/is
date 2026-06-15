import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ibwevarwvaotbhcfmkzd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid2V2YXJ3dmFvdGJoY2Zta3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjY2ODYsImV4cCI6MjA5NTM0MjY4Nn0.ApAMqkx4WyzgiQMLoKTFwc_REJY_TfKv4pVHKRWF92Y";

export const supabaseFrontend = createClient(supabaseUrl, supabaseAnonKey);