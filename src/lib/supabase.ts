import { supabase as generatedSupabase } from "@/integrations/supabase/client";

// Compatibility bridge for migrations that exist in GitHub but are not yet reflected
// in the generated Database type file. The generated client remains strongly typed;
// regenerate Supabase types after deploying migrations, then this cast can be removed.
export const supabase = generatedSupabase as any;
