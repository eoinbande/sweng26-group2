import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode: when real Supabase credentials aren't configured, provide a mock
// client so the UI renders without a backend.
const isDemo = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === 'your_supabase_url_here';

const mockUser = {
    id: 'demo-user-001',
    email: 'demo@example.com',
    user_metadata: { username: 'Demo User' },
};

const mockSupabase = {
    auth: {
        getUser: async () => ({ data: { user: mockUser }, error: null }),
        signInWithPassword: async () => ({ data: { user: mockUser }, error: null }),
        signUp: async () => ({ data: { user: mockUser }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
};

export const supabase = isDemo
    ? mockSupabase
    : createClient(supabaseUrl, supabaseKey);

export const isDemoMode = isDemo;