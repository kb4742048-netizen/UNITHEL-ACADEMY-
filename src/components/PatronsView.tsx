import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import * as api from '../api';
import { Award, Briefcase, Calendar, GraduationCap, Search, Star, Globe, Linkedin, Twitter, Github } from 'lucide-react';

export default function PatronsView() {
  const [patrons, setPatrons] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPatrons() {
      try {
        const allMembers = await api.fetchMembers();
        // Filter active members with isPatron set to true or role lord_patron / patron
        const activePatrons = allMembers.filter(m => 
          m.status === 'active' && 
          (m.isPatron === true || m.role === 'lord_patron' || m.role === 'patron')
        );
        setPatrons(activePatrons);
      } catch (err: any) {
        console.error(err);
        setError('Could not retrieve distinguished patrons directory.');
      } finally {
        setLoading(false);
      }
    }
    loadPatrons();
  }, []);

  const filteredPatrons = patrons.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.patronTitle && p.patronTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.workplace && p.workplace.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Title & Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex p-3 bg-[#0A1F44] border border-[#C9A227] mb-2 rounded-none">
            <Star className="h-6 w-6 text-[#C9A227] fill-[#C9A227]" />
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl uppercase tracking-wider text-[#0A1F44]">
            Patrons & Distinguished Leaders
          </h1>
          <div className="h-1 w-20 bg-[#C9A227] mx-auto" />
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Honorary Patrons and pillars of our community. Their extraordinary career achievements, mentorship, and financial support provide vital guidance to our circle.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 border border-gray-200 shadow-sm gap-4">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0A1F44]">
            Distinguished Pillars Roll ({filteredPatrons.length})
          </span>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search patrons by name or workplace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F1E8] border border-gray-300 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs text-center font-bold">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="animate-spin h-8 w-8 border-4 border-[#C9A227] border-t-transparent mx-auto" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#0A1F44]">Engraving Patrons Honor Board...</span>
          </div>
        ) : filteredPatrons.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center text-slate-500 text-xs">
            No patrons found matching the search criterion.
          </div>
        ) : (
          /* Patrons Grid - High-Contrast Elegant Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPatrons.map((patron) => (
              <div 
                key={patron.id} 
                className="bg-white border-2 border-[#C9A227]/30 hover:border-[#C9A227] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Header Profile Section */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    {/* Avatar with refererpolicy strictly set */}
                    {patron.avatarUrl ? (
                      <img 
                        src={patron.avatarUrl} 
                        alt={patron.name} 
                        className="h-16 w-16 object-cover border-2 border-[#C9A227]/40 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-[#0D2B4E] border-2 border-[#C9A227]/40 flex items-center justify-center text-white font-serif font-black text-lg">
                        {patron.name.charAt(0)}
                      </div>
                    )}
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-serif font-bold text-base text-[#0A1F44] leading-tight truncate">
                        {patron.name}
                      </h3>
                      <div className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9px] font-bold uppercase tracking-wider rounded-none">
                        ⭐ {patron.patronTitle || 'Honorary Patron'}
                      </div>
                    </div>
                  </div>

                  {/* Biography (Slightly smaller, beautifully spaced, constrained) */}
                  <p className="text-slate-600 text-xs leading-relaxed text-justify line-clamp-4">
                    {patron.biography || "Prestigious patron providing vital capital sponsorship and professional counsel to the alumni circle."}
                  </p>
                </div>

                {/* Professional details at the bottom of the card */}
                <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-2 text-[11px] text-slate-600">
                  {patron.workplace && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong>Workplace:</strong> {patron.workplace} {patron.jobTitle ? `(${patron.jobTitle})` : ''}
                      </span>
                    </div>
                  )}
                  {patron.classYear && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span><strong>Academy Class Year:</strong> {patron.classYear}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span><strong>Joined Circle:</strong> {new Date(patron.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                  </div>
                  
                  {patron.achievements && (
                    <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] text-slate-500 italic">
                      🏆 {patron.achievements}
                    </div>
                  )}

                  {/* Patron Social Links */}
                  {patron.socialLinks && (
                    <div className="flex items-center space-x-3 pt-2 mt-2 border-t border-gray-100">
                      {patron.socialLinks.linkedin && (
                        <a 
                          href={patron.socialLinks.linkedin} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-[#0A1F44] transition-colors"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {patron.socialLinks.twitter && (
                        <a 
                          href={patron.socialLinks.twitter} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-sky-500 transition-colors"
                        >
                          <Twitter className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {patron.socialLinks.github && (
                        <a 
                          href={patron.socialLinks.github} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-slate-900 transition-colors"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {patron.socialLinks.website && (
                        <a 
                          href={patron.socialLinks.website} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-[#C9A227] transition-colors"
                        >
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
