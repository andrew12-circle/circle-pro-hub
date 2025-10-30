import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { resolveShareLink, setReferralCookie } from "@/data/share";
import { Loader2 } from "lucide-react";

/**
 * Share link redirect handler
 * Resolves /s/:id to actual service and preserves ?ref= in cookie
 */
const Share = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!id) {
        navigate("/", { replace: true });
        return;
      }

      // Preserve referral code in cookie if present
      const refCode = searchParams.get("ref");
      if (refCode) {
        setReferralCookie(refCode);
      }

      // Resolve short ID to service ID
      const serviceId = await resolveShareLink(id);
      
      if (serviceId) {
        // Redirect to actual service detail page
        navigate(`/services/${serviceId}`, { replace: true });
      } else {
        // Link not found, redirect to home
        console.warn(`[Share] Short link not found: ${id}`);
        navigate("/", { replace: true });
      }
    };

    handleRedirect();
  }, [id, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Share;
