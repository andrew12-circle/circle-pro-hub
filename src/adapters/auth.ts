/**
 * Auth adapter (Supabase-backed)
 */

import { supabase } from "@/integrations/supabase/client";
import type { Session, User, Provider } from "@supabase/supabase-js";

export interface AuthAdapter {
  getCurrentUser(): Promise<{ id: string; email: string } | null>;
  signOut(): Promise<void>;
  signUp(credentials: { email: string; password: string; fullName: string }): Promise<{
    user: User | null;
    session: Session | null;
    error: any;
  }>;
  signIn(credentials: { email: string; password: string }): Promise<{
    user: User | null;
    session: Session | null;
    error: any;
  }>;
  signInWithOAuth(provider: Provider): Promise<void>;
  getCurrentSession(): Promise<Session | null>;
  refreshSession(): Promise<Session | null>;
  onAuthStateChange(callback: (session: Session | null) => void): { unsubscribe: () => void };
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

  async signUp(credentials: { email: string; password: string; fullName: string }) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: credentials.fullName,
        },
      },
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  }

  async signIn(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  }

  async signInWithOAuth(provider: Provider) {
    const redirectUrl = `${window.location.origin}/`;
    
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async refreshSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.refreshSession();
    return session;
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      callback(session);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
}

export const auth: AuthAdapter = new SupabaseAuthAdapter();
