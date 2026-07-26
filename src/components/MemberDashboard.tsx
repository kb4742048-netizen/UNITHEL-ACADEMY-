import React, { useState, useEffect } from 'react';
import { 
  Compass, User, MessageSquare, Award, Calendar, BookOpen, CreditCard, Bell, 
  Send, Plus, MessageCircle, Heart, Lock, Pin, Check, Download, AlertCircle, FileText, CheckCircle, X,
  Upload, Trash, Camera, AlertTriangle
} from 'lucide-react';
import { Member, Blog, Event, Discussion, ChatMessage, Ballot, SenateMotion, DuesRecord } from '../types';
import * as api from '../api';
import { getMilitaryInsignia, getMemberTitle, OFFICIAL_POSITIONS, AVAILABLE_POSITIONS } from '../utils/ranks';
import { compressImageFile } from '../utils/imageCompressor';

interface MemberDashboardProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  blogs: Blog[];
  events: Event[];
  onRefreshData: () => Promise<void>;
}

export default function MemberDashboard({ currentUser, setCurrentUser, blogs, events, onRefreshData }: MemberDashboardProps) {
  const isSenator = currentUser?.position === 'Senator' || currentUser?.position?.includes('Senator');
  const isChancellor = currentUser?.position === 'Chancellor';
  const isProvost = currentUser?.position === 'Provost';
  const isAdmin = currentUser?.role === 'admin';
  const showSenateTab = isSenator || isChancellor || isProvost || isAdmin;
  const canPostMotion = isAdmin || isSenator || isChancellor || isProvost;

  const [activeTab, setActiveTab] = useState('overview');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [dues, setDues] = useState<DuesRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  // Senate voting motions state and draft modal
  const [showDraftMotion, setShowDraftMotion] = useState(false);
  const [draftMotionTitle, setDraftMotionTitle] = useState('');
  const [draftMotionDesc, setDraftMotionDesc] = useState('');

  const [senateMotions, setSenateMotions] = useState<any[]>(() => {
    const saved = localStorage.getItem('senate_motions_voted');
    const defaultMotions = [
      { id: 'motion-1', title: 'Motion #81: Establish Regional Scholarly Research Chapters', description: 'Proposed to fund regional hubs to guide newly registered Scholars in high-impact academic fields.', votes: { aye: 4, nay: 1, abstain: 1 }, voters: ['admin'], status: 'active', createdAt: '2026-07-20T10:00:00Z' },
      { id: 'motion-2', title: 'Motion #82: Approve Sessional Financial Audit Guidelines', description: 'Proposed to institute strict quarterly auditing for all dues collections and disbursements.', votes: { aye: 3, nay: 2, abstain: 0 }, voters: [], status: 'active', createdAt: '2026-07-21T11:00:00Z' },
      { id: 'motion-3', title: 'Motion #83: Extend Council Terms for Elected Senators', description: 'Debate on extending the tenure of commissioned Senators from one academic year to two.', votes: { aye: 2, nay: 3, abstain: 1 }, voters: [], status: 'active', createdAt: '2026-07-22T12:00:00Z' }
    ];
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultMotions;
      }
    }
    return defaultMotions;
  });

  // Form states
  const [newDiscTitle, setNewDiscTitle] = useState('');
  const [newDiscContent, setNewDiscContent] = useState('');
  const [newDiscCat, setNewDiscCat] = useState('Mentorship');
  const [forumError, setForumError] = useState('');

  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyTargetCommentId, setReplyTargetCommentId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    classYear: currentUser.classYear || '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    position: currentUser.position || 'Scholar',
    avatarUrl: currentUser.avatarUrl || '',
    biography: currentUser.biography || '',
    workplace: currentUser.workplace || '',
    jobTitle: currentUser.jobTitle || '',
    achievements: currentUser.achievements || '',
    socialLinks: currentUser.socialLinks || {
      twitter: '',
      linkedin: '',
      github: '',
      website: ''
    }
  });
  const [profileSuccess, setProfileSuccess] = useState('');

  const [receiptToPrint, setReceiptToPrint] = useState<DuesRecord | null>(null);
  const [confirmDeleteMotionId, setConfirmDeleteMotionId] = useState<string | null>(null);
  const [motionBannerMsg, setMotionBannerMsg] = useState<string | null>(null);

  // Poll for messages and load data
  useEffect(() => {
    loadDashboardData();
    let interval: any;
    if (activeTab === 'chat') {
      interval = setInterval(() => {
        loadChatMessages();
      }, 5000); // Poll chat every 5s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, activeChannel]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [discData, balData, duesData, membersData, motionsData] = await Promise.all([
        api.fetchDiscussions(),
        api.fetchBallots(),
        api.fetchDues(),
        api.fetchMembers().catch(() => []),
        api.fetchSenateMotions().catch(() => [])
      ]);
      setDiscussions(discData);
      setBallots(balData);
      setDues(duesData.filter(d => d.memberId === currentUser.id));
      setMembers(membersData);
      if (motionsData && motionsData.length > 0) {
        setSenateMotions(motionsData);
      }
      if (activeTab === 'chat') {
        await loadChatMessages();
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async () => {
    try {
      const msgs = await api.fetchChatMessages(activeChannel);
      setChatMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  // Profile submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    try {
      const res = await api.updateMember(currentUser.id, profileForm);
      if (res.success) {
        setProfileSuccess('Profile parameters successfully adjusted!');
        const updatedUser = { ...currentUser, ...profileForm, ...(res.member || {}) };
        setCurrentUser(updatedUser);
        localStorage.setItem('seahawks_user', JSON.stringify(updatedUser));
        localStorage.setItem('scholar_circle_user', JSON.stringify(updatedUser));
        if (res.member) {
          setProfileForm({
            name: res.member.name || '',
            classYear: res.member.classYear || '',
            phone: res.member.phone || '',
            email: res.member.email || '',
            position: res.member.position || 'Scholar',
            avatarUrl: res.member.avatarUrl || '',
            biography: res.member.biography || '',
            workplace: res.member.workplace || '',
            jobTitle: res.member.jobTitle || '',
            achievements: res.member.achievements || '',
            socialLinks: res.member.socialLinks || {
              twitter: '',
              linkedin: '',
              github: '',
              website: ''
            }
          });
        }
        if (onRefreshData) await onRefreshData();
      } else {
        setProfileSuccess('Failed to adjust profile.');
      }
    } catch (err: any) {
      setProfileSuccess(err.message || 'Error occurred.');
    }
  };

  // Discussions Form Submission
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    setForumError('');
    if (!newDiscTitle || !newDiscContent) {
      setForumError('Title and content are required.');
      return;
    }
    try {
      const res = await api.createDiscussion({
        title: newDiscTitle,
        content: newDiscContent,
        category: newDiscCat,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role
      });
      if (res.success) {
        setNewDiscTitle('');
        setNewDiscContent('');
        loadDashboardData();
      }
    } catch (err: any) {
      setForumError(err.message || 'Error creating topic.');
    }
  };

  // Motion Management Handlers for Senate Assembly
  const handleToggleConfirmDelete = (id: string) => {
    setConfirmDeleteMotionId(prev => (prev === id ? null : id));
  };

  const handleExecuteDeleteMotion = async (id: string) => {
    setConfirmDeleteMotionId(null);
    if (isAdmin) {
      try {
        await api.deleteSenateMotion(id);
      } catch (e) {
        console.error('Error deleting motion:', e);
      }
      const updated = senateMotions.filter(m => m.id !== id);
      setSenateMotions(updated);
      localStorage.setItem('senate_motions_voted', JSON.stringify(updated));
      setMotionBannerMsg('Senate proposal has been permanently deleted.');
      setTimeout(() => setMotionBannerMsg(null), 5000);
      onRefreshData();
    } else {
      try {
        await api.requestDeleteSenateMotion(id, currentUser.name || 'Senator');
      } catch (e) {
        console.error('Error requesting deletion:', e);
      }
      const updated = senateMotions.map(m => {
        if (m.id === id) {
          return {
            ...m,
            deletionRequested: true,
            deletionRequestedBy: currentUser.name || 'Senator',
            deletionRequestedAt: new Date().toISOString()
          };
        }
        return m;
      });
      setSenateMotions(updated);
      localStorage.setItem('senate_motions_voted', JSON.stringify(updated));
      setMotionBannerMsg('Deletion request submitted to Administrators for approval.');
      setTimeout(() => setMotionBannerMsg(null), 5000);
      onRefreshData();
    }
  };

  const handleStatusChangeMotion = async (id: string, status: 'active' | 'concluded' | 'cancelled') => {
    try {
      await api.updateSenateMotionStatus(id, status);
    } catch (e) {
      console.error(e);
    }
    const updated = senateMotions.map(m => m.id === id ? { ...m, status } : m);
    setSenateMotions(updated);
    localStorage.setItem('senate_motions_voted', JSON.stringify(updated));
  };

  const handleVoteMotion = async (motionId: string, option: 'aye' | 'nay' | 'abstain') => {
    try {
      await api.voteSenateMotion(motionId, currentUser.id, option);
    } catch (e) {
      console.error(e);
    }
    const updated = senateMotions.map(m => {
      if (m.id === motionId) {
        const votes = { ...(m.votes || { aye: 0, nay: 0, abstain: 0 }) };
        votes[option] = (votes[option] || 0) + 1;
        const voters = [...(m.voters || []), currentUser.id];
        return { ...m, votes, voters };
      }
      return m;
    });
    setSenateMotions(updated);
    localStorage.setItem('senate_motions_voted', JSON.stringify(updated));
  };

  const handleCreateMotionMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPostMotion) return;
    if (!draftMotionTitle.trim() || !draftMotionDesc.trim()) return;
    try {
      const res = await api.createSenateMotion({
        title: draftMotionTitle,
        description: draftMotionDesc,
        authorId: currentUser.id,
        authorName: currentUser.name || 'Senator'
      });
      if (res.motion) {
        const updated = [res.motion, ...senateMotions];
        setSenateMotions(updated);
        localStorage.setItem('senate_motions_voted', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
      const newM = {
        id: `motion-${Date.now()}`,
        title: draftMotionTitle,
        description: draftMotionDesc,
        authorId: currentUser.id,
        authorName: currentUser.name || 'Senator',
        votes: { aye: 0, nay: 0, abstain: 0 },
        voters: [],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      const updated = [newM, ...senateMotions];
      setSenateMotions(updated);
      localStorage.setItem('senate_motions_voted', JSON.stringify(updated));
    }
    setDraftMotionTitle('');
    setDraftMotionDesc('');
    setShowDraftMotion(false);
  };

  // Discussion reaction
  const handleReaction = async (discId: string, emoji: string) => {
    try {
      const res = await api.toggleReaction(discId, emoji, currentUser.id);
      if (res.success) {
        // Update list
        setDiscussions(discussions.map(d => d.id === discId ? res.discussion : d));
        if (activeDiscussion && activeDiscussion.id === discId) {
          setActiveDiscussion(res.discussion);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Discussion comments
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !activeDiscussion) return;
    try {
      const res = await api.postComment(activeDiscussion.id, {
        content: newComment,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role
      });
      if (res.success) {
        setNewComment('');
        setActiveDiscussion(res.discussion);
        // update main list
        setDiscussions(discussions.map(d => d.id === res.discussion.id ? res.discussion : d));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!newReply || !activeDiscussion) return;
    try {
      const res = await api.postReply(activeDiscussion.id, commentId, {
        content: newReply,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role
      });
      if (res.success) {
        setNewReply('');
        setReplyTargetCommentId(null);
        setActiveDiscussion(res.discussion);
        setDiscussions(discussions.map(d => d.id === res.discussion.id ? res.discussion : d));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat message submit
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    try {
      const res = await api.sendChatMessage({
        content: chatInput,
        channel: activeChannel,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role
      });
      if (res.success) {
        setChatInput('');
        loadChatMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete chat message
  const handleDeleteChatMessage = async (msgId: string) => {
    try {
      const res = await api.deleteChatMessage(msgId);
      if (res.success) {
        setChatMessages(prev => prev.filter(m => m.id !== msgId));
      }
    } catch (err) {
      console.error('Failed to delete chat message:', err);
    }
  };

  // Calculate remaining retention time (7-day rule)
  const getRemainingDaysLabel = (createdAt: string) => {
    if (!createdAt) return '';
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) return '';
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = createdTime + sevenDaysMs;
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) return 'Expiring...';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days > 0) return `Expires in ${days}d ${remHours}h`;
    return `Expires in ${hours}h`;
  };

  // Vote ballot cast
  const handleVote = async (ballotId: string, option: string) => {
    try {
      const res = await api.castVote(ballotId, currentUser.id, option);
      if (res.success) {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Register Event Attendance
  const handleRegisterEvent = async (eventId: string) => {
    try {
      const res = await api.registerEventAttendance(eventId, currentUser.id);
      if (res.success) {
        onRefreshData();
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderAuthorBadges = (authorId?: string) => {
    if (!authorId) return null;
    const mb = members.find(m => m.id === authorId);
    if (!mb) return null;

    return (
      <span className="inline-flex flex-wrap items-center gap-1 font-sans">
        <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-[#0D2B4E] border border-slate-300 text-[8px] font-bold uppercase tracking-wider rounded-none gap-0.5">
          <span className="font-mono text-amber-600 font-bold">{getMilitaryInsignia(mb.position)}</span>
          <span>{getMemberTitle(mb.position)}</span>
        </span>
        {mb.isPatron && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[8px] font-bold uppercase tracking-wider rounded-none">
            ⭐ {mb.patronTitle || 'Patron'}
          </span>
        )}
      </span>
    );
  };

  // Compute stats
  const totalPaid = dues.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingDuesCount = dues.length === 0 ? 1 : 0; // standard indicator

  return (
    <div className="bg-[#F5F1E8] min-h-screen text-[#1E293B]">
      
      {/* Upper Dashboard Sub-header */}
      <div className="bg-[#0A1F44] border-b border-[#C9A227]/40 text-white py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-black uppercase tracking-wide">Member Dashboard</h1>
            <p className="text-[11px] text-gray-300 font-sans mt-0.5">Logged in as {currentUser.name} | Class Year: {currentUser.classYear}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40">
              Status: Active Member
            </span>
            {currentUser.role === 'lord_patron' && (
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40">
                Lord Patron
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Dashboard Left Sidebar Tabs */}
          <nav className="hidden lg:block lg:col-span-3 space-y-1 bg-white p-4 border border-gray-200 shadow-sm h-fit">
            <h3 className="text-xs font-serif font-bold text-[#0A1F44] uppercase tracking-widest border-b pb-2 mb-4">Circle Navigation</h3>
            
            {[
              { id: 'overview', label: 'Portal Overview', icon: Compass },
              { id: 'profile', label: 'Member Profile', icon: User },
              ...(showSenateTab ? [{ id: 'senate', label: 'Senate Council', icon: Award }] : []),
              { id: 'forum', label: 'Discussion Forum', icon: MessageSquare },
              { id: 'chat', label: 'Real-time Chat', icon: MessageCircle },
              { id: 'ballot', label: 'Ballot Voting', icon: Award },
              { id: 'events', label: 'Events Portal', icon: Calendar },
              { id: 'dues', label: 'Dues & Receipts', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); loadDashboardData(); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-wider font-sans border transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#0D2B4E] border-[#C9A227] text-[#C9A227] font-bold'
                      : 'border-transparent text-gray-600 hover:bg-[#F5F1E8] hover:text-[#0A1F44]'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Dashboard Right Panel Workstation */}
          <main className="lg:col-span-9 space-y-4 sm:space-y-6">

            {/* Mobile Horizontal Tabs Navigation */}
            <div className="lg:hidden bg-white border border-gray-200 shadow-sm p-1.5 flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: Compass },
                { id: 'profile', label: 'Profile', icon: User },
                ...(showSenateTab ? [{ id: 'senate', label: 'Senate', icon: Award }] : []),
                { id: 'forum', label: 'Forum', icon: MessageSquare },
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'ballot', label: 'Voting', icon: Award },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'dues', label: 'Dues', icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); loadDashboardData(); }}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-bold border transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#0D2B4E] border-[#C9A227] text-[#C9A227]'
                        : 'border-transparent text-gray-500 hover:bg-[#F5F1E8]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Visual grid counters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white border-b-4 border-[#C9A227] p-5 shadow-sm space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-sans">Recorded Contributions</span>
                    <span className="text-2xl font-serif font-black text-[#0A1F44] block">₦{totalPaid.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block uppercase">Checked Offline</span>
                  </div>
                  <div className="bg-white border-b-4 border-[#0A1F44] p-5 shadow-sm space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-sans">Pending Ballots</span>
                    <span className="text-2xl font-serif font-black text-[#0A1F44] block">
                      {ballots.filter(b => b.status === 'active' && !b.votes[currentUser.id]).length}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold block uppercase">Requires Vote Cast</span>
                  </div>
                  <div className="bg-white border-b-4 border-amber-600/60 p-5 shadow-sm space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-sans">Active Discussions</span>
                    <span className="text-2xl font-serif font-black text-[#0A1F44] block">{discussions.length}</span>
                    <span className="text-[10px] text-gray-500 block uppercase">Alumni Exchange</span>
                  </div>
                </div>

                {/* Latest Announcements Bulletin list */}
                <div className="bg-[#0A1F44] text-white p-6 border-l-4 border-l-[#C9A227] space-y-4">
                  <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-amber-300 flex items-center space-x-2">
                    <Bell className="h-4 w-4 shrink-0" />
                    <span>Circle Broadcast bulletins</span>
                  </h3>
                  <div className="h-[1px] bg-white/10 w-full" />
                  <ul className="space-y-3.5 text-xs text-gray-200">
                    <li>
                      <span className="block font-bold uppercase text-[#C9A227] text-[10px] mb-0.5">Dues & Recording Ledger</span>
                      <span>The Admin panel has recorded offline ledger entries. Please visit the Dues & Receipts section to inspect your generated physical receipts.</span>
                    </li>
                    <li>
                      <span className="block font-bold uppercase text-[#C9A227] text-[10px] mb-0.5">Democratic Balloting</span>
                      <span>Elections and Policy Ballots are open. Ensure your Aye/Nay coordinates are registered in the Ballot board.</span>
                    </li>
                  </ul>
                </div>

                {/* Profile coordinate overview */}
                <div className="bg-white p-5 border border-gray-200 shadow-sm">
                  <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide border-b pb-2 mb-3">
                    Member Academic Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-gray-600">
                    <div>
                      <span className="block font-bold uppercase text-gray-400 text-[10px]">Alumni Name</span>
                      <span className="text-gray-900 font-medium">{currentUser.name}</span>
                    </div>
                    <div>
                      <span className="block font-bold uppercase text-gray-400 text-[10px]">Academic Class Year</span>
                      <span className="text-gray-900 font-medium">{currentUser.classYear}</span>
                    </div>
                    <div>
                      <span className="block font-bold uppercase text-gray-400 text-[10px]">Registered Dispatch Email</span>
                      <span className="text-gray-900 font-medium">{currentUser.email}</span>
                    </div>
                    <div>
                      <span className="block font-bold uppercase text-gray-400 text-[10px]">Phone Coordinates</span>
                      <span className="text-gray-900 font-medium">{currentUser.phone}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
                <div className="border-b pb-3 border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Adjust Member Profile</h2>
                    <p className="text-xs text-gray-500 font-sans">Update your academic records, emergency coordinates, and professional credentials.</p>
                  </div>
                  
                  {/* Status & Position badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 text-[9px] bg-slate-100 text-[#0D2B4E] border border-slate-300 font-bold uppercase tracking-wider rounded-none font-sans gap-1">
                      <span className="font-mono text-amber-600 font-bold">{getMilitaryInsignia(currentUser.position)}</span>
                      <span>{getMemberTitle(currentUser.position)}</span>
                    </span>
                    {currentUser.isPatron && (
                      <span className="inline-flex items-center px-2.5 py-1 text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold uppercase tracking-wider rounded-none">
                        ⭐ Patron: {currentUser.patronTitle || 'Distinguished Pillar'}
                      </span>
                    )}
                  </div>
                </div>

                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold uppercase tracking-wider">
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6 font-sans text-xs">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-xs uppercase text-[#0A1F44] border-b pb-1">Basic Alumni Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block font-bold uppercase text-slate-700 mb-1">Full Member Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">Academy Class Year</label>
                        <input
                          type="text"
                          required
                          disabled={currentUser.role === 'lord_patron'}
                          value={profileForm.classYear}
                          onChange={(e) => setProfileForm({ ...profileForm, classYear: e.target.value })}
                          className="w-full bg-gray-100 disabled:opacity-75 border border-gray-300 px-3 py-2.5 focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">Mobile Contact Phone</label>
                        <input
                          type="text"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold uppercase text-slate-700 mb-1">Electronic Mail Address</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>
                    </div>

                    {/* Official Position / Rank Title */}
                    {currentUser.role === 'admin' ? (
                      <div className="space-y-1 bg-[#F5F1E8] p-3 border border-gray-300">
                        <label className="block font-bold uppercase text-slate-800 text-xs flex items-center justify-between">
                          <span>Official Position / Leadership Rank (Admin Override)</span>
                          <span className="text-[10px] text-amber-700 font-mono font-bold">
                            {getMilitaryInsignia(profileForm.position)} {getMemberTitle(profileForm.position)}
                          </span>
                        </label>
                        <p className="text-[10px] text-gray-500 mb-2">
                          As Administrator, you can override your official commission rank or leadership title.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={AVAILABLE_POSITIONS.includes(profileForm.position) ? profileForm.position : 'Custom'}
                            onChange={(e) => {
                              if (e.target.value !== 'Custom') {
                                setProfileForm({ ...profileForm, position: e.target.value });
                              }
                            }}
                            className="w-full bg-white border border-gray-300 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
                          >
                            {OFFICIAL_POSITIONS.map((pos) => (
                              <option key={pos.key} value={pos.key}>{pos.fullLabel}</option>
                            ))}
                            <option value="Custom">Custom Rank Title...</option>
                          </select>

                          {(!AVAILABLE_POSITIONS.includes(profileForm.position) || profileForm.position === 'Custom') && (
                            <input
                              type="text"
                              placeholder="Enter custom position title..."
                              value={profileForm.position}
                              onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                              className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 bg-[#F5F1E8] p-3 border border-gray-300">
                        <label className="block font-bold uppercase text-slate-800 text-xs flex items-center justify-between">
                          <span>Official Position / Leadership Rank</span>
                          <span className="text-[10px] text-amber-700 font-mono font-bold">
                            {getMilitaryInsignia(profileForm.position)} {getMemberTitle(profileForm.position)}
                          </span>
                        </label>
                        <p className="text-[10px] text-gray-500 mb-1">
                          Assigned official commission rank. Regular members cannot modify their position rank.
                        </p>
                        <div className="px-3 py-2 bg-white border border-gray-300 text-xs font-medium text-gray-700">
                          {getMemberTitle(profileForm.position)} ({profileForm.position || 'Scholar'})
                        </div>
                      </div>
                    )}

                    {/* Enhanced Profile Picture Uploader */}
                    <div className="p-4 bg-[#F5F1E8] border border-gray-300 space-y-3">
                      <label className="block font-bold uppercase text-slate-700 text-xs flex items-center justify-between">
                        <span>Profile Picture / Avatar</span>
                        {profileForm.avatarUrl && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Photo Loaded</span>
                          </span>
                        )}
                      </label>

                      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        {/* Avatar Live Preview */}
                        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#C9A227] shadow-sm bg-white shrink-0 group">
                          {profileForm.avatarUrl ? (
                            <img
                              src={profileForm.avatarUrl}
                              alt={profileForm.name || 'Member Avatar'}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#0D2B4E] text-[#C9A227] flex items-center justify-center font-serif font-black text-xl">
                              {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Camera className="h-5 w-5" />
                          </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 bg-[#0A1F44] hover:bg-[#C9A227] text-white hover:text-[#0A1F44] font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-all inline-flex items-center space-x-1.5 shadow-sm">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload Profile Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImageFile(file, 800, 800, 0.85);
                                      setProfileForm(prev => ({ ...prev, avatarUrl: compressed }));
                                    } catch (err) {
                                      alert("Could not process photo file. Please try another image.");
                                    }
                                  }
                                }}
                              />
                            </label>

                            {profileForm.avatarUrl && (
                              <button
                                type="button"
                                onClick={() => setProfileForm(prev => ({ ...prev, avatarUrl: '' }))}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] uppercase border border-red-200 inline-flex items-center space-x-1 transition-colors"
                              >
                                <Trash className="h-3.5 w-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-500 block">Or enter an image web URL:</span>
                            <input
                              type="url"
                              placeholder="https://example.com/photo.jpg"
                              value={profileForm.avatarUrl}
                              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                              className="w-full bg-white border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:border-[#C9A227]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patron-Only Profile details section */}
                  {currentUser.isPatron && (
                    <div className="space-y-4 border-t border-gray-200 pt-5">
                      <h3 className="font-serif font-bold text-xs uppercase text-emerald-800 border-b border-emerald-200 pb-1 flex items-center space-x-1">
                        <span>⭐ Distinguished Patron Professional Portfolio</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">Workplace / Corporate Affiliate</label>
                          <input
                            type="text"
                            placeholder="e.g. Chevron Nigeria, Shell Petroleum"
                            value={profileForm.workplace}
                            onChange={(e) => setProfileForm({ ...profileForm, workplace: e.target.value })}
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">Corporate Job Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Technical Director, Managing Partner"
                            value={profileForm.jobTitle}
                            onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">Short Biography</label>
                          <textarea
                            rows={3}
                            placeholder="Describe your academic roots and subsequent industrial/leadership milestones..."
                            value={profileForm.biography}
                            onChange={(e) => setProfileForm({ ...profileForm, biography: e.target.value })}
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase text-slate-700 mb-1">Achievements & Distinguished Merits</label>
                          <textarea
                            rows={3}
                            placeholder="Describe notable industry decorations, medals, fellowships, and support accomplishments..."
                            value={profileForm.achievements}
                            onChange={(e) => setProfileForm({ ...profileForm, achievements: e.target.value })}
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block font-bold uppercase text-slate-700">Digital Profiles & Professional Links</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <span className="w-16 font-mono font-bold text-[9px] text-gray-400 uppercase">LinkedIn</span>
                            <input
                              type="url"
                              placeholder="https://linkedin.com/in/username"
                              value={profileForm.socialLinks?.linkedin || ''}
                              onChange={(e) => setProfileForm({
                                ...profileForm,
                                socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value }
                              })}
                              className="flex-grow bg-[#F5F1E8] border border-gray-300 px-2.5 py-1.5 focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-16 font-mono font-bold text-[9px] text-gray-400 uppercase">Twitter</span>
                            <input
                              type="url"
                              placeholder="https://twitter.com/username"
                              value={profileForm.socialLinks?.twitter || ''}
                              onChange={(e) => setProfileForm({
                                ...profileForm,
                                socialLinks: { ...profileForm.socialLinks, twitter: e.target.value }
                              })}
                              className="flex-grow bg-[#F5F1E8] border border-gray-300 px-2.5 py-1.5 focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-16 font-mono font-bold text-[9px] text-gray-400 uppercase">GitHub</span>
                            <input
                              type="url"
                              placeholder="https://github.com/username"
                              value={profileForm.socialLinks?.github || ''}
                              onChange={(e) => setProfileForm({
                                ...profileForm,
                                socialLinks: { ...profileForm.socialLinks, github: e.target.value }
                              })}
                              className="flex-grow bg-[#F5F1E8] border border-gray-300 px-2.5 py-1.5 focus:outline-none text-[11px]"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-16 font-mono font-bold text-[9px] text-gray-400 uppercase">Website</span>
                            <input
                              type="url"
                              placeholder="https://example.com"
                              value={profileForm.socialLinks?.website || ''}
                              onChange={(e) => setProfileForm({
                                ...profileForm,
                                socialLinks: { ...profileForm.socialLinks, website: e.target.value }
                              })}
                              className="flex-grow bg-[#F5F1E8] border border-gray-300 px-2.5 py-1.5 focus:outline-none text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0D2B4E] hover:bg-[#C9A227] hover:text-[#0A1F44] text-white font-bold text-xs uppercase tracking-widest border border-transparent transition-colors shadow-sm"
                    >
                      Save Parameters
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2B: SENATE COUNCIL AREA */}
            {activeTab === 'senate' && (
              <div className="space-y-6">
                {/* Header Assembly Banner */}
                <div className="bg-[#0A1F44] border-2 border-[#C9A227] p-6 text-white shadow-md space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] font-mono">
                        [ ≡≡≡ ] Official Legislative Chamber
                      </span>
                      <h2 className="font-serif text-xl font-black uppercase tracking-wide text-white">
                        Council of Senate Assembly
                      </h2>
                    </div>
                    <div className="bg-[#0D2B4E] border border-[#C9A227]/40 px-3 py-1.5 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 block">Your Rank</span>
                      <span className="font-serif font-bold text-xs text-[#C9A227] block">
                        {getMilitaryInsignia(currentUser.position)} {getMemberTitle(currentUser.position)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    Welcome to the Council of Senate chamber. As an authorized officer or Senator, you hold voting privileges on association policy, financial audits, and scholar chapter charters.
                  </p>
                </div>

                {/* Senate Motions & Governance Voting */}
                <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-5">
                  <div className="border-b pb-3 border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">
                        Active Legislative Motions & Proposals
                      </h3>
                      <p className="text-xs text-gray-500">Cast your legislative vote or manage motions once elections and voting are concluded.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {canPostMotion && (
                        <button
                          onClick={() => setShowDraftMotion(!showDraftMotion)}
                          className="px-3 py-1.5 bg-[#0D2B4E] hover:bg-[#C9A227] hover:text-[#0A1F44] text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>{showDraftMotion ? 'Cancel Draft' : 'Propose New Motion'}</span>
                        </button>
                      )}
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 font-bold px-2.5 py-1 uppercase">
                        Chamber Session Active
                      </span>
                    </div>
                  </div>

                  {/* Draft Motion Form */}
                  {showDraftMotion && (
                    <form onSubmit={handleCreateMotionMember} className="bg-[#F5F1E8] p-4 border border-gray-300 space-y-3 text-xs font-sans">
                      <h4 className="font-serif font-bold text-xs uppercase text-[#0A1F44]">Draft Senate Proposal / Motion</h4>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Motion Title</label>
                        <input
                          type="text"
                          required
                          value={draftMotionTitle}
                          onChange={(e) => setDraftMotionTitle(e.target.value)}
                          placeholder="e.g. Motion #84: Authorize Sessional Research Grants"
                          className="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Description & Outline</label>
                        <textarea
                          required
                          rows={3}
                          value={draftMotionDesc}
                          onChange={(e) => setDraftMotionDesc(e.target.value)}
                          placeholder="Provide full details and proposed terms..."
                          className="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowDraftMotion(false)}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold uppercase text-[10px] cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#0D2B4E] hover:bg-[#C9A227] hover:text-[#0A1F44] text-white font-bold uppercase text-[10px] cursor-pointer"
                        >
                          Publish to Senate
                        </button>
                      </div>
                    </form>
                  )}

                  {motionBannerMsg && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-emerald-900 text-xs font-sans font-bold flex items-center justify-between">
                      <span>✓ {motionBannerMsg}</span>
                      <button onClick={() => setMotionBannerMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">✕</button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {senateMotions.length > 0 ? (
                      senateMotions.map((motion) => {
                        const hasVoted = motion.voters?.includes(currentUser.id) || motion.voters?.includes(currentUser.email);
                        const totalVotes = (motion.votes?.aye || 0) + (motion.votes?.nay || 0) + (motion.votes?.abstain || 0);
                        const ayePercent = totalVotes > 0 ? Math.round(((motion.votes?.aye || 0) / totalVotes) * 100) : 0;
                        const nayPercent = totalVotes > 0 ? Math.round(((motion.votes?.nay || 0) / totalVotes) * 100) : 0;
                        const isConcluded = motion.status === 'concluded' || motion.status === 'closed';
                        const isConfirmingDelete = confirmDeleteMotionId === motion.id;

                        return (
                          <div key={motion.id} className="border border-gray-200 p-5 bg-[#F5F1E8]/30 space-y-4">
                            {motion.deletionRequested && (
                              <div className="bg-amber-50 border border-amber-300 p-2.5 text-amber-900 text-xs font-sans flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                <span>
                                  <strong>Deletion Request Pending:</strong> Requested by {motion.deletionRequestedBy || 'Senator'}. Awaiting Administrator approval in the Admin Panel.
                                </span>
                              </div>
                            )}

                            {/* Inline Delete Confirmation Prompt */}
                            {isConfirmingDelete && (
                              <div className="bg-red-50 border-l-4 border-red-600 p-3 space-y-2 text-xs font-sans">
                                <div className="flex items-center space-x-2 text-red-900 font-bold">
                                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                                  <span>{isAdmin ? 'Confirm permanent deletion of this proposal?' : 'Submit deletion request to Administrators?'}</span>
                                </div>
                                <p className="text-red-800 text-[11px]">
                                  {isAdmin 
                                    ? 'This action cannot be undone. All votes recorded for this motion will be permanently deleted.'
                                    : 'Administrators will review this request in the Admin Console. The proposal will remain visible until approved or rejected.'}
                                </p>
                                <div className="flex items-center space-x-2 pt-1">
                                  <button
                                    onClick={() => handleExecuteDeleteMotion(motion.id)}
                                    className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] uppercase cursor-pointer"
                                  >
                                    Yes, {isAdmin ? 'Delete Permanently' : 'Request Deletion'}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteMotionId(null)}
                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-[10px] uppercase cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-serif font-bold text-sm text-[#0A1F44]">{motion.title}</h4>
                                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                                    isConcluded
                                      ? 'bg-slate-200 text-slate-700 border-slate-300'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  }`}>
                                    {isConcluded ? '✓ Voting Concluded' : '● Active Voting'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{motion.description}</p>
                                {motion.authorName && (
                                  <span className="text-[10px] text-gray-400 block mt-1">
                                    Proposed by: {motion.authorName}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono font-bold bg-[#0A1F44] text-[#C9A227] px-2 py-0.5 shrink-0">
                                {totalVotes} Votes Cast
                              </span>
                            </div>

                            {/* Vote Progress bars */}
                            <div className="space-y-1.5 text-xs font-sans">
                              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                                <span>Aye: {motion.votes?.aye || 0} ({ayePercent}%)</span>
                                <span>Nay: {motion.votes?.nay || 0} ({nayPercent}%)</span>
                                <span>Abstain: {motion.votes?.abstain || 0}</span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 flex overflow-hidden">
                                <div style={{ width: `${ayePercent}%` }} className="bg-emerald-600 h-full" />
                                <div style={{ width: `${nayPercent}%` }} className="bg-red-600 h-full" />
                                <div style={{ width: `${100 - ayePercent - nayPercent}%` }} className="bg-slate-400 h-full" />
                              </div>
                            </div>

                            {/* Voting Action buttons */}
                            {!isConcluded && !hasVoted ? (
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                                <span className="text-[10px] font-bold uppercase text-slate-500 mr-2">Cast Vote:</span>
                                <button
                                  onClick={() => handleVoteMotion(motion.id, 'aye')}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  ✓ Aye (Approve)
                                </button>
                                <button
                                  onClick={() => handleVoteMotion(motion.id, 'nay')}
                                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  ✕ Nay (Reject)
                                </button>
                                <button
                                  onClick={() => handleVoteMotion(motion.id, 'abstain')}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  ~ Abstain
                                </button>
                              </div>
                            ) : (
                              <div className="pt-2 border-t border-gray-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wide flex items-center space-x-1">
                                {isConcluded ? (
                                  <span className="text-slate-600">Voting for this motion has been concluded by the Senate Council.</span>
                                ) : (
                                  <span>✓ Your vote has been officially recorded for this motion.</span>
                                )}
                              </div>
                            )}

                            {/* Management & Deletion Bar for Officers / Senators / Admins */}
                            {showSenateTab && (
                              <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-[10px] font-sans">
                                <span className="font-bold text-gray-500 uppercase">Chamber Operations:</span>
                                <div className="flex items-center space-x-2">
                                  {!isConcluded ? (
                                    <button
                                      onClick={() => handleStatusChangeMotion(motion.id, 'concluded')}
                                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                      Close Voting
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStatusChangeMotion(motion.id, 'active')}
                                      className="px-2.5 py-1 border border-slate-300 hover:border-[#0A1F44] text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                      Reopen Voting
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleToggleConfirmDelete(motion.id)}
                                    className={`px-2.5 py-1 font-bold uppercase tracking-wider transition-colors flex items-center space-x-1 cursor-pointer ${
                                      isConfirmingDelete
                                        ? 'bg-red-700 text-white border border-red-800'
                                        : motion.deletionRequested && !isAdmin
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-700 hover:text-white'
                                    }`}
                                  >
                                    <Trash className="h-3 w-3" />
                                    <span>
                                      {isAdmin 
                                        ? 'Delete Motion' 
                                        : motion.deletionRequested 
                                        ? 'Deletion Pending Approval' 
                                        : 'Delete Proposal'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-gray-400 uppercase text-xs tracking-wider border border-dashed border-gray-300 bg-[#F5F1E8]/20">
                        No Senate legislative motions currently active in the chamber. Use the button above to propose a motion.
                      </div>
                    )}
                  </div>
                </div>

                {/* Senate Deliberation & Governance Forum */}
                <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="border-b pb-3 border-gray-100">
                    <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">
                      Senate Council Deliberation Threads
                    </h3>
                    <p className="text-xs text-gray-500">Deliberate on policy drafts and legislative matters.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 border border-l-4 border-l-[#C9A227] border-gray-200 bg-[#F5F1E8]/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-xs text-[#0A1F44]">
                          [ ≡≡≡ ] Policy Proposal: Quarterly Scholar Research Grants
                        </span>
                        <span className="text-[9px] bg-[#0A1F44] text-[#C9A227] px-2 py-0.5 font-mono font-bold">
                          Active Senate Thread
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Discussion regarding the distribution mechanism for quarterly research grants to active Scholars in good standing.
                      </p>
                      <button 
                        onClick={() => setActiveTab('forum')}
                        className="text-[10px] font-bold text-[#0D2B4E] underline hover:text-[#C9A227]"
                      >
                        Open Discussion Forum →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DISCUSSION FORUM */}
            {activeTab === 'forum' && (
              <div className="space-y-6">
                
                {/* Active Discussion details modal or nested view */}
                {activeDiscussion ? (
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
                    <button
                      onClick={() => setActiveDiscussion(null)}
                      className="px-3.5 py-1.5 text-[11px] font-bold uppercase bg-gray-200 hover:bg-[#C9A227] text-gray-800 transition-colors"
                    >
                      ← Back to Topics
                    </button>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-sans">
                        <span className="px-2 py-0.5 bg-gray-100 text-[#0A1F44] font-bold uppercase tracking-wide">{activeDiscussion.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span>Posted on {new Date(activeDiscussion.createdAt).toLocaleDateString()} by {activeDiscussion.authorName} ({activeDiscussion.authorRole})</span>
                          {renderAuthorBadges(activeDiscussion.authorId)}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-[#0A1F44] uppercase tracking-wide leading-snug">
                        {activeDiscussion.title}
                      </h2>
                      <div className="h-[1px] bg-gray-200" />
                      <p className="text-xs text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">{activeDiscussion.content}</p>
                    </div>

                    {/* Reactions block */}
                    <div className="flex items-center space-x-2 py-3 border-t border-b border-gray-100">
                      {['👍', '⚓', '👏', '💡'].map((emoji) => {
                        const voters = activeDiscussion.reactions[emoji] || [];
                        const userHasVoted = voters.includes(currentUser.id);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(activeDiscussion.id, emoji)}
                            className={`flex items-center space-x-1 px-3 py-1 text-xs border ${
                              userHasVoted 
                                ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#0A1F44] font-bold' 
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{voters.length}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Comments thread list */}
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wider">
                        Exchanged Transmissions ({activeDiscussion.comments.length})
                      </h3>

                      <div className="space-y-4">
                        {activeDiscussion.comments.map((comment) => (
                          <div key={comment.id} className="p-4 bg-[#F5F1E8] border border-gray-200 space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-[#0A1F44] font-bold">
                              <span className="flex items-center gap-1.5">
                                <span>{comment.authorName} ({comment.authorRole})</span>
                                {renderAuthorBadges(comment.authorId)}
                              </span>
                              <span className="text-gray-400 font-sans font-normal">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">{comment.content}</p>
                            
                            {/* Nested Replies */}
                            <div className="pl-6 border-l border-amber-600/30 space-y-2 mt-2">
                              {comment.replies?.map((rep) => (
                                <div key={rep.id} className="bg-white/60 p-2.5 text-[11px] font-sans">
                                  <div className="flex justify-between items-center font-bold text-[#0A1F44] mb-1">
                                    <span className="flex items-center gap-1.5">
                                      <span>{rep.authorName} ({rep.authorRole})</span>
                                      {renderAuthorBadges(rep.authorId)}
                                    </span>
                                    <span className="text-gray-400 font-normal">{new Date(rep.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-gray-600 whitespace-pre-wrap">{rep.content}</p>
                                </div>
                              ))}

                              {/* Reply Form Trigger */}
                              {replyTargetCommentId === comment.id ? (
                                <div className="space-y-1.5 pt-2">
                                  <textarea
                                    rows={1}
                                    placeholder="Write nested reply..."
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                    className="w-full bg-white border border-gray-300 text-xs p-2 focus:outline-none"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => setReplyTargetCommentId(null)}
                                      className="px-2.5 py-1 text-[10px] bg-gray-200 text-gray-700 uppercase"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleAddReply(comment.id)}
                                      className="px-2.5 py-1 text-[10px] bg-[#0A1F44] text-white uppercase"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setReplyTargetCommentId(comment.id)}
                                  className="text-[10px] text-[#0A1F44] font-bold uppercase hover:underline"
                                >
                                  + Reply to comment
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add comment input form */}
                      {activeDiscussion.isLocked ? (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold uppercase tracking-wide flex items-center space-x-2">
                          <Lock className="h-4 w-4 shrink-0" />
                          <span>This discussion topic has been locked by an administrator. Replies are disabled.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleAddComment} className="pt-4 border-t border-gray-200 space-y-2">
                          <label className="block text-xs font-bold uppercase text-[#0A1F44] tracking-wider">Your Transmission Content</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Contribute constructive comments..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-[#F5F1E8] border border-gray-300 text-xs p-3 focus:outline-none focus:border-[#C9A227]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#0A1F44] text-white hover:bg-[#C9A227] hover:text-[#0A1F44] text-xs font-bold uppercase tracking-widest transition-colors"
                          >
                            Send comment
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Create Discussion Topic Form */}
                    <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                      <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide border-b pb-2 mb-4">
                        + Launch New Exchange Topic
                      </h3>

                      {forumError && (
                        <div className="p-2.5 bg-red-50 text-red-800 text-xs">{forumError}</div>
                      )}

                      <form onSubmit={handleCreateDiscussion} className="space-y-4 text-xs font-sans">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold uppercase text-[#0A1F44] tracking-wider mb-1">Topic Title</label>
                            <input
                              type="text"
                              required
                              value={newDiscTitle}
                              onChange={(e) => setNewDiscTitle(e.target.value)}
                              placeholder="e.g. Guidance for Academic Research & Internships"
                              className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 focus:outline-none focus:border-[#C9A227] rounded-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-bold uppercase text-[#0A1F44] tracking-wider mb-1">Category</label>
                            <select
                              value={newDiscCat}
                              onChange={(e) => setNewDiscCat(e.target.value)}
                              className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 focus:outline-none focus:border-[#C9A227] rounded-none text-xs"
                            >
                              <option value="Mentorship">Mentorship</option>
                              <option value="Career">Career Paths</option>
                              <option value="Scholarly">Scholarly Seminars</option>
                              <option value="General">General Exchange</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold uppercase text-[#0A1F44] tracking-wider mb-1">Detail Content Description</label>
                          <textarea
                            required
                            rows={3}
                            value={newDiscContent}
                            onChange={(e) => setNewDiscContent(e.target.value)}
                            placeholder="Detail your question or exchange proposal..."
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#0D2B4E] text-white hover:bg-[#C9A227] hover:text-[#0A1F44] font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          Establish Topic
                        </button>
                      </form>
                    </div>

                    {/* Active Topics Grid/List */}
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">
                        Active Alumni Exchanges
                      </h3>

                      <div className="space-y-4">
                        {discussions.filter(d => d.category !== 'Senate Governance').length > 0 ? (
                          discussions.filter(d => d.category !== 'Senate Governance').map((disc) => (
                            <div 
                              key={disc.id} 
                              className="bg-white border border-gray-200 p-5 shadow-sm hover:border-[#C9A227] transition-all flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-sans">
                                  <span className="px-2 py-0.5 bg-gray-100 text-[#0A1F44] font-bold uppercase tracking-wider">{disc.category}</span>
                                  {disc.isPinned && <span className="px-2 py-0.5 bg-red-600 text-white font-bold uppercase tracking-wider flex items-center gap-1"><Pin className="h-3 w-3 shrink-0" /> Pinned</span>}
                                  {disc.isLocked && <span className="px-2 py-0.5 bg-gray-700 text-white font-bold uppercase tracking-wider flex items-center gap-1"><Lock className="h-3 w-3 shrink-0" /> Locked</span>}
                                  <span>•</span>
                                  <span>Published by {disc.authorName} ({disc.authorRole})</span>
                                </div>
                                <h4 
                                  onClick={() => setActiveDiscussion(disc)}
                                  className="font-serif font-bold text-base text-[#0A1F44] hover:text-[#C9A227] cursor-pointer uppercase tracking-wide leading-tight line-clamp-1"
                                >
                                  {disc.title}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-sans">{disc.content}</p>
                              </div>

                              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                                <div className="flex items-center space-x-3 text-xs text-gray-400">
                                  <span>{disc.comments.length} comments</span>
                                  <span>•</span>
                                  <span>
                                    {Object.values(disc.reactions).reduce((acc: number, curr: any) => acc + curr.length, 0)} reactions
                                  </span>
                                </div>
                                <button
                                  onClick={() => setActiveDiscussion(disc)}
                                  className="text-xs font-bold uppercase text-[#0A1F44] hover:text-[#C9A227] tracking-wider"
                                >
                                  Enter Exchange →
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 bg-white border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-sans">No topics logged on board. Establish one above.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* TAB 4: DISPATCH CHAT */}
            {activeTab === 'chat' && (
              <div className="bg-white border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 h-[650px] overflow-hidden">
                
                {/* Channels selection bar */}
                <div className="md:col-span-4 lg:col-span-3 bg-[#0A1F44] border-r border-gray-700 p-3 space-y-4 overflow-y-auto">
                  
                  {/* Channels section */}
                  <div>
                    <h4 className="font-serif font-bold text-[11px] uppercase tracking-wider text-[#C9A227] border-b border-[#C9A227]/30 pb-1.5 mb-2">
                      Public Channels
                    </h4>
                    <div className="space-y-1">
                      {[
                        { id: 'general', label: '💬 General Room' },
                        { id: 'announcements', label: '📣 Announcements' },
                        { id: 'instant', label: '⚡ Instant Chat' }
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChannel(ch.id)}
                          className={`w-full text-left text-xs uppercase tracking-wider font-sans px-3 py-2 border transition-all ${
                            activeChannel === ch.id
                              ? 'bg-[#0D2B4E] border-[#C9A227] text-[#C9A227] font-bold'
                              : 'border-transparent text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Messages (DMs) section */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-1.5 mb-2">
                      <h4 className="font-serif font-bold text-[11px] uppercase tracking-wider text-[#C9A227]">
                        Direct Messages (DMs)
                      </h4>
                      <span className="text-[9px] bg-[#C9A227]/20 text-[#C9A227] px-1 py-0.5 rounded font-bold">
                        7-Day Retention
                      </span>
                    </div>
                    
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {members.filter(m => m.id !== currentUser.id).length > 0 ? (
                        members.filter(m => m.id !== currentUser.id).map((m) => {
                          const dmChannelId = `dm_${[currentUser.id, m.id].sort().join('_')}`;
                          const isSelected = activeChannel === dmChannelId;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setActiveChannel(dmChannelId)}
                              className={`w-full text-left text-xs font-sans px-2.5 py-2 border flex items-center space-x-2 transition-all ${
                                isSelected
                                  ? 'bg-[#0D2B4E] border-[#C9A227] text-[#C9A227] font-bold'
                                  : 'border-transparent text-gray-300 hover:bg-gray-800'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-[#C9A227] font-bold text-[9px] flex items-center justify-center shrink-0 border border-[#C9A227]/40">
                                {m.name ? m.name.charAt(0).toUpperCase() : 'M'}
                              </div>
                              <div className="truncate flex-1">
                                <span className="block truncate">{m.name}</span>
                                <span className="text-[8px] text-gray-400 block font-normal capitalize">
                                  {m.position || m.role}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-gray-400 italic p-1">No other members available.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Messages pane */}
                <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full justify-between bg-gray-50">
                  
                  {/* Active channel head & policy info */}
                  <div className="bg-white p-3 border-b border-gray-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-serif font-bold text-[#0A1F44] uppercase tracking-wider flex items-center space-x-2">
                        {activeChannel.startsWith('dm_') ? (
                          <>
                            <span className="bg-amber-100 text-[#0A1F44] px-1.5 py-0.5 text-[9px] font-bold uppercase border border-amber-300">
                              Direct Message (DM)
                            </span>
                            <span>
                              With {
                                (() => {
                                  const parts = activeChannel.replace('dm_', '').split('_');
                                  const otherId = parts.find(id => id !== currentUser.id);
                                  const otherMember = members.find(m => m.id === otherId);
                                  return otherMember ? otherMember.name : 'Member';
                                })()
                              }
                            </span>
                          </>
                        ) : (
                          <span>Channel: #{activeChannel} Chatroom</span>
                        )}
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 font-bold">
                        ⏱️ 7-Day Auto-Expiry Policy
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 font-sans">
                      💬 Messages in public rooms and DMs stay active for 7 days before automatically disappearing from the chat screen.
                    </p>
                  </div>

                  {/* Messages container list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="text-xs font-serif font-bold text-[#0A1F44]">{msg.authorName}</span>
                              <span className="text-[9px] uppercase tracking-wider bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-none font-sans font-bold">
                                {msg.authorRole === 'admin' ? 'Admin' : msg.authorRole === 'lord_patron' ? 'Patron' : 'Member'}
                              </span>
                              {renderAuthorBadges(msg.authorId)}
                              <span className="text-[8px] text-gray-400 font-sans">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              
                              {/* Remaining Retention badge */}
                              <span className="text-[8px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-mono">
                                ⏳ {getRemainingDaysLabel(msg.createdAt)}
                              </span>
                            </div>

                            {/* Delete msg button if author or admin */}
                            {(msg.authorId === currentUser.id || currentUser.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteChatMessage(msg.id)}
                                title="Delete message"
                                className="text-red-400 hover:text-red-600 text-[10px] p-1 font-bold transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>

                          <div className={`p-3 text-xs max-w-xl font-sans rounded-none relative border ${
                            msg.authorId === currentUser.id
                              ? 'bg-amber-50 border-[#C9A227]/40 text-[#0A1F44]'
                              : 'bg-white border-gray-200 text-gray-800'
                          }`}>
                            {msg.isPinned && (
                              <span className="absolute top-1.5 right-1.5 text-[#C9A227]" title="Pinned message">
                                <Pin className="h-3 w-3 shrink-0" />
                              </span>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-gray-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs uppercase tracking-widest font-sans">No messages posted in this room yet.</p>
                        <p className="text-[10px] text-gray-400 font-sans mt-1">Send a message below. All messages stay active for 7 days.</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input form */}
                  <form onSubmit={handleSendChatMessage} className="bg-white p-3 border-t border-gray-200 flex space-x-2">
                    <input
                      type="text"
                      required
                      placeholder={activeChannel.startsWith('dm_') ? "Send a direct message..." : "Compose channel message..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-[#F5F1E8] text-xs px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#C9A227] rounded-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0A1F44] text-white hover:bg-[#C9A227] hover:text-[#0A1F44] transition-colors font-bold text-xs uppercase flex items-center space-x-1"
                    >
                      <Send className="h-4 w-4 shrink-0" />
                      <span>Send</span>
                    </button>
                  </form>

                </div>

              </div>
            )}

            {/* TAB 5: BALLOT BOARD */}
            {activeTab === 'ballot' && (
              <div className="space-y-6">
                <div className="bg-white p-6 border border-gray-200 shadow-sm border-l-4 border-l-[#C9A227]">
                  <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Democratic Circle Balloting</h3>
                  <p className="text-xs text-gray-500 font-sans mt-1">
                    Democratic policy revisions and leadership elections. cast your Aye/Nay or Select Candidate vote below.
                  </p>
                </div>

                <div className="space-y-6">
                  {ballots.length > 0 ? (
                    ballots.map((ballot) => {
                      const userVote = ballot.votes[currentUser.id];
                      const totalVotes = Object.keys(ballot.votes).length;

                      return (
                        <div key={ballot.id} className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-gray-100 text-[#0A1F44]">
                                {ballot.type === 'policy' ? 'Policy Revision Proposal' : 'Circle Trustee Election'}
                              </span>
                              <h4 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide mt-2">
                                {ballot.title}
                              </h4>
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 border ${
                              ballot.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : 'bg-red-50 text-red-700 border-red-300'
                            }`}>
                              {ballot.status === 'active' ? 'Operational' : 'Closed'}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 leading-relaxed font-sans">{ballot.description}</p>

                          <div className="h-[1px] bg-gray-100" />

                          {ballot.status === 'active' ? (
                            <div className="space-y-2">
                              {userVote ? (
                                <div className="p-3 bg-amber-50 border border-[#C9A227]/30 text-xs font-sans flex items-center space-x-2 text-[#0A1F44]">
                                  <Check className="h-4 w-4 text-[#C9A227]" />
                                  <span>Your Vote is recorded as: <strong>{userVote}</strong>. Thank you for your command input.</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <span className="block text-xs font-bold text-[#0A1F44] uppercase tracking-wider">Cast Your Command Decision</span>
                                  <div className="flex flex-wrap gap-2">
                                    {ballot.options.map((opt) => (
                                      <button
                                        key={opt}
                                        onClick={() => handleVote(ballot.id, opt)}
                                        className="px-4 py-2 border border-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A1F44] text-[#0A1F44] font-bold text-xs uppercase tracking-widest transition-colors"
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 text-xs font-sans">
                              <span className="font-bold text-[#0A1F44] uppercase block mb-1">Voting coordinates are locked.</span>
                              <p className="text-gray-500 text-[11px]">Total cast votes: {totalVotes}</p>
                            </div>
                          )}

                          {/* Ballot live voting results breakdown */}
                          {ballot.resultsPublished && (
                            <div className="space-y-3 pt-3 border-t border-gray-100 font-sans text-xs">
                              <span className="font-bold uppercase text-[#0A1F44] tracking-wider block">Official Tally Results</span>
                              <div className="space-y-2">
                                {ballot.options.map((opt) => {
                                  const votesCount = Object.values(ballot.votes).filter(v => v === opt).length;
                                  const pct = totalVotes > 0 ? (votesCount / totalVotes) * 100 : 0;
                                  return (
                                    <div key={opt} className="space-y-1">
                                      <div className="flex justify-between font-bold text-[11px] text-gray-700 uppercase">
                                        <span>{opt}</span>
                                        <span>{votesCount} votes ({pct.toFixed(0)}%)</span>
                                      </div>
                                      <div className="h-2 w-full bg-gray-200 overflow-hidden rounded-none">
                                        <div className="h-full bg-[#C9A227]" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-white border border-gray-200">
                      <p className="text-xs text-gray-500 font-sans uppercase tracking-widest">No active ballots reported by administration.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 6: EVENTS REGISTRY */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide border-b pb-2.5 mb-4">
                    Alumni Gatherings & Attendance Registrar
                  </h3>

                  <div className="space-y-6">
                    {events.length > 0 ? (
                      events.map((event) => {
                        const isRegistered = event.registrations.includes(currentUser.id);
                        return (
                          <div key={event.id} className="p-5 bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-amber-700 uppercase tracking-widest font-bold">
                                {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })} at {event.time}
                              </span>
                              <h4 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">{event.title}</h4>
                              <p className="text-xs text-gray-500">{event.venue}</p>
                            </div>
                            
                            {isRegistered ? (
                              <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold uppercase tracking-widest flex items-center space-x-1.5">
                                <CheckCircle className="h-4 w-4" />
                                <span>Attendance Confirmed</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRegisterEvent(event.id)}
                                className="px-5 py-2.5 bg-[#0D2B4E] hover:bg-[#C9A227] hover:text-[#0A1F44] text-white font-bold text-xs uppercase tracking-widest transition-colors border"
                              >
                                Register Attendance
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-400 font-sans">No events coordinates declared currently.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: DUES & RECEIPTS LOGS */}
            {activeTab === 'dues' && (
              <div className="space-y-6">
                <div className="bg-white p-6 border border-gray-200 shadow-sm border-l-4 border-l-[#C9A227]">
                  <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Offline Dues Payment Ledger</h3>
                  <p className="text-xs text-gray-500 font-sans mt-1">
                    Payments are handled offline (cash, bank wire, etc) and validated by the administrator. Inspect and download generated printable digital vouchers here.
                  </p>
                </div>

                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wider mb-4 border-b pb-2">
                    Contribution Transactions History
                  </h4>

                  {dues.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-sans">
                        <thead>
                          <tr className="bg-gray-100 text-[#0A1F44] font-bold uppercase tracking-wider border-b border-gray-200">
                            <th className="p-3">Receipt Code</th>
                            <th className="p-3">Months Covered</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Reference/Remarks</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-700">
                          {dues.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="p-3 font-semibold text-[#0A1F44]">{record.receiptNo}</td>
                              <td className="p-3 font-semibold">{record.months.join(', ')}</td>
                              <td className="p-3 font-bold text-amber-800">₦{record.amount.toLocaleString()}</td>
                              <td className="p-3 text-gray-500 max-w-xs truncate">{record.reference}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setReceiptToPrint(record)}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0A1F44] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A1F44] transition-colors font-bold uppercase text-[10px]"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Voucher</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500 text-xs">
                      <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <span>No offline recorded payment history found. If you made contribution, notify the Admin.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* PRINTABLE DIGITAL RECEIPT VOUCHER OVERLAY MODAL */}
      {receiptToPrint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-[#1E293B] border-4 border-[#C9A227] max-w-lg w-full relative shadow-2xl p-6 md:p-8 rounded-none">
            
            {/* Close action */}
            <button
              onClick={() => setReceiptToPrint(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Receipt Printable layout */}
            <div className="space-y-6">
              
              {/* Receipt Header branding block */}
              <div className="text-center pb-4 border-b-2 border-dashed border-gray-300">
                <span className="inline-block text-[10px] uppercase tracking-[0.25em] bg-[#0A1F44] text-[#C9A227] px-3 py-1 font-bold">
                  Official Scholar Circle Voucher
                </span>
                <h2 className="font-serif text-xl font-bold uppercase tracking-wide text-[#0A1F44] mt-2">
                  Scholar Circle Alumni
                </h2>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">Scholar Hall, Graduate Lane, Alumni Drive</p>
              </div>

              {/* Receipt Info details metadata */}
              <div className="space-y-2 text-xs font-sans text-gray-700">
                <div className="flex justify-between border-b pb-1 border-gray-100">
                  <span className="font-bold text-[#0A1F44] uppercase text-[10px]">Voucher Receipt No</span>
                  <span className="font-mono font-bold text-gray-900">{receiptToPrint.receiptNo}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-gray-100">
                  <span className="font-bold text-[#0A1F44] uppercase text-[10px]">Member Name</span>
                  <span className="font-semibold text-gray-900">{receiptToPrint.memberName}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-gray-100">
                  <span className="font-bold text-[#0A1F44] uppercase text-[10px]">Member ID</span>
                  <span className="font-mono text-gray-600">{receiptToPrint.memberId}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-gray-100">
                  <span className="font-bold text-[#0A1F44] uppercase text-[10px]">Validated Date</span>
                  <span className="text-gray-900">{receiptToPrint.date}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-gray-100">
                  <span className="font-bold text-[#0A1F44] uppercase text-[10px]">Months covered</span>
                  <span className="font-semibold text-gray-900">{receiptToPrint.months.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-gray-100">
                  <span className="font-bold text-[#0A1F44] uppercase text-[10px]">Reference Ledger</span>
                  <span className="text-gray-600 italic">{receiptToPrint.reference}</span>
                </div>
                {receiptToPrint.remarks && (
                  <div className="flex justify-between border-b pb-1 border-gray-100">
                    <span className="font-bold text-[#0A1F44] uppercase text-[10px]">Remarks</span>
                    <span className="text-gray-500">{receiptToPrint.remarks}</span>
                  </div>
                )}
              </div>

              {/* Big amount block */}
              <div className="bg-[#F5F1E8] border border-[#C9A227]/40 p-4 text-center">
                <span className="block text-[10px] text-[#0A1F44] font-bold uppercase tracking-wider">Amount Paid</span>
                <span className="text-3xl font-serif font-black text-[#0A1F44]">₦{receiptToPrint.amount.toLocaleString()}.00</span>
              </div>

              {/* Administrative stamp */}
              <div className="pt-4 flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
                <div className="text-left font-serif text-[#0A1F44]">
                  <span>Seal: VALIDATED LEDGER</span>
                  <span className="block text-[9px] text-gray-400 font-normal mt-0.5">Recorded Offline via Admin Console</span>
                </div>
                <div className="text-right font-serif text-[#0A1F44] border-t border-[#0A1F44] pt-2 w-32">
                  <span>Circle Administrator</span>
                </div>
              </div>

              {/* Action operations printable */}
              <div className="pt-4 flex justify-end space-x-2 print:hidden">
                <button
                  onClick={() => setReceiptToPrint(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-bold text-xs uppercase"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[#0A1F44] text-[#C9A227] font-bold text-xs uppercase tracking-widest flex items-center space-x-1 hover:bg-[#C9A227] hover:text-[#0A1F44]"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>Print Receipt</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
