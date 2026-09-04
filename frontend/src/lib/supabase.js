import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  client = {};
}

// Safety shim: do not pass custom backend JWT to Supabase to prevent 'signature verification failed'
if (!client.auth) client.auth = {};
client.auth.getSession = async () => {
  return { data: { session: null }, error: null };
};

export const supabase = client;
export default supabase;
