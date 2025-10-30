import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProMember() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkProStatus = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsPro(false);
          setUserId(null);
          setLoading(false);
          return;
        }

        setUserId(session.user.id);

        const { data, error } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'pro'
        });

        if (error) {
          console.error("Error checking Pro status:", error);
          setIsPro(false);
        } else {
          setIsPro(!!data);
        }
      } catch (error) {
        console.error("Error in useProMember:", error);
        setIsPro(false);
      } finally {
        setLoading(false);
      }
    };

    checkProStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkProStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isPro, loading, userId };
}
