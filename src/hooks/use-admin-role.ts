import { useState, useEffect } from "react";
import { isAdmin } from "@/data/roles";
import { onAuthStateChange } from "@/data/auth";

export function useAdminRole() {
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const adminStatus = await isAdmin();
        setIsAdminRole(adminStatus);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error checking admin role:", error);
        }
        setIsAdminRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();

    // Re-check on auth state change
    const unsubscribe = onAuthStateChange(() => {
      checkAdminRole();
    });

    return unsubscribe;
  }, []);

  return { isAdmin: isAdminRole, loading };
}
