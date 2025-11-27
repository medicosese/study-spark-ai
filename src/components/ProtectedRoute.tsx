import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.is_blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Account Blocked</h1>
          <p className="text-muted-foreground">Your account has been blocked. Please contact support.</p>
        </div>
      </div>
    );
  }

  if (profile?.verification_status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Verification Pending</h1>
          <p className="text-muted-foreground">Your account is awaiting admin approval. Please check back later.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
