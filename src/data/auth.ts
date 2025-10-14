/**
 * Auth data facade
 * Centralizes all authentication operations
 */

import { auth } from "@/adapters/auth";
import type { SignUpRequest, SignInRequest, OAuthProvider, AuthResult } from "@/contracts/auth";
import type { Session, User } from "@supabase/supabase-js";

export async function signUp(credentials: SignUpRequest): Promise<AuthResult> {
  try {
    const result = await auth.signUp(credentials);
    
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
    const result = await auth.signIn(credentials);
    
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

export async function getCurrentUser(): Promise<User | null> {
  const user = await auth.getCurrentUser();
  return user;
}

export async function refreshSession(): Promise<Session | null> {
  return await auth.refreshSession();
}
