import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  client = {};
}

// Fallback safety shim to prevent errors during complete Neon migration
if (!client.auth) client.auth = {};
client.auth.getSession = async () => {
  const token = localStorage.getItem('bizleap_token');
  if (token) {
    return {
      data: {
        session: {
          access_token: token,
          user: { id: 'user', email: 'user@bizleap.in' }
        }
      },
      error: null
    };
  }
  return { data: { session: null }, error: null };
};

export const supabase = client;
export default supabase;
