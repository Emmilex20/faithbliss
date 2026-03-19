import { useAuthContext } from '@/contexts/AuthContext';
import ProtectedPremium from './Premium';
import PublicPremium from './PublicPremium';

export default function PremiumRoute() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (!isLoading && isAuthenticated) {
    return <ProtectedPremium />;
  }

  return <PublicPremium />;
}
