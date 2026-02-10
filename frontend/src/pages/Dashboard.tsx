/* eslint-disable no-irregular-whitespace */
// src/pages/Dashboard.tsx

import { DashboardPage } from '@/components/dashboard/DashboardPage'; 
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthContext } from '@/contexts/AuthContext';

// The function name should start with a capital letter
function Dashboard() {
    const { user } = useAuthContext(); // Assuming useAuth() returns the User object or null/undefined

    // ðŸŒŸ FIX: Add a check for user loading/null state ðŸŒŸ
    if (!user) {
        // ProtectedRoute might handle this, but an explicit null return is safe here
        // or you could return a simple loader.
        return null; 
    }

    return (
      <ProtectedRoute requireOnboarding={false}>
        {/* Pass the authenticated user object to DashboardPage. The check above ensures user is not null. */}
        <DashboardPage user={user} />
      </ProtectedRoute>
    );
}

export default Dashboard;



