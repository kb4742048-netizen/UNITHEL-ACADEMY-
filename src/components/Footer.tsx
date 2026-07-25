import React from 'react';
import { Compass, Mail, MapPin, MessageSquare, PhoneCall } from 'lucide-react';
import { WebsiteAppearance } from '../types';

interface FooterProps {
  setView: (view: string) => void;
  appearance?: WebsiteAppearance | null;
}

export default function Footer({ setView, appearance }: FooterProps) {
  const whatsAppGroupLink = 'https://chat.whatsapp.com/BUFcRgyJ1In590VagfBfBf?s=cl&p=a&ilr=0';

  return (
    <footer className="bg-[#0A1F44] border-t-2 border-[#C9A227] text-white pt-10 pb-6 mt-auto font-sans text-xs">
      <div className="max-w-md mx-auto px-4 sm:max-w-xl md:max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className={`flex items-center justify-center ${
                appearance?.logoStyle === 'transparent'
                  ? 'p-0 bg-transparent border-0'
                  : appearance?.logoStyle === 'circle'
                  ? 'p-1.5 bg-[#0D2B4E] border border-[#C9A227] rounded-full'
                  : appearance?.logoStyle === 'rounded'
                  ? 'p-1.5 bg-[#0D2B4E] border border-[#C9A227] rounded-md'
                  : 'p-1.5 bg-[#0D2B4E] border border-[#C9A227]'
              }`}>
                {appearance?.logoUrl ? (
                  <img 
                    src={appearance.logoUrl} 
                    alt={appearance?.logoText || "Logo"} 
                    className="object-contain" 
                    style={{
                      height: `${Math.min(appearance?.logoHeight || 28, 40)}px`,
                      objectFit: (appearance?.logoFit as any) || 'contain'
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Compass className="h-5 w-5 text-[#C9A227]" />
                )}
              </div>
              <div>
                <span className="block font-serif text-xs sm:text-sm font-bold tracking-wider uppercase leading-none">
                  {appearance?.logoText || 'UNITHEL ACADEMY'}
                </span>
                <span className="block text-[8px] uppercase font-sans tracking-[0.15em] text-amber-400 mt-1 font-semibold">
                  {appearance?.logoSubtext || 'ALUMNI ORGANIZATION'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed text-justify">
              The official alumni network of Unithel Academy (Opolo Yenagoa, Bayelsa State). Dedicated to maintaining lifelong connections, mentorship, academic grants, and professional excellence.
            </p>
          </div>

          {/* Col 2: Quick Navigation */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-xs tracking-wider uppercase border-b border-[#C9A227]/40 pb-1.5 text-[#C9A227]">
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
              <li>
                <button onClick={() => setView('home')} className="hover:text-amber-200 text-left transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setView('about')} className="hover:text-amber-200 text-left transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => setView('leadership')} className="hover:text-amber-200 text-left transition-colors">
                  Leadership
                </button>
              </li>
              <li>
                <button onClick={() => setView('patrons')} className="hover:text-amber-200 text-left transition-colors">
                  Patrons
                </button>
              </li>
              <li>
                <button onClick={() => setView('events')} className="hover:text-amber-200 text-left transition-colors">
                  Events
                </button>
              </li>
              <li>
                <button onClick={() => setView('news')} className="hover:text-amber-200 text-left transition-colors">
                  News & Blog
                </button>
              </li>
              <li>
                <button onClick={() => setView('contact')} className="hover:text-amber-200 text-left transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Values Brief */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-xs tracking-wider uppercase border-b border-[#C9A227]/40 pb-1.5 text-[#C9A227]">
              Our Values
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Unity, Integrity, Lifelong Service, and Excellence guide our community. Join our alumni circle to connect and thrive.
            </p>
          </div>

          {/* Col 4: Contact & Direct WhatsApp Button */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs tracking-wider uppercase border-b border-[#C9A227]/40 pb-1.5 text-[#C9A227]">
              HQ Contact
            </h4>
            <div className="space-y-2 text-[11px] text-gray-300">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-[#C9A227] shrink-0 mt-0.5" />
                <span>UNITHEL ACADEMY, Opolo Yenagoa Bayelsa State</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#C9A227] shrink-0" />
                <span>info@scholarcircle.org</span>
              </div>
              
              {/* WhatsApp Button */}
              <div className="pt-1.5">
                <a
                  href={whatsAppGroupLink}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-md transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  <MessageSquare className="h-3.5 w-3.5 text-white fill-current" />
                  <span>Join WhatsApp Group</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Lower Footer */}
        <div className="border-t border-gray-700/60 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} UNITHEL ACADEMY ALUMNI ORGANIZATION. All rights reserved.</p>
          <div className="flex space-x-3">
            <a href="#" className="hover:text-amber-200 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-amber-200 transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
