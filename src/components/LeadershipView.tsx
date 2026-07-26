import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import * as api from '../api';
import { getMilitaryInsignia, getMemberTitle } from '../utils/ranks';
import { Compass, Briefcase, Calendar, Award, GraduationCap, Search, ShieldAlert, Star } from 'lucide-react';

export default function LeadershipView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMembers() {
      try {
        const allMembers = await api.fetchMembers();
        // Keep active members
        setMembers(allMembers.filter(m => m.status === 'active'));
      } catch (err: any) {
        console.error(err);
        setError('Could not retrieve council members registry.');
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  // Filter members by search term
  const matchesSearch = (m: Member) => {
    const term = searchTerm.toLowerCase();
    const title = getMemberTitle(m.position);
    return (
      m.name.toLowerCase().includes(term) ||
      title.toLowerCase().includes(term) ||
      (m.workplace && m.workplace.toLowerCase().includes(term))
    );
  };

  // 1. Executive Leadership: Active members with an executive position or admin role
  const executiveLeaders = members.filter(m => {
    const title = getMemberTitle(m.position);
    const isExec = (
      m.role === 'admin' ||
      (m.position &&
       m.position.trim() !== '' &&
       title.toLowerCase() !== 'scholar' &&
       !title.toLowerCase().includes('senator'))
    );
    return isExec && matchesSearch(m);
  });

  // Sort Executive Leaders: Chancellor/Admin first, then Provost, then Quartermaster, Scribe, then others
  const getExecutiveRankOrder = (m: Member): number => {
    if (m.role === 'admin') return 1;
    const pos = m.position;
    if (!pos) return 99;
    const p = pos.toLowerCase();
    if (p.includes('chancellor') || p.includes('admin') || p.includes('president')) return 1;
    if (p.includes('provost')) return 2;
    if (p.includes('quartermaster')) return 3;
    if (p.includes('scribe')) return 4;
    if (p.includes('archivist')) return 5;
    if (p.includes('auditor')) return 6;
    return 10;
  };

  const sortedExecutiveLeaders = [...executiveLeaders].sort((a, b) => {
    return getExecutiveRankOrder(a) - getExecutiveRankOrder(b);
  });

  // 2. Council of Senate: Active members whose position is 'Senator' or contains 'Senator'
  const senators = members.filter(m => {
    const title = getMemberTitle(m.position);
    return title.toLowerCase().includes('senator') && matchesSearch(m);
  });

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Page Title & Intro */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex p-3 bg-[#0A1F44] border border-[#C9A227] mb-2 rounded-none">
            <Award className="h-6 w-6 text-[#C9A227]" />
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl uppercase tracking-wider text-[#0A1F44]">
            Leadership & Senate Council
          </h1>
          <div className="h-1 w-20 bg-[#C9A227] mx-auto" />
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Meet the commissioned officers and legislators piloting our community. Guided by academic precision and structured under a Senate-assisted governance model.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 border border-gray-200 shadow-sm gap-4">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0A1F44]">
            Official Officers & Senators Directory
          </span>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search leaders & senators..."
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
            <span className="text-xs uppercase tracking-widest font-bold text-[#0A1F44]">Engraving Leadership Rolls...</span>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Section 1: Executive Leadership */}
            <div className="space-y-6">
              <div className="border-b-2 border-[#0A1F44]/15 pb-2">
                <h2 className="font-serif text-xl sm:text-2xl font-black uppercase text-[#0A1F44] tracking-wider flex items-center space-x-2">
                  <span className="text-[#C9A227] font-mono text-base font-bold">I.</span>
                  <span>Executive Leadership</span>
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">The high-ranking commissioned officers managing the daily affairs and administration.</p>
              </div>

              {sortedExecutiveLeaders.length === 0 ? (
                <div className="bg-white border border-gray-200 p-8 text-center text-slate-500 text-xs">
                  No executive officers found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedExecutiveLeaders.map((leader) => (
                    <div 
                      key={leader.id} 
                      className="bg-white border-2 border-gray-200 hover:border-[#C9A227] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                          {leader.avatarUrl ? (
                            <img 
                              src={leader.avatarUrl} 
                              alt={leader.name} 
                              className="h-28 w-28 sm:h-32 sm:w-32 object-cover border-2 border-[#C9A227] shadow-md shrink-0 bg-white"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-28 w-28 sm:h-32 sm:w-32 bg-[#0D2B4E] border-2 border-[#C9A227] flex items-center justify-center text-white font-serif font-black text-3xl shrink-0 shadow-md">
                              {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                            </div>
                          )}
                          <div className="space-y-2 min-w-0 flex-1">
                            <h3 className="font-serif font-bold text-lg text-[#0A1F44] leading-snug">
                              {leader.name}
                            </h3>
                            <div className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-[#0A1F44] border border-gray-300 text-[10px] font-bold font-mono tracking-wider">
                              {getMilitaryInsignia(leader.position)} {getMemberTitle(leader.position)}
                            </div>
                            {leader.role === 'admin' && (
                              <div className="mt-1">
                                <span className="inline-block text-[9px] bg-[#C9A227]/20 text-[#0A1F44] border border-[#C9A227]/60 px-2 py-0.5 font-bold uppercase tracking-wider">
                                  ⭐ Executive Administrator
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-600 text-xs leading-relaxed text-justify line-clamp-4">
                          {leader.biography || "Dedicated alumni representative promoting unity, academic inquiry, and leadership inside the Scholar Circle community."}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-2 text-[11px] text-slate-600">
                        {leader.workplace && (
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              <strong>Workplace:</strong> {leader.workplace} {leader.jobTitle ? `(${leader.jobTitle})` : ''}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span><strong>Academy Class Year:</strong> {leader.classYear}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span><strong>Joined Circle:</strong> {new Date(leader.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                        </div>
                        
                        {leader.achievements && (
                          <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] text-slate-500 italic">
                            🏆 {leader.achievements}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Council of Senate */}
            <div className="space-y-6">
              <div className="border-b-2 border-[#0A1F44]/15 pb-2">
                <h2 className="font-serif text-xl sm:text-2xl font-black uppercase text-[#0A1F44] tracking-wider flex items-center space-x-2">
                  <span className="text-[#C9A227] font-mono text-base font-bold">II.</span>
                  <span>Council of Senate</span>
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">The advisory council of elected Senators steering constitutional reviews, policy debates, and internal governance.</p>
              </div>

              {senators.length === 0 ? (
                <div className="bg-white border border-gray-200 p-12 text-center text-slate-500 text-xs">
                  No active Senators currently listed in the Senate Council rolls.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {senators.map((senator) => (
                    <div 
                      key={senator.id} 
                      className="bg-white border-2 border-slate-300 hover:border-[#C9A227]/70 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                          {senator.avatarUrl ? (
                            <img 
                              src={senator.avatarUrl} 
                              alt={senator.name} 
                              className="h-28 w-28 sm:h-32 sm:w-32 object-cover border-2 border-[#C9A227] shadow-md shrink-0 bg-white"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-28 w-28 sm:h-32 sm:w-32 bg-[#0B3C5D] border-2 border-slate-300 flex items-center justify-center text-white font-serif font-black text-3xl shrink-0 shadow-md">
                              {senator.name ? senator.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                          )}
                          <div className="space-y-2 min-w-0 flex-1">
                            <h3 className="font-serif font-bold text-lg text-[#0A1F44] leading-snug">
                              {senator.name}
                            </h3>
                            <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold font-mono tracking-wider">
                              {getMilitaryInsignia(senator.position)} {getMemberTitle(senator.position)}
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-600 text-xs leading-relaxed text-justify line-clamp-4">
                          {senator.biography || "Elected Senator of the Scholar Circle community. Assisting the Chancellor in policy formulation, decision audits, and governance councils."}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-2 text-[11px] text-slate-600">
                        {senator.workplace && (
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              <strong>Workplace:</strong> {senator.workplace} {senator.jobTitle ? `(${senator.jobTitle})` : ''}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span><strong>Academy Class Year:</strong> {senator.classYear}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span><strong>Senate Seat Joined:</strong> {new Date(senator.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                        </div>
                        
                        {senator.achievements && (
                          <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] text-slate-500 italic">
                            🏆 {senator.achievements}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
