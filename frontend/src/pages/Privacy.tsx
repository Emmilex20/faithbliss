import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Shield, Lock, Eye, Users, Globe, Mail, CheckCircle2 } from "lucide-react";
import FadeIn from "../components/FadeIn";

const sections = [
  {
    id: "overview",
    title: "Privacy at a glance",
    description:
      "We only collect what we need to create meaningful, faith-centered connections. You stay in control of what you share and with whom.",
    Icon: Shield,
  },
  {
    id: "data",
    title: "Information we collect",
    description:
      "Account details, profile responses, and usage activity help us personalize your experience and keep the community safe.",
    Icon: Eye,
  },
  {
    id: "safety",
    title: "How we protect you",
    description:
      "Secure infrastructure, moderation tools, and clear reporting paths help keep FaithBliss respectful and secure.",
    Icon: Lock,
  },
  {
    id: "rights",
    title: "Your choices and rights",
    description:
      "Update your profile, manage visibility, or request data removal at any time through your settings.",
    Icon: Users,
  },
];

export default function Privacy() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navOpacity = Math.min(scrollY / 100, 0.95);

  return (
    <main className="bg-gray-900 text-white min-h-screen no-horizontal-scroll">
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: `rgba(17, 24, 39, ${navOpacity})`,
          backdropFilter: navOpacity > 0.1 ? "blur(10px)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">FaithBliss</span>
                <span className="text-xs text-pink-300 font-medium">
                  Africa&apos;s Trusted Platform for
                  <br />
                  Christian Singles
                </span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="/" className="text-white hover:text-pink-400 transition-colors">
                Home
              </a>
              <a href="#overview" className="text-white hover:text-pink-400 transition-colors">
                Overview
              </a>
              <a href="#data" className="text-white hover:text-pink-400 transition-colors">
                Data
              </a>
              <a href="#safety" className="text-white hover:text-pink-400 transition-colors">
                Safety
              </a>
              <a href="#rights" className="text-white hover:text-pink-400 transition-colors">
                Your Rights
              </a>
            </div>
            <div className="flex gap-2">
              <Link to="/login">
                <button className="text-sm md:text-base bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-all whitespace-nowrap">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.14),transparent_55%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.16),transparent_55%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px]" />

        <section className="relative z-10 min-h-screen flex items-center">
          <FadeIn>
            <div className="w-full px-4 sm:px-6 lg:px-12">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-pink-300 mb-4">
                    Privacy Policy
                  </p>
                  <h1 className="text-4xl md:text-6xl font-black leading-tight">
                    Your trust matters to us.
                  </h1>
                  <p className="text-lg text-gray-300 mt-6 max-w-2xl leading-relaxed">
                    FaithBliss is built for believers who value integrity. This policy explains
                    what we collect, how we use it, and the choices you always have.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Globe className="text-pink-400" size={18} />
                      Africa-focused community
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="text-pink-400" size={18} />
                      Safety-first moderation
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Last updated</h3>
                      <p className="text-gray-300 text-sm">January 10, 2026</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Who this applies to</h3>
                      <p className="text-gray-300 text-sm">
                        Everyone who uses FaithBliss services, including our website, mobile
                        experiences, and community events.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Contact us</h3>
                      <p className="text-gray-300 text-sm">
                        Questions? Reach the Trust & Safety team at
                        <span className="text-pink-300"> support@faithbliss.com</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <section className="relative z-10 py-16 md:py-24">
          <div className="w-full px-4 sm:px-6 lg:px-12">
            <div className="grid gap-6 md:grid-cols-2">
              {sections.map((section, index) => (
                <FadeIn key={section.id} delay={150 * index}>
                  <div
                    id={section.id}
                    className="group bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-pink-400/60 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        <section.Icon className="text-pink-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 pb-16 md:pb-24">
          <FadeIn>
            <div className="w-full px-4 sm:px-6 lg:px-12">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-start">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Details you should know
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    We never sell your personal data. Some information is shared with trusted
                    partners who help us deliver services securely (like hosting or payment
                    processing), and only when necessary.
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Mail className="text-pink-400" size={18} />
                    You can request a data export or deletion in your account settings.
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  {[
                    "Profile visibility is always under your control.",
                    "We use cookies to keep you signed in and improve performance.",
                    "Moderation tools review reports to keep the community respectful.",
                    "If policies change, we notify you before updates take effect.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="text-pink-400" size={18} />
                      <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <footer className="bg-gray-900 text-white py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row  md:justify-between items-center">
              <div className="mb-8 md:mb-0 text-center md:text-left">
                <h3 className="text-2xl font-bold  bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                  FaithBliss
                </h3>
                <p className="text-gray-400 mt-2">Building faithful connections</p>
              </div>

              <div className="flex space-x-8">
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </Link>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center space-y-3">
              <p className="text-gray-400">2025 FaithBliss. Built with faith.</p>
              <p className="text-gray-500 text-sm">
                Powered by <span className="text-blue-400 font-semibold">FutureGRIN</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
