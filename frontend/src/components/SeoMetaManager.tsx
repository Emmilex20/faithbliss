import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SeoRoute = {
  title: string;
  description: string;
  index: boolean;
};

const SITE_NAME = 'FaithBliss';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://faithbliss.app').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/bg5.jpg`;

const DEFAULT_SEO: SeoRoute = {
  title: `${SITE_NAME} | Christian Dating App for Meaningful Relationships`,
  description:
    'FaithBliss helps Christian singles build meaningful, God-centered relationships through intentional matching and authentic conversations.',
  index: true,
};

const ROUTE_SEO: Record<string, SeoRoute> = {
  '/': DEFAULT_SEO,
  '/about': {
    title: `About ${SITE_NAME} | Faith-Based Dating Community`,
    description:
      'Learn how FaithBliss helps Christian singles connect intentionally, build trust, and grow relationships rooted in shared faith.',
    index: true,
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Read how FaithBliss protects your personal information, communication data, and account privacy across the platform.',
    index: true,
  },
  '/login': {
    title: `Login | ${SITE_NAME}`,
    description: `Sign in to ${SITE_NAME} and continue building meaningful, faith-centered connections.`,
    index: false,
  },
  '/signup': {
    title: `Sign Up | ${SITE_NAME}`,
    description: `Create your ${SITE_NAME} account and meet Christian singles looking for meaningful relationships.`,
    index: false,
  },
};

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

const ensureJsonLd = (pathname: string) => {
  const scriptId = 'faithbliss-seo-jsonld';
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DEFAULT_SEO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}${pathname}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
    },
  };

  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(payload);
};

const getSeoForPath = (pathname: string): SeoRoute => {
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];

  if (pathname.startsWith('/profile') || pathname.startsWith('/dashboard') || pathname.startsWith('/messages')) {
    return {
      title: `Member Area | ${SITE_NAME}`,
      description: 'Private member experience for matches, stories, conversations, and profile management.',
      index: false,
    };
  }

  return {
    title: `${SITE_NAME} App`,
    description: 'Faith-based dating experience for meaningful Christian relationships.',
    index: false,
  };
};

export const SeoMetaManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname || '/';
    const seo = getSeoForPath(pathname);
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    const robots = seo.index
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow';

    document.title = seo.title;
    ensureCanonical(canonicalUrl);

    ensureMetaByName('description', seo.description);
    ensureMetaByName('robots', robots);
    ensureMetaByName('googlebot', robots);
    ensureMetaByName('twitter:card', 'summary_large_image');
    ensureMetaByName('twitter:title', seo.title);
    ensureMetaByName('twitter:description', seo.description);
    ensureMetaByName('twitter:image', DEFAULT_IMAGE);

    ensureMetaByProperty('og:type', 'website');
    ensureMetaByProperty('og:site_name', SITE_NAME);
    ensureMetaByProperty('og:title', seo.title);
    ensureMetaByProperty('og:description', seo.description);
    ensureMetaByProperty('og:url', canonicalUrl);
    ensureMetaByProperty('og:image', DEFAULT_IMAGE);

    ensureJsonLd(pathname);
  }, [location.pathname]);

  return null;
};

