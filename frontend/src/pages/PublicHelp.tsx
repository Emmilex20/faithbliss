import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, HelpCircle, Mail, ShieldCheck, Sparkles } from 'lucide-react';

const helpTopics = [
  {
    title: 'Account access',
    description: 'Need help getting back in, verifying your email, or understanding how onboarding works?',
    link: '/contact',
    cta: 'Contact support',
    Icon: HelpCircle,
  },
  {
    title: 'Safety and reporting',
    description: 'Questions about safe conversations, suspicious activity, or community standards start here.',
    link: '/privacy',
    cta: 'Review privacy',
    Icon: ShieldCheck,
  },
  {
    title: 'Premium plans',
    description: 'Compare subscription options, pricing notes, and the benefits available with premium access.',
    link: '/premium',
    cta: 'View premium',
    Icon: Sparkles,
  },
] as const;

const faqs = [
  {
    question: 'Do I need an account to contact FaithBliss?',
    answer:
      'No. You can reach the team directly through the contact page or by email if you are not signed in yet.',
  },
  {
    question: 'Where do signed-in members send support requests?',
    answer:
      'Signed-in members can continue from the in-app help experience, where support history and replies stay attached to their account.',
  },
  {
    question: 'How do I report a safety concern?',
    answer:
      'Use the report tools inside the app when available, or email the team immediately if you need help before signing in.',
  },
] as const;

export default function PublicHelp() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navOpacity = Math.min(scrollY / 100, 0.95);

  return (
    <main className="min-h-screen bg-gray-900 text-white no-horizontal-scroll">
      <nav
        className="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: `rgba(17, 24, 39, ${navOpacity})`,
          backdropFilter: navOpacity > 0.1 ? 'blur(10px)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">FaithBliss</span>
              <span className="text-xs font-medium text-pink-300">
                Africa&apos;s Trusted Platform for
                <br />
                Christian Singles
              </span>
            </div>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-white transition-colors hover:text-pink-400">
              Home
            </Link>
            <Link to="/contact" className="text-white transition-colors hover:text-pink-400">
              Contact
            </Link>
            <Link to="/premium" className="text-white transition-colors hover:text-pink-400">
              Premium
            </Link>
            <Link to="/privacy" className="text-white transition-colors hover:text-pink-400">
              Privacy
            </Link>
          </div>
          <Link
            to="/login"
            className="whitespace-nowrap rounded-full bg-pink-500 px-6 py-2 text-sm text-white transition-all hover:bg-pink-600 md:text-base"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <div className="relative overflow-hidden px-6 pb-20 pt-32 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.15),transparent_45%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl">
          <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.45)] sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">Help Center</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              Help for getting started, staying safe, and understanding how FaithBliss works.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
              This page gives visitors and members a clear place to find support information before
              signing in. If you already have an account, you can still use the in-app help flow after
              login. If you are new here, start with our{' '}
              <Link to="/about" className="font-semibold text-pink-300 hover:text-pink-200">
                About page
              </Link>{' '}
              or head straight to{' '}
              <Link to="/contact" className="font-semibold text-pink-300 hover:text-pink-200">
                contact support
              </Link>
              .
            </p>
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-3">
            {helpTopics.map(({ title, description, link, cta, Icon }) => (
              <article
                key={title}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-gray-300">{description}</p>
                <Link
                  to={link}
                  className="mt-6 inline-flex rounded-full border border-pink-300/30 px-4 py-2 text-sm font-semibold text-pink-200 transition hover:border-pink-200/50 hover:text-pink-100"
                >
                  {cta}
                </Link>
              </article>
            ))}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">Frequently asked questions</h2>
              <div className="mt-6 space-y-5">
                {faqs.map(({ question, answer }) => (
                  <div key={question} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-lg font-semibold text-white">{question}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{answer}</p>
                  </div>
                ))}
              </div>
            </article>

            <aside className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent p-6 sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Mail className="h-7 w-7 text-pink-200" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">Direct support email</h2>
              <p className="mt-3 text-sm leading-7 text-gray-300">
                Need a human response? Reach the team at{' '}
                <a className="font-semibold text-pink-300 hover:text-pink-200" href="mailto:faithbliss@futuregrin.com">
                  faithbliss@futuregrin.com
                </a>
                . You can also review our{' '}
                <Link to="/terms" className="font-semibold text-pink-300 hover:text-pink-200">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-semibold text-pink-300 hover:text-pink-200">
                  Privacy Policy
                </Link>{' '}
                before creating an account.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
                >
                  Create account
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  Contact page
                </Link>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
