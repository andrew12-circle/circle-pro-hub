/**
 * Roles data facade
 * Centralizes role checking operations
 */

import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "./auth";

export type AppRole = "admin" | "pro" | "user";

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: AppRole): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: role,
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.error(`[Roles] Error checking role ${role}:`, error);
      }
      return false;
    }

    return !!data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[Roles] Exception checking role ${role}:`, error);
    }
    return false;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if current user is Pro member
 */
export async function isProMember(): Promise<boolean> {
  return hasRole("pro");
}

/**
 * Get all roles for current user
 */
export async function getUserRoles(): Promise<AppRole[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (error) {
      if (import.meta.env.DEV) {
        console.error("[Roles] Error fetching user roles:", error);
      }
      return [];
    }

    return (data || []).map((r) => r.role as AppRole);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Roles] Exception fetching user roles:", error);
    }
    return [];
  }
}
