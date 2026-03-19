import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_IMAGE,
  SITE_NAME,
  THEME_COLOR,
  buildSeoPayload,
} from '@/seo/routeSeo';

const ensureMetaByName = (name: string, content: string) => {
  let meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const ensureMetaByProperty = (property: string, content: string) => {
  let meta = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const ensureCanonical = (href: string) => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const ensureJsonLd = (payload: Record<string, unknown>) => {
  const scriptId = 'faithbliss-seo-jsonld';

  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
};

export const SeoMetaManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname || '/';
    const { seo, canonicalUrl, robots, jsonLd } = buildSeoPayload(pathname);

    document.title = seo.title;
    ensureCanonical(canonicalUrl);

    ensureMetaByName('description', seo.description);
    ensureMetaByName('keywords', seo.keywords);
    ensureMetaByName('robots', robots);
    ensureMetaByName('googlebot', robots);
    ensureMetaByName('application-name', SITE_NAME);
    ensureMetaByName('apple-mobile-web-app-title', SITE_NAME);
    ensureMetaByName('theme-color', THEME_COLOR);
    ensureMetaByName('twitter:card', 'summary_large_image');
    ensureMetaByName('twitter:title', seo.title);
    ensureMetaByName('twitter:description', seo.description);
    ensureMetaByName('twitter:image', DEFAULT_IMAGE);
    ensureMetaByName('twitter:image:alt', `${SITE_NAME} preview image`);

    ensureMetaByProperty('og:type', 'website');
    ensureMetaByProperty('og:locale', 'en_US');
    ensureMetaByProperty('og:site_name', SITE_NAME);
    ensureMetaByProperty('og:title', seo.title);
    ensureMetaByProperty('og:description', seo.description);
    ensureMetaByProperty('og:url', canonicalUrl);
    ensureMetaByProperty('og:image', DEFAULT_IMAGE);
    ensureMetaByProperty('og:image:alt', `${SITE_NAME} preview image`);

    ensureJsonLd(jsonLd as Record<string, unknown>);
  }, [location.pathname]);

  return null;
};
