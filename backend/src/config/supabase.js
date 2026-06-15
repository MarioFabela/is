import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config(); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Faltan las variables de entorno de Supabase en el backend.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;