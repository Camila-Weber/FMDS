import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Verificação básica (bom para debug):
if (!process.env.SUPABASE_URL) {
  console.error("❌ Faltando SUPABASE_URL no .env");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Faltando SUPABASE_SERVICE_ROLE_KEY no .env");
}

// ⚠️ Use somente no backend — nunca no frontend
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
