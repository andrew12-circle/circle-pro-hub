/**
 * Profiles data facade
 * Centralizes profile CRUD operations
 */

import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "./auth";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  points: number;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateProfileData {
  full_name?: string;
  location?: string;
  avatar_url?: string;
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error("[Profiles] Error fetching profile:", error);
      }
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      location: data.location,
      points: data.points || 0,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Profiles] Exception fetching profile:", error);
    }
    return null;
  }
}

/**
 * Update current user's profile
 */
export async function updateCurrentProfile(
  updates: UpdateProfileData
): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      if (import.meta.env.DEV) {
        console.error("[Profiles] Error updating profile:", error);
      }
      return false;
    }

    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Profiles] Exception updating profile:", error);
    }
    return false;
  }
}

/**
 * Get profile by user ID (for admin/public views)
 */
export async function getProfileById(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error(`[Profiles] Error fetching profile ${userId}:`, error);
      }
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      location: data.location,
      points: data.points || 0,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[Profiles] Exception fetching profile ${userId}:`, error);
    }
    return null;
  }
}
