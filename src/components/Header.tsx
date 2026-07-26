import React, { useState } from 'react';
import { Compass, Menu, X, Shield, User, LogIn, Award, LogOut } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  currentUser: any;
  onLogout: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  appearance?: any;
}

export default function Header({ currentView, setView, currentUser, onLogout, openAuthModal, appearance }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'patrons', label: 'Patrons' },
    { id: 'events', label: 'Events' },
    { id: 'news', label: 'News & Blog' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setView(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A1F44] border-b-2 border-[#C9A227] text-white shadow-md">
      {/* Gold Braid Line */}
      <div className="h-1 bg-gradient-to-r from-[#C9A227] via-yellow-200 to-[#C9A227]" />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo Section */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <div className={`transition-all group-hover:scale-105 duration-300 flex items-center justify-center ${
              appearance?.logoStyle === 'transparent'
                ? 'p-0 bg-transparent border-0'
                : appearance?.logoStyle === 'circle'
                ? 'p-1.5 bg-[#0D2B4E] border border-[#C9A227] rounded-full shadow-[0_0_8px_rgba(201,162,39,0.3)]'
                : appearance?.logoStyle === 'rounded'
                ? 'p-1.5 bg-[#0D2B4E] border border-[#C9A227] rounded-md shadow-[0_0_8px_rgba(201,162,39,0.3)]'
                : 'p-1.5 bg-[#0D2B4E] border border-[#C9A227] shadow-[0_0_6px_rgba(201,162,39,0.2)]'
            }`}>
              {appearance?.logoUrl ? (
                <img 
                  src={appearance.logoUrl} 
                  alt={appearance?.logoText || "Logo"} 
                  className="object-contain" 
                  style={{
                    height: `${appearance?.logoHeight || 32}px`,
                    maxHeight: '52px',
                    objectFit: (appearance?.logoFit as any) || 'contain'
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Compass className="text-[#C9A227]" style={{ height: `${appearance?.logoHeight || 28}px`, width: `${appearance?.logoHeight || 28}px` }} />
              )}
            </div>
            <div>
              <span className="block font-serif text-sm sm:text-base font-bold tracking-wider text-white group-hover:text-amber-200 uppercase leading-none">
                {appearance?.logoText || 'UNITHEL ACADEMY'}
              </span>
              <span className="block text-[8px] sm:text-[9px] uppercase font-sans tracking-[0.2em] text-amber-400 mt-1 font-bold">
                {appearance?.logoSubtext || 'ALUMNI ASSOCIATION'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 text-xs uppercase tracking-widest font-sans transition-colors duration-150 border-b-2 ${
                  currentView === item.id
                    ? 'border-[#C9A227] text-[#C9A227] font-bold'
                    : 'border-transparent text-gray-200 hover:text-white hover:border-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#C9A227] bg-[#0D2B4E] text-[10px] uppercase tracking-widest text-white hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all font-sans"
                >
                  {currentUser.role === 'admin' ? (
                    <Shield className="h-3.5 w-3.5 text-[#C9A227]" />
                  ) : currentUser.role === 'lord_patron' ? (
                    <Award className="h-3.5 w-3.5 text-[#C9A227]" />
                  ) : (
                    <Compass className="h-3.5 w-3.5 text-[#C9A227]" />
                  )}
                  <span>Portal</span>
                </button>
                <div className="text-right">
                  <span className="block text-xs font-serif font-semibold leading-tight">{currentUser.name}</span>
                  <span className="block text-[8px] uppercase tracking-wider text-amber-300 leading-none">
                    {currentUser.role === 'admin' ? 'Admin Officer' : currentUser.role === 'lord_patron' ? 'Lord Patron' : 'Alumni'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 border border-red-500/30 text-gray-300 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs uppercase tracking-widest border border-transparent text-[#C9A227] hover:border-[#C9A227] hover:bg-[#0D2B4E] transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3 py-1.5 text-xs uppercase tracking-widest bg-[#C9A227] text-[#0A1F44] font-bold border border-[#C9A227] hover:bg-transparent hover:text-white transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center space-x-2">
            {currentUser && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="p-2 border border-[#C9A227] text-[#C9A227] hover:bg-[#0D2B4E] active:scale-95 transition-transform"
                title="Portal Dashboard"
              >
                <Compass className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-[#C9A227] active:scale-95 transition-transform"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Strictly responsive & fit on 320px–430px screens) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A1F44] border-t border-[#C9A227] py-3.5 px-4 space-y-2.5 animate-in fade-in slide-in-from-top-3 duration-150">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2 px-3 text-[11px] uppercase tracking-widest border transition-colors ${
                  currentView === item.id 
                    ? 'border-[#C9A227] text-[#C9A227] font-bold bg-[#0D2B4E]' 
                    : 'border-transparent text-gray-300 hover:bg-[#0D2B4E]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="h-[1px] bg-gray-700/60" />
          
          {currentUser ? (
            <div className="flex justify-between items-center bg-[#0D2B4E]/50 p-2.5 border border-gray-700/50">
              <div className="text-xs">
                <span className="block font-serif font-bold text-gray-100">{currentUser.name}</span>
                <span className="block text-[9px] text-amber-300 uppercase tracking-widest mt-0.5">
                  {currentUser.role === 'admin' ? 'Admin Officer' : currentUser.role === 'lord_patron' ? 'Lord Patron' : 'Alumni'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 text-[10px] bg-red-950/60 border border-red-500/40 text-red-400 font-bold uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }}
                className="text-center py-2 text-[10px] border border-[#C9A227] text-[#C9A227] uppercase tracking-widest font-bold"
              >
                Login
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal('register'); }}
                className="text-center py-2 text-[10px] bg-[#C9A227] text-[#0A1F44] font-bold uppercase tracking-widest"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
