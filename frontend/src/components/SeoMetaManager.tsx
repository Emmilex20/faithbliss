import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type SeoRoute = {
  title: string;
  description: string;
  index: boolean;
  schemaType?: 'WebPage' | 'AboutPage' | 'CollectionPage';
};

const SITE_NAME = 'FaithBliss';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://faithblissafrica.com').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/bg5.jpg`;
const LOGO_URL = `${SITE_URL}/FaithBliss-Logo%20Source.svg`;
const THEME_COLOR = '#111827';

const DEFAULT_SEO: SeoRoute = {
  title: `${SITE_NAME} Africa | Christian Dating App for Meaningful Relationships`,
  description:
    'FaithBliss helps Christian singles across Africa build meaningful, God-centered relationships through intentional matching and authentic conversations.',
  index: true,
  schemaType: 'CollectionPage',
};

const ROUTE_SEO: Record<string, SeoRoute> = {
  '/': DEFAULT_SEO,
  '/about': {
    title: `About ${SITE_NAME} | Faith-Based Dating Community in Africa`,
    description:
      'Learn how FaithBliss helps Christian singles across Africa connect intentionally, build trust, and grow relationships rooted in shared faith.',
    index: true,
    schemaType: 'AboutPage',
  },
  '/contact': {
    title: `Contact ${SITE_NAME} | Support and Help`,
    description:
      'Contact the FaithBliss team for support, safety concerns, account help, and general questions about the platform.',
    index: true,
    schemaType: 'WebPage',
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Read how FaithBliss protects your personal information, communication data, and account privacy across the platform.',
    index: true,
    schemaType: 'WebPage',
  },
  '/login': {
    title: `Login | ${SITE_NAME}`,
    description: `Sign in to ${SITE_NAME} and continue building meaningful, faith-centered connections.`,
    index: false,
    schemaType: 'WebPage',
  },
  '/signup': {
    title: `Sign Up | ${SITE_NAME}`,
    description: `Create your ${SITE_NAME} account and meet Christian singles across Africa looking for meaningful relationships.`,
    index: false,
    schemaType: 'WebPage',
  },
  '/reset-password': {
    title: `Reset Password | ${SITE_NAME}`,
    description: `Reset your ${SITE_NAME} password and get back to your account securely.`,
    index: false,
    schemaType: 'WebPage',
  },
  '/verify-email': {
    title: `Verify Email | ${SITE_NAME}`,
    description: `Enter your FaithBliss email verification code to continue setting up your account.`,
    index: false,
    schemaType: 'WebPage',
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

const ensureJsonLd = (seo: SeoRoute, canonicalUrl: string) => {
  const scriptId = 'faithbliss-seo-jsonld';

  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const pageId = `${canonicalUrl}#webpage`;
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
      '@type': 'Organization',
      '@id': organizationId,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
      areaServed: 'Africa',
      description: DEFAULT_SEO.description,
      },
      {
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: DEFAULT_SEO.description,
      publisher: {
        '@id': organizationId,
      },
      },
      {
      '@type': seo.schemaType || 'WebPage',
      '@id': pageId,
      url: canonicalUrl,
      name: seo.title,
      description: seo.description,
      inLanguage: 'en',
      isPartOf: {
        '@id': websiteId,
      },
      about: {
        '@id': organizationId,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
      },
      },
    ],
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
      schemaType: 'WebPage',
    };
  }

  return {
    title: `${SITE_NAME} App`,
    description: 'Faith-based dating experience for meaningful Christian relationships.',
    index: false,
    schemaType: 'WebPage',
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

    ensureJsonLd(seo, canonicalUrl);
  }, [location.pathname]);

  return null;
};

