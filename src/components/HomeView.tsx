import React from 'react';
import { Calendar, BookOpen, Compass, ChevronRight, Users, Image as ImageIcon, Megaphone, MessageSquare } from 'lucide-react';
import { Blog, Event, WebsiteAppearance } from '../types';
import { getLeadershipRank } from '../utils/ranks';

interface HomeViewProps {
  setView: (view: string) => void;
  blogs: Blog[];
  events: Event[];
  appearance: WebsiteAppearance;
  openAuthModal: (mode: 'login' | 'register') => void;
  currentUser: any;
}

export default function HomeView({ setView, blogs, events, appearance, openAuthModal, currentUser }: HomeViewProps) {
  // Sort and filter latest 2 blogs visible on home
  const visibleBlogs = blogs
    .filter(b => b.visibleOnHome)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  // Sort upcoming events
  const upcomingEvents = events
    .filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const whatsAppGroupLink = 'https://chat.whatsapp.com/BUFcRgyJ1In590VagfBfBf?s=cl&p=a&ilr=0';

  const overlayOpacity = appearance?.imageOverlayOpacity ?? 0.88;
  const filterStyle = appearance?.imageFilterStyle ?? 'none';
  const imageHeight = appearance?.heroImageHeight ?? 420;
  const borderRadius = appearance?.imageBorderRadius ?? 'none';

  let filterCss = 'none';
  if (filterStyle === 'sepia') filterCss = 'sepia(0.35) contrast(1.05)';
  if (filterStyle === 'grayscale') filterCss = 'grayscale(0.7) contrast(1.1)';
  if (filterStyle === 'contrast') filterCss = 'contrast(1.25) brightness(0.95)';
  if (filterStyle === 'vintage') filterCss = 'sepia(0.25) contrast(1.15) hue-rotate(-10deg)';

  const heroBackground = `linear-gradient(rgba(10, 31, 68, ${overlayOpacity}), rgba(13, 43, 78, ${Math.min(1, overlayOpacity + 0.08)})), url(${appearance?.heroBannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'})`;

  return (
    <div className="bg-[#F5F1E8] text-[#1E293B] font-sans">
      
      {/* 1. HERO SECTION */}
      <section 
        className={`relative bg-[#0A1F44] text-white py-14 px-4 overflow-hidden border-b-4 border-[#C9A227] bg-cover bg-center flex flex-col justify-center transition-all ${borderRadius}`}
        style={{ 
          backgroundImage: heroBackground,
          minHeight: `${imageHeight}px`,
          filter: filterCss
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.04] pointer-events-none" />
        {/* Decorative Compass Mark */}
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <Compass className="h-48 w-48 sm:h-72 sm:w-72 text-[#C9A227]" />
        </div>

        <div className="max-w-md mx-auto sm:max-w-xl md:max-w-3xl text-center relative z-10 space-y-4">
          {/* LARGE & CLEAR LOGO BEFORE THE TITLE / ORGANIZATION NAME */}
          <div className="flex justify-center mb-6">
            <div className={`flex items-center justify-center backdrop-blur-md p-4 sm:p-6 bg-[#0D2B4E]/95 border-3 border-[#C9A227] shadow-[0_0_30px_rgba(201,162,39,0.5)] ${
              appearance.logoStyle === 'transparent'
                ? 'p-0 bg-transparent border-0 shadow-none'
                : appearance.logoStyle === 'circle'
                ? 'rounded-full'
                : appearance.logoStyle === 'rounded'
                ? 'rounded-3xl'
                : 'rounded-xl'
            }`}>
              {appearance.logoUrl ? (
                <img 
                  src={appearance.logoUrl} 
                  alt={appearance.logoText || "Unithel Academy Logo"} 
                  className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
                  style={{ objectFit: (appearance.logoFit as any) || 'contain' }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Compass className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 text-[#C9A227] drop-shadow-md" />
              )}
            </div>
          </div>

          <span className="inline-block text-[10px] sm:text-[11px] font-black font-sans tracking-[0.25em] uppercase bg-[#C9A227]/25 text-[#C9A227] px-4 py-1.5 border border-[#C9A227]/60 shadow-md">
            {appearance.logoText ? `${appearance.logoText} ${appearance.logoSubtext || ''}` : 'UNITHEL ACADEMY ALUMNI ASSOCIATION'}
          </span>
          <h1 className="font-serif text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase text-amber-100">
            {appearance.heroTitle || 'UNITHEL ACADEMY ALUMNI ASSOCIATION'}
          </h1>
          <p className="max-w-lg mx-auto text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
            {appearance.heroSubtitle || 'Connecting generations of Unithel Academy graduates, distinguished scholars, and academic patrons to foster lifelong excellence and mutual growth.'}
          </p>

          {/* LOGO APPEARS AFTER BRIEF INTRODUCTION AND BEFORE JOIN BUTTONS */}
          <div className="flex justify-center pt-2">
            <div className="p-2 bg-[#0C244C]/80 border border-[#C9A227]/50 rounded-none flex items-center justify-center">
              {appearance.logoUrl ? (
                <img 
                  src={appearance.logoUrl} 
                  alt="Unithel Academy Logo Small" 
                  className="h-10 w-10 object-contain" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Compass className="h-10 w-10 text-[#C9A227]" />
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2 max-w-xs mx-auto sm:max-w-none">
            {currentUser ? (
              <button
                onClick={() => setView('dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#C9A227] text-[#0A1F44] font-bold text-[11px] uppercase tracking-wider hover:bg-yellow-500 hover:scale-[1.02] active:scale-95 transition-all shadow-md border-b-4 border-[#9F7E1B]"
              >
                Launch Member Portal
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('register')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#C9A227] text-[#0A1F44] font-bold text-[11px] uppercase tracking-wider hover:bg-yellow-500 hover:scale-[1.02] active:scale-95 transition-all shadow-md border-b-4 border-[#9F7E1B]"
                >
                  Join Unithel Academy Alumni
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#0D2B4E] text-white border border-[#C9A227] font-bold text-[11px] uppercase tracking-wider hover:bg-[#C9A227]/20 transition-all"
                >
                  Member Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. BULLETIN BOARD / ANNOUNCEMENTS OVERVIEW */}
      {appearance.announcements && appearance.announcements.length > 0 && (
        <section className="bg-[#0D2B4E] text-white border-b border-[#C9A227]/30 py-3 overflow-hidden">
          <div className="max-w-md mx-auto sm:max-w-xl md:max-w-7xl px-4 flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-[#C9A227] text-[#0A1F44] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 animate-pulse">
              <Megaphone className="h-3 w-3" />
              <span>Bulletin</span>
            </div>
            <div className="overflow-hidden relative h-4 w-full">
              <div className="absolute whitespace-nowrap animate-[marquee_20s_linear_infinite] hover:pause text-[11px] tracking-wide text-amber-200">
                {appearance.announcements.join('  •  ')}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. WELCOME STATEMENT & MISSION PREVIEW */}
      <section className="py-10 px-4 max-w-md mx-auto sm:max-w-xl md:max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-0.5 w-6 bg-[#C9A227]" />
            <span className="font-serif font-bold text-[10px] uppercase tracking-widest text-[#C9A227]">
              Unithel Academy Welcome
            </span>
          </div>
          <h2 className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#0A1F44] uppercase leading-tight">
            A Lifelong Network of Academic & Career Excellence
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed text-justify">
            The Unithel Academy Alumni Association is a community of graduates dedicated to maintaining lifelong connections with one another and with Unithel Academy (Opolo Yenagoa, Bayelsa State). The association serves as a premier platform for networking, career mentorship, research grant sponsorship, and social service across generations.
          </p>
          <div className="pt-1">
            <button
              onClick={() => setView('about')}
              className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-[#0A1F44] hover:text-[#C9A227] group transition-colors"
            >
              <span>Read About Unithel Academy</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="md:col-span-5 bg-white border border-[#C9A227]/25 p-5 shadow-sm relative space-y-3">
          <div className="absolute top-0 right-0 bg-[#C9A227]/5 p-2">
            <Compass className="h-6 w-6 text-[#C9A227]/30" />
          </div>
          <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase">
            Unithel Academy Pillars
          </h3>
          <div className="space-y-3 text-[11px]">
            <div>
              <h4 className="font-bold uppercase text-[#C9A227] tracking-wider">Our Mission</h4>
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                To unite Unithel Academy graduates in a supportive network that promotes professional development, research mentorship, social service, and active support for students and alumni.
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase text-[#C9A227] tracking-wider">Our Vision</h4>
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                To stand as an elite, globally respected alumni association, cultivating visionary leadership and lifelong career opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS FEED */}
      <section className="bg-white py-10 border-t border-b border-gray-200">
        <div className="max-w-md mx-auto sm:max-w-xl md:max-w-7xl px-4">
          <div className="flex justify-between items-end mb-6 border-b border-[#0A1F44]/10 pb-3">
            <div>
              <span className="block text-[9px] font-bold uppercase text-[#C9A227] tracking-wider">
                Alumni Calendar
              </span>
              <h2 className="font-serif text-base sm:text-xl font-bold uppercase text-[#0A1F44]">
                Upcoming Gatherings
              </h2>
            </div>
            <button
              onClick={() => setView('events')}
              className="text-[10px] font-bold uppercase tracking-wider text-[#0A1F44] hover:text-[#C9A227] border-b border-[#0A1F44]"
            >
              All Events
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="bg-[#F5F1E8] border border-gray-200 border-l-4 border-l-[#C9A227] p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-1 text-[10px] text-amber-800 font-bold uppercase tracking-wider mb-1">
                    <Calendar className="h-3.5 w-3.5 text-[#C9A227]" />
                    <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#0A1F44] mb-1 uppercase tracking-wide">{event.title}</h3>
                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed mb-3">{event.description}</p>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">
                    <span>Venue: {event.venue}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 bg-gray-50 border border-gray-100">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">No scheduled gatherings found. Check back later.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. LATEST BLOG & NEWS FEED */}
      <section className="py-10 max-w-md mx-auto sm:max-w-xl md:max-w-7xl px-4">
        <div className="flex justify-between items-end mb-6 border-b border-[#0A1F44]/10 pb-3">
          <div>
            <span className="block text-[9px] font-bold uppercase text-[#C9A227] tracking-wider">
              Circle Archives
            </span>
            <h2 className="font-serif text-base sm:text-xl font-bold uppercase text-[#0A1F44]">
              News & Updates
            </h2>
          </div>
          <button
            onClick={() => setView('news')}
            className="text-[10px] font-bold uppercase tracking-wider text-[#0A1F44] hover:text-[#C9A227] border-b border-[#0A1F44]"
          >
            All Logs
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleBlogs.length > 0 ? (
            visibleBlogs.map((blog) => (
              <div key={blog.id} className="bg-white border border-[#C9A227]/20 shadow-sm flex flex-col overflow-hidden">
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#0A1F44] text-[#C9A227] border border-[#C9A227] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    {blog.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[9px] text-gray-400 block">
                      Published {new Date(blog.date).toLocaleDateString()}
                    </span>
                    <h3 className="font-serif font-bold text-xs text-[#0A1F44] hover:text-[#C9A227] transition-colors uppercase tracking-wide line-clamp-1 mt-0.5">
                      {blog.title}
                    </h3>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-1">
                      {blog.excerpt}
                    </p>
                  </div>
                  <button
                    onClick={() => setView('news')}
                    className="inline-flex items-center text-[10px] font-bold text-[#0A1F44] hover:text-[#C9A227] uppercase tracking-wider"
                  >
                    <span>Read More</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 bg-white border border-[#C9A227]/10">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Circle log list is currently empty.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. EXECUTIVE LEADERSHIP PREVIEW */}
      <section className="bg-[#0A1F44] text-white py-10 border-t-2 border-[#C9A227]">
        <div className="max-w-md mx-auto sm:max-w-xl md:max-w-7xl px-4">
          <div className="text-center mb-8">
            <span className="text-[9px] font-bold text-[#C9A227] uppercase tracking-[0.2em] block mb-1">
              Circle Leaders
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold uppercase text-white tracking-wide">
              Executive Leadership
            </h2>
            <div className="h-0.5 w-12 bg-[#C9A227] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {appearance.leaders && appearance.leaders.length > 0 ? (
              [...appearance.leaders]
                .sort((a, b) => getLeadershipRank(a.position) - getLeadershipRank(b.position))
                .map((leader, i) => (
                <div key={i} className="bg-[#0D2B4E] border border-[#C9A227]/30 p-4 text-center flex flex-col items-center shadow shadow-black/20">
                  <div className="h-20 w-20 rounded-full overflow-hidden border border-[#C9A227] mb-2.5">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif font-bold text-xs text-amber-100 uppercase tracking-wide leading-none">{leader.name}</h3>
                  <span className="text-[9px] uppercase text-gray-300 font-sans tracking-wider mt-1 block">{leader.position}</span>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-[10px] text-gray-400">Officers credentials currently validating.</p>
            )}
          </div>
        </div>
      </section>

      {/* 7. PHOTO GALLERY PREVIEW */}
      <section className="py-10 max-w-md mx-auto sm:max-w-xl md:max-w-7xl px-4 bg-[#F5F1E8]">
        <div className="text-center mb-6">
          <span className="text-[9px] font-bold text-[#C9A227] uppercase tracking-[0.2em] block mb-1">
            Visual Highlights
          </span>
          <h2 className="font-serif text-base sm:text-xl font-bold uppercase text-[#0A1F44]">
            Recent Activities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {appearance.gallery && appearance.gallery.length > 0 ? (
            appearance.gallery.map((url, index) => (
              <div key={index} className="h-44 overflow-hidden border border-gray-300 relative group shadow-sm bg-white">
                <img
                  src={url}
                  alt={`Activity ${index + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-[10px] text-gray-500">No photos logged in gallery.</p>
          )}
        </div>
      </section>

      {/* 8. CALL TO ACTION & CONTACT */}
      <section className="bg-gradient-to-r from-[#0A1F44] to-[#0D2B4E] text-white py-12 border-t-2 border-[#C9A227] px-4 text-center">
        <div className="max-w-md mx-auto sm:max-w-xl md:max-w-3xl space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-2.5 bg-[#0D2B4E]/80 border-2 border-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.3)] rounded-none flex items-center justify-center">
              {appearance.logoUrl ? (
                <img 
                  src={appearance.logoUrl} 
                  alt="Scholar Circle Logo CTA" 
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Compass className="h-10 w-10 sm:h-12 sm:w-12 text-[#C9A227] animate-spin-slow" />
              )}
            </div>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-black uppercase tracking-wide">
            Ready to Connect?
          </h2>
          <p className="text-[11px] text-gray-300 leading-relaxed max-w-md mx-auto">
            Eligied graduates, academic professionals, and distinguished circle patrons are welcome to register securely today. Support our values and connect.
          </p>
          <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full py-2.5 bg-[#C9A227] text-[#0A1F44] font-bold text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all shadow shadow-black/25 rounded-none"
            >
              Request Access Code
            </button>
            <a
              href={whatsAppGroupLink}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="w-full inline-flex justify-center items-center space-x-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] tracking-widest uppercase transition-colors shadow shadow-black/25"
              style={{ minHeight: '44px' }}
            >
              <MessageSquare className="h-4 w-4 text-white fill-current shrink-0" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>
        </div>
      </section>
      
    </div>
  );
}
