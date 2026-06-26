import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://uoxrvoiwyazzwbxrvelw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_op6pLQeM3uJPguTuxB_naw_OVylI7mA';

export const sb = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);