import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicSiteLayout from '@/layouts/PublicSiteLayout';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import PublicHelp from '@/pages/PublicHelp';
import Home from '@/pages/Home';
import Privacy from '@/pages/Privacy';
import PublicPremium from '@/pages/PublicPremium';
import Terms from '@/pages/Terms';
import { renderSeoHead } from '@/seo/routeSeo';

export const PRERENDER_ROUTES = ['/', '/about', '/contact', '/privacy', '/terms', '/help', '/premium'] as const;

const PrerenderApp = () => (
  <Routes>
    <Route element={<PublicSiteLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/help" element={<PublicHelp />} />
      <Route path="/premium" element={<PublicPremium />} />
    </Route>
  </Routes>
);

export const renderRoute = (pathname: string) => {
  const appHtml = renderToString(
    <MemoryRouter initialEntries={[pathname]}>
      <PrerenderApp />
    </MemoryRouter>,
  );

  return {
    appHtml,
    headHtml: renderSeoHead(pathname),
  };
};
