import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, HelpCircle, ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';

const contactOptions = [
  {
    title: 'Email support',
    description: 'Reach our Trust & Safety team directly for questions, reports, or account help.',
    ctaLabel: 'Email support',
    href: 'mailto:faithbliss@futuregrin.com',
    external: true,
    Icon: Mail,
  },
  {
    title: 'Help center',
    description: 'Already have an account? Sign in to send a support request from your in-app help page.',
    ctaLabel: 'Go to Help',
    href: '/help',
    external: false,
    Icon: HelpCircle,
  },
] as const;

export default function Contact() {
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
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: `rgba(17, 24, 39, ${navOpacity})`,
          backdropFilter: navOpacity > 0.1 ? 'blur(10px)' : 'none',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between py-4">
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

            <div className="flex gap-2">
              <Link to="/signup">
                <button className="whitespace-nowrap rounded-full bg-pink-500 px-6 py-2 text-sm text-white transition-all hover:bg-pink-600 md:text-base">
                  Join Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-20 pt-32 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.16),transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl">
          <FadeIn>
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.45)] sm:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">Contact</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
                Need help, have feedback, or want to reach the FaithBliss team?
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
                We are here to help with questions about getting started, account access, safety concerns,
                and general support.
              </p>
            </div>
          </FadeIn>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {contactOptions.map(({ title, description, ctaLabel, href, external, Icon }) => {
              const content = (
                <div className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition hover:border-pink-400/30 hover:bg-white/[0.07]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-white">{title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-gray-300">{description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pink-300">
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );

              return external ? (
                <a key={title} href={href} className="block h-full">
                  {content}
                </a>
              ) : (
                <Link key={title} to={href} className="block h-full">
                  {content}
                </Link>
              );
            })}
          </div>

          <FadeIn delay={120}>
            <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">Direct email</h2>
              <p className="mt-3 text-sm leading-7 text-gray-300">
                You can always reach us at{' '}
                <a className="font-semibold text-pink-300 hover:text-pink-200" href="mailto:faithbliss@futuregrin.com">
                  faithbliss@futuregrin.com
                </a>
                .
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
