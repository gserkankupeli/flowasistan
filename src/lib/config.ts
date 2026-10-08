const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Demo mode runs the whole panel on fictional in-browser data: no login, no Supabase,
 * no external API. It is on when VITE_DEMO_MODE=true (set in .env.production, so every
 * production build is a demo unless explicitly overridden) or when Supabase is not configured.
 */
export const isDemo =
    import.meta.env.VITE_DEMO_MODE === 'true' || !supabaseUrl || !supabaseAnonKey;

/** Root path of the panel. The public demo lives under /demo, the real app under /app. */
export const APP_BASE = isDemo ? '/demo' : '/app';

export const appPath = (sub = '') => (sub ? `${APP_BASE}/${sub}` : APP_BASE);
