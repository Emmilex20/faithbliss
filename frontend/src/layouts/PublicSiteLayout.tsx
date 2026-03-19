import { Outlet } from 'react-router-dom';
import { SeoMetaManager } from '@/components/SeoMetaManager';

export default function PublicSiteLayout() {
  return (
    <>
      <SeoMetaManager />
      <Outlet />
    </>
  );
}
