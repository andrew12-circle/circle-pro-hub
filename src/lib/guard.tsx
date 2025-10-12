import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useProMember } from '@/hooks/use-pro-member';

type RequireAuthProps = {
  children: ReactNode;
  redirectTo?: string;
};

/**
 * Guard component that requires authentication.
 * Redirects unauthenticated users to /auth.
 */
export function RequireAuth({ children, redirectTo = '/auth' }: RequireAuthProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsChecking(false);

      if (!session) {
        navigate(redirectTo, { replace: true });
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate(redirectTo, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}

type RequireRoleProps = {
  children: ReactNode;
  role: 'admin' | 'pro';
  fallback?: ReactNode;
};

/**
 * Guard component that requires a specific role.
 * Shows fallback UI if user doesn't have the required role.
 */
export function RequireRole({ children, role, fallback }: RequireRoleProps) {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { isPro, loading: proLoading } = useProMember();

  const loading = role === 'admin' ? adminLoading : proLoading;
  const hasRole = role === 'admin' ? isAdmin : isPro;

  useEffect(() => {
    if (!loading && !hasRole) {
      // Redirect admin-only routes to home if not admin
      if (role === 'admin') {
        navigate('/', { replace: true });
      }
    }
  }, [loading, hasRole, role, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

/**
 * Combined guard that requires both authentication and a specific role.
 */
export function RequireAuthAndRole({ 
  children, 
  role, 
  fallback 
}: { 
  children: ReactNode; 
  role: 'admin' | 'pro';
  fallback?: ReactNode;
}) {
  return (
    <RequireAuth>
      <RequireRole role={role} fallback={fallback}>
        {children}
      </RequireRole>
    </RequireAuth>
  );
}
