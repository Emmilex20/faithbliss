import { Link } from "react-router-dom"; // <-- CHANGED from 'next/link'
import { Heart, Globe, Users, Target, Shield, Handshake, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import FadeIn from "../components/FadeIn"; // <-- IMPORTED our component

// All &apos; have been replaced with '
// All &quot; have been replaced with "

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  // Array of background images
  // IMPORTANT: Place these images in the 'frontend/public' folder
  const backgroundImages = [
    '/bg1.jpg',
    '/bg2.jpg',
    '/bg3.jpg',
    '/bg4.jpg',
    '/bg5.jpg',
    '/bg6.jpg',
    '/bg.jpg'
  ];

  // Love stories data
  const loveStories = [
    {
      id: 1,
      initials: "S&D",
      names: "Sarah & David",
      status: "Engaged 2025",
      gradient: "from-purple-500 to-pink-500",
      borderColor: "purple-500",
      textColor: "purple-300",
      quote: "Found my prayer partner and soulmate! We bonded over mission trips and now we're planning to serve together in ministry."
    },
    {
      id: 2,
      initials: "J&R",
      names: "James & Rachel",
      status: "Dating 1 Year",
      gradient: "from-blue-500 to-cyan-500",
      borderColor: "blue-500",
      textColor: "blue-300",
      quote: "What started as a conversation about favorite Bible verses turned into the most beautiful relationship. Thank you FaithBliss!"
    },
    {
      id: 3,
      initials: "M&L",
      names: "Michael & Lisa",
      status: "Married 2023",
      gradient: "from-green-500 to-emerald-500",
      borderColor: "green-500",
      textColor: "green-300",
      quote: "We discovered we both volunteer at the same shelter! God's timing is perfect. Now we serve together as husband and wife."
    },
    {
      id: 4,
      initials: "E&G",
      names: "Emmanuel & Grace",
      status: "Married 2024",
      gradient: "from-yellow-500 to-orange-500",
      borderColor: "yellow-500",
      textColor: "yellow-300",
      quote: "From different countries but same faith! Long distance became short when we realized we were meant to be together."
    },
    {
      id: 5,
      initials: "P&J",
      names: "Peter & Joy",
      status: "Engaged 2024",
      gradient: "from-indigo-500 to-purple-600",
      borderColor: "indigo-500",
      textColor: "indigo-300",
      quote: "Both youth pastors who found love while serving God. Our shared ministry brought us together in the most beautiful way."
    },
    {
      id: 6,
      initials: "D&R",
      names: "Daniel & Ruth",
      status: "Dating 8 months",
      gradient: "from-rose-500 to-pink-600",
      borderColor: "rose-500",
      textColor: "rose-300",
      quote: "Two worship leaders from different churches who harmonize perfectly in love and music. God's plan is always perfect!"
    }
  ];

  // Image rotation effect with fade out/in transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true); // Start fade out
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % backgroundImages.length
        );
        setIsTransitioning(false); // Start fade in
      }, 500); // Wait 500ms for fade out before changing image

    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Auto-scroll for love stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prevIndex) => 
        (prevIndex + 1) % loveStories.length
      );
    }, 4000); // Change story every 4 seconds

    return () => clearInterval(interval);
  }, [loveStories.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    let ticking = false;
    const smoothScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', smoothScroll, { passive: true });
    return () => window.removeEventListener('scroll', smoothScroll);
  }, []);

  // Tinder-style scroll calculations
  const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const scrollProgress = Math.min(scrollY / heroHeight, 1);
  
  // Background parallax - slower movement (Tinder style)
  const bgTransform = scrollY * 0.3;
  
  // Content fade and movement - faster than background
  const contentOpacity = Math.max(0, 1 - scrollProgress * 1.2);
  const contentTransform = scrollY * 0.6;
  
  // Headline scale effect (Tinder-style)
  const headlineScale = Math.max(0.8, 1 - scrollProgress * 0.3);
  const headlineOpacity = Math.max(0, 1 - scrollProgress * 1.5);
  
  // Navigation background appears on scroll
  const navOpacity = Math.min(scrollY / 100, 0.95);

  return (
    <main className="bg-gray-900 no-horizontal-scroll dashboard-main" style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: `rgba(17, 24, 39, ${navOpacity})`,
          backdropFilter: navOpacity > 0.1 ? 'blur(10px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">FaithBliss</span>
                <span className="text-xs text-pink-300 font-medium">Africa's Trusted Platform for<br />Christian Singles</span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              {/* These are hash links, so <a> is correct */}
              <a href="#features" className="text-white hover:text-pink-400 transition-colors">Why FaithBliss</a>
              <a href="/about" className="text-white hover:text-pink-400 transition-colors">About</a>
              <a href="#stories" className="text-white hover:text-pink-400 transition-colors">Love Stories</a>
              <a href="#community" className="text-white hover:text-pink-400 transition-colors">Community</a>
            </div>
            <div className="flex gap-2">
              {/* These are page links, so <Link> is correct */}
              <Link to="/login">
                <button className="text-sm md:text-base bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-all whitespace-nowrap">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Tinder-Style Parallax */}
      <section className="relative min-h-screen md:h-screen overflow-hidden">
        {/* Background Images with Fade Out/In Rotation */}
        {backgroundImages.map((image, index) => (
          <div 
            key={index}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 will-change-transform transition-opacity duration-700 ease-in-out"
            style={{
              backgroundImage: `url('${image}')`,
              transform: `translate3d(0, ${bgTransform}px, 0) scale(1.1)`,
              opacity: index === currentImageIndex ? (isTransitioning ? 0.7 : 1) : 0,
            }}
          />
        ))}
        
        <div className="absolute inset-0">
          {/* Lighter overlay for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/10"></div>
        </div>
        
        {/* Content Layer - Faster movement with fade */}
        <div 
          className="relative z-10 min-h-screen md:h-screen flex items-center justify-center px-4 pt-20 pb-8 md:pt-24 md:pb-0 will-change-transform"
          style={{
            opacity: contentOpacity,
            transform: `translate3d(0, ${contentTransform}px, 0)`,
          }}
        >
          <div className="text-center text-white max-w-4xl mx-auto flex flex-col items-center justify-center">
            {/* Headline with Tinder-style scale and fade effect */}
            <div 
              className="will-change-transform flex flex-col items-center"
              style={{
                opacity: headlineOpacity,
                transform: `scale(${headlineScale})`,
              }}
            >
              <h1 className="text-3xl md:text-6xl font-bold mb-6 leading-tight text-center">
                Believers Across
                <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Africa Are Finding Love
                </span>
                <span className="block text-white" style={{ fontFamily: "'Dancing Script', cursive" }}>on FaithBliss</span>
              </h1>
              <p className="text-sm md:text-xl mb-8 md:mb-12 text-gray-200 max-w-3xl mx-auto text-center">
                Built specifically for African Christians - connecting believers across all 54 countries with shared faith, values, and marriage intentions.
              </p>
              
              {/* CTA Button - Simple & Responsive */}
              <div className="flex justify-center">
                <Link to="/signup">
                  <button className="bg-pink-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold hover:bg-pink-600 transition-all transform hover:scale-105 shadow-2xl backdrop-blur-sm border border-pink-400/20">
                    Start My Love Journey
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Why FaithBliss?
              </h2>
              <p className="text-md text-gray-300 max-w-3xl mx-auto leading-relaxed">
                More than just a dating app - we understand African faith, values, and realities
              </p>
            </div>
          </FadeIn>

          {/* Features Grid - 3 per row, responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* First Row */}
            <FadeIn delay={200}>
              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-pink-500/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">Marriage, Not Casual Dating</h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    Every connection is intended to nurture godly friendship that could lead to Christian marriage.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">Built for African Christians</h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    FaithBliss understands African faith, values, and realities — and is built around them.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">Diverse & Interdenominational</h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    Connecting believers across all African 54 countries and 20+ denominations. Your chances of finding love are high.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Second Row */}
            <FadeIn delay={500}>
              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">Smart Filters for Selective Search</h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    Find exactly what you're looking for. Narrow by country, denomination, or church family — so Nigerians can meet Nigerians, Pentecostals can meet Pentecostals.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={600}>
              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">Safe & Decent</h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    We welcome your gorgeous and best looks, but filter out inappropriate content to protect Christian values.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={700}>
              <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-teal-500/50 transition-all duration-500 hover:transform hover:scale-105 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Handshake className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">Community & Meetups</h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    Go beyond swipes — connect through sub-groups, interest spaces, and safe events for travelers, professionals, creatives, and more.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Faith & Love Resources - Full Width */}
          <FadeIn delay={800}>
            <div className="mt-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-4 mb-1">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-3xl font-bold text-white">Faith & Love Resources</h3>
              </div>
              <p className="text-sm md:text-xl text-gray-300 text-left max-w-4xl mx-auto leading-relaxed">
                Get devotionals, relationship insights, and marriage preparation tools designed to help Christian singles grow in love and faith together.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="stories" className="py-20 px-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Love Stories
              </h2>
              <p className="text-md md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Real couples who found their forever person through faith, love, and divine timing 
              </p>
            </div>
          </FadeIn>

          {/* Auto-Scrolling Story Cards - Responsive */}
          {/* Note: This carousel logic is simple and might be jumpy on resize. */}
          {/* We can refine this later if needed. */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-1000 ease-in-out"
              style={{
                // This logic seems built for 3 items. Be mindful on mobile.
                // We'll address full responsiveness later.
                transform: `translateX(-${currentStoryIndex * (100 / 3)}%)`,
                width: `${loveStories.length * (100 / 3)}%`
              }}
            >
              {loveStories.map((story, index) => (
                <div 
                  key={story.id}
                  className="w-1/3 flex-shrink-0 px-3" // This forces 3-wide
                >
                  <FadeIn delay={300 + (index * 100)}>
                    <div className={`group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700 hover:border-${story.borderColor}/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-${story.borderColor}/20 h-full`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${story.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base`}>
                              {story.initials}
                            </div>
                            <div>
                              <h3 className="text-base md:text-lg font-bold text-white">{story.names}</h3>
                              <p className={`text-${story.textColor} text-xs md:text-sm`}>{story.status}</p>
                            </div>
                          </div>
                        </div>
                        <blockquote className="text-gray-300 leading-relaxed text-xs md:text-sm italic">
                          "{story.quote}"
                        </blockquote>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              ))}
            </div>
            
            {/* Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {loveStories.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStoryIndex ? 'bg-pink-500 w-8' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  onClick={() => setCurrentStoryIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
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
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms</Link>
              <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center space-y-3">
            <p className="text-gray-400">
              2025 FaithBliss. Built with faith.
            </p>
            <p className="text-gray-500 text-sm">
              Powered by <span className="text-blue-400 font-semibold">FutureGRIN</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}