/**
 * Auth data facade
 * Centralizes all authentication operations
 */

import { auth } from "@/adapters/auth";
import type { SignUpRequest, SignInRequest, OAuthProvider, AuthResult } from "../../contracts/auth";
import type { Session, User } from "@supabase/supabase-js";

export async function signUp(credentials: SignUpRequest): Promise<AuthResult> {
  try {
    const { email, password, fullName } = credentials;
    const result = await auth.signUp({ email, password, fullName });
    
    if (result.error) {
      return {
        user: null,
        session: null,
        error: result.error.message,
      };
    }

    return {
      user: result.user ? {
        id: result.user.id,
        email: result.user.email || "",
        fullName: result.user.user_metadata?.full_name,
        avatarUrl: result.user.user_metadata?.avatar_url,
      } : null,
      session: result.session,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

export async function signIn(credentials: SignInRequest): Promise<AuthResult> {
  try {
    const { email, password } = credentials;
    const result = await auth.signIn({ email, password });
    
    if (result.error) {
      return {
        user: null,
        session: null,
        error: result.error.message,
      };
    }

    return {
      user: result.user ? {
        id: result.user.id,
        email: result.user.email || "",
        fullName: result.user.user_metadata?.full_name,
        avatarUrl: result.user.user_metadata?.avatar_url,
      } : null,
      session: result.session,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  await auth.signInWithOAuth(provider);
}

export async function signOut(): Promise<void> {
  await auth.signOut();
}

export async function getCurrentSession(): Promise<Session | null> {
  return await auth.getCurrentSession();
}

export async function getCurrentUser() {
  return await auth.getCurrentUser();
}

export async function refreshSession(): Promise<Session | null> {
  return await auth.refreshSession();
}
