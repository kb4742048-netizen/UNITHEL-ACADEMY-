import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PortalHeader from './components/PortalHeader';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import NewsBlogView from './components/NewsBlogView';
import EventsView from './components/EventsView';
import ContactView from './components/ContactView';
import MemberDashboard from './components/MemberDashboard';
import AdminConsole from './components/AdminConsole';
import LeadershipView from './components/LeadershipView';
import PatronsView from './components/PatronsView';
import PatronInviteView from './components/PatronInviteView';
import { Blog, Event, WebsiteAppearance } from './types';
import * as api from './api';
import { Compass, Shield, Award, Users, CreditCard, Key, Smartphone, Mail, X, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentView, setView] = useState('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // App data lists
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [appearance, setAppearance] = useState<WebsiteAppearance | null>(null);

  // Authentication modals
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [authForm, setAuthForm] = useState({
    name: '',
    classYear: '',
    email: '',
    phone: '',
    password: '',
    inviteCode: '' // Used for Lord Patron
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Patron Invite Link intercept (/patron-invite/:token)
  const [patronInviteToken, setPatronInviteToken] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/patron-invite/')) {
      const tok = path.replace('/patron-invite/', '').trim();
      return tok || null;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('patronToken') || params.get('token') || null;
  });

  // Special Query Parameter Intercept for Lord Patron Invite Code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('inviteCode');
    if (code) {
      setAuthForm(prev => ({ ...prev, inviteCode: code }));
      setAuthModal('register'); // Trigger modal immediately
      // Remove query parameter cleanly from address bar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Sessions restore from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('seahawks_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('seahawks_user');
      }
    }
    loadAppData();

    // Set up background polling for global public app data
    const interval = setInterval(() => {
      loadAppData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadAppData = async () => {
    try {
      const [blogData, eventData, appData] = await Promise.all([
        api.fetchBlogs(),
        api.fetchEvents(),
        api.fetchAppearance()
      ]);
      setBlogs(blogData);
      setEvents(eventData);
      setAppearance(appData);
    } catch (e) {
      console.error('Error fetching baseline portal data:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seahawks_user');
    setCurrentUser(null);
    setView('home');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authModal === 'login') {
        const user = await api.loginUser(authForm.email, authForm.password);
        localStorage.setItem('seahawks_user', JSON.stringify(user));
        setCurrentUser(user);
        setAuthModal(null);
        setView('dashboard');
      } else {
        // Registering
        if (authForm.inviteCode) {
          // Register Lord Patron
          const res = await api.registerLordPatron({
            name: authForm.name,
            email: authForm.email,
            phone: authForm.phone,
            password: authForm.password,
            code: authForm.inviteCode
          });
          if (res.success) {
            setAuthSuccess('Prestigious Lord Patron Commission Activated! You may now login.');
            setAuthForm({ name: '', classYear: '', email: '', phone: '', password: '', inviteCode: '' });
            setTimeout(() => {
              setAuthModal('login');
              setAuthSuccess('');
            }, 3000);
          }
        } else {
          // Standard member registration
          const res = await api.registerUser({
            name: authForm.name,
            classYear: authForm.classYear,
            email: authForm.email,
            phone: authForm.phone,
            password: authForm.password
          });
          if (res.success) {
            setAuthSuccess('Commission registered successfully! Pending validation by Admiralty Admin.');
            setAuthForm({ name: '', classYear: '', email: '', phone: '', password: '', inviteCode: '' });
          }
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Operation failed.');
    }
  };

  // Helper renderer
  const renderView = () => {
    if (patronInviteToken) {
      return (
        <PatronInviteView
          token={patronInviteToken}
          onSuccessLogin={(user) => {
            setCurrentUser(user);
            setPatronInviteToken(null);
            setView('dashboard');
            window.history.replaceState({}, document.title, '/');
          }}
          onGoHome={() => {
            setPatronInviteToken(null);
            setView('home');
            window.history.replaceState({}, document.title, '/');
          }}
        />
      );
    }

    if (!appearance) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] text-[#0A1F44]">
          <div className="text-center space-y-2">
            <div className="animate-spin h-8 w-8 border-4 border-[#C9A227] border-t-transparent mx-auto" />
            <span className="text-xs uppercase tracking-widest font-bold">Anchoring Portal Systems...</span>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <HomeView
            setView={setView}
            blogs={blogs}
            events={events}
            appearance={appearance}
            openAuthModal={(mode) => {
              setAuthError('');
              setAuthSuccess('');
              setAuthForm({ name: '', classYear: '', email: '', phone: '', password: '', inviteCode: '' });
              setAuthModal(mode);
            }}
            currentUser={currentUser}
          />
        );
      case 'about':
        return <AboutView />;
      case 'leadership':
        return <LeadershipView />;
      case 'patrons':
        return <PatronsView />;
      case 'news':
        return <NewsBlogView blogs={blogs} />;
      case 'events':
        return <EventsView events={events} />;
      case 'contact':
        return <ContactView />;
      case 'dashboard':
        if (!currentUser) return <div className="p-8 text-center text-xs">Please login to inspect dashboard.</div>;
        return (
          <div className="space-y-6">
            
            {/* If admin is logged in, show dynamic switch panel bar */}
            {currentUser.role === 'admin' && (
              <div className="bg-[#C9A227]/10 border-b border-[#C9A227] py-3.5 px-4 text-center text-xs font-sans font-bold flex flex-wrap justify-center gap-4">
                <span className="text-[#0A1F44] uppercase tracking-wider mt-1">Admiral Controls:</span>
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-1 border transition-all ${
                    currentView === 'dashboard' ? 'bg-[#0A1F44] text-[#C9A227] border-[#0A1F44]' : 'bg-transparent text-gray-700 border-gray-400'
                  }`}
                >
                  Member Interface
                </button>
                <button
                  onClick={() => setView('admin-console')}
                  className={`px-4 py-1 border transition-all ${
                    currentView === 'admin-console' ? 'bg-[#0A1F44] text-[#C9A227] border-[#0A1F44]' : 'bg-transparent text-gray-700 border-gray-400'
                  }`}
                >
                  Admiralty Command Deck
                </button>
              </div>
            )}

            <MemberDashboard
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              blogs={blogs}
              events={events}
              onRefreshData={loadAppData}
            />
          </div>
        );
      case 'admin-console':
        if (currentUser?.role !== 'admin') return <div className="p-8 text-center text-xs">Permission denied.</div>;
        return (
          <div className="space-y-6">
            <AdminConsole
              currentUser={currentUser}
              blogs={blogs}
              events={events}
              onRefreshData={loadAppData}
              setView={setView}
              onLogout={handleLogout}
            />
          </div>
        );
      default:
        return <div className="p-8">Coordinates Lost. Return home.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-between text-[#1E293B]">
      
      {/* 1. HEADER */}
      {currentView === 'dashboard' ? (
        <PortalHeader
          currentUser={currentUser}
          currentView={currentView}
          setView={setView}
          onLogout={handleLogout}
          appearance={appearance || undefined}
        />
      ) : currentView !== 'admin-console' ? (
        <Header
          currentView={currentView}
          setView={setView}
          currentUser={currentUser}
          onLogout={handleLogout}
          appearance={appearance}
          openAuthModal={(mode) => {
            setAuthError('');
            setAuthSuccess('');
            setAuthForm({ name: '', classYear: '', email: '', phone: '', password: '', inviteCode: '' });
            setAuthModal(mode);
          }}
        />
      ) : null}

      {/* 2. DYNAMIC CONTENT WORKSTATION */}
      <div className="flex-grow">
        {renderView()}
      </div>

      {/* 3. FOOTER */}
      {currentView !== 'admin-console' && currentView !== 'dashboard' && (
        <Footer setView={setView} appearance={appearance} />
      )}

      {/* 4. AUTHENTICATION POPUP DIALOG */}
      {authModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#C9A227] max-w-md w-full relative shadow-2xl overflow-hidden rounded-none text-xs">
            
            {/* Modal branding header */}
            <div className="bg-[#0A1F44] text-white p-4 flex justify-between items-center border-b border-[#C9A227]">
              <div className="flex items-center space-x-2">
                <Compass className="h-5 w-5 text-[#C9A227]" />
                <span className="font-serif uppercase font-bold tracking-widest text-white">
                  {authModal === 'login' ? 'Officer Login' : 'Cadet Registration'}
                </span>
              </div>
              <button
                onClick={() => setAuthModal(null)}
                className="text-gray-300 hover:text-[#C9A227]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content container */}
            <div className="p-6 space-y-4">
              {authError && (
                <div className="p-2.5 bg-red-50 text-red-800 font-sans border border-red-200">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 font-sans border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Form trigger block */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 font-sans text-xs">
                
                {authModal === 'register' && (
                  <>
                    {/* Intercept Invite Notice */}
                    {authForm.inviteCode && (
                      <div className="p-2.5 bg-amber-50 text-[#0A1F44] font-bold border border-[#C9A227] rounded-none">
                        ⚓ Prestigious Lord Patron Commission: invitation code ({authForm.inviteCode}) validated.
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Full Officer Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Admiral John Doe"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full bg-[#F5F1E8] border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-[#C9A227]"
                      />
                    </div>

                    {!authForm.inviteCode && (
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Academy Cohort Class Year</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1995"
                          value={authForm.classYear}
                          onChange={(e) => setAuthForm({ ...authForm, classYear: e.target.value })}
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Mobile Phone Coordinates</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 07068019293"
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        className="w-full bg-[#F5F1E8] border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-[#C9A227]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Commission Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="officer@example.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-[#C9A227]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Operational Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-[#C9A227]"
                  />
                </div>

                {authModal === 'register' && !authForm.inviteCode && (
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">Lord Patron Invite Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. SEAHAV-INV-101"
                      value={authForm.inviteCode}
                      onChange={(e) => setAuthForm({ ...authForm, inviteCode: e.target.value })}
                      className="w-full bg-[#F5F1E8] border border-gray-300 px-3.5 py-2.5 focus:outline-none focus:border-[#C9A227]"
                    />
                    <span className="block mt-1 text-[10px] text-gray-400">Leave blank if standard student or graduating alumni member.</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0A1F44] text-white hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all font-bold uppercase tracking-widest border-b-4 border-black/40"
                  >
                    {authModal === 'login' ? 'Confirm Credentials' : 'Request Commission'}
                  </button>
                </div>
              </form>

              {/* Modal toggler links */}
              <div className="text-center pt-2">
                {authModal === 'login' ? (
                  <p className="text-[11px] text-gray-500">
                    Don't have a commission?{' '}
                    <button
                      onClick={() => {
                        setAuthError('');
                        setAuthSuccess('');
                        setAuthForm({ name: '', classYear: '', email: '', phone: '', password: '', inviteCode: '' });
                        setAuthModal('register');
                      }}
                      className="text-[#0A1F44] font-bold hover:underline"
                    >
                      Enlist here
                    </button>
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500">
                    Already commissioned?{' '}
                    <button
                      onClick={() => {
                        setAuthError('');
                        setAuthSuccess('');
                        setAuthForm({ name: '', classYear: '', email: '', phone: '', password: '', inviteCode: '' });
                        setAuthModal('login');
                      }}
                      className="text-[#0A1F44] font-bold hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
