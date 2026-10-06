import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ddvzcqeunaappryvbuov.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdnpjcWV1bmFhcHByeXZidW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyODg2OTEsImV4cCI6MjEwNjg2NDY5MX0.BEmdtY1kQFusiCnsmtGrXYTMIwmpUY2cD0PilLje6tU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
