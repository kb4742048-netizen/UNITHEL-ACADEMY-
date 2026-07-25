import React, { useState } from 'react';
import { Compass, Shield, Award, LogOut, Globe, Menu, X, User } from 'lucide-react';

interface PortalHeaderProps {
  currentUser: any;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
  appearance?: any;
}

export default function PortalHeader({ currentUser, currentView, setView, onLogout, appearance }: PortalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#0A1F44] border-b-2 border-[#C9A227] text-white sticky top-0 z-50 shadow-lg font-sans">
      {/* Gold Braid Line */}
      <div className="h-1 bg-gradient-to-r from-[#C9A227] via-yellow-200 to-[#C9A227]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Brand Header */}
          <div 
            onClick={() => setView('dashboard')} 
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <div className={`transition-all group-hover:scale-105 duration-300 flex items-center justify-center ${
              appearance?.logoStyle === 'transparent'
                ? 'p-0 bg-transparent border-0'
                : appearance?.logoStyle === 'circle'
                ? 'p-1 bg-[#0D2B4E] border border-[#C9A227] rounded-full shadow-[0_0_8px_rgba(201,162,39,0.3)]'
                : appearance?.logoStyle === 'rounded'
                ? 'p-1 bg-[#0D2B4E] border border-[#C9A227] rounded-md shadow-[0_0_8px_rgba(201,162,39,0.3)]'
                : 'p-1 bg-[#0D2B4E] border border-[#C9A227] shadow-[0_0_6px_rgba(201,162,39,0.2)]'
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
                <Compass className="h-4.5 w-4.5 text-[#C9A227]" />
              )}
            </div>
            <div>
              <span className="block font-serif text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-none">
                {appearance?.logoText || 'UNITHEL ACADEMY'}
              </span>
              <span className="block text-[8px] uppercase font-sans tracking-[0.15em] text-amber-400 mt-0.5 font-semibold">
                {appearance?.logoSubtext ? `${appearance.logoSubtext} WORKSPACE` : 'ALUMNI WORKSPACE'}
              </span>
            </div>
          </div>

          {/* Desktop Right Panel Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Public Portal Link */}
            <button
              onClick={() => setView('home')}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-700 hover:border-slate-500 bg-slate-800/40 text-[10px] uppercase tracking-widest text-slate-200 hover:text-white transition-all font-semibold cursor-pointer"
              style={{ minHeight: '36px' }}
              title="Return to Public Website"
            >
              <Globe className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>Public Website</span>
            </button>

            {/* If Admin, Option to Toggle to Admiralty Deck */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setView(currentView === 'admin-console' ? 'dashboard' : 'admin-console')}
                className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#C9A227] bg-[#0D2B4E] hover:bg-[#C9A227] hover:text-[#0A1F44] text-[10px] uppercase tracking-widest text-white font-bold transition-all cursor-pointer animate-pulse hover:animate-none"
                style={{ minHeight: '36px' }}
                title={currentView === 'admin-console' ? 'Switch to Member Dashboard' : 'Go to Admin Console'}
              >
                <Shield className="h-3.5 w-3.5 text-[#C9A227] group-hover:text-current" />
                <span>
                  {currentView === 'admin-console' ? 'Member Account' : 'Admin Console'}
                </span>
              </button>
            )}

            {/* Logged in User Identity Block */}
            <div className="text-right border-l border-slate-700/60 pl-3">
              <span className="block text-xs font-serif font-bold text-gray-100 leading-tight">
                {currentUser?.name}
              </span>
              <span className="block text-[8px] uppercase tracking-wider text-amber-300 leading-none">
                {currentUser?.role === 'admin' ? 'Admin Officer' : currentUser?.role === 'lord_patron' ? 'Lord Patron' : 'Alumni'}
              </span>
            </div>

            {/* Log out */}
            <button
              onClick={onLogout}
              className="p-1.5 border border-red-500/30 text-gray-300 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer flex items-center justify-center"
              style={{ minHeight: '36px', minWidth: '36px' }}
              title="Logout from Portal"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Right Actions & Hamburger Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setView(currentView === 'admin-console' ? 'dashboard' : 'admin-console')}
                className="p-2 border border-[#C9A227] text-[#C9A227] hover:bg-[#0D2B4E] active:scale-95 transition-transform flex items-center justify-center"
                style={{ minHeight: '44px', minWidth: '44px' }}
                title="Switch Roles"
              >
                <Shield className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-[#C9A227] active:scale-95 transition-transform flex items-center justify-center"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Toggle Portal Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Portal Navigation Slider Menu (Strictly styled, compact, no public clutter) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A1F44] border-t border-[#C9A227]/40 py-3.5 px-4 space-y-3 animate-in fade-in slide-in-from-top-3 duration-150">
          <div className="bg-[#0D2B4E]/50 p-3 border border-slate-700/50 flex items-center space-x-3">
            <div className="p-2 bg-[#0A1F44] border border-[#C9A227] rounded-full">
              <User className="h-4 w-4 text-[#C9A227]" />
            </div>
            <div>
              <span className="block font-serif font-black text-xs text-gray-100">{currentUser?.name}</span>
              <span className="block text-[9px] text-amber-300 uppercase tracking-widest mt-0.5 font-semibold">
                {currentUser?.role === 'admin' ? 'Admiralty Officer' : currentUser?.role === 'lord_patron' ? 'Lord Patron' : 'Alumni Member'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Swapper */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setView(currentView === 'admin-console' ? 'dashboard' : 'admin-console');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 text-xs font-bold bg-[#C9A227] text-[#0A1F44] uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <Shield className="h-4 w-4" />
                <span>
                  {currentView === 'admin-console' ? 'Member Account Portal' : 'Admin Command Console'}
                </span>
              </button>
            )}

            {/* Back to Public website */}
            <button
              onClick={() => {
                setView('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs border border-slate-600 text-slate-200 hover:text-white bg-slate-800/40 uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              <Globe className="h-4 w-4 text-[#C9A227]" />
              <span>Return to Public Website</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full text-center py-2.5 text-xs bg-red-950/60 border border-red-500/40 text-red-300 hover:text-red-100 font-black uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout and Go to Public Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
