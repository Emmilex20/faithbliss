export type SeoRoute = {
  title: string;
  description: string;
  keywords: string;
  index: boolean;
  schemaType?: 'WebPage' | 'AboutPage' | 'CollectionPage';
};

export const SITE_NAME = 'FaithBliss';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://faithblissafrica.com').replace(/\/$/, '');
export const DEFAULT_IMAGE = `${SITE_URL}/bg5.jpg`;
export const LOGO_URL = `${SITE_URL}/FaithBliss-Logo%20Source.svg`;
export const THEME_COLOR = '#111827';
export const DEFAULT_KEYWORDS =
  'Christian dating app, faith based dating, Christian singles Africa, meaningful relationships, God-centered relationships, FaithBliss';

const DEFAULT_SEO: SeoRoute = {
  title: `${SITE_NAME} Africa | Christian Dating App for Meaningful Relationships`,
  description:
    'FaithBliss helps Christian singles across Africa build meaningful, God-centered relationships through intentional matching and authentic conversations.',
  keywords: DEFAULT_KEYWORDS,
  index: true,
  schemaType: 'CollectionPage',
};

export const ROUTE_SEO: Record<string, SeoRoute> = {
  '/': DEFAULT_SEO,
  '/about': {
    title: `About ${SITE_NAME} | Faith-Based Dating Community in Africa`,
    description:
      'Learn how FaithBliss helps Christian singles across Africa connect intentionally, build trust, and grow relationships rooted in shared faith.',
    keywords: 'about FaithBliss, Christian dating Africa, faith based relationships, Christian singles community',
    index: true,
    schemaType: 'AboutPage',
  },
  '/contact': {
    title: `Contact ${SITE_NAME} | Support and Help`,
    description:
      'Contact the FaithBliss team for support, safety concerns, account help, and general questions about the platform.',
    keywords: 'contact FaithBliss, FaithBliss support, dating app help, Christian dating support',
    index: true,
    schemaType: 'WebPage',
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      'Read how FaithBliss protects your personal information, communication data, and account privacy across the platform.',
    keywords: 'FaithBliss privacy policy, dating app privacy, Christian dating app data protection',
    index: true,
    schemaType: 'WebPage',
  },
  '/terms': {
    title: `Terms of Service | ${SITE_NAME}`,
    description:
      'Review the FaithBliss terms that govern account use, subscriptions, community behavior, and platform access.',
    keywords: 'FaithBliss terms, dating app terms of service, Christian dating app rules',
    index: true,
    schemaType: 'WebPage',
  },
  '/help': {
    title: `Help Center | ${SITE_NAME}`,
    description:
      'Find answers about account access, safety, subscriptions, and support options for FaithBliss members and visitors.',
    keywords: 'FaithBliss help center, FaithBliss FAQ, premium support, dating app safety help',
    index: true,
    schemaType: 'WebPage',
  },
  '/premium': {
    title: `Premium Plans | ${SITE_NAME}`,
    description:
      'Explore FaithBliss Premium plans, feature access, pricing, and matching benefits designed for intentional Christian relationships.',
    keywords: 'FaithBliss premium, Christian dating premium plan, faith based dating subscription, FaithBliss pricing',
    index: true,
    schemaType: 'CollectionPage',
  },
  '/login': {
    title: `Login | ${SITE_NAME}`,
    description: `Sign in to ${SITE_NAME} and continue building meaningful, faith-centered connections.`,
    keywords: 'FaithBliss login, sign in FaithBliss',
    index: false,
    schemaType: 'WebPage',
  },
  '/signup': {
    title: `Sign Up | ${SITE_NAME}`,
    description: `Create your ${SITE_NAME} account and meet Christian singles across Africa looking for meaningful relationships.`,
    keywords: 'FaithBliss sign up, Christian dating app registration',
    index: false,
    schemaType: 'WebPage',
  },
  '/reset-password': {
    title: `Reset Password | ${SITE_NAME}`,
    description: `Reset your ${SITE_NAME} password and get back to your account securely.`,
    keywords: 'FaithBliss reset password, account recovery',
    index: false,
    schemaType: 'WebPage',
  },
  '/verify-email': {
    title: `Verify Email | ${SITE_NAME}`,
    description: `Enter your FaithBliss email verification code to continue setting up your account.`,
    keywords: 'FaithBliss verify email, email verification',
    index: false,
    schemaType: 'WebPage',
  },
};

export const getSeoForPath = (pathname: string): SeoRoute => {
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];

  if (pathname.startsWith('/profile') || pathname.startsWith('/dashboard') || pathname.startsWith('/messages')) {
    return {
      title: `Member Area | ${SITE_NAME}`,
      description: 'Private member experience for matches, stories, conversations, and profile management.',
      keywords: 'FaithBliss member area, private dashboard',
      index: false,
      schemaType: 'WebPage',
    };
  }

  return {
    title: `${SITE_NAME} App`,
    description: 'Faith-based dating experience for meaningful Christian relationships.',
    keywords: DEFAULT_KEYWORDS,
    index: false,
    schemaType: 'WebPage',
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildSeoPayload = (pathname: string) => {
  const seo = getSeoForPath(pathname);
  const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
  const robots = seo.index
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, nofollow';

  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const pageId = `${canonicalUrl}#webpage`;
  const jsonLd = {
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

  return {
    seo,
    canonicalUrl,
    robots,
    jsonLd,
  };
};

export const renderSeoHead = (pathname: string) => {
  const { seo, canonicalUrl, robots, jsonLd } = buildSeoPayload(pathname);
  const structuredData = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`,
    '<meta name="author" content="FaithBliss" />',
    `<meta name="application-name" content="${SITE_NAME}" />`,
    `<meta name="apple-mobile-web-app-title" content="${SITE_NAME}" />`,
    `<meta name="theme-color" content="${THEME_COLOR}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta name="googlebot" content="${robots}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="en_US" />',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${DEFAULT_IMAGE}" />`,
    `<meta property="og:image:alt" content="${SITE_NAME} preview image" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${DEFAULT_IMAGE}" />`,
    `<meta name="twitter:image:alt" content="${SITE_NAME} preview image" />`,
    `<script id="faithbliss-seo-jsonld" type="application/ld+json">${structuredData}</script>`,
  ].join('\n    ');
};
