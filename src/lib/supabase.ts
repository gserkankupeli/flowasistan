import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isDemo } from './config';
import { demoClient } from './demo/client';

// In demo mode no real client is created; pages talk to the in-browser demo client instead.
export const supabase: SupabaseClient = isDemo
    ? (demoClient as unknown as SupabaseClient)
    : createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
