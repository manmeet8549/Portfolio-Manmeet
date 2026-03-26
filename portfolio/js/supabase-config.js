/**
 * Supabase Client Configuration
 * Initializes the Supabase JS client for use across the portfolio site.
 */

const SUPABASE_URL = 'https://rklzweouzrklbalpjuuf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbHp3ZW91enJrbGJhbHBqdXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDE1NTAsImV4cCI6MjA5MDExNzU1MH0.1WZHL6bllDvOOraVKucgVxFHQdC-_-uz5iEAvxSexvM';

// Initialize the Supabase client
// Note: `window.supabase` is the SDK namespace from CDN, so we use `supabaseClient` for the instance
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
