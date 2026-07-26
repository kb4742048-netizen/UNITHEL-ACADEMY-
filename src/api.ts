import { Member, Blog, Event, Discussion, ChatMessage, Ballot, DuesRecord, LordPatronInvite, WebsiteAppearance, News } from './types';

const API_BASE = '';

export async function loginUser(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed.');
  }
  return res.json();
}

export async function registerUser(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed.');
  }
  return res.json();
}

export async function registerLordPatron(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/register-lord-patron`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed.');
  }
  return res.json();
}

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch(`${API_BASE}/api/members`);
  if (!res.ok) throw new Error('Failed to fetch members.');
  return res.json();
}

export async function approveMember(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/members/${id}/approve`, { method: 'POST' });
  return res.json();
}

export async function suspendMember(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/members/${id}/suspend`, { method: 'POST' });
  return res.json();
}

export async function unsuspendMember(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/members/${id}/unsuspend`, { method: 'POST' });
  return res.json();
}

export async function updateMember(id: string, data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchBlogs(): Promise<Blog[]> {
  const res = await fetch(`${API_BASE}/api/blogs`);
  if (!res.ok) throw new Error('Failed to fetch articles.');
  return res.json();
}

export async function createBlog(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateBlog(id: string, data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/blogs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteBlog(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/blogs/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${API_BASE}/api/events`);
  if (!res.ok) throw new Error('Failed to fetch events.');
  return res.json();
}

export async function createEvent(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateEvent(id: string, data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteEvent(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function registerEventAttendance(id: string, memberId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/events/${id}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId })
  });
  return res.json();
}

export async function fetchDiscussions(): Promise<Discussion[]> {
  const res = await fetch(`${API_BASE}/api/discussions`);
  if (!res.ok) throw new Error('Failed to fetch forum discussions.');
  return res.json();
}

export async function createDiscussion(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/discussions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function postComment(discussionId: string, data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/discussions/${discussionId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function postReply(discussionId: string, commentId: string, data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/discussions/${discussionId}/comments/${commentId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function toggleReaction(id: string, emoji: string, memberId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/discussions/${id}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji, memberId })
  });
  return res.json();
}

export async function toggleLockDiscussion(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/discussions/${id}/lock`, { method: 'POST' });
  return res.json();
}

export async function togglePinDiscussion(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/discussions/${id}/pin`, { method: 'POST' });
  return res.json();
}

export async function deleteDiscussion(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/discussions/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchChatMessages(channel: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/api/chats/${channel}`);
  if (!res.ok) throw new Error('Failed to fetch chat messages.');
  return res.json();
}

export async function sendChatMessage(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteChatMessage(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/chats/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function togglePinChatMessage(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/chats/${id}/pin`, { method: 'POST' });
  return res.json();
}

export async function fetchBallots(): Promise<Ballot[]> {
  const res = await fetch(`${API_BASE}/api/ballots`);
  if (!res.ok) throw new Error('Failed to fetch ballots.');
  return res.json();
}

export async function createBallot(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/ballots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function castVote(ballotId: string, memberId: string, option: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/ballots/${ballotId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, option })
  });
  return res.json();
}

export async function closeBallot(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/ballots/${id}/close`, { method: 'POST' });
  return res.json();
}

export async function togglePublishBallotResults(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/ballots/${id}/publish`, { method: 'POST' });
  return res.json();
}

export async function deleteBallot(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/ballots/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchDues(): Promise<DuesRecord[]> {
  const res = await fetch(`${API_BASE}/api/dues`);
  if (!res.ok) throw new Error('Failed to fetch dues records.');
  return res.json();
}

export async function recordDuesPayment(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/dues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchLordPatronInvites(): Promise<LordPatronInvite[]> {
  const res = await fetch(`${API_BASE}/api/lord-patron/invites`);
  if (!res.ok) throw new Error('Failed to fetch Lord Patron invites.');
  return res.json();
}

export async function generateLordPatronInvite(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/lord-patron/invites`, { method: 'POST' });
  return res.json();
}

export async function fetchAppearance(): Promise<WebsiteAppearance> {
  const res = await fetch(`${API_BASE}/api/appearance`);
  if (!res.ok) throw new Error('Failed to fetch visual branding configurations.');
  return res.json();
}

export async function updateAppearance(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/appearance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchNews(): Promise<News[]> {
  const res = await fetch(`${API_BASE}/api/news`);
  if (!res.ok) throw new Error('Failed to fetch news.');
  return res.json();
}

export async function createNews(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteNews(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/news/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchDbStatus(): Promise<{ isPostgres: boolean }> {
  const res = await fetch(`${API_BASE}/api/db-status`);
  if (!res.ok) throw new Error('Failed to fetch DB status.');
  return res.json();
}

export async function flushDatabase(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/flush`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to flush custom dummy data.');
  return res.json();
}

export async function fetchPatronInvites(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/patron/invites`);
  if (!res.ok) throw new Error('Failed to fetch patron invitations.');
  return res.json();
}

export async function generatePatronInvite(patronType: 'Lord Patron' | 'Patron' = 'Lord Patron'): Promise<any> {
  const res = await fetch(`${API_BASE}/api/patron/invites/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patronType })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate invitation link.');
  }
  return res.json();
}

export async function validatePatronInvite(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/patron/invites/validate/${encodeURIComponent(token)}`);
  return res.json();
}

export async function registerPatronViaInvite(token: string, data: { name: string; email: string; phone: string; password: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/api/patron/invites/register/${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration via invitation failed.');
  }
  return res.json();
}
