import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerified = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/signin");
    } else if (!loading && isAuthenticated && requireEmailVerified && !user?.email_verified) {
      setLocation("/check-email");
    }
  }, [loading, isAuthenticated, user, requireEmailVerified, setLocation]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (requireEmailVerified && !user?.email_verified) {
      return null; // Will redirect
  }

  return <>{children}</>;
}
