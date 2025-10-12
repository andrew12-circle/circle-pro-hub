/**
 * Auth adapter (Supabase-backed)
 */

import { supabase } from "@/integrations/supabase/client";

export interface AuthAdapter {
  getCurrentUser(): Promise<{ id: string; email: string } | null>;
  signOut(): Promise<void>;
}

class SupabaseAuthAdapter implements AuthAdapter {
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email || "",
    };
  }

  async signOut() {
    await supabase.auth.signOut();
  }
}

export const auth: AuthAdapter = new SupabaseAuthAdapter();
