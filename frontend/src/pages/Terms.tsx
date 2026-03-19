import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Heart, ShieldCheck, Wallet } from 'lucide-react';

const termSections = [
  {
    title: 'Eligibility and account use',
    description:
      'You must provide accurate information, protect your login details, and use FaithBliss only for lawful, respectful, relationship-focused purposes.',
    Icon: FileText,
  },
  {
    title: 'Community standards',
    description:
      'Harassment, fraud, impersonation, explicit content, or abusive behavior can lead to moderation action, account restrictions, or removal.',
    Icon: ShieldCheck,
  },
  {
    title: 'Premium plans and billing',
    description:
      'Paid subscriptions and add-ons are billed through our payment providers. Pricing, billing cycle details, and renewal terms are shown before checkout.',
    Icon: Wallet,
  },
] as const;

export default function Terms() {
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
            <Link to="/privacy" className="text-white transition-colors hover:text-pink-400">
              Privacy
            </Link>
            <Link to="/contact" className="text-white transition-colors hover:text-pink-400">
              Contact
            </Link>
            <Link to="/help" className="text-white transition-colors hover:text-pink-400">
              Help
            </Link>
          </div>
          <Link
            to="/signup"
            className="whitespace-nowrap rounded-full bg-pink-500 px-6 py-2 text-sm text-white transition-all hover:bg-pink-600 md:text-base"
          >
            Join Now
          </Link>
        </div>
      </nav>

      <div className="relative overflow-hidden px-6 pb-20 pt-32 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.14),transparent_45%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.16),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl">
          <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.45)] sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">Terms of Service</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              Clear rules for using FaithBliss with respect, honesty, and care.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
              These terms govern how you access FaithBliss, use community features, purchase premium
              plans, and interact with other members. They work together with our{' '}
              <Link to="/privacy" className="font-semibold text-pink-300 hover:text-pink-200">
                Privacy Policy
              </Link>{' '}
              and our{' '}
              <Link to="/help" className="font-semibold text-pink-300 hover:text-pink-200">
                Help Center
              </Link>
              .
            </p>
            <p className="mt-4 text-sm text-gray-400">Last updated: March 19, 2026</p>
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-3">
            {termSections.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-gray-300">{description}</p>
              </article>
            ))}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">Subscriptions and payments</h2>
              <p className="mt-4 text-sm leading-7 text-gray-300">
                Premium subscriptions, renewals, and add-ons are optional paid services. Before you
                complete checkout, we show pricing, billing interval, and the product you are buying.
                Questions about payment or premium access can be reviewed on our{' '}
                <Link to="/premium" className="font-semibold text-pink-300 hover:text-pink-200">
                  Premium page
                </Link>{' '}
                or sent through our{' '}
                <Link to="/contact" className="font-semibold text-pink-300 hover:text-pink-200">
                  Contact page
                </Link>
                .
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">Enforcement and suspension</h2>
              <p className="mt-4 text-sm leading-7 text-gray-300">
                We may investigate reports, restrict features, suspend accounts, or remove access when
                behavior threatens member safety, violates these terms, or attempts to misuse the
                platform. If you need help resolving an issue, use the{' '}
                <Link to="/help" className="font-semibold text-pink-300 hover:text-pink-200">
                  Help Center
                </Link>{' '}
                or contact us directly.
              </p>
            </article>
          </section>

          <section className="mt-10 rounded-[1.75rem] border border-white/10 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-blue-500/15 p-8 text-center sm:p-10">
            <h2 className="text-3xl font-semibold text-white">Need clarification before joining?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-300">
              Review our privacy commitments, explore premium features, or reach the team if you need
              help understanding how FaithBliss works before creating an account.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/privacy"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Read privacy policy
              </Link>
              <Link
                to="/contact"
                className="rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
              >
                Contact support
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
