import React, { useState, useEffect } from 'react';
import { Shield, Crown, CheckCircle, AlertTriangle, ArrowRight, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import * as api from '../api';

interface PatronInviteViewProps {
  token: string;
  onSuccessLogin: (user: any) => void;
  onGoHome: () => void;
}

export default function PatronInviteView({ token, onSuccessLogin, onGoHome }: PatronInviteViewProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [patronType, setPatronType] = useState<'Lord Patron' | 'Patron'>('Lord Patron');
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    setIsValidating(true);
    setErrorMessage('');
    try {
      const res = await api.validatePatronInvite(token);
      if (res.valid) {
        setIsValid(true);
        setPatronType(res.patronType || 'Lord Patron');
      } else {
        setIsValid(false);
        setErrorMessage(res.message || 'This invitation link is invalid or has expired.');
      }
    } catch (err: any) {
      setIsValid(false);
      setErrorMessage(err.message || 'Unable to validate invitation link.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsSubmitting(true);

    try {
      const res = await api.registerPatronViaInvite(token, form);
      if (res.success && res.user) {
        // Log in immediately
        localStorage.setItem('seahawks_user', JSON.stringify(res.user));
        onSuccessLogin(res.user);
      } else {
        setRegError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F1E8] px-4 py-12">
        <div className="bg-white p-8 max-w-md w-full border border-gray-200 shadow-xl text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-[#C9A227] border-t-transparent mx-auto rounded-full" />
          <h2 className="font-serif font-bold text-lg text-[#0A1F44] uppercase tracking-wider">Validating Patron Link...</h2>
          <p className="text-xs text-gray-500 font-sans">Connecting to Admiralty Control Deck security protocol...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F5F1E8] px-4 py-12">
        <div className="bg-white p-8 max-w-lg w-full border-2 border-red-200 shadow-2xl text-center space-y-6">
          <div className="p-4 bg-red-50 border border-red-200 inline-block rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto" />
          </div>
          <div>
            <h2 className="font-serif font-black text-2xl text-[#0A1F44] uppercase tracking-wide">Invitation Link Expired</h2>
            <p className="text-sm text-gray-600 font-sans mt-2 leading-relaxed">
              {errorMessage || 'This one-time patron invitation link has already been used or is invalid. Please contact the Super Administrator to request a new invitation link.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onGoHome}
              className="px-6 py-3 bg-[#0A1F44] text-[#C9A227] border-2 border-[#C9A227] uppercase font-bold text-xs tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all inline-flex items-center space-x-2 shadow-md"
            >
              <span>Return to Home Page</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLord = patronType === 'Lord Patron';

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F1E8] px-4 py-12">
      <div className="bg-white max-w-xl w-full border-2 border-[#C9A227] shadow-2xl overflow-hidden">
        
        {/* Banner Header */}
        <div className="bg-[#0A1F44] text-white p-6 border-b-2 border-[#C9A227] text-center space-y-2 relative">
          <div className="p-3 bg-[#0D2B4E] border border-[#C9A227] inline-block rounded-full shadow-lg mb-1">
            {isLord ? (
              <Crown className="h-10 w-10 text-[#C9A227]" />
            ) : (
              <Shield className="h-10 w-10 text-[#C9A227]" />
            )}
          </div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">
            Exclusive One-Time Patron Commission
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-wide">
            {isLord ? 'Lord Patron Registration' : 'Patron Registration'}
          </h1>
          <p className="text-xs text-slate-300 font-sans max-w-md mx-auto">
            You have received a direct VIP commission link to join <strong className="text-[#C9A227]">The Scholars Circle</strong> as an active {patronType}.
          </p>
        </div>

        {/* Registration Form */}
        <div className="p-6 sm:p-8 space-y-6">
          {regError && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-300 text-xs font-semibold uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1 flex items-center space-x-1">
                <UserIcon className="h-3.5 w-3.5 text-[#C9A227]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Samuel Vance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1 flex items-center space-x-1">
                  <Mail className="h-3.5 w-3.5 text-[#C9A227]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="patron@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1 flex items-center space-x-1">
                  <Phone className="h-3.5 w-3.5 text-[#C9A227]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1 flex items-center space-x-1">
                <Lock className="h-3.5 w-3.5 text-[#C9A227]" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#0A1F44] text-[#C9A227] border-2 border-[#C9A227] uppercase font-bold text-xs tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-[#C9A227] border-t-transparent rounded-full" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Activating Account...' : `Activate ${patronType} Account & Enter Portal`}</span>
              </button>
            </div>
          </form>

          <p className="text-[10px] text-gray-400 font-sans text-center">
            * This one-time link will expire immediately after registration is completed.
          </p>
        </div>
      </div>
    </div>
  );
}
