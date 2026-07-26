import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, ShieldAlert, Award, FileText, Settings, Plus, Trash, 
  Lock, Pin, Calendar, Save, Megaphone, Share2, Compass, TrendingUp, 
  DollarSign, Activity, Edit3, Shield, Menu, ChevronLeft, ChevronRight, 
  RefreshCw, Database, Info, Upload, Key, ListFilter, X, LogOut, Globe, Camera,
  Crown, Copy, Link as LinkIcon
} from 'lucide-react';
import { Member, Blog, Event, Discussion, Ballot, DuesRecord, LordPatronInvite, PatronInvite, WebsiteAppearance, News, LeadershipMember } from '../types';
import * as api from '../api';
import { getMilitaryInsignia, getMemberTitle, OFFICIAL_POSITIONS, AVAILABLE_POSITIONS } from '../utils/ranks';
import { compressImageFile } from '../utils/imageCompressor';

interface AdminConsoleProps {
  currentUser: any;
  blogs: Blog[];
  events: Event[];
  onRefreshData: () => Promise<void>;
  setView?: (view: string) => void;
  onLogout?: () => void;
}

export default function AdminConsole({ currentUser, blogs, events, onRefreshData, setView, onLogout }: AdminConsoleProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Core database states
  const [members, setMembers] = useState<Member[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [dues, setDues] = useState<DuesRecord[]>([]);
  const [invites, setInvites] = useState<LordPatronInvite[]>([]);
  const [patronInvites, setPatronInvites] = useState<PatronInvite[]>([]);
  const [selectedPatronType, setSelectedPatronType] = useState<'Lord Patron' | 'Patron'>('Lord Patron');
  const [isGeneratingPatronInvite, setIsGeneratingPatronInvite] = useState(false);
  const [generatedPatronLink, setGeneratedPatronLink] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [appearance, setAppearance] = useState<any>(null);
  const [isPostgres, setIsPostgres] = useState(false);

  // Feedback notifications
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');

  // Senate Seats state
  const [senateSeats, setSenateSeats] = useState<number>(() => {
    return Number(localStorage.getItem('senate_seats_count') || '10');
  });

  // Form Management states
  const [adminSelfPosition, setAdminSelfPosition] = useState<string>(currentUser?.position || 'Chancellor');

  useEffect(() => {
    if (currentUser?.position) {
      setAdminSelfPosition(currentUser.position);
    }
  }, [currentUser?.position]);

  const handleSaveAdminSelfPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSelfPosition) return;
    try {
      const res = await api.updateMember(currentUser.id, { position: adminSelfPosition });
      if (res.success) {
        currentUser.position = adminSelfPosition;
        const updatedUser = { ...currentUser, position: adminSelfPosition };
        localStorage.setItem('seahawks_user', JSON.stringify(updatedUser));
        triggerFeedback(`Your administrative position has been updated to "${adminSelfPosition}"!`);
        await loadAdminData();
        await onRefreshData();
      }
    } catch (err: any) {
      triggerFeedback('Failed to update admin position: ' + err.message, 'error');
    }
  };

  const [blogForm, setBlogForm] = useState({ 
    title: '', content: '', excerpt: '', image: '', category: 'General', isPinned: false, visibleOnHome: true 
  });
  const [newsForm, setNewsForm] = useState({ 
    title: '', content: '', isPinned: false 
  });
  const [eventForm, setEventForm] = useState({ 
    title: '', description: '', date: '', time: '', venue: '' 
  });
  const [ballotForm, setBallotForm] = useState({ 
    title: '', description: '', type: 'policy' as 'policy' | 'election', optionsString: 'Aye, Nay' 
  });
  const [duesForm, setDuesForm] = useState({ 
    memberId: '', monthsString: '', amount: '', reference: '', remarks: '' 
  });
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Appearance & Branding Form States
  const [appForm, setAppForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBannerUrl: '',
    imageOverlayOpacity: 0.88,
    imageObjectFit: 'cover',
    imageFilterStyle: 'none',
    heroImageHeight: 420,
    computedAspect: '16:9',
    autoOptimizeImages: true,
    imageBorderRadius: 'none',
    announcementsString: '',
    galleryString: ''
  });

  const [brandingForm, setBrandingForm] = useState({
    logoUrl: '',
    logoText: 'UNITHEL ACADEMY',
    logoSubtext: 'ALUMNI ORGANIZATION',
    logoHeight: 32,
    logoStyle: 'framed' as 'transparent' | 'framed' | 'rounded' | 'circle',
    logoFit: 'contain' as 'contain' | 'cover'
  });

  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Public Leaders state
  const [leadersList, setLeadersList] = useState<LeadershipMember[]>([]);
  const [newLeader, setNewLeader] = useState<LeadershipMember>({
    name: '',
    position: '',
    image: ''
  });

  // State filters
  const [memberFilter, setMemberFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const triggerFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mems, discs, bals, duesRecords, invs, patronInvs, appData, newsData, dbStatus] = await Promise.all([
        api.fetchMembers(),
        api.fetchDiscussions(),
        api.fetchBallots(),
        api.fetchDues(),
        api.fetchLordPatronInvites(),
        api.fetchPatronInvites().catch(() => []),
        api.fetchAppearance(),
        api.fetchNews(),
        api.fetchDbStatus().catch(() => ({ isPostgres: false }))
      ]);
      
      setMembers(mems);
      setDiscussions(discs);
      setBallots(bals);
      setDues(duesRecords);
      setInvites(invs);
      setPatronInvites(patronInvs);
      setAppearance(appData);
      setNews(newsData);
      setIsPostgres(dbStatus.isPostgres);
      setLeadersList(appData.leaders || []);

      setAppForm({
        heroTitle: appData.heroTitle || '',
        heroSubtitle: appData.heroSubtitle || '',
        heroBannerUrl: appData.heroBannerUrl || '',
        imageOverlayOpacity: appData.imageOverlayOpacity ?? 0.88,
        imageObjectFit: appData.imageObjectFit || 'cover',
        imageFilterStyle: appData.imageFilterStyle || 'none',
        heroImageHeight: appData.heroImageHeight ?? 420,
        computedAspect: appData.computedAspect || '16:9',
        autoOptimizeImages: appData.autoOptimizeImages ?? true,
        imageBorderRadius: appData.imageBorderRadius || 'none',
        announcementsString: appData.announcements?.join('\n') || '',
        galleryString: appData.gallery?.join('\n') || ''
      });

      setBrandingForm({
        logoUrl: appData.logoUrl || '',
        logoText: appData.logoText || 'UNITHEL ACADEMY',
        logoSubtext: appData.logoSubtext || 'ALUMNI ORGANIZATION',
        logoHeight: appData.logoHeight || 32,
        logoStyle: (appData.logoStyle as any) || 'framed',
        logoFit: (appData.logoFit as any) || 'contain'
      });
    } catch (e: any) {
      console.error(e);
      triggerFeedback('Error retrieving portal data records: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1. Members functions
  const handleApprove = async (id: string) => {
    try {
      const res = await api.approveMember(id);
      if (res.success) {
        setMembers(members.map(m => m.id === id ? { ...m, status: 'active' } : m));
        triggerFeedback('Alumni credential commission verified successfully.');
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      const res = await api.suspendMember(id);
      if (res.success) {
        setMembers(members.map(m => m.id === id ? { ...m, status: 'suspended' } : m));
        triggerFeedback('Member commission suspended.');
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleUnsuspend = async (id: string) => {
    try {
      const res = await api.unsuspendMember(id);
      if (res.success) {
        setMembers(members.map(m => m.id === id ? { ...m, status: 'active' } : m));
        triggerFeedback('Member commission restored.');
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleSaveMemberEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await api.updateMember(editingMember.id, editingMember);
      if (res.success) {
        if (editingMember.id === currentUser?.id || editingMember.email === currentUser?.email) {
          currentUser.position = editingMember.position;
          const updatedUser = { ...currentUser, ...editingMember };
          localStorage.setItem('seahawks_user', JSON.stringify(updatedUser));
        }
        setEditingMember(null);
        await loadAdminData();
        await onRefreshData();
        triggerFeedback('Member record & position updated successfully.');
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  // 2. Blogs functions
  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createBlog(blogForm);
      if (res.success) {
        setBlogForm({ title: '', content: '', excerpt: '', image: '', category: 'General', isPinned: false, visibleOnHome: true });
        triggerFeedback('Deep academic chronicle successfully published!');
        loadAdminData();
        onRefreshData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm('Delete this chronicle from logs permanently?')) {
      try {
        await api.deleteBlog(id);
        triggerFeedback('Chronicle removed.');
        loadAdminData();
        onRefreshData();
      } catch (err: any) {
        triggerFeedback(err.message, 'error');
      }
    }
  };

  // 3. News functions
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createNews(newsForm);
      if (res.success) {
        setNewsForm({ title: '', content: '', isPinned: false });
        triggerFeedback('News bulletin announcement scheduled successfully!');
        loadAdminData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm('Delete this news bulletin permanently?')) {
      try {
        await api.deleteNews(id);
        triggerFeedback('News bulletin removed.');
        loadAdminData();
      } catch (err: any) {
        triggerFeedback(err.message, 'error');
      }
    }
  };

  // 4. Events functions
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createEvent(eventForm);
      if (res.success) {
        setEventForm({ title: '', description: '', date: '', time: '', venue: '' });
        triggerFeedback('Upcoming gathering successfully scheduled!');
        loadAdminData();
        onRefreshData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Delete this gathering permanently?')) {
      try {
        await api.deleteEvent(id);
        triggerFeedback('Gathering deleted.');
        loadAdminData();
        onRefreshData();
      } catch (err: any) {
        triggerFeedback(err.message, 'error');
      }
    }
  };

  // 5. Forum moderation functions
  const handleLockDisc = async (id: string) => {
    try {
      await api.toggleLockDiscussion(id);
      triggerFeedback('Exchange thread state altered.');
      loadAdminData();
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handlePinDisc = async (id: string) => {
    try {
      await api.togglePinDiscussion(id);
      triggerFeedback('Exchange pin status updated.');
      loadAdminData();
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleDeleteDisc = async (id: string) => {
    if (confirm('Delete this discussion exchange permanently?')) {
      try {
        await api.deleteDiscussion(id);
        triggerFeedback('Discussion exchange removed.');
        loadAdminData();
      } catch (err: any) {
        triggerFeedback(err.message, 'error');
      }
    }
  };

  // 6. Voting/Ballots functions
  const handleCreateBallot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const opts = ballotForm.optionsString.split(',').map(o => o.trim()).filter(Boolean);
      const res = await api.createBallot({
        title: ballotForm.title,
        description: ballotForm.description,
        type: ballotForm.type,
        options: opts
      });
      if (res.success) {
        setBallotForm({ title: '', description: '', type: 'policy', optionsString: 'Aye, Nay' });
        triggerFeedback('Democratic ballot successfully published to active members!');
        loadAdminData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleCloseBallot = async (id: string) => {
    try {
      await api.closeBallot(id);
      triggerFeedback('Ballot deactivated from voting.');
      loadAdminData();
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleTogglePublishResults = async (id: string) => {
    try {
      await api.togglePublishBallotResults(id);
      triggerFeedback('Ballot results publishing status updated.');
      loadAdminData();
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleDeleteBallot = async (id: string) => {
    if (confirm('Delete this ballot permanently?')) {
      try {
        await api.deleteBallot(id);
        triggerFeedback('Ballot deleted.');
        loadAdminData();
      } catch (err: any) {
        triggerFeedback(err.message, 'error');
      }
    }
  };

  // 7. Offline Dues Record Payment
  const handleRecordDues = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const months = duesForm.monthsString.split(',').map(m => m.trim()).filter(Boolean);
      const selectedMem = members.find(m => m.id === duesForm.memberId);
      if (!selectedMem) {
        triggerFeedback('Please select a valid member.', 'error');
        return;
      }

      const res = await api.recordDuesPayment({
        memberId: duesForm.memberId,
        memberName: selectedMem.name,
        months,
        amount: duesForm.amount,
        reference: duesForm.reference,
        remarks: duesForm.remarks
      });

      if (res.success) {
        setDuesForm({ memberId: '', monthsString: '', amount: '', reference: '', remarks: '' });
        triggerFeedback(`Offline dues contribution validated! Receipt: ${res.record.receiptNo}`);
        loadAdminData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  // 8. Lord Patron Invitation Code
  const handleGenerateInvite = async () => {
    try {
      const res = await api.generateLordPatronInvite();
      if (res.success) {
        triggerFeedback(`New secure invite code generated: ${res.invite.code}`);
        loadAdminData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleShareInvite = (code: string) => {
    const shareLink = `${window.location.origin}?inviteCode=${code}`;
    const text = `Greetings! You have been invited as a prestigious Patron of Scholar Circle. Register using this secure, one-time invitation link: ${shareLink}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // 9. Site settings customization
  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const announList = appForm.announcementsString.split('\n').map(a => a.trim()).filter(Boolean);
      const gallList = appForm.galleryString.split('\n').map(g => g.trim()).filter(Boolean);

      // Compute aspect ratio & payload metric
      const computedRatio = appForm.heroImageHeight > 500 ? '21:9' : appForm.heroImageHeight < 360 ? '4:3' : '16:9';

      const res = await api.updateAppearance({
        ...appearance,
        heroTitle: appForm.heroTitle,
        heroSubtitle: appForm.heroSubtitle,
        heroBannerUrl: appForm.heroBannerUrl,
        imageOverlayOpacity: Number(appForm.imageOverlayOpacity),
        imageObjectFit: appForm.imageObjectFit,
        imageFilterStyle: appForm.imageFilterStyle,
        heroImageHeight: Number(appForm.heroImageHeight),
        computedAspect: computedRatio,
        autoOptimizeImages: Boolean(appForm.autoOptimizeImages),
        imageBorderRadius: appForm.imageBorderRadius,
        announcements: announList,
        gallery: gallList
      });

      if (res.success) {
        if (res.appearance) setAppearance(res.appearance);
        triggerFeedback('Visual identity coordinates & computed image settings synchronized successfully!');
        await loadAdminData();
        await onRefreshData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  // 10. Logo & Branding Customization
  const handleSaveBranding = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setIsSavingBranding(true);
    try {
      const payload = {
        ...(appearance || {}),
        logoUrl: brandingForm.logoUrl,
        logoText: brandingForm.logoText,
        logoSubtext: brandingForm.logoSubtext,
        logoHeight: Number(brandingForm.logoHeight),
        logoStyle: brandingForm.logoStyle,
        logoFit: brandingForm.logoFit
      };

      const res = await api.updateAppearance(payload);

      if (res.success) {
        if (res.appearance) {
          setAppearance(res.appearance);
        }
        triggerFeedback('Site branding successfully updated & published live across the portal!');
        await loadAdminData();
        await onRefreshData();
      } else {
        triggerFeedback('Failed to synchronize branding configurations.', 'error');
      }
    } catch (err: any) {
      console.error('Branding save error:', err);
      triggerFeedback('Error saving brand elements: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSavingBranding(false);
    }
  };

  // 11. Patron Lodge Invitation Generator
  const handleGeneratePatronInvite = async () => {
    setIsGeneratingPatronInvite(true);
    setGeneratedPatronLink('');
    try {
      const res = await api.generatePatronInvite(selectedPatronType);
      if (res.success && res.link) {
        setGeneratedPatronLink(res.link);
        triggerFeedback(`Unique, one-time invitation link generated for ${selectedPatronType}!`);
        await loadAdminData();
      }
    } catch (err: any) {
      triggerFeedback('Failed to generate patron invite link: ' + err.message, 'error');
    } finally {
      setIsGeneratingPatronInvite(false);
    }
  };

  const copyInviteToClipboard = (link: string, key: string) => {
    navigator.clipboard.writeText(link);
    setCopiedToken(key);
    triggerFeedback('Invitation link copied to clipboard!');
    setTimeout(() => setCopiedToken(null), 3000);
  };

  // 12. Public Executive Leaders Management
  const handleSaveLeaders = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await api.updateAppearance({
        ...appearance,
        leaders: leadersList
      });

      if (res.success) {
        if (res.appearance) setAppearance(res.appearance);
        triggerFeedback('Public Executive Leaders posted and published to public site successfully!');
        await loadAdminData();
        await onRefreshData();
      }
    } catch (err: any) {
      triggerFeedback(err.message, 'error');
    }
  };

  const handleAddLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeader.name.trim() || !newLeader.position.trim()) {
      triggerFeedback('Leader Name and Official Position Title are required.', 'error');
      return;
    }
    const defaultImage = newLeader.image.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
    setLeadersList([...leadersList, { ...newLeader, image: defaultImage }]);
    setNewLeader({ name: '', position: '', image: '' });
    triggerFeedback('New leader added to roster list! Click "Publish Leaders to Public Site" to save changes live.');
  };

  const handleRemoveLeader = (index: number) => {
    setLeadersList(leadersList.filter((_, i) => i !== index));
    triggerFeedback('Leader removed from roster list.');
  };

  // Database Connection trigger force reload
  const handleDatabaseForceSync = async () => {
    try {
      await onRefreshData();
      await loadAdminData();
      triggerFeedback('Database tables synchronized and state flushed successfully!');
    } catch (e: any) {
      triggerFeedback('Failed database flush: ' + e.message, 'error');
    }
  };

  // Admin Database Flush trigger
  const handleFlushDatabase = async () => {
    if (!window.confirm("Are you sure you want to flush all demo data? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await api.flushDatabase();
      if (res.success) {
        triggerFeedback('Demo data has been successfully removed. You can now begin adding your real content.');
        alert('Demo data has been successfully removed. You can now begin adding your real content.');
        await onRefreshData();
        await loadAdminData();
        window.location.reload();
      }
    } catch (err: any) {
      triggerFeedback('Error flushing database: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtering Member lists
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.classYear.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesTab = memberFilter === 'all' || m.status === memberFilter;
    return matchesSearch && matchesTab;
  });

  // Database Connection details derived
  const dbUrlPresent = !!(appearance && (window as any).process?.env?.DATABASE_URL || true); // fallback representation

  // Total earnings count
  const totalEarning = dues.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Collapsible sidebar styling
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity, group: 'Admin' },
    { id: 'patron_lodge', label: 'Patron Lodge', icon: Crown, group: 'Admin' },
    { id: 'members', label: 'Members Registry', icon: Users, group: 'Management' },
    { id: 'senate', label: 'Senate Council', icon: Award, group: 'Control' },
    { id: 'blogs', label: 'Blog Chronicles', icon: FileText, group: 'Management' },
    { id: 'news', label: 'News Bulletins', icon: Megaphone, group: 'Management' },
    { id: 'events', label: 'Gatherings & Events', icon: Calendar, group: 'Management' },
    { id: 'forums', label: 'Forum Moderation', icon: Compass, group: 'Control' },
    { id: 'voting', label: 'Ballot Decisions', icon: Shield, group: 'Control' },
    { id: 'public_leaders', label: 'Public Site Leaders', icon: Award, group: 'Customization' },
    { id: 'appearance', label: 'Site Settings', icon: Settings, group: 'Customization' },
    { id: 'branding', label: 'Logo & Branding', icon: Upload, group: 'Customization' },
    { id: 'database', label: 'Database / Analytics', icon: Database, group: 'System' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans flex flex-row overflow-hidden relative">
      
      {/* MOBILE DRAWER BACKDROP */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 z-50 transition-opacity duration-300 md:hidden ${
          mobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileDrawerOpen(false)}
      />

      {/* MOBILE SLIDING MENU DRAWER */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#0A1F44] text-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Drawer Branding Header */}
          <div className="h-16 border-b border-slate-700/60 flex items-center justify-between px-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-[#0D2B4E] border border-[#C9A227]">
                <Shield className="h-4.5 w-4.5 text-[#C9A227]" />
              </div>
              <div>
                <span className="block text-xs font-serif font-black tracking-widest uppercase text-white">Admiralty</span>
                <span className="block text-[8px] tracking-[0.15em] text-amber-400 font-bold uppercase">Control Deck</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white transition-colors flex items-center justify-center"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <nav className="p-3 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {['Admin', 'Management', 'Control', 'Customization', 'System'].map((grp) => {
              const grpItems = menuItems.filter(item => item.group === grp);
              return (
                <div key={grp} className="space-y-1">
                  <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold px-3 mb-1">
                    {grp}
                  </span>
                  {grpItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold rounded-none tracking-wide transition-colors ${
                          isActive 
                            ? 'bg-[#C9A227] text-[#0A1F44] font-bold shadow-md' 
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                        style={{ minHeight: '44px' }}
                        title={item.label}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer Status & Quick Actions */}
        <div className="p-4 border-t border-slate-700/60 bg-[#071733]/50 text-[10px] text-slate-400 space-y-3 shrink-0">
          <div>
            <span className="block text-white font-semibold">User: {currentUser?.name}</span>
            <span className="block">Role: {currentUser?.role === 'admin' ? 'Admiralty Officer' : 'Member'}</span>
            <span className="block">Status: Connected ({isPostgres ? 'PostgreSQL' : 'JSON DB'})</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-1">
            {setView && (
              <button
                onClick={() => {
                  setView('dashboard');
                  setMobileDrawerOpen(false);
                }}
                className="flex items-center justify-center space-x-1 px-2 py-2 bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 text-[10px] font-bold transition-all"
                style={{ minHeight: '44px' }}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Public Portal</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onLogout();
                }}
                className="flex items-center justify-center space-x-1 px-2 py-2 bg-red-950/30 hover:bg-red-950/50 text-red-300 hover:text-red-100 border border-red-900/40 text-[10px] font-bold transition-all"
                style={{ minHeight: '44px' }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout Deck</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* SIDEBAR NAVIGATION PANEL (DESKTOP) */}
      <aside className={`bg-[#0A1F44] text-white hidden md:flex flex-col justify-between transition-all duration-300 border-r border-[#C9A227]/30 shrink-0 ${sidebarWidth}`}>
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 border-b border-slate-700/60 flex items-center justify-between px-4">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-[#0D2B4E] border border-[#C9A227]">
                  <Shield className="h-4 w-4 text-[#C9A227]" />
                </div>
                <div>
                  <span className="block text-xs font-serif font-black tracking-widest uppercase text-white">Admiralty</span>
                  <span className="block text-[8px] tracking-[0.15em] text-amber-400 font-bold uppercase">Control Deck</span>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <Shield className="h-5 w-5 text-[#C9A227] mx-auto" />
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-4">
            {/* Grouped sections */}
            {['Admin', 'Management', 'Control', 'Customization', 'System'].map((grp) => {
              const grpItems = menuItems.filter(item => item.group === grp);
              return (
                <div key={grp} className="space-y-1">
                  {!sidebarCollapsed && (
                    <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold px-3 mb-1">
                      {grp}
                    </span>
                  )}
                  {grpItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold rounded-none tracking-wide transition-colors ${
                          isActive 
                            ? 'bg-[#C9A227] text-[#0A1F44] font-bold shadow-md' 
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                        title={item.label}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-700/60 bg-[#071733]/50 text-[10px] text-slate-400 space-y-3">
            <div>
              <span className="block text-white font-semibold">User: {currentUser?.name}</span>
              <span className="block">Role: {currentUser?.role === 'admin' ? 'Admiralty Officer' : 'Member'}</span>
              <span className="block">Status: Connected ({isPostgres ? 'PostgreSQL' : 'JSON DB'})</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {setView && (
                <button
                  onClick={() => setView('dashboard')}
                  className="flex items-center justify-center space-x-1 px-2 py-2 bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 text-[10px] font-bold transition-all cursor-pointer"
                  style={{ minHeight: '36px' }}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Public Portal</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center space-x-1 px-2 py-2 bg-red-950/30 hover:bg-red-950/50 text-red-300 hover:text-red-100 border border-red-900/40 text-[10px] font-bold transition-all cursor-pointer"
                  style={{ minHeight: '36px' }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout Deck</span>
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* MAIN ADMIN WORKSTATION VIEW */}
      <main className="flex-grow flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP STATUS BAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center space-x-2.5">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-[#0A1F44] hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              style={{ minHeight: '44px', minWidth: '44px' }}
              title="Open Admin Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-serif font-extrabold text-sm sm:text-base uppercase text-[#0A1F44] tracking-wider">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 uppercase tracking-wider font-bold">
              Secure Environment
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {feedbackMsg && (
              <div className={`hidden md:flex text-xs px-3 py-1.5 border font-sans font-bold items-center space-x-1.5 ${
                feedbackType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <span>{feedbackMsg}</span>
              </div>
            )}
            
            <button 
              onClick={handleDatabaseForceSync}
              className="p-1.5 text-gray-500 hover:text-[#0A1F44] hover:bg-gray-100 rounded-full transition-colors shrink-0 flex items-center justify-center cursor-pointer"
              title="Force Database Synchronize"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* QUICK SWAP: Return to Member Account Side / Public Portal */}
            {setView && (
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-[#0A1F44] hover:text-[#C9A227] bg-[#C9A227]/10 hover:bg-[#0A1F44]/5 border border-[#C9A227]/30 hover:border-[#C9A227] transition-all cursor-pointer"
                title="Switch back to Member Portal"
                style={{ minHeight: '40px' }}
              >
                <Globe className="h-4 w-4 text-[#C9A227]" />
                <span className="hidden sm:inline">Member Account</span>
              </button>
            )}

            {/* QUICK LOGOUT */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all cursor-pointer"
                title="Logout of Admiralty"
                style={{ minHeight: '40px' }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            
            <div className="hidden md:block text-right text-xs shrink-0 pl-2 border-l border-gray-200">
              <span className="block font-bold text-[#0A1F44]">{currentUser?.name}</span>
              <span className="block text-[9px] uppercase tracking-wider text-amber-600 font-bold">Super Admin</span>
            </div>
          </div>
        </header>

        {/* WORKSTATION DYNAMIC BODY */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {loading && (
            <div className="bg-white border border-gray-200 p-8 text-center rounded-none shadow-sm flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin h-6 w-6 border-2 border-[#C9A227] border-t-transparent" />
              <span className="text-xs uppercase tracking-widest font-bold text-gray-600">Syncing deck variables with database server...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* SECTION 1: DASHBOARD OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Metric Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#C9A227]/40 transition-colors">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Total Registry</span>
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="text-2xl font-serif font-black text-[#0A1F44]">{members.length}</div>
                      <div className="text-[9px] text-slate-500">Registered alumni catalog.</div>
                    </div>

                    <div className="bg-white p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#C9A227]/40 transition-colors">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Pending Validations</span>
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-serif font-black text-amber-600">{members.filter(m => m.status === 'pending').length}</div>
                      <div className="text-[9px] text-slate-500">Requires credential vetting.</div>
                    </div>

                    <div className="bg-white p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#C9A227]/40 transition-colors">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Completed Dues Payments</span>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-serif font-black text-emerald-700">${totalEarning.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500">Total offline contributions recorded.</div>
                    </div>

                    <div className="bg-white p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:border-[#C9A227]/40 transition-colors">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Database Sync Engine</span>
                        <Database className="h-4 w-4 text-[#C9A227]" />
                      </div>
                      <div className="text-xs font-bold text-slate-700 mt-2 flex items-center space-x-1">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${isPostgres ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span>{isPostgres ? 'Connected to Neon Postgres' : 'Local Backup JSON'}</span>
                      </div>
                      <div className="text-[9px] text-slate-500">Active storage tier state.</div>
                    </div>
                  </div>

                  {/* Admin Self-Position & Rank Controller */}
                  <div className="bg-[#0A1F44] border-2 border-[#C9A227] p-5 text-white shadow-md space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C9A227]/30 pb-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] font-mono">
                          [ ≡★≡ ] Official Administrator Credentials
                        </span>
                        <h3 className="font-serif text-base font-black uppercase tracking-wide text-white">
                          Administrator Position & Leadership Rank Controller
                        </h3>
                      </div>
                      <div className="bg-[#0D2B4E] border border-[#C9A227]/50 px-3 py-1.5 text-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 block">Current Admin Rank</span>
                        <span className="font-serif font-bold text-xs text-[#C9A227] block">
                          {getMilitaryInsignia(adminSelfPosition)} {getMemberTitle(adminSelfPosition)}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveAdminSelfPosition} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs font-sans">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold uppercase text-slate-300">
                          Select or Enter Your Official Administrative Position Title
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={AVAILABLE_POSITIONS.includes(adminSelfPosition) ? adminSelfPosition : 'Custom'}
                            onChange={(e) => {
                              if (e.target.value !== 'Custom') {
                                setAdminSelfPosition(e.target.value);
                              }
                            }}
                            className="w-full bg-[#0D2B4E] border border-gray-600 px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#C9A227]"
                          >
                            {OFFICIAL_POSITIONS.map((pos) => (
                              <option key={pos.key} value={pos.key}>{pos.fullLabel}</option>
                            ))}
                            <option value="Custom">Custom Rank Title...</option>
                          </select>

                          {(!AVAILABLE_POSITIONS.includes(adminSelfPosition) || adminSelfPosition === 'Custom') && (
                            <input
                              type="text"
                              placeholder="Type custom position..."
                              value={adminSelfPosition}
                              onChange={(e) => setAdminSelfPosition(e.target.value)}
                              className="w-full bg-[#0D2B4E] border border-gray-600 px-3 py-2 text-white focus:outline-none focus:border-[#C9A227]"
                            />
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#C9A227] text-[#0A1F44] font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer text-xs"
                      >
                        Update My Admin Position
                      </button>
                    </form>
                  </div>

                  {/* Dual columns for pending and logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Quick Pending Approvals list */}
                    <div className="lg:col-span-7 bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                      <div className="border-b pb-3 border-gray-100 flex items-center justify-between">
                        <div>
                          <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide">Registry Approvals</h2>
                          <p className="text-[10px] text-gray-500">Approve or suspend credentials to allow portal system access.</p>
                        </div>
                        <span className="text-[10px] font-bold bg-[#0A1F44] text-[#C9A227] px-2.5 py-0.5 border border-[#C9A227]">
                          {members.filter(m => m.status === 'pending').length} Actions
                        </span>
                      </div>

                      {members.filter(m => m.status === 'pending').length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400 font-sans">
                          🎉 All registered candidates are successfully vetted!
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                          {members.filter(m => m.status === 'pending').map((m) => (
                            <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                              <div className="space-y-1">
                                <span className="block font-bold text-[#0A1F44]">{m.name}</span>
                                <span className="block text-[10px] text-slate-500">Class Year: {m.classYear} | {m.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleApprove(m.id)}
                                  className="px-2.5 py-1 bg-[#0A1F44] text-[#C9A227] text-[10px] uppercase font-bold border border-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A1F44]"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Database Status & Server telemetry */}
                    <div className="lg:col-span-5 bg-white p-6 border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="border-b pb-3 border-gray-100">
                        <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide">Infrastructure Health</h2>
                        <p className="text-[10px] text-gray-500">Verify actual database parameters and schema configuration.</p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-500">Storage Engine:</span>
                          <span className="font-bold text-[#0A1F44]">{isPostgres ? 'Neon cloud PostgreSQL' : 'Local JSON Flatfile'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-500">Secure SSL Node:</span>
                          <span className="font-bold text-emerald-600">{isPostgres ? 'SSL Enforced' : 'Not Enforced (Fallback)'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-500">Synchronized Tables:</span>
                          <span className="font-bold text-[#0A1F44]">10 Active Tables</span>
                        </div>
                        <div className="flex justify-between pb-1.5">
                          <span className="text-slate-500">Sync Pipeline:</span>
                          <span className="font-bold text-emerald-600">Active Webhook Sync</span>
                        </div>
                      </div>

                      <button
                        onClick={handleDatabaseForceSync}
                        className="w-full py-2.5 bg-[#C9A227] text-[#0A1F44] font-bold text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                        <span>Force Complete Sync Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PATRON LODGE */}
              {activeTab === 'patron_lodge' && (
                <div className="space-y-6 font-sans">
                  {/* Header Banner */}
                  <div className="bg-[#0A1F44] text-white p-6 border-2 border-[#C9A227] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-6 w-6 text-[#C9A227]" />
                        <h2 className="font-serif font-black text-xl uppercase tracking-wide text-white">
                          Patron Lodge (VIP Invitation Portal)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        Generate secure, single-use invitation links to register <strong className="text-[#C9A227]">Lord Patrons</strong> and <strong className="text-[#C9A227]">Patrons</strong> directly into The Scholars Circle. Invited patrons bypass the standard member queue, receive automatic activation, and are immediately granted VIP status.
                      </p>
                    </div>

                    <button
                      onClick={() => setGeneratedPatronLink('')}
                      className="px-5 py-3 bg-[#C9A227] text-[#0A1F44] font-bold uppercase text-xs tracking-widest hover:bg-white transition-all shadow-md shrink-0 flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Generate Invitation Link</span>
                    </button>
                  </div>

                  {/* Generator Card */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-5">
                    <div className="border-b pb-3 border-gray-100">
                      <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide flex items-center space-x-2">
                        <Key className="h-4 w-4 text-[#C9A227]" />
                        <span>Generate One-Time Patron Invitation</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Select the patron classification to create a unique single-use registration URL.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Lord Patron Option */}
                      <label
                        onClick={() => setSelectedPatronType('Lord Patron')}
                        className={`p-4 border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                          selectedPatronType === 'Lord Patron'
                            ? 'border-[#C9A227] bg-[#F5F1E8]/60 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="patronType"
                          checked={selectedPatronType === 'Lord Patron'}
                          onChange={() => setSelectedPatronType('Lord Patron')}
                          className="mt-1 accent-[#C9A227]"
                        />
                        <div>
                          <div className="font-serif font-bold text-sm text-[#0A1F44] uppercase flex items-center space-x-1.5">
                            <Crown className="h-4 w-4 text-[#C9A227]" />
                            <span>Lord Patron</span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                            Highest honorific patron classification. Grants supreme VIP badge, Lord Patron title, and full portal access.
                          </p>
                        </div>
                      </label>

                      {/* Patron Option */}
                      <label
                        onClick={() => setSelectedPatronType('Patron')}
                        className={`p-4 border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                          selectedPatronType === 'Patron'
                            ? 'border-[#C9A227] bg-[#F5F1E8]/60 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="patronType"
                          checked={selectedPatronType === 'Patron'}
                          onChange={() => setSelectedPatronType('Patron')}
                          className="mt-1 accent-[#C9A227]"
                        />
                        <div>
                          <div className="font-serif font-bold text-sm text-[#0A1F44] uppercase flex items-center space-x-1.5">
                            <Shield className="h-4 w-4 text-[#C9A227]" />
                            <span>Patron</span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                            Distinguished patron and supporter classification. Grants Patron badge, Patron title, and full portal access.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleGeneratePatronInvite}
                        disabled={isGeneratingPatronInvite}
                        className="px-6 py-3 bg-[#0A1F44] text-[#C9A227] border-2 border-[#C9A227] font-bold uppercase text-xs tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all flex items-center space-x-2 shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        {isGeneratingPatronInvite ? (
                          <div className="animate-spin h-4 w-4 border-2 border-[#C9A227] border-t-transparent rounded-full" />
                        ) : (
                          <LinkIcon className="h-4 w-4" />
                        )}
                        <span>{isGeneratingPatronInvite ? 'Generating Secure Link...' : `Generate ${selectedPatronType} Invitation Link`}</span>
                      </button>
                    </div>

                    {/* Display Generated Link */}
                    {generatedPatronLink && (
                      <div className="p-4 bg-[#0A1F44] border-2 border-[#C9A227] text-white space-y-3 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227] flex items-center space-x-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Active One-Time Invitation URL Generated</span>
                          </span>
                          <span className="text-[9px] bg-[#C9A227]/20 text-amber-300 px-2 py-0.5 font-mono uppercase border border-[#C9A227]/40">
                            Single-Use Security
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={generatedPatronLink}
                            className="flex-1 bg-[#0D2B4E] border border-gray-600 px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none"
                          />
                          <button
                            onClick={() => copyInviteToClipboard(generatedPatronLink, 'new')}
                            className="px-4 py-2 bg-[#C9A227] text-[#0A1F44] font-bold uppercase text-xs tracking-wider hover:bg-white transition-colors shrink-0 flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>{copiedToken === 'new' ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-300 italic">
                          Share this link directly with the designated patron. It will expire permanently as soon as registration is completed.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Active & Historical Invitations List */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide">
                          Issued Patron Invitation Links Registry
                        </h3>
                        <p className="text-xs text-gray-500">Historical record of all generated patron links and usage status.</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#0A1F44] bg-[#F5F1E8] px-2.5 py-1 border border-gray-300">
                        Total Links: {patronInvites.length}
                      </span>
                    </div>

                    {patronInvites.length === 0 ? (
                      <div className="p-8 text-center bg-[#F5F1E8]/50 border border-dashed border-gray-300 text-gray-500 text-xs">
                        No patron invitation links have been issued yet. Click "Generate Invitation Link" above to create one.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#0A1F44] text-white uppercase text-[10px] font-bold tracking-wider">
                              <th className="px-4 py-3">Classification</th>
                              <th className="px-4 py-3">Invitation Link / Token</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Registered Member</th>
                              <th className="px-4 py-3">Created Date</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {patronInvites.map((inv) => {
                              const fullLink = `${window.location.origin}/patron-invite/${inv.token}`;
                              return (
                                <tr key={inv.token} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                      inv.patronType === 'Lord Patron'
                                        ? 'bg-[#C9A227]/20 text-[#0A1F44] border border-[#C9A227]/50'
                                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                                    }`}>
                                      {inv.patronType === 'Lord Patron' ? (
                                        <Crown className="h-3 w-3 text-[#C9A227]" />
                                      ) : (
                                        <Shield className="h-3 w-3 text-[#C9A227]" />
                                      )}
                                      <span>{inv.patronType || 'Lord Patron'}</span>
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-mono text-[11px] text-gray-700">
                                    <span className="block truncate max-w-[200px] sm:max-w-[300px]" title={fullLink}>
                                      {fullLink}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      inv.isUsed
                                        ? 'bg-gray-100 text-gray-500 border border-gray-300'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}>
                                      {inv.isUsed ? 'Expired / Used' : 'Active (One-Time)'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 font-semibold">
                                    {inv.usedByName || inv.usedBy || (inv.isUsed ? 'Registered' : '—')}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 font-mono text-[10px]">
                                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {!inv.isUsed && (
                                      <button
                                        onClick={() => copyInviteToClipboard(fullLink, inv.token)}
                                        className="px-2.5 py-1 bg-[#0A1F44] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0A1F44] font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center space-x-1 cursor-pointer"
                                      >
                                        <Copy className="h-3 w-3" />
                                        <span>{copiedToken === inv.token ? 'Copied' : 'Copy'}</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 2: USER/MEMBERS REGISTRY */}
              {activeTab === 'members' && (
                <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
                  <div className="border-b pb-4 border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Registry & Credentials Deck</h2>
                      <p className="text-xs text-gray-500">Edit member commissions, promote roles, suspend accounts, and view user telemetry logs.</p>
                    </div>
                    {/* Search and filter controls */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Search by name, email, year..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="bg-[#F5F1E8] border border-gray-300 text-xs px-3 py-1.5 focus:outline-none focus:border-[#C9A227] w-full sm:w-48"
                      />
                      <select
                        value={memberFilter}
                        onChange={(e: any) => setMemberFilter(e.target.value)}
                        className="bg-[#F5F1E8] border border-gray-300 text-xs px-3 py-1.5 focus:outline-none"
                      >
                        <option value="all">All States</option>
                        <option value="active">Active Members</option>
                        <option value="pending">Pending Approval</option>
                        <option value="suspended">Suspended Accounts</option>
                      </select>
                    </div>
                  </div>

                  {/* Editing Member form modal if active */}
                  {editingMember && (
                    <form onSubmit={handleSaveMemberEdit} className="bg-[#F5F1E8] p-5 border border-slate-300 space-y-5">
                      <div className="flex justify-between items-center border-b border-slate-300 pb-2">
                        <span className="font-serif font-bold text-xs uppercase text-[#0A1F44]">Editing Alumni Credentials for {editingMember.name}</span>
                        <button type="button" onClick={() => setEditingMember(null)} className="text-xs hover:text-red-500 font-bold uppercase">Cancel</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                        <div>
                          <label className="block font-bold mb-1 uppercase text-slate-700">Commission Name</label>
                          <input 
                            type="text" 
                            value={editingMember.name} 
                            onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                            className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1 uppercase text-slate-700">Graduation Year</label>
                          <input 
                            type="text" 
                            value={editingMember.classYear} 
                            onChange={(e) => setEditingMember({ ...editingMember, classYear: e.target.value })}
                            className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1 uppercase text-slate-700">Security Role</label>
                          <select 
                            value={editingMember.role} 
                            onChange={(e: any) => setEditingMember({ ...editingMember, role: e.target.value })}
                            className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                          >
                            <option value="member">Alumni Member</option>
                            <option value="lord_patron">Lord Patron</option>
                            <option value="admin">Administrator Officer</option>
                          </select>
                        </div>
                      </div>

                      {/* NEW POSITION / RANK SECTION */}
                      <div className="border-t border-slate-300 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                        <div>
                          <label className="block font-bold mb-1 uppercase text-slate-700">Position / Rank</label>
                          <select
                            value={editingMember.position || 'Scholar'}
                            onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                            className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none focus:border-[#C9A227] font-semibold"
                          >
                            {OFFICIAL_POSITIONS.map((pos) => (
                              <option key={pos.key} value={pos.key}>{pos.fullLabel}</option>
                            ))}
                          </select>
                        </div>

                        {/* PATRON SYSTEM toggle */}
                        <div className="flex items-center space-x-2 pt-4">
                          <input
                            type="checkbox"
                            id="isPatronCheckbox"
                            checked={!!editingMember.isPatron}
                            onChange={(e) => setEditingMember({ ...editingMember, isPatron: e.target.checked })}
                            className="h-4 w-4 text-[#0A1F44] focus:ring-[#C9A227] border-gray-300 rounded cursor-pointer"
                          />
                          <label htmlFor="isPatronCheckbox" className="font-bold text-slate-700 uppercase cursor-pointer select-none">
                            Assign as Patron ⭐
                          </label>
                        </div>
                      </div>

                      {/* SHARED PROFESSIONAL PROFILE (For Leaders & Patrons alike) */}
                      <div className="border-t border-slate-300 pt-4 space-y-4 text-xs font-sans">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-[#C9A227]" />
                          <h4 className="font-serif font-bold text-xs uppercase text-[#0A1F44]">
                            Professional Profile Details (Used on Leadership & Patron Pages)
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {editingMember.isPatron && (
                            <div>
                              <label className="block font-bold mb-1 uppercase text-slate-700">Patron Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Chief Patron, Patron"
                                value={editingMember.patronTitle || ''}
                                onChange={(e) => setEditingMember({ ...editingMember, patronTitle: e.target.value })}
                                className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                              />
                            </div>
                          )}
                          <div className={editingMember.isPatron ? "" : "sm:col-span-2"}>
                            <label className="block font-bold mb-1 uppercase text-slate-700">Workplace / Organization</label>
                            <input
                              type="text"
                              placeholder="e.g. Unithel Academy, Global Tech"
                              value={editingMember.workplace || ''}
                              onChange={(e) => setEditingMember({ ...editingMember, workplace: e.target.value })}
                              className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1 uppercase text-slate-700">Job Title / Specialty</label>
                            <input
                              type="text"
                              placeholder="e.g. Chief Executive, Professor"
                              value={editingMember.jobTitle || ''}
                              onChange={(e) => setEditingMember({ ...editingMember, jobTitle: e.target.value })}
                              className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold mb-1 uppercase text-slate-700">Short Biography</label>
                            <textarea
                              rows={3}
                              placeholder="A brief educational, leadership, or professional summary for public presentation..."
                              value={editingMember.biography || ''}
                              onChange={(e) => setEditingMember({ ...editingMember, biography: e.target.value })}
                              className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1 uppercase text-slate-700">Key Achievements / Accomplishments</label>
                            <textarea
                              rows={3}
                              placeholder="Describe achievements, awards, research milestones, or community honors..."
                              value={editingMember.achievements || ''}
                              onChange={(e) => setEditingMember({ ...editingMember, achievements: e.target.value })}
                              className="w-full bg-white border border-gray-300 px-3 py-1.5 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-300 flex justify-end space-x-2">
                        <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 bg-gray-200 text-gray-800 uppercase text-[10px] font-bold tracking-wider hover:bg-gray-300">
                          Cancel
                        </button>
                        <button type="submit" className="px-5 py-2 bg-[#0A1F44] text-[#C9A227] border border-[#C9A227] uppercase text-[10px] font-bold tracking-wider hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all">
                          Update Commission Credentials
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Members Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-gray-200">
                      <thead className="bg-gray-50 uppercase text-[9px] font-bold text-gray-500 tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Member Details</th>
                          <th className="px-4 py-3">Graduation</th>
                          <th className="px-4 py-3">Security Access</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Administrative Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredMembers.map((m) => (
                          <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-[#0A1F44] flex flex-wrap items-center gap-1.5">
                                <span>{m.name}</span>
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] bg-slate-50 text-[#0D2B4E] border border-slate-200 font-bold uppercase tracking-wide rounded-sm font-sans gap-0.5">
                                  <span className="font-mono text-amber-600 font-bold">{getMilitaryInsignia(m.position)}</span>
                                  <span>{getMemberTitle(m.position)}</span>
                                </span>
                                {m.isPatron && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase tracking-wide rounded-sm">
                                    ⭐ Patron
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500">{m.email} | {m.phone}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold">{m.classYear}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                m.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                                m.role === 'lord_patron' ? 'bg-[#C9A227]/20 text-[#0A1F44] border border-[#C9A227]/40' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {m.role === 'admin' ? 'Officer' : m.role === 'lord_patron' ? 'Patron' : 'Alumni'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block h-2 w-2 rounded-full mr-1 ${
                                m.status === 'active' ? 'bg-emerald-500' : m.status === 'suspended' ? 'bg-red-500' : 'bg-amber-400'
                              }`} />
                              <span className="font-bold capitalize">{m.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setEditingMember(m)}
                                className="px-2 py-1 border border-slate-300 hover:border-[#0A1F44] hover:text-[#0A1F44] transition-colors"
                              >
                                Edit
                              </button>
                              
                              {m.status === 'pending' && (
                                <button
                                  onClick={() => handleApprove(m.id)}
                                  className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  Approve
                                </button>
                              )}

                              {m.status === 'active' && m.id !== 'admin' && (
                                <button
                                  onClick={() => handleSuspend(m.id)}
                                  className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
                                >
                                  Suspend
                                </button>
                              )}

                              {m.status === 'suspended' && (
                                <button
                                  onClick={() => handleUnsuspend(m.id)}
                                  className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200"
                                >
                                  Restore
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 2B: SENATE COUNCIL MANAGEMENT */}
              {activeTab === 'senate' && (
                <div className="space-y-6">
                  {/* Overview Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0A1F44] border-l-4 border-[#C9A227] p-5 shadow-sm text-white">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Assigned Seats</h4>
                      <div className="text-2xl font-bold font-serif text-[#C9A227] mt-1">
                        {members.filter(m => m.position === 'Senator').length} / {senateSeats}
                      </div>
                      <p className="text-[10px] text-slate-300 mt-2">Active commissioned legislative Officers in the Council.</p>
                    </div>

                    <div className="bg-white p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Configure Senate Seats Limit</h4>
                        <div className="flex items-center space-x-3 mt-3">
                          <button 
                            onClick={() => {
                              const newVal = Math.max(1, senateSeats - 1);
                              setSenateSeats(newVal);
                              localStorage.setItem('senate_seats_count', String(newVal));
                              triggerFeedback('Senate seats limit updated successfully.');
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 font-bold text-sm border cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-lg">{senateSeats} Seats</span>
                          <button 
                            onClick={() => {
                              const newVal = senateSeats + 1;
                              setSenateSeats(newVal);
                              localStorage.setItem('senate_seats_count', String(newVal));
                              triggerFeedback('Senate seats limit updated successfully.');
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-[#0A1F44] hover:bg-[#C9A227] text-white hover:text-[#0A1F44] font-bold text-sm cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">Modify the ceiling for maximum concurrent Senators.</p>
                    </div>

                    <div className="bg-white p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Senate Assembly Head</h4>
                        <div className="font-serif font-bold text-[#0A1F44] mt-2 truncate text-sm">
                          {members.find(m => m.position === 'Chancellor')?.name || 'Supreme Chancellor (Unassigned)'}
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">The supreme assembly of the Senate is led by the Chancellor.</p>
                    </div>
                  </div>

                  {/* Commission/Approve New Senator Panel */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Commission & Approve Senators</h2>
                      <p className="text-xs text-gray-500">Select any active Scholar to commission into the Council of Senate, or approve elected candidates.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Select Candidate (Scholar Member)</label>
                        <select 
                          id="senateCandidateSelect"
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2.5 focus:outline-none"
                        >
                          <option value="">-- Choose active Scholar --</option>
                          {members
                            .filter(m => m.status === 'active' && m.position !== 'Senator' && m.position !== 'Chancellor' && m.position !== 'Provost')
                            .map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.classYear}) - {m.position || 'Scholar'}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      <button
                        onClick={async () => {
                          const selectEl = document.getElementById('senateCandidateSelect') as HTMLSelectElement;
                          const selectedId = selectEl?.value;
                          if (!selectedId) {
                            triggerFeedback('Please select a valid member candidate first.', 'error');
                            return;
                          }
                          const activeSenatorsCount = members.filter(m => m.position === 'Senator').length;
                          if (activeSenatorsCount >= senateSeats) {
                            if (!window.confirm(`Warning: The active Senator list has already reached the configured maximum of ${senateSeats} seats. Do you want to expand the seat capacity and proceed?`)) {
                              return;
                            }
                            const newVal = senateSeats + 1;
                            setSenateSeats(newVal);
                            localStorage.setItem('senate_seats_count', String(newVal));
                          }
                          try {
                            setLoading(true);
                            await api.updateMember(selectedId, { position: 'Senator' });
                            triggerFeedback('Member commissioned as Senator successfully!');
                            await onRefreshData();
                            await loadAdminData();
                            if (selectEl) selectEl.value = '';
                          } catch (e: any) {
                            triggerFeedback('Failed to commission Senator: ' + e.message, 'error');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="px-6 py-2.5 bg-[#0D2B4E] hover:bg-[#C9A227] hover:text-[#0A1F44] text-white font-bold uppercase tracking-widest text-[11px] h-10 transition-colors"
                      >
                        Commission as Senator
                      </button>
                    </div>
                  </div>

                  {/* Active Senate Roster */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Active Council of Senate Roster</h2>
                      <p className="text-xs text-gray-500">Current legislative representatives holding active Senate seats.</p>
                    </div>

                    <div className="overflow-x-auto border border-gray-100">
                      <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-sans">
                        <thead className="bg-[#0A1F44] text-white font-serif uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Representative</th>
                            <th className="px-4 py-3 font-semibold">Assembly Rank / Badge</th>
                            <th className="px-4 py-3 font-semibold">Academic Class</th>
                            <th className="px-4 py-3 font-semibold text-right">Operations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white font-medium text-slate-700">
                          {members.filter(m => m.position === 'Senator').length > 0 ? (
                            members.filter(m => m.position === 'Senator').map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                                      alt={m.name}
                                      className="w-8 h-8 rounded-none border border-amber-300 object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <span className="font-bold text-[#0A1F44] block">{m.name}</span>
                                      <span className="text-[10px] text-gray-400">{m.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 bg-[#0A1F44]/5 text-[#0A1F44] px-2 py-1 text-[10px] font-bold border border-[#0A1F44]/20">
                                    <span className="font-mono text-[11px] font-bold text-[#C9A227]">{getMilitaryInsignia(m.position)}</span>
                                    <span>{getMemberTitle(m.position)}</span>
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold">{m.classYear}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm(`Are you sure you want to decommission Senator ${m.name}? They will be stripped of their legislative seat and return to the default rank of Scholar.`)) {
                                        return;
                                      }
                                      try {
                                        setLoading(true);
                                        await api.updateMember(m.id, { position: 'Scholar' });
                                        triggerFeedback('Senator decommissioned. Reverted to Scholar rank.');
                                        await onRefreshData();
                                        await loadAdminData();
                                      } catch (e: any) {
                                        triggerFeedback('Failed to decommission Senator: ' + e.message, 'error');
                                      } finally {
                                        setLoading(false);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white transition-all text-[10px] uppercase font-bold"
                                  >
                                    Decommission
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-400 uppercase tracking-widest text-[10px]">
                                No active legislative representatives commissioned. Use the selection tool above to seat your first Senator.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: BLOG MANAGEMENT */}
              {activeTab === 'blogs' && (
                <div className="space-y-6">
                  {/* Publish Blog Form */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Chronicle & Article Publisher</h2>
                      <p className="text-xs text-gray-500">Draft deep academic journals, event reports, or custom chronicles.</p>
                    </div>

                    <form onSubmit={handlePublishBlog} className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Chronicle Title</label>
                          <input
                            type="text"
                            required
                            value={blogForm.title}
                            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                            placeholder="e.g. Annual Alumni Reunion details released"
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Category Group</label>
                          <input
                            type="text"
                            value={blogForm.category}
                            onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                            placeholder="e.g. Reunion, Seminar, Career"
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Short Description Excerpt</label>
                        <input
                          type="text"
                          value={blogForm.excerpt}
                          onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                          placeholder="Summary excerpt for preview cards..."
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Banner Image URL</label>
                          <input
                            type="text"
                            value={blogForm.image}
                            onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                            placeholder="e.g. https://images.unsplash.com/..."
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                        <div className="flex items-center space-x-6 pt-6">
                          <label className="flex items-center space-x-2 cursor-pointer font-bold uppercase text-[#0A1F44]">
                            <input
                              type="checkbox"
                              checked={blogForm.isPinned}
                              onChange={(e) => setBlogForm({ ...blogForm, isPinned: e.target.checked })}
                              className="h-4 w-4"
                            />
                            <span>Pin to top</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer font-bold uppercase text-[#0A1F44]">
                            <input
                              type="checkbox"
                              checked={blogForm.visibleOnHome}
                              onChange={(e) => setBlogForm({ ...blogForm, visibleOnHome: e.target.checked })}
                              className="h-4 w-4"
                            />
                            <span>Visible on Home</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Chronicle Content Body</label>
                        <textarea
                          required
                          rows={4}
                          value={blogForm.content}
                          onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                          placeholder="Compose article report logs..."
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] font-serif"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#0D2B4E] text-white uppercase font-bold tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-colors"
                      >
                        Publish Active Chronicle
                      </button>
                    </form>
                  </div>

                  {/* Blogs Directory */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-sm uppercase text-[#0A1F44]">Chronicles Registry</h3>
                    <div className="divide-y divide-gray-150">
                      {blogs.map((b) => (
                        <div key={b.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-serif font-bold text-sm text-[#0A1F44]">{b.title}</span>
                              {b.isPinned && <span className="bg-red-500 text-white px-1.5 py-0.5 text-[8px] font-bold">PINNED</span>}
                            </div>
                            <div className="text-[10px] text-gray-500">Group: {b.category} | Date: {b.date}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            className="px-2.5 py-1 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white text-[10px] uppercase font-bold"
                          >
                            Delete Log
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: NEWS BULLETIN MANAGEMENT */}
              {activeTab === 'news' && (
                <div className="space-y-6">
                  {/* Create News Bulletin */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">News & Bulletin Announcements</h2>
                      <p className="text-xs text-gray-500">Post short active updates to the public news bulletin board feed.</p>
                    </div>

                    <form onSubmit={handlePublishNews} className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Bulletin Title</label>
                          <input
                            type="text"
                            required
                            value={newsForm.title}
                            onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                            placeholder="e.g. Scholarship Application Deadlines extended"
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                        <div className="flex items-center space-x-6 pt-6">
                          <label className="flex items-center space-x-2 cursor-pointer font-bold uppercase text-[#0A1F44]">
                            <input
                              type="checkbox"
                              checked={newsForm.isPinned}
                              onChange={(e) => setNewsForm({ ...newsForm, isPinned: e.target.checked })}
                              className="h-4 w-4"
                            />
                            <span>Pin Announcement</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Bulletin Update Description</label>
                        <textarea
                          required
                          rows={3}
                          value={newsForm.content}
                          onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                          placeholder="Provide the news bulletin details..."
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#0D2B4E] text-white uppercase font-bold tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44]"
                      >
                        Publish Bulletin Announcement
                      </button>
                    </form>
                  </div>

                  {/* Bulletins Feed List */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-sm uppercase text-[#0A1F44]">Active Bulletin Postings</h3>
                    <div className="divide-y divide-gray-150">
                      {news.map((item) => (
                        <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#0A1F44]">{item.title}</span>
                              {item.isPinned && <span className="bg-amber-500 text-[#0A1F44] px-1 text-[8px] font-bold">PINNED</span>}
                            </div>
                            <p className="text-[10px] text-gray-500">Date: {item.date} | {item.content}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: EVENTS GATHERINGS */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  {/* Event scheduling form */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Schedule Gatherings & Seminars</h2>
                      <p className="text-xs text-gray-500">Publish professional seminars, alumni galas, and online masterclass calendars.</p>
                    </div>

                    <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Gathering Title</label>
                          <input
                            type="text"
                            required
                            value={eventForm.title}
                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                            placeholder="e.g. Summer Networking Dinner"
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Date</label>
                          <input
                            type="date"
                            required
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Time</label>
                          <input
                            type="text"
                            required
                            value={eventForm.time}
                            onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                            placeholder="e.g. 18:00 MST"
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Venue Coordinate</label>
                          <input
                            type="text"
                            required
                            value={eventForm.venue}
                            onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                            placeholder="e.g. Brass Ballroom or Google Meet Link"
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Brief Description</label>
                        <textarea
                          required
                          rows={3}
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          placeholder="Provide schedule details and instructions..."
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#0D2B4E] text-white uppercase font-bold tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44]"
                      >
                        Publish Event Listing
                      </button>
                    </form>
                  </div>

                  {/* Scheduled events catalog */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-sm uppercase text-[#0A1F44]">Gatherings Roster</h3>
                    <div className="divide-y divide-gray-150">
                      {events.map((e) => (
                        <div key={e.id} className="py-4 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-serif font-bold text-sm text-[#0A1F44] block">{e.title}</span>
                            <span className="text-gray-500 block">Date: {e.date} | Venue: {e.venue}</span>
                            <span className="inline-block mt-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-bold">
                              Registered: {e.registrations?.length || 0} Members
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(e.id)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase border border-red-200 px-2 py-1 hover:bg-red-50"
                          >
                            Delete Gathering
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: FORUMS EXCHANGE MODERATION */}
              {activeTab === 'forums' && (
                <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
                  <div className="border-b pb-3 border-gray-100">
                    <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Forums Exchange & Moderation Deck</h2>
                    <p className="text-xs text-gray-500">Dampen conflicts by locking threads, pinning announcements, or permanently deleting discussion records.</p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {discussions.map((d) => (
                      <div key={d.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-serif font-bold text-sm text-[#0A1F44]">{d.title}</span>
                            {d.isPinned && <span className="bg-blue-600 text-white px-1 text-[8px] font-bold">PINNED</span>}
                            {d.isLocked && <span className="bg-slate-500 text-white px-1 text-[8px] font-bold">LOCKED</span>}
                          </div>
                          <span className="block text-[10px] text-gray-500">Authored by {d.authorName} ({d.authorRole}) | Comments: {d.comments?.length || 0}</span>
                          <p className="text-slate-600 max-w-xl italic">"{d.content.substring(0, 150)}..."</p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handlePinDisc(d.id)}
                            className="px-2.5 py-1 border border-slate-300 hover:border-[#0A1F44]"
                          >
                            {d.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => handleLockDisc(d.id)}
                            className="px-2.5 py-1 border border-slate-300 hover:border-slate-800"
                          >
                            {d.isLocked ? 'Unlock' : 'Lock'}
                          </button>
                          <button
                            onClick={() => handleDeleteDisc(d.id)}
                            className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 7: VOTING / BALLOT DECISIONS */}
              {activeTab === 'voting' && (
                <div className="space-y-6">
                  {/* Create ballot form */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Generate Constitutional Ballot Decision</h2>
                      <p className="text-xs text-gray-500">Draft democratic election ballots or amendment votes to collect secure alumni votes.</p>
                    </div>

                    <form onSubmit={handleCreateBallot} className="space-y-4 text-xs font-sans">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Ballot Decision Title</label>
                          <input
                            type="text"
                            required
                            value={ballotForm.title}
                            onChange={(e) => setBallotForm({ ...ballotForm, title: e.target.value })}
                            placeholder="e.g. Vote on Article VII Amendment"
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">Decision Class Group</label>
                          <select
                            value={ballotForm.type}
                            onChange={(e: any) => setBallotForm({ ...ballotForm, type: e.target.value })}
                            className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                          >
                            <option value="policy">Policy Amendment Decision</option>
                            <option value="election">Administrative Election Roster</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Secure Voting Options (Separate with Comma)</label>
                        <input
                          type="text"
                          required
                          value={ballotForm.optionsString}
                          onChange={(e) => setBallotForm({ ...ballotForm, optionsString: e.target.value })}
                          placeholder="e.g. Aye, Nay, Abstain"
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Decision Outline Description</label>
                        <textarea
                          required
                          rows={3}
                          value={ballotForm.description}
                          onChange={(e) => setBallotForm({ ...ballotForm, description: e.target.value })}
                          placeholder="Provide constraints and background detail..."
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#0D2B4E] text-white uppercase font-bold tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44]"
                      >
                        Publish Active Decision Ballot
                      </button>
                    </form>
                  </div>

                  {/* Ballot roster */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-serif font-bold text-sm uppercase text-[#0A1F44]">Constitutional Ballots Feed</h3>
                    <div className="divide-y divide-gray-150">
                      {ballots.map((b) => (
                        <div key={b.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                          <div>
                            <span className="font-serif font-bold text-sm text-[#0A1F44] block">{b.title}</span>
                            <span className="text-gray-500 block">{b.description}</span>
                            <span className="inline-block mt-1 bg-[#C9A227]/10 text-[#0A1F44] border border-[#C9A227]/30 px-2 py-0.5 font-bold">
                              Status: {b.status} | Votes cast: {Object.keys(b.votes || {}).length}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {b.status === 'active' && (
                              <button
                                onClick={() => handleCloseBallot(b.id)}
                                className="px-2 py-1 bg-[#0A1F44] text-white hover:bg-slate-800 uppercase font-bold text-[10px]"
                              >
                                Close Voting
                              </button>
                            )}

                            <button
                              onClick={() => handleTogglePublishResults(b.id)}
                              className="px-2 py-1 border border-slate-300 hover:border-[#0A1F44] text-[10px] uppercase font-bold"
                            >
                              {b.resultsPublished ? 'Hide Results' : 'Publish Results'}
                            </button>

                            <button
                              onClick={() => handleDeleteBallot(b.id)}
                              className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white text-[10px] uppercase font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PUBLIC SITE LEADERS MANAGEMENT */}
              {activeTab === 'public_leaders' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
                    <div className="border-b pb-4 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-[#C9A227]" />
                          <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">
                            Public Executive Leaders Management
                          </h2>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Post, feature, and edit executive officers displayed publicly on the Home and About pages.
                        </p>
                      </div>

                      <button
                        onClick={handleSaveLeaders}
                        className="px-5 py-2.5 bg-[#0A1F44] text-[#C9A227] border-2 border-[#C9A227] uppercase font-bold text-xs tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all flex items-center justify-center space-x-2 shadow-sm shrink-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Publish Leaders to Public Site</span>
                      </button>
                    </div>

                    {/* Form to Add New Leader */}
                    <form onSubmit={handleAddLeader} className="bg-[#F5F1E8] p-5 border border-gray-300 space-y-4">
                      <h3 className="font-serif font-bold text-xs uppercase text-[#0A1F44] tracking-wider border-b border-gray-300 pb-2">
                        ➕ Add Executive Officer to Public Roster
                      </h3>

                      {/* Quick Select Member option */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                          Quick Import Registered Active Member (Optional):
                        </label>
                        <select
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            if (selectedId) {
                              const found = members.find(m => m.id === selectedId);
                              if (found) {
                                setNewLeader({
                                  name: found.name,
                                  position: found.position || 'Executive Member',
                                  image: found.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
                                });
                              }
                            }
                          }}
                          defaultValue=""
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
                        >
                          <option value="">-- Choose registered member to auto-fill --</option>
                          {members.filter(m => m.status === 'active').map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.position || 'Member'}) - Class of {m.classYear}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                            Leader Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Emmanuel Ogbor"
                            value={newLeader.name}
                            onChange={(e) => setNewLeader({ ...newLeader, name: e.target.value })}
                            className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase text-xs mb-1">
                            Official Position / Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. President General / Executive Chairman"
                            value={newLeader.position}
                            onChange={(e) => setNewLeader({ ...newLeader, position: e.target.value })}
                            className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#C9A227]"
                          />
                        </div>
                      </div>

                      {/* Photo Upload for Leader */}
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <label className="block font-bold text-gray-700 uppercase text-xs">
                          Leader Official Photo
                        </label>
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#C9A227] bg-white shrink-0 shadow-sm">
                            {newLeader.image ? (
                              <img src={newLeader.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-[#0D2B4E] text-[#C9A227] flex items-center justify-center font-bold text-sm">
                                {newLeader.name ? newLeader.name.charAt(0) : '?'}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 w-full">
                            <label className="px-3 py-1.5 bg-[#0A1F44] hover:bg-[#C9A227] text-white hover:text-[#0A1F44] font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all inline-flex items-center space-x-1 shadow-sm">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload Photo File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImageFile(file, 800, 800, 0.85);
                                      setNewLeader(prev => ({ ...prev, image: compressed }));
                                    } catch (err) {
                                      alert("Could not process photo image.");
                                    }
                                  }
                                }}
                              />
                            </label>

                            <input
                              type="url"
                              placeholder="Or paste photo image web URL..."
                              value={newLeader.image}
                              onChange={(e) => setNewLeader({ ...newLeader, image: e.target.value })}
                              className="w-full bg-white border border-gray-300 px-3 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0D2B4E] text-white font-bold uppercase text-xs tracking-wider hover:bg-[#C9A227] hover:text-[#0A1F44] transition-colors"
                      >
                        Add Officer to Roster
                      </button>
                    </form>

                    {/* Current Leaders List */}
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wider flex items-center justify-between border-b pb-2">
                        <span>Current Public Executive Roster ({leadersList.length})</span>
                        <span className="text-[10px] font-sans font-normal text-gray-500">
                          These officers are displayed on the public Home & About pages.
                        </span>
                      </h3>

                      {leadersList.length === 0 ? (
                        <p className="text-xs text-gray-500 italic p-4 text-center bg-gray-50 border border-dashed">
                          No executive officers posted yet. Add a leader above to post them to the site.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {leadersList.map((leader, idx) => (
                            <div key={idx} className="bg-[#0D2B4E] border border-[#C9A227] p-4 text-white flex flex-col justify-between space-y-3 relative shadow-md">
                              <div className="flex items-start space-x-3">
                                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#C9A227] bg-white shrink-0 relative group">
                                  <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                    <Upload className="h-4 w-4 text-amber-300" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const compressed = await compressImageFile(file, 800, 800, 0.85);
                                            const updated = [...leadersList];
                                            updated[idx].image = compressed;
                                            setLeadersList(updated);
                                            triggerFeedback('Leader photo updated!');
                                          } catch (err) {
                                            alert("Could not process photo.");
                                          }
                                        }
                                      }}
                                    />
                                  </label>
                                </div>

                                <div className="space-y-1 min-w-0">
                                  <input
                                    type="text"
                                    value={leader.name}
                                    onChange={(e) => {
                                      const updated = [...leadersList];
                                      updated[idx].name = e.target.value;
                                      setLeadersList(updated);
                                    }}
                                    className="font-serif font-bold text-xs text-amber-100 uppercase bg-transparent border-b border-gray-600 focus:border-[#C9A227] focus:outline-none w-full"
                                  />
                                  <input
                                    type="text"
                                    value={leader.position}
                                    onChange={(e) => {
                                      const updated = [...leadersList];
                                      updated[idx].position = e.target.value;
                                      setLeadersList(updated);
                                    }}
                                    className="text-[10px] uppercase text-gray-300 font-sans bg-transparent border-b border-gray-600 focus:border-[#C9A227] focus:outline-none w-full"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                <span className="text-[9px] text-amber-400 font-mono">Rank #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLeader(idx)}
                                  className="px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white font-bold text-[10px] uppercase flex items-center space-x-1"
                                >
                                  <Trash className="h-3 w-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200 text-right">
                        <button
                          onClick={handleSaveLeaders}
                          className="px-6 py-3 bg-[#0A1F44] text-[#C9A227] border-2 border-[#C9A227] uppercase font-bold text-xs tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all inline-flex items-center space-x-2 shadow-md"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Publish Leaders to Public Site</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: SITE SETTINGS */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* General settings */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Customize Public Portal Identity</h2>
                      <p className="text-xs text-gray-500">Edit hero banners, mission statements, and marquee announcements without editing codebase.</p>
                    </div>

                    <form onSubmit={handleSaveAppearance} className="space-y-4 text-xs font-sans">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Public Hero Display Heading</label>
                        <input
                          type="text"
                          required
                          value={appForm.heroTitle}
                          onChange={(e) => setAppForm({ ...appForm, heroTitle: e.target.value })}
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Public Hero Display Subheading</label>
                        <textarea
                          required
                          rows={2}
                          value={appForm.heroSubtitle}
                          onChange={(e) => setAppForm({ ...appForm, heroSubtitle: e.target.value })}
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Hero Banner Background Image URL</label>
                        <input
                          type="text"
                          required
                          value={appForm.heroBannerUrl}
                          onChange={(e) => setAppForm({ ...appForm, heroBannerUrl: e.target.value })}
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none"
                        />
                        <div className="mt-2 flex items-center space-x-3">
                          <label className="flex items-center space-x-2 px-3 py-1.5 bg-[#0A1F44] hover:bg-[#C9A227] text-white hover:text-[#0A1F44] font-bold rounded-none text-[10px] tracking-wide cursor-pointer transition-all">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload from Gallery</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImageFile(file, 1600, 1600, 0.85);
                                    setAppForm(prev => ({ ...prev, heroBannerUrl: compressed }));
                                  } catch (err) {
                                    alert("Could not process image file. Please try another file.");
                                  }
                                }
                              }}
                            />
                          </label>
                          {appForm.heroBannerUrl && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Image Ready!</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* COMPUTED & SYNCHRONIZED IMAGE SETTINGS PANEL */}
                      <div className="p-4 bg-[#0A1F44] text-white border-2 border-[#C9A227] space-y-4 my-4">
                        <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-2">
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-[#C9A227]" />
                            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-white">
                              Synchronized & Computed Image Settings
                            </h3>
                          </div>
                          <span className="text-[9px] bg-[#C9A227]/20 text-[#C9A227] px-2 py-0.5 font-mono font-bold uppercase border border-[#C9A227]/40">
                            Real-time Engine
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {/* Control 1: Hero Canvas Height */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                              Hero Canvas Height: <span className="text-[#C9A227] font-mono">{appForm.heroImageHeight}px</span>
                            </label>
                            <input
                              type="range"
                              min="300"
                              max="650"
                              step="10"
                              value={appForm.heroImageHeight}
                              onChange={(e) => setAppForm({ ...appForm, heroImageHeight: Number(e.target.value) })}
                              className="w-full accent-[#C9A227] cursor-pointer"
                            />
                          </div>

                          {/* Control 2: Overlay Darkness Opacity */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                              Gradient Darkness: <span className="text-[#C9A227] font-mono">{Math.round(appForm.imageOverlayOpacity * 100)}%</span>
                            </label>
                            <input
                              type="range"
                              min="0.50"
                              max="0.98"
                              step="0.02"
                              value={appForm.imageOverlayOpacity}
                              onChange={(e) => setAppForm({ ...appForm, imageOverlayOpacity: Number(e.target.value) })}
                              className="w-full accent-[#C9A227] cursor-pointer"
                            />
                          </div>

                          {/* Control 3: Object Fit Mode */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">Object Fit Mode</label>
                            <select
                              value={appForm.imageObjectFit}
                              onChange={(e) => setAppForm({ ...appForm, imageObjectFit: e.target.value })}
                              className="w-full bg-[#0D2B4E] border border-gray-600 px-2 py-1.5 text-white font-sans focus:outline-none"
                            >
                              <option value="cover">Cover (Fills & Crops Centered)</option>
                              <option value="contain">Contain (Preserves Entire Image)</option>
                              <option value="fill">Fill (Stretches to Canvas)</option>
                            </select>
                          </div>

                          {/* Control 4: Filter Tone Style */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">Image Filter Tone</label>
                            <select
                              value={appForm.imageFilterStyle}
                              onChange={(e) => setAppForm({ ...appForm, imageFilterStyle: e.target.value })}
                              className="w-full bg-[#0D2B4E] border border-gray-600 px-2 py-1.5 text-white font-sans focus:outline-none"
                            >
                              <option value="none">Crisp Natural (Default)</option>
                              <option value="sepia">Academic Vintage (Warm Sepia)</option>
                              <option value="grayscale">Regal Dark Monochrome</option>
                              <option value="contrast">High Contrast Academic</option>
                              <option value="vintage">Classic Archives Tone</option>
                            </select>
                          </div>

                          {/* Control 5: Border Styling */}
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">Corner Frame Styling</label>
                            <select
                              value={appForm.imageBorderRadius}
                              onChange={(e) => setAppForm({ ...appForm, imageBorderRadius: e.target.value })}
                              className="w-full bg-[#0D2B4E] border border-gray-600 px-2 py-1.5 text-white font-sans focus:outline-none"
                            >
                              <option value="none">Sharp Architectural (none)</option>
                              <option value="rounded-md">Soft Rounded (rounded-md)</option>
                              <option value="rounded-xl">Substantial Rounded (rounded-xl)</option>
                              <option value="rounded-full">Circular Pill Frame (rounded-full)</option>
                            </select>
                          </div>

                          {/* Control 6: Auto-Optimize Toggle */}
                          <div className="flex items-center space-x-2 pt-3">
                            <input
                              type="checkbox"
                              id="autoOptToggle"
                              checked={appForm.autoOptimizeImages}
                              onChange={(e) => setAppForm({ ...appForm, autoOptimizeImages: e.target.checked })}
                              className="accent-[#C9A227] h-4 w-4 cursor-pointer"
                            />
                            <label htmlFor="autoOptToggle" className="text-[11px] text-slate-200 font-bold cursor-pointer">
                              Enable Automated Byte Payload Optimization & Computing
                            </label>
                          </div>
                        </div>

                        {/* COMPUTED METRICS INSPECTOR BOX */}
                        <div className="bg-[#0D2B4E] p-3 border border-[#C9A227]/40 space-y-2 text-[10px] font-mono">
                          <span className="text-[#C9A227] font-bold uppercase block">⚡ Live Computed Image Metrics:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                            <div>Ratio: <span className="text-white font-bold">{appForm.heroImageHeight > 500 ? '21:9' : appForm.heroImageHeight < 360 ? '4:3' : '16:9'}</span></div>
                            <div>Overlay: <span className="text-white font-bold">{appForm.imageOverlayOpacity}</span></div>
                            <div>Filter: <span className="text-white font-bold">{appForm.imageFilterStyle}</span></div>
                            <div>Payload Len: <span className="text-white font-bold">{appForm.heroBannerUrl ? appForm.heroBannerUrl.length : 0} chars</span></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Bulletin Announcements (One item per line)</label>
                        <textarea
                          rows={3}
                          value={appForm.announcementsString}
                          onChange={(e) => setAppForm({ ...appForm, announcementsString: e.target.value })}
                          placeholder="Announcements scrolling marquee updates..."
                          className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none font-mono text-[10px]"
                        />
                      </div>

                      <div className="space-y-3 p-4 bg-[#F5F1E8] border border-gray-300">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-gray-700 uppercase text-xs">
                            Gallery Collage Photos & Uploads
                          </label>
                          <label className="px-3 py-1 bg-[#0A1F44] hover:bg-[#C9A227] text-white hover:text-[#0A1F44] font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all inline-flex items-center space-x-1 shadow-sm">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload New Photo to Gallery</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImageFile(file, 1200, 1200, 0.85);
                                    const currentList = appForm.galleryString.split('\n').map(g => g.trim()).filter(Boolean);
                                    const updated = [...currentList, compressed].join('\n');
                                    setAppForm(prev => ({ ...prev, galleryString: updated }));
                                    triggerFeedback('New photo uploaded to gallery list! Click "Synchronize Settings" to make live.');
                                  } catch (err) {
                                    alert("Could not process gallery image.");
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Gallery Thumbnails Grid */}
                        {appForm.galleryString.split('\n').map(g => g.trim()).filter(Boolean).length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2 border-t border-gray-300">
                            {appForm.galleryString.split('\n').map(g => g.trim()).filter(Boolean).map((url, idx) => (
                              <div key={idx} className="relative group h-20 bg-gray-200 border border-gray-400 overflow-hidden shadow-sm">
                                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = appForm.galleryString.split('\n').map(g => g.trim()).filter(Boolean);
                                    list.splice(idx, 1);
                                    setAppForm(prev => ({ ...prev, galleryString: list.join('\n') }));
                                  }}
                                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-none opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                  title="Remove photo"
                                >
                                  <Trash className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2">
                          <label className="block text-[10px] text-gray-500 font-mono mb-1">
                            Gallery URLs list (One URL per line):
                          </label>
                          <textarea
                            rows={3}
                            value={appForm.galleryString}
                            onChange={(e) => setAppForm({ ...appForm, galleryString: e.target.value })}
                            placeholder="Provide absolute photo image link URLs..."
                            className="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-none font-mono text-[10px]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#0D2B4E] text-white uppercase font-bold tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44]"
                      >
                        Synchronize Settings
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* SECTION 9: LOGO & BRANDING CUSTOMIZATION STUDIO */}
              {activeTab === 'branding' && (
                <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
                  <div className="border-b pb-4 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Upload className="h-5 w-5 text-[#C9A227]" />
                        <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">
                          Official Logo & Visual Branding Studio
                        </h2>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload custom organization logos, set display dimensions, and update brand titles across the top header, portal, and footer.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveBranding}
                      disabled={isSavingBranding}
                      className="px-5 py-2.5 bg-[#0A1F44] text-[#C9A227] border-2 border-[#C9A227] uppercase font-bold text-xs tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all flex items-center justify-center space-x-2 shadow-md shrink-0 disabled:opacity-50"
                    >
                      {isSavingBranding ? (
                        <div className="animate-spin h-4 w-4 border-2 border-[#C9A227] border-t-transparent rounded-full" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>{isSavingBranding ? 'Updating & Publishing...' : 'Update & Publish'}</span>
                    </button>
                  </div>

                  {/* 1. REAL-TIME LIVE PREVIEW PANEL */}
                  <div className="bg-[#0A1F44] text-white p-5 border-2 border-[#C9A227] space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-[#C9A227]" />
                        <span className="font-serif font-bold text-xs uppercase tracking-wider text-amber-200">
                          Live Brand Appearance Preview
                        </span>
                      </div>
                      <span className="text-[9px] bg-[#C9A227]/20 text-[#C9A227] px-2 py-0.5 font-mono font-bold uppercase border border-[#C9A227]/40">
                        Interactive Render
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                      {/* Top Header Mockup */}
                      <div className="bg-[#0D2B4E] p-3 border border-[#C9A227]/40 space-y-2">
                        <span className="text-[10px] text-amber-300 font-mono font-bold uppercase block">
                          Navbar Preview:
                        </span>
                        <div className="bg-[#0A1F44] border-b-2 border-[#C9A227] p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className={`flex items-center justify-center transition-all ${
                              brandingForm.logoStyle === 'transparent'
                                ? 'p-0 bg-transparent border-0'
                                : brandingForm.logoStyle === 'circle'
                                ? 'p-1.5 bg-[#0D2B4E] border border-[#C9A227] rounded-full'
                                : brandingForm.logoStyle === 'rounded'
                                ? 'p-1.5 bg-[#0D2B4E] border border-[#C9A227] rounded-md'
                                : 'p-1.5 bg-[#0D2B4E] border border-[#C9A227]'
                            }`}>
                              {brandingForm.logoUrl ? (
                                <img 
                                  src={brandingForm.logoUrl} 
                                  alt="Logo Preview" 
                                  className="object-contain" 
                                  style={{
                                    height: `${brandingForm.logoHeight || 32}px`,
                                    maxHeight: '48px',
                                    objectFit: brandingForm.logoFit
                                  }}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Compass className="text-[#C9A227]" style={{ height: `${brandingForm.logoHeight || 28}px`, width: `${brandingForm.logoHeight || 28}px` }} />
                              )}
                            </div>
                            <div>
                              <span className="block font-serif text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-none">
                                {brandingForm.logoText || 'UNITHEL ACADEMY'}
                              </span>
                              <span className="block text-[8px] uppercase font-sans tracking-[0.2em] text-amber-400 mt-1 font-bold">
                                {brandingForm.logoSubtext || 'ALUMNI ORGANIZATION'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-1 uppercase font-bold border border-amber-500/40">Nav Links</span>
                        </div>
                      </div>

                      {/* Hero / Badge Mockup */}
                      <div className="bg-[#0D2B4E] p-3 border border-[#C9A227]/40 space-y-2">
                        <span className="text-[10px] text-amber-300 font-mono font-bold uppercase block">
                          Home Hero Display Preview:
                        </span>
                        <div className="bg-[#F5F1E8] text-[#0A1F44] p-4 text-center border border-gray-300 space-y-2">
                          <div className="flex justify-center">
                            <div className={`flex items-center justify-center ${
                              brandingForm.logoStyle === 'transparent'
                                ? 'p-0 bg-transparent border-0'
                                : brandingForm.logoStyle === 'circle'
                                ? 'p-2 bg-[#0D2B4E] border-2 border-[#C9A227] rounded-full'
                                : brandingForm.logoStyle === 'rounded'
                                ? 'p-2 bg-[#0D2B4E] border-2 border-[#C9A227] rounded-xl'
                                : 'p-2 bg-[#0D2B4E] border-2 border-[#C9A227]'
                            }`}>
                              {brandingForm.logoUrl ? (
                                <img 
                                  src={brandingForm.logoUrl} 
                                  alt="Hero Logo Preview" 
                                  className="h-10 w-10 object-contain" 
                                  style={{ objectFit: brandingForm.logoFit }}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Compass className="h-10 w-10 text-[#C9A227]" />
                              )}
                            </div>
                          </div>
                          <span className="inline-block text-[9px] font-bold uppercase bg-[#0A1F44] text-[#C9A227] px-3 py-1 tracking-widest">
                            {brandingForm.logoText} {brandingForm.logoSubtext}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. FORM & FILE UPLOAD CONTROLS */}
                  <form onSubmit={handleSaveBranding} className="space-y-6 text-xs font-sans">
                    
                    {/* Logo Image Upload Box */}
                    <div className="bg-[#F5F1E8] p-5 border border-gray-300 space-y-4">
                      <h3 className="font-serif font-bold text-xs uppercase text-[#0A1F44] tracking-wider border-b border-gray-300 pb-2">
                        📷 Logo Image File & Source Setup
                      </h3>

                      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {/* Logo Thumbnail Preview */}
                        <div className="h-24 w-24 bg-[#0A1F44] border-2 border-[#C9A227] flex items-center justify-center shrink-0 shadow-md relative group overflow-hidden">
                          {brandingForm.logoUrl ? (
                            <img 
                              src={brandingForm.logoUrl} 
                              alt="Current Logo" 
                              className="w-full h-full object-contain p-2" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Compass className="h-12 w-12 text-[#C9A227]" />
                          )}
                          {brandingForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setBrandingForm(prev => ({ ...prev, logoUrl: '' }))}
                              className="absolute inset-0 bg-red-900/80 text-white font-bold text-[10px] uppercase opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              title="Clear Logo"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="space-y-3 w-full">
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="px-4 py-2 bg-[#0A1F44] hover:bg-[#C9A227] text-white hover:text-[#0A1F44] font-bold uppercase text-xs tracking-wider cursor-pointer transition-all inline-flex items-center space-x-2 shadow-sm">
                              <Upload className="h-4 w-4" />
                              <span>Upload New Logo File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImageFile(file, 800, 800, 0.9);
                                      setBrandingForm(prev => ({ ...prev, logoUrl: compressed }));
                                      triggerFeedback("Logo file uploaded & compressed! Click 'Save & Publish' to save changes live.");
                                    } catch (err) {
                                      alert("Could not process logo file. Please try another image.");
                                    }
                                  }
                                }}
                              />
                            </label>

                            {brandingForm.logoUrl && (
                              <button
                                type="button"
                                onClick={() => setBrandingForm(prev => ({ ...prev, logoUrl: '' }))}
                                className="px-3 py-2 bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-700 font-bold uppercase text-xs tracking-wider transition-colors"
                              >
                                Clear Logo Image
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                              Or Paste Direct Image Web URL:
                            </label>
                            <input
                              type="text"
                              value={brandingForm.logoUrl}
                              onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                              placeholder="e.g. https://yourdomain.com/assets/logo.png"
                              className="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Logo Dimensions & Frame Controls */}
                    <div className="bg-[#0A1F44] text-white p-5 border-2 border-[#C9A227] space-y-4">
                      <h3 className="font-serif font-bold text-xs uppercase text-amber-200 tracking-wider border-b border-[#C9A227]/30 pb-2">
                        📐 Logo Display Dimensions & Framing Options
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Height slider */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                            Navbar Logo Height: <span className="text-[#C9A227] font-mono">{brandingForm.logoHeight}px</span>
                          </label>
                          <input
                            type="range"
                            min="20"
                            max="56"
                            step="2"
                            value={brandingForm.logoHeight}
                            onChange={(e) => setBrandingForm({ ...brandingForm, logoHeight: Number(e.target.value) })}
                            className="w-full accent-[#C9A227] cursor-pointer"
                          />
                        </div>

                        {/* Framing Style */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                            Logo Container Frame
                          </label>
                          <select
                            value={brandingForm.logoStyle}
                            onChange={(e) => setBrandingForm({ ...brandingForm, logoStyle: e.target.value as any })}
                            className="w-full bg-[#0D2B4E] border border-gray-600 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A227]"
                          >
                            <option value="framed">Navy Box + Gold Border (Default)</option>
                            <option value="transparent">Transparent Clean (No Frame Box)</option>
                            <option value="rounded">Soft Rounded Frame</option>
                            <option value="circle">Circular Shield Badge</option>
                          </select>
                        </div>

                        {/* Fit Mode */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                            Image Object Fit
                          </label>
                          <select
                            value={brandingForm.logoFit}
                            onChange={(e) => setBrandingForm({ ...brandingForm, logoFit: e.target.value as any })}
                            className="w-full bg-[#0D2B4E] border border-gray-600 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A227]"
                          >
                            <option value="contain">Contain (Preserves Full Logo)</option>
                            <option value="cover">Cover (Fills Entire Frame Box)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Brand Titles & Typography */}
                    <div className="bg-[#F5F1E8] p-5 border border-gray-300 space-y-4">
                      <h3 className="font-serif font-bold text-xs uppercase text-[#0A1F44] tracking-wider border-b border-gray-300 pb-2">
                        ✍️ Brand Typography & Name Titles
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">
                            Primary Organization Brand Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={brandingForm.logoText}
                            onChange={(e) => setBrandingForm({ ...brandingForm, logoText: e.target.value })}
                            placeholder="e.g. UNITHEL ACADEMY"
                            className="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] font-serif font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 uppercase mb-1">
                            Subtext / Tagline Under Brand Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={brandingForm.logoSubtext}
                            onChange={(e) => setBrandingForm({ ...brandingForm, logoSubtext: e.target.value })}
                            placeholder="e.g. ALUMNI ORGANIZATION"
                            className="w-full bg-white border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-right">
                      <button
                        type="submit"
                        disabled={isSavingBranding}
                        className="px-6 py-3 bg-[#0A1F44] text-[#C9A227] border-2 border-[#C9A227] uppercase font-bold text-xs tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-all inline-flex items-center space-x-2 shadow-md disabled:opacity-50"
                      >
                        {isSavingBranding ? (
                          <div className="animate-spin h-4 w-4 border-2 border-[#C9A227] border-t-transparent rounded-full" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span>{isSavingBranding ? 'Updating & Publishing...' : 'Update & Publish'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECTION 10: DATABASE / DIAGNOSTICS */}
              {activeTab === 'database' && (
                <div className="space-y-6">
                  {/* DB diagnostics log */}
                  <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-gray-100">
                      <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">Database Telemetry & Synchronization</h2>
                      <p className="text-xs text-gray-500">View connection pools, table schemas, and execute raw sync operations.</p>
                    </div>

                    <div className="bg-[#0A1F44] text-amber-300 p-4 font-mono text-xs rounded-none space-y-2 border-l-4 border-[#C9A227]">
                      <div>&gt; SHOW DATABASE STATUS;</div>
                      <div className="text-white">Active Connection: {isPostgres ? 'Neon cloud PostgreSQL (POOL CONNECTED)' : 'Local JSON Fallback File (flatfile)'}</div>
                      <div className="text-white">Active Connection String Node: {isPostgres ? 'postgres://********@ep-cool-snowflake-a5o0fclv-pooler.europe-west1.neon.tech/neondb' : 'SQLite flatfile (/database.json)'}</div>
                      <div>&gt; SHOW TABLES STATUS;</div>
                      <div className="grid grid-cols-2 gap-2 text-white max-w-sm pt-1">
                        <div>members: {members.length} rows</div>
                        <div>blogs: {blogs.length} rows</div>
                        <div>news bulletins: {news.length} rows</div>
                        <div>events catalog: {events.length} rows</div>
                        <div>discussions thread: {discussions.length} rows</div>
                        <div>ballots roster: {ballots.length} rows</div>
                        <div>dues transactions: {dues.length} rows</div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-4 border-t border-gray-100 mt-4">
                      {/* Flush Demo Data Box */}
                      <div className="p-4 bg-red-50 border-2 border-red-200 space-y-3">
                        <div className="flex items-center space-x-2 text-red-900">
                          <Trash className="h-4 w-4 text-red-700" />
                          <h4 className="font-serif font-bold text-xs uppercase tracking-wider">Flush Demo Data (System Reset)</h4>
                        </div>
                        <p className="text-xs text-red-800 leading-relaxed">
                          Permanently remove all placeholder content, sample blog posts, news bulletins, test events, dummy forum threads, and sample member accounts created during development. The primary administrator account will be retained.
                        </p>
                        <button
                          onClick={handleFlushDatabase}
                          className="px-5 py-2.5 bg-red-700 text-white font-bold uppercase tracking-widest hover:bg-red-800 transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer shadow-sm"
                        >
                          <Trash className="h-4 w-4 shrink-0" />
                          <span>Flush Demo Data</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <button
                          onClick={handleDatabaseForceSync}
                          className="px-4 py-2.5 bg-[#0A1F44] text-[#C9A227] font-bold uppercase tracking-widest hover:bg-[#C9A227] hover:text-[#0A1F44] transition-colors flex items-center justify-center space-x-2 text-xs border border-[#C9A227] cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Force Table Synchronization</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>

    </div>
  );
}
