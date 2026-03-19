import { useAuthContext } from '@/contexts/AuthContext';
import ProtectedHelp from './Help';
import PublicHelp from './PublicHelp';

export default function HelpRoute() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (!isLoading && isAuthenticated) {
    return <ProtectedHelp />;
  }

  return <PublicHelp />;
}
