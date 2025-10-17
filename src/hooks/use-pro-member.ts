import { useState, useEffect } from "react";
import { isProMember as checkProMember } from "@/data/roles";
import { getCurrentUser } from "@/data/auth";
import { onAuthStateChange } from "@/data/auth";

export function useProMember() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkProStatus = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          setIsPro(false);
          setUserId(null);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const proStatus = await checkProMember();
        setIsPro(proStatus);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error in useProMember:", error);
        }
        setIsPro(false);
      } finally {
        setLoading(false);
      }
    };

    checkProStatus();

    const unsubscribe = onAuthStateChange(() => {
      checkProStatus();
    });

    return unsubscribe;
  }, []);

  return { isPro, loading, userId };
}
