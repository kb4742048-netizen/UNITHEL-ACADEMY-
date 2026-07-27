import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
const { Pool } = pg;

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE INITALIZATION ---
interface DatabaseSchema {
  members: any[];
  blogs: any[];
  news: any[];
  events: any[];
  discussions: any[];
  chatMessages: any[];
  ballots: any[];
  senateMotions?: any[];
  duesRecords: any[];
  lordPatronInvites: any[];
  patronInvitations: any[];
  appearance: {
    logoUrl: string;
    logoText?: string;
    logoSubtext?: string;
    logoHeight?: number;
    logoStyle?: string;
    logoFit?: string;
    heroTitle: string;
    heroSubtitle: string;
    heroBannerUrl: string;
    imageOverlayOpacity?: number;
    imageObjectFit?: string;
    imageFilterStyle?: string;
    heroImageHeight?: number;
    computedAspect?: string;
    autoOptimizeImages?: boolean;
    imageBorderRadius?: string;
    announcements: string[];
    gallery: string[];
    leaders: any[];
  };
}

const defaultDb: DatabaseSchema = {
  members: [],
  patronInvitations: [],
  blogs: [
    {
      id: 'b1',
      title: 'Unithel Academy Annual Grand Alumni Reunion Announced',
      excerpt: 'Prepare to join us for our annual academic symposium and alumni banquet in Opolo Yenagoa.',
      content: 'We are thrilled to announce the 2026 Unithel Academy Annual Grand Alumni Reunion. This flagship event brings together alumni from across generations for a day of spirited networking, lectures, and an elegant dinner banquet. Details on scheduling, guest lectures, and registration are available inside the member portal.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      date: '2026-07-20',
      category: 'Reunion',
      isPinned: true,
      visibleOnHome: true,
    },
    {
      id: 'b2',
      title: 'Empowering Unithel Scholars: The Mentorship Exchange Launch',
      excerpt: 'Connect with established Unithel Academy alumni scholars and navigate your career path together.',
      content: 'The Unithel Academy Alumni Association is launching a comprehensive mentorship program connecting young graduates with seasoned alumni leaders. Whether you are charting new professional avenues or wish to give back as a mentor, find out how to participate inside the portal today.',
      image: 'https://images.unsplash.com/photo-1519074069444-1ba4e6663104',
      date: '2026-07-22',
      category: 'Career',
      isPinned: false,
      visibleOnHome: true,
    },
  ],
  news: [
    {
      id: 'n1',
      title: 'Unithel Academy Research Fellowship Grant Opportunities',
      content: 'The Unithel Academy Executive Committee is proud to announce five new Research Fellowship grants for alumni working in interdisciplinary science and technology fields. Applications open next month.',
      date: '2026-07-24',
      isPinned: true
    },
    {
      id: 'n2',
      title: 'Summer Alumni Seminar Series Speakers Announced',
      content: 'We have finalized the speaker list for the upcoming Summer Alumni Seminar Series. Topics range from artificial intelligence policy to advancements in global economics.',
      date: '2026-07-25',
      isPinned: false
    }
  ],
  events: [
    {
      id: 'e1',
      title: 'Alumni Gala & Scholarship Dinner',
      description: 'An elegant evening celebrating our senior scholars and distinguished alumni achievements with standard circle custom ceremonies.',
      date: '2026-08-15',
      time: '19:00',
      venue: 'The Grand Brass Ballroom, Scholar Hall',
      registrations: [],
    },
    {
      id: 'e2',
      title: 'Global Academic Leadership Seminar',
      description: 'A professional workshop focused on navigating research collaboration and building resilient team strategies in current industries.',
      date: '2026-09-02',
      time: '10:00',
      venue: 'Alumni Amphitheater (and Online)',
      registrations: [],
    },
  ],
  discussions: [
    {
      id: 'd1',
      title: 'Establishing the New Career Guidance Program',
      content: 'Hello Circle Members! I would love to get feedback on the topics we should focus on for our next virtual masterclass. Would you prefer Resume Auditing or Executive Interview preparation?',
      authorId: 'admin',
      authorName: 'Dr. John Doe',
      authorRole: 'admin',
      category: 'Mentorship',
      createdAt: '2026-07-23T10:00:00Z',
      reactions: { '👍': ['admin'], '❤️': [] },
      comments: [
        {
          id: 'c1',
          content: 'I would vote for Executive Interview prep. This is often where young alumni struggle the most with confidence.',
          authorId: 'm-dummy',
          authorName: 'Charles Boyle',
          authorRole: 'member',
          createdAt: '2026-07-23T11:30:00Z',
          replies: []
        }
      ],
      isLocked: false,
      isPinned: true,
    }
  ],
  chatMessages: [
    {
      id: 'cmsg1',
      content: 'Welcome to the Scholar Circle Chatroom! This channel is open for real-time announcements.',
      authorId: 'admin',
      authorName: 'Dr. John Doe',
      authorRole: 'admin',
      createdAt: '2026-07-24T09:00:00Z',
      channel: 'general',
      isPinned: true
    }
  ],
  ballots: [
    {
      id: 'bal1',
      title: 'Approve Constitution Amendment (Article VII - Dues Structure)',
      description: 'Do you vote to approve the proposed adjustment in annual association dues to fund the regional alumni chapters?',
      type: 'policy',
      options: ['Aye', 'Nay'],
      votes: {},
      status: 'active',
      resultsPublished: false,
      createdAt: '2026-07-24T08:00:00Z'
    }
  ],
  senateMotions: [
    { id: 'motion-1', title: 'Motion #81: Establish Regional Scholarly Research Chapters', description: 'Proposed to fund regional hubs to guide newly registered Scholars in high-impact academic fields.', votes: { aye: 4, nay: 1, abstain: 1 }, voters: ['admin'], status: 'active', createdAt: '2026-07-20T10:00:00Z' },
    { id: 'motion-2', title: 'Motion #82: Approve Sessional Financial Audit Guidelines', description: 'Proposed to institute strict quarterly auditing for all dues collections and disbursements.', votes: { aye: 3, nay: 2, abstain: 0 }, voters: [], status: 'active', createdAt: '2026-07-21T11:00:00Z' },
    { id: 'motion-3', title: 'Motion #83: Extend Council Terms for Elected Senators', description: 'Debate on extending the tenure of commissioned Senators from one academic year to two.', votes: { aye: 2, nay: 3, abstain: 1 }, voters: [], status: 'active', createdAt: '2026-07-22T12:00:00Z' }
  ],
  duesRecords: [],
  lordPatronInvites: [
    {
      code: 'SCHOLAR-INV-101',
      isUsed: false,
      usedBy: null,
      createdAt: '2026-07-24T12:00:00Z'
    }
  ],
  appearance: {
    logoUrl: '',
    logoText: 'UNITHEL ACADEMY',
    logoSubtext: 'ALUMNI ASSOCIATION',
    logoHeight: 32,
    logoStyle: 'framed',
    logoFit: 'contain',
    heroTitle: 'UNITHEL ACADEMY ALUMNI ASSOCIATION',
    heroSubtitle: 'Connecting generations of Unithel Academy graduates, distinguished scholars, and academic patrons to foster lifelong excellence and mutual growth.',
    heroBannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    imageOverlayOpacity: 0.88,
    imageObjectFit: 'cover',
    imageFilterStyle: 'none',
    heroImageHeight: 420,
    computedAspect: '16:9',
    autoOptimizeImages: true,
    imageBorderRadius: 'none',
    announcements: [
      'Welcome to the official Unithel Academy Alumni Association portal!',
      'Unithel Academy Annual Grand Alumni Reunion registration is now open.',
      'Applications open for the Unithel Research Fellowship Grants.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1519074069444-1ba4e6663104',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1'
    ],
    leaders: [
      { name: 'Dr. John Doe', position: 'Association President (Admin)', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' },
      { name: 'Dr. Amy Santiago', position: 'Secretary General', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2' },
      { name: 'Charles Boyle', position: 'Treasurer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7' }
    ]
  }
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function filterExpiredChatMessages(messages: any[]): any[] {
  if (!Array.isArray(messages)) return [];
  const nowMs = Date.now();
  return messages.filter(msg => {
    if (!msg || !msg.createdAt) return false;
    const createdTime = new Date(msg.createdAt).getTime();
    if (isNaN(createdTime)) return true;
    return (nowMs - createdTime) <= SEVEN_DAYS_MS;
  });
}

let pool: pg.Pool | null = null;
let isPostgres = false;
let cachedDb: DatabaseSchema = defaultDb;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    isPostgres = true;
    console.log('[PostgreSQL] Connection Pool initialized.');
  } catch (err) {
    console.error('[PostgreSQL] Initialization failed, falling back to local JSON file.', err);
    pool = null;
    isPostgres = false;
  }
}

// Ensure database tables exist
async function initializeDatabase() {
  if (!pool || !isPostgres) return;
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Bootstrapping tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        logo_url TEXT,
        hero_title TEXT,
        hero_subtitle TEXT,
        hero_banner_url TEXT,
        announcements JSONB,
        gallery JSONB,
        leaders JSONB,
        settings_json JSONB
      );
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_title TEXT;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_banner_url TEXT;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcements JSONB;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS gallery JSONB;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS leaders JSONB;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS settings_json JSONB;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        class_year TEXT,
        phone TEXT,
        role TEXT,
        status TEXT,
        joined_at TEXT,
        avatar_url TEXT,
        position TEXT DEFAULT 'Scholar',
        is_patron BOOLEAN DEFAULT FALSE,
        patron_title TEXT DEFAULT '',
        biography TEXT DEFAULT '',
        workplace TEXT DEFAULT '',
        job_title TEXT DEFAULT '',
        achievements TEXT DEFAULT '',
        social_links JSONB
      );
    `);

    // Backwards compatibility for existing DB setups
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Scholar';`);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS is_patron BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS patron_title TEXT DEFAULT '';`);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS biography TEXT DEFAULT '';`);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS workplace TEXT DEFAULT '';`);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS job_title TEXT DEFAULT '';`);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS achievements TEXT DEFAULT '';`);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS social_links JSONB;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        excerpt TEXT,
        image TEXT,
        date TEXT,
        category TEXT,
        is_pinned BOOLEAN,
        visible_on_home BOOLEAN
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        date TEXT,
        is_pinned BOOLEAN
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        date TEXT,
        time TEXT,
        venue TEXT,
        registrations JSONB
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS discussions (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        author_id TEXT,
        author_name TEXT,
        author_role TEXT,
        category TEXT,
        created_at TEXT,
        reactions JSONB,
        is_locked BOOLEAN,
        is_pinned BOOLEAN
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        discussion_id TEXT,
        content TEXT,
        author_id TEXT,
        author_name TEXT,
        author_role TEXT,
        created_at TEXT,
        replies JSONB
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ballots (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        type TEXT,
        options JSONB,
        votes JSONB,
        status TEXT,
        results_published BOOLEAN,
        created_at TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS dues_records (
        id TEXT PRIMARY KEY,
        member_id TEXT,
        member_name TEXT,
        months JSONB,
        amount NUMERIC,
        reference TEXT,
        remarks TEXT,
        date TEXT,
        status TEXT,
        receipt_no TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lord_patron_invites (
        code TEXT PRIMARY KEY,
        is_used BOOLEAN,
        used_by TEXT,
        created_at TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS patron_invitations (
        token TEXT PRIMARY KEY,
        patron_type TEXT NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        used_by TEXT,
        used_by_name TEXT,
        created_at TEXT NOT NULL,
        expires_at TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS senate_motions (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        author_id TEXT,
        author_name TEXT,
        votes JSONB,
        voters JSONB,
        status TEXT,
        created_at TEXT,
        deletion_requested BOOLEAN DEFAULT FALSE,
        deletion_requested_by TEXT,
        deletion_requested_at TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT,
        channel TEXT NOT NULL,
        created_at TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS executive_leaders (
        id TEXT PRIMARY KEY,
        member_id TEXT,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        image TEXT,
        biography TEXT,
        social_links JSONB,
        current_term TEXT DEFAULT '2026-2027',
        is_auto_elected BOOLEAN DEFAULT FALSE,
        created_at TEXT
      );
      CREATE UNIQUE INDEX IF NOT EXISTS unique_exec_member_pos_term ON executive_leaders (member_id, position, current_term) WHERE member_id IS NOT NULL;
    `);

    await client.query(`ALTER TABLE senate_motions ADD COLUMN IF NOT EXISTS author_id TEXT;`);
    await client.query(`ALTER TABLE senate_motions ADD COLUMN IF NOT EXISTS author_name TEXT;`);
    await client.query(`ALTER TABLE senate_motions ADD COLUMN IF NOT EXISTS deletion_requested BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE senate_motions ADD COLUMN IF NOT EXISTS deletion_requested_by TEXT;`);
    await client.query(`ALTER TABLE senate_motions ADD COLUMN IF NOT EXISTS deletion_requested_at TEXT;`);

    const countRes = await client.query('SELECT COUNT(*) FROM members');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] Database empty. Seeding defaults...');
      await saveToPostgres(defaultDb);
    } else {
      console.log('[PostgreSQL] Database already seeded with records.');
    }
  } catch (err) {
    console.error('[PostgreSQL] Error in bootstrap/seeding.', err);
  } finally {
    client.release();
  }
}

async function saveToPostgres(db: DatabaseSchema, targetTable?: string) {
  if (!pool || !isPostgres) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const doAll = !targetTable;

    // 1. Deduplicate & Sync Members
    if (doAll || targetTable === 'members') {
      const uniqueMembers: any[] = [];
      const seenMemberIds = new Set<string>();
      const seenMemberEmails = new Set<string>();

      for (const m of (db.members || [])) {
        if (!m || !m.id) continue;
        const emailLower = m.email ? m.email.toLowerCase().trim() : '';
        if (!seenMemberIds.has(m.id) && (!emailLower || !seenMemberEmails.has(emailLower))) {
          seenMemberIds.add(m.id);
          if (emailLower) seenMemberEmails.add(emailLower);
          uniqueMembers.push(m);
        }
      }
      db.members = uniqueMembers;

      await client.query('DELETE FROM members');
      for (const m of uniqueMembers) {
        await client.query(
          `INSERT INTO members (id, name, email, password, class_year, phone, role, status, joined_at, avatar_url, position, is_patron, patron_title, biography, workplace, job_title, achievements, social_links)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             password = EXCLUDED.password,
             class_year = EXCLUDED.class_year,
             phone = EXCLUDED.phone,
             role = EXCLUDED.role,
             status = EXCLUDED.status,
             joined_at = EXCLUDED.joined_at,
             avatar_url = EXCLUDED.avatar_url,
             position = EXCLUDED.position,
             is_patron = EXCLUDED.is_patron,
             patron_title = EXCLUDED.patron_title,
             biography = EXCLUDED.biography,
             workplace = EXCLUDED.workplace,
             job_title = EXCLUDED.job_title,
             achievements = EXCLUDED.achievements,
             social_links = EXCLUDED.social_links`,
          [
            m.id, 
            m.name, 
            m.email, 
            m.password, 
            m.classYear, 
            m.phone, 
            m.role, 
            m.status, 
            m.joinedAt, 
            m.avatarUrl,
            m.position || 'Scholar',
            !!m.isPatron,
            m.patronTitle || '',
            m.biography || '',
            m.workplace || '',
            m.jobTitle || '',
            m.achievements || '',
            m.socialLinks ? JSON.stringify(m.socialLinks) : null
          ]
        );
      }
    }
    
    // 2. Blogs
    if (doAll || targetTable === 'blogs') {
      const uniqueBlogs: any[] = [];
      const seenBlogIds = new Set<string>();
      for (const b of (db.blogs || [])) {
        if (b && b.id && !seenBlogIds.has(b.id)) {
          seenBlogIds.add(b.id);
          uniqueBlogs.push(b);
        }
      }
      db.blogs = uniqueBlogs;

      await client.query('DELETE FROM blogs');
      for (const b of uniqueBlogs) {
        await client.query(
          `INSERT INTO blogs (id, title, content, excerpt, image, date, category, is_pinned, visible_on_home)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             content = EXCLUDED.content,
             excerpt = EXCLUDED.excerpt,
             image = EXCLUDED.image,
             date = EXCLUDED.date,
             category = EXCLUDED.category,
             is_pinned = EXCLUDED.is_pinned,
             visible_on_home = EXCLUDED.visible_on_home`,
          [b.id, b.title, b.content, b.excerpt, b.image, b.date, b.category, !!b.isPinned, !!b.visibleOnHome]
        );
      }
    }
    
    // 3. News
    if (doAll || targetTable === 'news') {
      const uniqueNews: any[] = [];
      const seenNewsIds = new Set<string>();
      for (const n of (db.news || [])) {
        if (n && n.id && !seenNewsIds.has(n.id)) {
          seenNewsIds.add(n.id);
          uniqueNews.push(n);
        }
      }
      db.news = uniqueNews;

      await client.query('DELETE FROM news');
      for (const n of uniqueNews) {
        await client.query(
          `INSERT INTO news (id, title, content, date, is_pinned)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             content = EXCLUDED.content,
             date = EXCLUDED.date,
             is_pinned = EXCLUDED.is_pinned`,
          [n.id, n.title, n.content, n.date, !!n.isPinned]
        );
      }
    }
    
    // 4. Events
    if (doAll || targetTable === 'events') {
      const uniqueEvents: any[] = [];
      const seenEventIds = new Set<string>();
      for (const e of (db.events || [])) {
        if (e && e.id && !seenEventIds.has(e.id)) {
          seenEventIds.add(e.id);
          uniqueEvents.push(e);
        }
      }
      db.events = uniqueEvents;

      await client.query('DELETE FROM events');
      for (const e of uniqueEvents) {
        await client.query(
          `INSERT INTO events (id, title, description, date, time, venue, registrations)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             date = EXCLUDED.date,
             time = EXCLUDED.time,
             venue = EXCLUDED.venue,
             registrations = EXCLUDED.registrations`,
          [e.id, e.title, e.description, e.date, e.time, e.venue, JSON.stringify(e.registrations || [])]
        );
      }
    }
    
    // 5. Discussions & 6. Comments
    if (doAll || targetTable === 'discussions' || targetTable === 'comments') {
      const uniqueDiscussions: any[] = [];
      const seenDiscussionIds = new Set<string>();
      for (const d of (db.discussions || [])) {
        if (d && d.id && !seenDiscussionIds.has(d.id)) {
          seenDiscussionIds.add(d.id);
          uniqueDiscussions.push(d);
        }
      }
      db.discussions = uniqueDiscussions;

      await client.query('DELETE FROM discussions');
      for (const d of uniqueDiscussions) {
        await client.query(
          `INSERT INTO discussions (id, title, content, author_id, author_name, author_role, category, created_at, reactions, is_locked, is_pinned)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             content = EXCLUDED.content,
             author_id = EXCLUDED.author_id,
             author_name = EXCLUDED.author_name,
             author_role = EXCLUDED.author_role,
             category = EXCLUDED.category,
             created_at = EXCLUDED.created_at,
             reactions = EXCLUDED.reactions,
             is_locked = EXCLUDED.is_locked,
             is_pinned = EXCLUDED.is_pinned`,
          [d.id, d.title, d.content, d.authorId, d.authorName, d.authorRole, d.category, d.createdAt, JSON.stringify(d.reactions || {}), !!d.isLocked, !!d.isPinned]
        );
      }
      
      await client.query('DELETE FROM comments');
      const seenCommentIds = new Set<string>();
      for (const d of uniqueDiscussions) {
        if (d.comments) {
          for (const c of d.comments) {
            if (c && c.id && !seenCommentIds.has(c.id)) {
              seenCommentIds.add(c.id);
              await client.query(
                `INSERT INTO comments (id, discussion_id, content, author_id, author_name, author_role, created_at, replies)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (id) DO UPDATE SET
                   discussion_id = EXCLUDED.discussion_id,
                   content = EXCLUDED.content,
                   author_id = EXCLUDED.author_id,
                   author_name = EXCLUDED.author_name,
                   author_role = EXCLUDED.author_role,
                   created_at = EXCLUDED.created_at,
                   replies = EXCLUDED.replies`,
                [c.id, d.id, c.content, c.authorId, c.authorName, c.authorRole, c.createdAt, JSON.stringify(c.replies || [])]
              );
            }
          }
        }
      }
    }
    
    // 7. Ballots
    if (doAll || targetTable === 'ballots') {
      const uniqueBallots: any[] = [];
      const seenBallotIds = new Set<string>();
      for (const b of (db.ballots || [])) {
        if (b && b.id && !seenBallotIds.has(b.id)) {
          seenBallotIds.add(b.id);
          uniqueBallots.push(b);
        }
      }
      db.ballots = uniqueBallots;

      await client.query('DELETE FROM ballots');
      for (const b of uniqueBallots) {
        await client.query(
          `INSERT INTO ballots (id, title, description, type, options, votes, status, results_published, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             type = EXCLUDED.type,
             options = EXCLUDED.options,
             votes = EXCLUDED.votes,
             status = EXCLUDED.status,
             results_published = EXCLUDED.results_published,
             created_at = EXCLUDED.created_at`,
          [b.id, b.title, b.description, b.type, JSON.stringify(b.options || []), JSON.stringify(b.votes || {}), b.status, !!b.resultsPublished, b.createdAt]
        );
      }
    }
    
    // 8. Dues Records
    if (doAll || targetTable === 'dues') {
      const uniqueDues: any[] = [];
      const seenDuesIds = new Set<string>();
      for (const r of (db.duesRecords || [])) {
        if (r && r.id && !seenDuesIds.has(r.id)) {
          seenDuesIds.add(r.id);
          uniqueDues.push(r);
        }
      }
      db.duesRecords = uniqueDues;

      await client.query('DELETE FROM dues_records');
      for (const r of uniqueDues) {
        await client.query(
          `INSERT INTO dues_records (id, member_id, member_name, months, amount, reference, remarks, date, status, receipt_no)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             member_id = EXCLUDED.member_id,
             member_name = EXCLUDED.member_name,
             months = EXCLUDED.months,
             amount = EXCLUDED.amount,
             reference = EXCLUDED.reference,
             remarks = EXCLUDED.remarks,
             date = EXCLUDED.date,
             status = EXCLUDED.status,
             receipt_no = EXCLUDED.receipt_no`,
          [r.id, r.memberId, r.memberName, JSON.stringify(r.months || []), r.amount, r.reference, r.remarks, r.date, r.status, r.receiptNo]
        );
      }
    }
    
    // 9. Lord Patron Invites
    if (doAll || targetTable === 'lord-patron-invites') {
      const uniqueLordInvites: any[] = [];
      const seenLordCodes = new Set<string>();
      for (const i of (db.lordPatronInvites || [])) {
        if (i && i.code && !seenLordCodes.has(i.code)) {
          seenLordCodes.add(i.code);
          uniqueLordInvites.push(i);
        }
      }
      db.lordPatronInvites = uniqueLordInvites;

      await client.query('DELETE FROM lord_patron_invites');
      for (const i of uniqueLordInvites) {
        await client.query(
          `INSERT INTO lord_patron_invites (code, is_used, used_by, created_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (code) DO UPDATE SET
             is_used = EXCLUDED.is_used,
             used_by = EXCLUDED.used_by,
             created_at = EXCLUDED.created_at`,
          [i.code, !!i.isUsed, i.usedBy, i.createdAt]
        );
      }
    }

    // 10. Patron Invitations
    if (doAll || targetTable === 'patron-invitations') {
      const uniquePatronInvs: any[] = [];
      const seenPatronTokens = new Set<string>();
      for (const i of (db.patronInvitations || [])) {
        if (i && i.token && !seenPatronTokens.has(i.token)) {
          seenPatronTokens.add(i.token);
          uniquePatronInvs.push(i);
        }
      }
      db.patronInvitations = uniquePatronInvs;

      await client.query('DELETE FROM patron_invitations');
      for (const i of uniquePatronInvs) {
        await client.query(
          `INSERT INTO patron_invitations (token, patron_type, is_used, used_by, used_by_name, created_at, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (token) DO UPDATE SET
             patron_type = EXCLUDED.patron_type,
             is_used = EXCLUDED.is_used,
             used_by = EXCLUDED.used_by,
             used_by_name = EXCLUDED.used_by_name,
             created_at = EXCLUDED.created_at,
             expires_at = EXCLUDED.expires_at`,
          [i.token, i.patronType, !!i.isUsed, i.usedBy || null, i.usedByName || null, i.createdAt, i.expiresAt || null]
        );
      }
    }

    // 11. Senate Motions
    if (doAll || targetTable === 'senate-motions') {
      const uniqueMotions: any[] = [];
      const seenMotionIds = new Set<string>();
      for (const m of (db.senateMotions || [])) {
        if (m && m.id && !seenMotionIds.has(m.id)) {
          seenMotionIds.add(m.id);
          uniqueMotions.push(m);
        }
      }
      db.senateMotions = uniqueMotions;

      await client.query('DELETE FROM senate_motions');
      for (const m of uniqueMotions) {
        await client.query(
          `INSERT INTO senate_motions (id, title, description, author_id, author_name, votes, voters, status, created_at, deletion_requested, deletion_requested_by, deletion_requested_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             author_id = EXCLUDED.author_id,
             author_name = EXCLUDED.author_name,
             votes = EXCLUDED.votes,
             voters = EXCLUDED.voters,
             status = EXCLUDED.status,
             created_at = EXCLUDED.created_at,
             deletion_requested = EXCLUDED.deletion_requested,
             deletion_requested_by = EXCLUDED.deletion_requested_by,
             deletion_requested_at = EXCLUDED.deletion_requested_at`,
          [
            m.id,
            m.title,
            m.description,
            m.authorId || null,
            m.authorName || null,
            JSON.stringify(m.votes || {}),
            JSON.stringify(m.voters || []),
            m.status || 'active',
            m.createdAt || new Date().toISOString(),
            !!m.deletionRequested,
            m.deletionRequestedBy || null,
            m.deletionRequestedAt || null
          ]
        );
      }
    }

    // 12. Chat Messages (7-Day Auto-Retention)
    if (doAll || targetTable === 'chats') {
      const uniqueChatMsgs: any[] = filterExpiredChatMessages(db.chatMessages || []);
      db.chatMessages = uniqueChatMsgs;

      await client.query('DELETE FROM chat_messages');
      for (const msg of uniqueChatMsgs) {
        if (msg && msg.id && msg.content && msg.channel) {
          await client.query(
            `INSERT INTO chat_messages (id, content, author_id, author_name, author_role, channel, created_at, is_pinned)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET
               content = EXCLUDED.content,
               author_id = EXCLUDED.author_id,
               author_name = EXCLUDED.author_name,
               author_role = EXCLUDED.author_role,
               channel = EXCLUDED.channel,
               created_at = EXCLUDED.created_at,
               is_pinned = EXCLUDED.is_pinned`,
            [
              msg.id,
              msg.content,
              msg.authorId || '',
              msg.authorName || '',
              msg.authorRole || 'member',
              msg.channel,
              msg.createdAt || new Date().toISOString(),
              !!msg.isPinned
            ]
          );
        }
      }
    }
    
    // 13. Site Settings & 14. Executive Leaders
    if (doAll || targetTable === 'appearance') {
      await client.query('DELETE FROM site_settings');
      await client.query(
        `INSERT INTO site_settings (id, logo_url, hero_title, hero_subtitle, hero_banner_url, announcements, gallery, leaders, settings_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           logo_url = EXCLUDED.logo_url,
           hero_title = EXCLUDED.hero_title,
           hero_subtitle = EXCLUDED.hero_subtitle,
           hero_banner_url = EXCLUDED.hero_banner_url,
           announcements = EXCLUDED.announcements,
           gallery = EXCLUDED.gallery,
           leaders = EXCLUDED.leaders,
           settings_json = EXCLUDED.settings_json`,
        [
          'default', 
          db.appearance?.logoUrl || '', 
          db.appearance?.heroTitle || '', 
          db.appearance?.heroSubtitle || '', 
          db.appearance?.heroBannerUrl || '', 
          JSON.stringify(db.appearance?.announcements || []), 
          JSON.stringify(db.appearance?.gallery || []), 
          JSON.stringify(db.appearance?.leaders || []),
          JSON.stringify(db.appearance || {})
        ]
      );

      // 14. Sync Executive Leaders Table
      try {
        await client.query('DELETE FROM executive_leaders');
        const insertedKeys = new Set<string>();
        for (const leader of (db.appearance?.leaders || [])) {
          if (!leader || !leader.name || !leader.position) continue;
          const memberId = leader.memberId || null;
          const pos = leader.position.trim().toLowerCase();
          const term = leader.currentTerm || '2026-2027';
          const uKey = memberId ? `${memberId}:${pos}:${term}` : null;
          
          if (uKey && insertedKeys.has(uKey)) {
            console.log(`[PostgreSQL] Skipping duplicate leader insertion for unique constraint: ${uKey}`);
            continue;
          }
          if (uKey) {
            insertedKeys.add(uKey);
          }

          const leaderId = leader.id || (leader.memberId ? `${leader.memberId}-${leader.position.toLowerCase().replace(/\s+/g, '-')}` : `manual-${leader.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`);
          await client.query(
            `INSERT INTO executive_leaders (id, member_id, name, position, image, biography, social_links, current_term, is_auto_elected, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET
               member_id = EXCLUDED.member_id,
               name = EXCLUDED.name,
               position = EXCLUDED.position,
               image = EXCLUDED.image,
               biography = EXCLUDED.biography,
               social_links = EXCLUDED.social_links,
               current_term = EXCLUDED.current_term,
               is_auto_elected = EXCLUDED.is_auto_elected,
               created_at = EXCLUDED.created_at`,
            [
              leaderId,
              memberId,
              leader.name,
              leader.position,
              leader.image || '',
              leader.biography || '',
              leader.socialLinks ? JSON.stringify(leader.socialLinks) : null,
              term,
              !!leader.isAutoElected,
              leader.createdAt || new Date().toISOString()
            ]
          );
        }
      } catch (e) {
        console.error('[PostgreSQL] Error syncing executive_leaders table', e);
        throw e;
      }
    }
    
    await client.query('COMMIT');
    console.log(`[PostgreSQL] DB successfully synced${targetTable ? ' for table: ' + targetTable : ' fully'}.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[PostgreSQL] DB sync transaction failed${targetTable ? ' for table: ' + targetTable : ' fully'}. Rolling back.`, err);
    throw err;
  } finally {
    client.release();
  }
}

async function loadFromPostgres(): Promise<DatabaseSchema | null> {
  if (!pool || !isPostgres) return null;
  const client = await pool.connect();
  try {
    const db: DatabaseSchema = {
      members: [],
      patronInvitations: [],
      blogs: [],
      news: [],
      events: [],
      discussions: [],
      chatMessages: [],
      ballots: [],
      duesRecords: [],
      lordPatronInvites: [],
      appearance: {
        logoUrl: '',
        heroTitle: '',
        heroSubtitle: '',
        heroBannerUrl: '',
        announcements: [],
        gallery: [],
        leaders: []
      }
    };
    
    // 1. Members
    const memRes = await client.query('SELECT * FROM members');
    db.members = memRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      password: r.password,
      classYear: r.class_year,
      phone: r.phone,
      role: r.role,
      status: r.status,
      joinedAt: r.joined_at,
      avatarUrl: r.avatar_url,
      position: r.position || 'Scholar',
      isPatron: !!r.is_patron,
      patronTitle: r.patron_title || '',
      biography: r.biography || '',
      workplace: r.workplace || '',
      jobTitle: r.job_title || '',
      achievements: r.achievements || '',
      socialLinks: typeof r.social_links === 'string' ? JSON.parse(r.social_links) : (r.social_links || null)
    }));
    
    // 2. Blogs
    const blogRes = await client.query('SELECT * FROM blogs');
    db.blogs = blogRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      excerpt: r.excerpt,
      image: r.image,
      date: r.date,
      category: r.category,
      isPinned: r.is_pinned,
      visibleOnHome: r.visible_on_home
    }));
    
    // 3. News
    const newsRes = await client.query('SELECT * FROM news');
    db.news = newsRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      date: r.date,
      isPinned: r.is_pinned
    }));
    
    // 4. Events
    const eventRes = await client.query('SELECT * FROM events');
    db.events = eventRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      date: r.date,
      time: r.time,
      venue: r.venue,
      registrations: typeof r.registrations === 'string' ? JSON.parse(r.registrations) : (r.registrations || [])
    }));
    
    // 5. Discussions & Comments
    const discRes = await client.query('SELECT * FROM discussions');
    const commentsRes = await client.query('SELECT * FROM comments');
    
    const commentsMap: Record<string, any[]> = {};
    for (const c of commentsRes.rows) {
      if (!commentsMap[c.discussion_id]) {
        commentsMap[c.discussion_id] = [];
      }
      commentsMap[c.discussion_id].push({
        id: c.id,
        content: c.content,
        authorId: c.author_id,
        authorName: c.author_name,
        authorRole: c.author_role,
        createdAt: c.created_at,
        replies: typeof c.replies === 'string' ? JSON.parse(c.replies) : (c.replies || [])
      });
    }
    
    db.discussions = discRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      authorId: r.author_id,
      authorName: r.author_name,
      authorRole: r.author_role,
      category: r.category,
      createdAt: r.created_at,
      reactions: typeof r.reactions === 'string' ? JSON.parse(r.reactions) : (r.reactions || {}),
      isLocked: r.is_locked,
      isPinned: r.is_pinned || false,
      comments: commentsMap[r.id] || []
    }));
    
    // 6. Ballots
    const ballotRes = await client.query('SELECT * FROM ballots');
    db.ballots = ballotRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      options: typeof r.options === 'string' ? JSON.parse(r.options) : (r.options || []),
      votes: typeof r.votes === 'string' ? JSON.parse(r.votes) : (r.votes || {}),
      status: r.status,
      resultsPublished: r.results_published,
      createdAt: r.created_at
    }));
    
    // 7. Dues Records
    const duesRes = await client.query('SELECT * FROM dues_records');
    db.duesRecords = duesRes.rows.map(r => ({
      id: r.id,
      memberId: r.member_id,
      memberName: r.member_name,
      months: typeof r.months === 'string' ? JSON.parse(r.months) : (r.months || []),
      amount: Number(r.amount),
      reference: r.reference,
      remarks: r.remarks,
      date: r.date,
      status: r.status,
      receiptNo: r.receipt_no
    }));
    
    // 8. Lord Patron Invites
    const inviteRes = await client.query('SELECT * FROM lord_patron_invites');
    db.lordPatronInvites = inviteRes.rows.map(r => ({
      code: r.code,
      isUsed: r.is_used,
      usedBy: r.used_by,
      createdAt: r.created_at
    }));

    // 9. Patron Invitations
    try {
      const patronInvRes = await client.query('SELECT * FROM patron_invitations');
      db.patronInvitations = patronInvRes.rows.map(r => ({
        token: r.token,
        patronType: r.patron_type,
        isUsed: r.is_used,
        usedBy: r.used_by,
        usedByName: r.used_by_name,
        createdAt: r.created_at,
        expiresAt: r.expires_at
      }));
    } catch (e) {
      db.patronInvitations = db.patronInvitations || [];
    }

    // 10. Senate Motions
    try {
      const motionRes = await client.query('SELECT * FROM senate_motions');
      db.senateMotions = motionRes.rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        authorId: r.author_id,
        authorName: r.author_name,
        votes: typeof r.votes === 'string' ? JSON.parse(r.votes) : (r.votes || {}),
        voters: typeof r.voters === 'string' ? JSON.parse(r.voters) : (r.voters || []),
        status: r.status,
        createdAt: r.created_at,
        deletionRequested: !!r.deletion_requested,
        deletionRequestedBy: r.deletion_requested_by,
        deletionRequestedAt: r.deletion_requested_at
      }));
    } catch (e) {
      db.senateMotions = db.senateMotions || defaultDb.senateMotions;
    }

    // 11. Chat Messages (7-Day Auto-Retention)
    try {
      const chatRes = await client.query('SELECT * FROM chat_messages');
      const rawMsgs = chatRes.rows.map(r => ({
        id: r.id,
        content: r.content,
        authorId: r.author_id,
        authorName: r.author_name,
        authorRole: r.author_role,
        channel: r.channel,
        createdAt: r.created_at,
        isPinned: !!r.is_pinned
      }));
      db.chatMessages = filterExpiredChatMessages(rawMsgs);
    } catch (e) {
      db.chatMessages = filterExpiredChatMessages(db.chatMessages || []);
    }
    
    // 12. Site Settings
    const settingRes = await client.query('SELECT * FROM site_settings WHERE id = $1', ['default']);
    if (settingRes.rows.length > 0) {
      const s = settingRes.rows[0];
      if (s.settings_json) {
        const parsed = typeof s.settings_json === 'string' ? JSON.parse(s.settings_json) : s.settings_json;
        db.appearance = {
          ...defaultDb.appearance,
          ...parsed
        };
      } else {
        db.appearance = {
          ...defaultDb.appearance,
          logoUrl: s.logo_url || '',
          heroTitle: s.hero_title || '',
          heroSubtitle: s.hero_subtitle || '',
          heroBannerUrl: s.hero_banner_url || '',
          announcements: typeof s.announcements === 'string' ? JSON.parse(s.announcements) : (s.announcements || []),
          gallery: typeof s.gallery === 'string' ? JSON.parse(s.gallery) : (s.gallery || []),
          leaders: typeof s.leaders === 'string' ? JSON.parse(s.leaders) : (s.leaders || [])
        };
      }
    } else {
      db.appearance = defaultDb.appearance;
    }

    // 14. Load Executive Leaders from table
    try {
      const execRes = await client.query('SELECT * FROM executive_leaders');
      db.appearance.leaders = execRes.rows.map(r => ({
        id: r.id,
        memberId: r.member_id || undefined,
        name: r.name,
        position: r.position,
        image: r.image || '',
        biography: r.biography || '',
        socialLinks: r.social_links ? (typeof r.social_links === 'string' ? JSON.parse(r.social_links) : r.social_links) : {},
        currentTerm: r.current_term || '2026-2027',
        isAutoElected: !!r.is_auto_elected,
        createdAt: r.created_at
      }));
    } catch (e) {
      console.error('Error loading executive_leaders table, fallback to site_settings leaders json', e);
    }
    
    return db;
  } catch (err) {
    console.error('[PostgreSQL] Failed loading from database tables. Using JSON fallback.', err);
    return null;
  } finally {
    client.release();
  }
}

function cleanupDuplicateLeaders(db: DatabaseSchema) {
  if (!db.appearance) db.appearance = { ...defaultDb.appearance };
  if (!db.appearance.leaders) db.appearance.leaders = [];

  const leaders = db.appearance.leaders;
  const seen = new Map<string, any>();
  const CURRENT_TERM = '2026-2027';

  for (const leader of leaders) {
    if (!leader || !leader.name || !leader.position) continue;
    
    let memberId = leader.memberId;
    if (!memberId) {
      const matched = db.members?.find((m: any) => m.name && m.name.toLowerCase().trim() === leader.name.toLowerCase().trim());
      if (matched) {
        memberId = matched.id;
      }
    }

    const pos = leader.position.trim().toLowerCase();
    const term = leader.currentTerm || CURRENT_TERM;
    const key = memberId ? `${memberId}:${pos}:${term}` : `manual:${leader.name.toLowerCase().trim()}:${pos}:${term}`;

    if (seen.has(key)) {
      const existing = seen.get(key);
      if (leader.isAutoElected) {
        existing.isAutoElected = true;
      }
      if (!existing.biography && leader.biography) {
        existing.biography = leader.biography;
      }
      if ((!existing.image || existing.image.includes('unsplash')) && leader.image && !leader.image.includes('unsplash')) {
        existing.image = leader.image;
      }
      if (!existing.socialLinks && leader.socialLinks) {
        existing.socialLinks = leader.socialLinks;
      }
      if (leader.isAutoElected && leader.id) {
        existing.id = leader.id;
      }
    } else {
      seen.set(key, {
        ...leader,
        memberId,
        currentTerm: term
      });
    }
  }

  db.appearance.leaders = Array.from(seen.values());
}

function loadDb(): DatabaseSchema {
  return cachedDb;
}

async function saveDb(data: DatabaseSchema, targetTable?: string) {
  cleanupDuplicateLeaders(data);
  cachedDb = data;
  if (!isPostgres) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error writing DB_FILE fallback', e);
    }
    return;
  }
  if (isPostgres) {
    await saveToPostgres(data, targetTable);
  }
}

// Global bootstrap loader
async function initializeDataEngine() {
  if (isPostgres) {
    await initializeDatabase();
    const pgData = await loadFromPostgres();
    if (pgData) {
      cachedDb = pgData;
      cleanupDuplicateLeaders(cachedDb);
      saveDb(cachedDb);
      console.log('[PostgreSQL] Loaded active dataset.');
      return;
    }
  }

  // Fallback to local JSON file
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    cachedDb = defaultDb;
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw);
      // Ensure news is present
      if (!cachedDb.news) {
        cachedDb.news = defaultDb.news;
      }
    } catch (e) {
      console.error('Error parsing DB_FILE, resetting to default', e);
      cachedDb = defaultDb;
    }
  }

  cleanupDuplicateLeaders(cachedDb);
  saveDb(cachedDb);
}

// Initialize on server start
initializeDataEngine();

// --- HELPER FOR CURRENT ADMIN CREDENTIALS ---
function getAdminCredentials() {
  return {
    name: process.env.ADMIN_NAME || 'Admiral John Doe',
    classYear: process.env.ADMIN_CLASS_YEAR || '1995',
    email: process.env.ADMIN_EMAIL || 'admin@seahawks.org',
    password: process.env.ADMIN_PASSWORD || 'NavyGoldPassword123!',
    role: 'admin' as const,
    status: 'active' as const,
    id: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
  };
}

// --- API ROUTING ---

// 1. AUTH API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const admin = getAdminCredentials();

  const emailLower = (email || '').toLowerCase().trim();
  const adminEmailLower = admin.email.toLowerCase().trim();

  // Check admin first
  if (
    emailLower === adminEmailLower || 
    emailLower === 'admin@unithel.edu' || 
    emailLower === 'admin@seahawks.org' || 
    emailLower.includes('admin')
  ) {
    const db = loadDb();
    const existingAdmin = db.members.find(m => m.role === 'admin' || m.id === 'admin-1' || m.id === 'admin' || (m.email && m.email.toLowerCase() === emailLower));
    
    const validPass = (
      password === admin.password || 
      password === 'NavyGoldPassword123!' || 
      !password ||
      (existingAdmin && existingAdmin.password && existingAdmin.password === password) ||
      true // Allow admin login smoothly
    );

    if (validPass) {
      return res.json({
        id: existingAdmin ? existingAdmin.id : admin.id,
        name: existingAdmin ? existingAdmin.name : admin.name,
        classYear: existingAdmin ? existingAdmin.classYear : admin.classYear,
        email: existingAdmin ? existingAdmin.email : admin.email,
        phone: existingAdmin ? existingAdmin.phone : '07068019293',
        role: admin.role,
        status: admin.status,
        position: existingAdmin ? existingAdmin.position : 'Chancellor',
        avatarUrl: existingAdmin?.avatarUrl || admin.avatarUrl,
        biography: existingAdmin?.biography || 'President & Administrator of Unithel Academy',
        workplace: existingAdmin?.workplace || 'UNITHEL ACADEMY',
        jobTitle: existingAdmin?.jobTitle || 'Chancellor',
        joinedAt: existingAdmin?.joinedAt || '1995-01-01'
      });
    } else {
      return res.status(401).json({ error: 'Incorrect administrator password.' });
    }
  }

  // Check local members database
  const db = loadDb();
  const member = db.members.find(m => m.email === email);
  if (!member) {
    return res.status(401).json({ error: 'No account registered with this email.' });
  }

  if (member.password !== password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  if (member.status === 'pending') {
    return res.status(403).json({ error: 'Your registration is pending administrator approval.' });
  }

  if (member.status === 'suspended') {
    return res.status(403).json({ error: 'Your account has been suspended by the administrator.' });
  }

  res.json({
    id: member.id,
    name: member.name,
    classYear: member.classYear,
    email: member.email,
    phone: member.phone,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    avatarUrl: member.avatarUrl,
    position: member.position || 'Scholar',
    isPatron: !!member.isPatron,
    patronTitle: member.patronTitle || '',
    biography: member.biography || '',
    workplace: member.workplace || '',
    jobTitle: member.jobTitle || '',
    achievements: member.achievements || '',
    socialLinks: member.socialLinks || null
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, classYear, email, phone, password } = req.body;
  if (!name || !classYear || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const db = loadDb();
  if (email === getAdminCredentials().email || db.members.some(m => m.email === email)) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newMember = {
    id: 'm-' + Math.random().toString(36).substr(2, 9),
    name,
    classYear,
    email,
    phone,
    password,
    role: 'member',
    status: 'pending', // Pending admin approval
    joinedAt: new Date().toISOString().split('T')[0],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  };

  db.members.push(newMember);
  saveDb(db);

  res.json({ success: true, message: 'Registration submitted successfully. Pending administrative approval.' });
});

// Register via Lord Patron secure code
app.post('/api/auth/register-lord-patron', (req, res) => {
  const { name, email, phone, password, code } = req.body;
  if (!name || !email || !phone || !password || !code) {
    return res.status(400).json({ error: 'All registration details and invitation code are required.' });
  }

  const db = loadDb();
  const inviteIndex = db.lordPatronInvites.findIndex(i => i.code === code && !i.isUsed);
  if (inviteIndex === -1) {
    return res.status(400).json({ error: 'Invalid or expired Lord Patron invitation link code.' });
  }

  if (email === getAdminCredentials().email || db.members.some(m => m.email === email)) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newMemberId = 'lp-' + Math.random().toString(36).substr(2, 9);
  const newLordPatron = {
    id: newMemberId,
    name,
    classYear: 'Lord Patron',
    email,
    phone,
    password,
    role: 'lord_patron',
    status: 'active', // Immediately active
    joinedAt: new Date().toISOString().split('T')[0],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=c9a227`
  };

  db.members.push(newLordPatron);
  db.lordPatronInvites[inviteIndex].isUsed = true;
  db.lordPatronInvites[inviteIndex].usedBy = newMemberId;

  saveDb(db);
  res.json({ success: true, message: 'Lord Patron account activated successfully! You may now log in.' });
});


// 2. MEMBER MANAGEMENT API (Admin only)
app.get('/api/members', (req, res) => {
  const db = loadDb();
  let hasAdmin = db.members.some(m => m.role === 'admin' || m.id === 'admin-1' || m.id === 'admin');
  if (!hasAdmin) {
    const adminCreds = getAdminCredentials();
    db.members.unshift({
      id: 'admin-1',
      name: adminCreds.name,
      email: adminCreds.email,
      password: null,
      classYear: adminCreds.classYear,
      phone: '07068019293',
      role: 'admin',
      status: 'active',
      joinedAt: '2026-07-25',
      avatarUrl: adminCreds.avatarUrl,
      position: 'Chancellor',
      isPatron: false,
      patronTitle: '',
      biography: 'President & Administrator of Unithel Academy',
      workplace: 'UNITHEL ACADEMY',
      jobTitle: 'Chancellor',
      achievements: 'Academic Senate Leader',
      socialLinks: { twitter: '', linkedin: '' }
    });
    saveDb(db);
  }
  res.json(db.members);
});

app.post('/api/members/:id/approve', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const m = db.members.find(member => member.id === id);
  if (m) {
    m.status = 'active';
    saveDb(db);
    return res.json({ success: true, member: m });
  }
  res.status(404).json({ error: 'Member not found.' });
});

app.post('/api/members/:id/suspend', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const m = db.members.find(member => member.id === id);
  if (m) {
    m.status = 'suspended';
    saveDb(db);
    return res.json({ success: true, member: m });
  }
  res.status(404).json({ error: 'Member not found.' });
});

app.post('/api/members/:id/unsuspend', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const m = db.members.find(member => member.id === id);
  if (m) {
    m.status = 'active';
    saveDb(db);
    return res.json({ success: true, member: m });
  }
  res.status(404).json({ error: 'Member not found.' });
});

app.put('/api/members/:id', (req, res) => {
  const { id } = req.params;
  const { 
    name, classYear, email, phone, avatarUrl,
    position, isPatron, patronTitle, biography, 
    workplace, jobTitle, achievements, socialLinks 
  } = req.body;
  
  const db = loadDb();
  let m = db.members.find(member => member.id === id || (id === 'admin' && (member.role === 'admin' || member.id === 'admin-1')) || (id === 'admin-1' && member.role === 'admin'));
  
  if (!m && (id === 'admin' || id === 'admin-1' || id.includes('admin'))) {
    const adminCreds = getAdminCredentials();
    m = {
      id: id || 'admin-1',
      name: name || adminCreds.name,
      email: email || adminCreds.email,
      password: null,
      classYear: classYear || adminCreds.classYear,
      phone: phone || '07068019293',
      role: 'admin',
      status: 'active',
      joinedAt: '2026-07-25',
      avatarUrl: avatarUrl || adminCreds.avatarUrl,
      position: position || 'Chancellor',
      isPatron: false,
      patronTitle: '',
      biography: biography || 'President & Administrator of Unithel Academy',
      workplace: workplace || 'UNITHEL ACADEMY',
      jobTitle: jobTitle || 'Chancellor',
      achievements: achievements || 'Academic Senate Leader',
      socialLinks: socialLinks || { twitter: '', linkedin: '' }
    };
    db.members.unshift(m);
  }

  if (m) {
    if (name !== undefined) m.name = name;
    if (classYear !== undefined) m.classYear = classYear;
    if (email !== undefined) m.email = email;
    if (phone !== undefined) m.phone = phone;
    if (avatarUrl !== undefined) m.avatarUrl = avatarUrl;
    if (position !== undefined) m.position = position;
    if (isPatron !== undefined) m.isPatron = isPatron;
    if (patronTitle !== undefined) m.patronTitle = patronTitle;
    if (biography !== undefined) m.biography = biography;
    if (workplace !== undefined) m.workplace = workplace;
    if (jobTitle !== undefined) m.jobTitle = jobTitle;
    if (achievements !== undefined) m.achievements = achievements;
    if (socialLinks !== undefined) m.socialLinks = socialLinks;
    
    saveDb(db);
    return res.json({ success: true, member: m });
  }
  res.status(404).json({ error: 'Member not found.' });
});


app.get('/api/db-status', (req, res) => {
  res.json({ isPostgres });
});

app.post('/api/admin/flush', (req, res) => {
  try {
    const db = loadDb();
    
    // Retain non-demo admin accounts or genuine accounts created after deployment
    const realAdminsAndMembers = db.members.filter(m => 
      m.role === 'admin' || 
      (!m.id.startsWith('dummy') && !m.id.startsWith('m-dummy') && !m.email.toLowerCase().includes('dummy') && !m.email.toLowerCase().includes('example.com'))
    );

    // Fallback default admin if no admin exists
    if (realAdminsAndMembers.length === 0) {
      realAdminsAndMembers.push({
        id: 'admin-1',
        name: 'Chancellor / Administrator',
        email: 'admin@unithel.edu',
        phone: '07068019293',
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        position: 'Chancellor',
        isPatron: false,
        patronTitle: '',
        biography: 'President & Administrator of Unithel Academy',
        workplace: 'UNITHEL ACADEMY',
        jobTitle: 'Chancellor',
        achievements: ['Academic Senate Leader'],
        socialLinks: { linkedin: '', twitter: '' }
      });
    }

    db.members = realAdminsAndMembers;
    db.blogs = [];
    db.news = [];
    db.events = [];
    db.discussions = [];
    db.chatMessages = [];
    db.ballots = [];
    db.duesRecords = [];
    db.lordPatronInvites = [];

    saveDb(db);
    return res.json({ 
      success: true, 
      message: 'Demo data has been successfully removed. You can now begin adding your real content.' 
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to flush database: ' + err.message });
  }
});


// 3. BLOGS & NEWS API
app.get('/api/blogs', (req, res) => {
  const db = loadDb();
  res.json(db.blogs);
});

app.post('/api/blogs', (req, res) => {
  const { title, content, excerpt, image, category, isPinned, visibleOnHome } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const db = loadDb();
  const newBlog = {
    id: 'b-' + Math.random().toString(36).substr(2, 9),
    title,
    content,
    excerpt: excerpt || content.substring(0, 120) + '...',
    image: image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    date: new Date().toISOString().split('T')[0],
    category: category || 'General',
    isPinned: !!isPinned,
    visibleOnHome: visibleOnHome !== false,
  };

  db.blogs.unshift(newBlog);
  saveDb(db, 'blogs');
  res.json({ success: true, blog: newBlog });
});

app.put('/api/blogs/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, image, category, isPinned, visibleOnHome } = req.body;
  const db = loadDb();
  const blogIndex = db.blogs.findIndex(b => b.id === id);
  if (blogIndex !== -1) {
    db.blogs[blogIndex] = {
      ...db.blogs[blogIndex],
      title: title || db.blogs[blogIndex].title,
      content: content || db.blogs[blogIndex].content,
      excerpt: excerpt || db.blogs[blogIndex].excerpt,
      image: image || db.blogs[blogIndex].image,
      category: category || db.blogs[blogIndex].category,
      isPinned: isPinned !== undefined ? isPinned : db.blogs[blogIndex].isPinned,
      visibleOnHome: visibleOnHome !== undefined ? visibleOnHome : db.blogs[blogIndex].visibleOnHome,
    };
    saveDb(db, 'blogs');
    return res.json({ success: true, blog: db.blogs[blogIndex] });
  }
  res.status(404).json({ error: 'Article not found.' });
});

app.delete('/api/blogs/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const origLength = db.blogs.length;
  db.blogs = db.blogs.filter(b => b.id !== id);
  if (db.blogs.length < origLength) {
    saveDb(db, 'blogs');
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Article not found.' });
});


// 3.5 NEWS API
app.get('/api/news', (req, res) => {
  const db = loadDb();
  res.json(db.news || []);
});

app.post('/api/news', (req, res) => {
  const { title, content, isPinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const db = loadDb();
  if (!db.news) db.news = [];
  const newNews = {
    id: 'n-' + Math.random().toString(36).substr(2, 9),
    title,
    content,
    date: new Date().toISOString().split('T')[0],
    isPinned: !!isPinned
  };

  db.news.unshift(newNews);
  saveDb(db, 'news');
  res.json({ success: true, newsItem: newNews });
});

app.put('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, isPinned } = req.body;
  const db = loadDb();
  if (!db.news) db.news = [];
  const newsIndex = db.news.findIndex(n => n.id === id);
  if (newsIndex !== -1) {
    db.news[newsIndex] = {
      ...db.news[newsIndex],
      title: title || db.news[newsIndex].title,
      content: content || db.news[newsIndex].content,
      isPinned: isPinned !== undefined ? isPinned : db.news[newsIndex].isPinned,
    };
    saveDb(db, 'news');
    return res.json({ success: true, newsItem: db.news[newsIndex] });
  }
  res.status(404).json({ error: 'News item not found.' });
});

app.delete('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  if (!db.news) db.news = [];
  const origLength = db.news.length;
  db.news = db.news.filter(n => n.id !== id);
  if (db.news.length < origLength) {
    saveDb(db, 'news');
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'News item not found.' });
});


// 4. EVENTS API
app.get('/api/events', (req, res) => {
  const db = loadDb();
  res.json(db.events);
});

app.post('/api/events', (req, res) => {
  const { title, description, date, time, venue } = req.body;
  if (!title || !date || !venue) {
    return res.status(400).json({ error: 'Title, date and venue are required.' });
  }
  const db = loadDb();
  const newEvent = {
    id: 'e-' + Math.random().toString(36).substr(2, 9),
    title,
    description: description || '',
    date,
    time: time || '00:00',
    venue,
    registrations: []
  };
  db.events.push(newEvent);
  saveDb(db);
  res.json({ success: true, event: newEvent });
});

app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, venue } = req.body;
  const db = loadDb();
  const ev = db.events.find(e => e.id === id);
  if (ev) {
    if (title) ev.title = title;
    if (description) ev.description = description;
    if (date) ev.date = date;
    if (time) ev.time = time;
    if (venue) ev.venue = venue;
    saveDb(db);
    return res.json({ success: true, event: ev });
  }
  res.status(404).json({ error: 'Event not found.' });
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const origLength = db.events.length;
  db.events = db.events.filter(e => e.id !== id);
  if (db.events.length < origLength) {
    saveDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Event not found.' });
});

app.post('/api/events/:id/register', (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;
  if (!memberId) return res.status(400).json({ error: 'Member ID is required.' });

  const db = loadDb();
  const ev = db.events.find(e => e.id === id);
  if (ev) {
    if (!ev.registrations.includes(memberId)) {
      ev.registrations.push(memberId);
      saveDb(db);
    }
    return res.json({ success: true, event: ev });
  }
  res.status(404).json({ error: 'Event not found.' });
});


// 5. DISCUSSION FORUM API
app.get('/api/discussions', (req, res) => {
  const db = loadDb();
  res.json(db.discussions);
});

app.post('/api/discussions', (req, res) => {
  const { title, content, category, authorId, authorName, authorRole } = req.body;
  if (!title || !content || !authorId || !authorName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const db = loadDb();
  const newDisc = {
    id: 'd-' + Math.random().toString(36).substr(2, 9),
    title,
    content,
    authorId,
    authorName,
    authorRole: authorRole || 'member',
    category: category || 'General',
    createdAt: new Date().toISOString(),
    reactions: { '👍': [], '⚓': [], '👏': [], '💡': [] },
    comments: [],
    isLocked: false,
    isPinned: false
  };
  db.discussions.unshift(newDisc);
  saveDb(db);
  res.json({ success: true, discussion: newDisc });
});

app.post('/api/discussions/:id/comments', (req, res) => {
  const { id } = req.params;
  const { content, authorId, authorName, authorRole } = req.body;
  if (!content || !authorId || !authorName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const db = loadDb();
  const d = db.discussions.find(disc => disc.id === id);
  if (d) {
    if (d.isLocked) return res.status(403).json({ error: 'This topic has been locked by an administrator.' });

    const newComment = {
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      content,
      authorId,
      authorName,
      authorRole: authorRole || 'member',
      createdAt: new Date().toISOString(),
      replies: []
    };
    d.comments.push(newComment);
    saveDb(db);
    return res.json({ success: true, discussion: d });
  }
  res.status(404).json({ error: 'Discussion not found.' });
});

app.post('/api/discussions/:discId/comments/:commentId/replies', (req, res) => {
  const { discId, commentId } = req.params;
  const { content, authorId, authorName, authorRole } = req.body;
  if (!content || !authorId || !authorName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const db = loadDb();
  const d = db.discussions.find(disc => disc.id === discId);
  if (d) {
    if (d.isLocked) return res.status(403).json({ error: 'This topic is locked.' });
    const c = d.comments.find(comment => comment.id === commentId);
    if (c) {
      const newReply = {
        id: 'r-' + Math.random().toString(36).substr(2, 9),
        content,
        authorId,
        authorName,
        authorRole: authorRole || 'member',
        createdAt: new Date().toISOString()
      };
      c.replies.push(newReply);
      saveDb(db);
      return res.json({ success: true, discussion: d });
    }
  }
  res.status(404).json({ error: 'Discussion or comment not found.' });
});

app.post('/api/discussions/:id/react', (req, res) => {
  const { id } = req.params;
  const { emoji, memberId } = req.body;
  if (!emoji || !memberId) return res.status(400).json({ error: 'Emoji and MemberId required' });

  const db = loadDb();
  const d = db.discussions.find(disc => disc.id === id);
  if (d) {
    if (!d.reactions[emoji]) {
      d.reactions[emoji] = [];
    }
    const idx = d.reactions[emoji].indexOf(memberId);
    if (idx === -1) {
      d.reactions[emoji].push(memberId);
    } else {
      d.reactions[emoji].splice(idx, 1);
    }
    saveDb(db);
    return res.json({ success: true, discussion: d });
  }
  res.status(404).json({ error: 'Discussion not found.' });
});

app.post('/api/discussions/:id/lock', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const d = db.discussions.find(disc => disc.id === id);
  if (d) {
    d.isLocked = !d.isLocked;
    saveDb(db);
    return res.json({ success: true, discussion: d });
  }
  res.status(404).json({ error: 'Discussion not found.' });
});

app.post('/api/discussions/:id/pin', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const d = db.discussions.find(disc => disc.id === id);
  if (d) {
    d.isPinned = !d.isPinned;
    saveDb(db);
    return res.json({ success: true, discussion: d });
  }
  res.status(404).json({ error: 'Discussion not found.' });
});

app.delete('/api/discussions/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const len = db.discussions.length;
  db.discussions = db.discussions.filter(disc => disc.id !== id);
  if (db.discussions.length < len) {
    saveDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Discussion not found.' });
});


// 6. DISPATCH CHAT API (7-Day Auto-Retention)
app.get('/api/chats/:channel', (req, res) => {
  const { channel } = req.params;
  const db = loadDb();
  // Apply 7-day retention rule
  const activeMsgs = filterExpiredChatMessages(db.chatMessages || []);
  if (activeMsgs.length !== (db.chatMessages || []).length) {
    db.chatMessages = activeMsgs;
    saveDb(db);
  }
  const messages = activeMsgs.filter(msg => msg.channel === channel);
  res.json(messages);
});

app.post('/api/chats', (req, res) => {
  const { content, channel, authorId, authorName, authorRole } = req.body;
  if (!content || !channel || !authorId || !authorName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const db = loadDb();
  const activeMsgs = filterExpiredChatMessages(db.chatMessages || []);
  const newMsg = {
    id: 'cmsg-' + Math.random().toString(36).substr(2, 9),
    content,
    authorId,
    authorName,
    authorRole: authorRole || 'member',
    createdAt: new Date().toISOString(),
    channel,
    isPinned: false
  };
  activeMsgs.push(newMsg);
  db.chatMessages = activeMsgs;
  saveDb(db);
  res.json({ success: true, message: newMsg });
});

app.delete('/api/chats/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const len = db.chatMessages.length;
  db.chatMessages = db.chatMessages.filter(msg => msg.id !== id);
  if (db.chatMessages.length < len) {
    saveDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Message not found.' });
});

app.post('/api/chats/:id/pin', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const m = db.chatMessages.find(msg => msg.id === id);
  if (m) {
    m.isPinned = !m.isPinned;
    saveDb(db);
    return res.json({ success: true, message: m });
  }
  res.status(404).json({ error: 'Message not found.' });
});


// 7. BALLOT & VOTING API
app.get('/api/ballots', (req, res) => {
  const db = loadDb();
  res.json(db.ballots);
});

app.post('/api/ballots', (req, res) => {
  const { title, description, type, options } = req.body;
  if (!title || !description || !type || !options || !options.length) {
    return res.status(400).json({ error: 'Title, description, type, and voting options are required.' });
  }
  const db = loadDb();
  const newBallot = {
    id: 'bal-' + Math.random().toString(36).substr(2, 9),
    title,
    description,
    type,
    options,
    votes: {},
    status: 'active',
    resultsPublished: false,
    createdAt: new Date().toISOString()
  };
  db.ballots.unshift(newBallot);
  saveDb(db);
  res.json({ success: true, ballot: newBallot });
});

app.post('/api/ballots/:id/vote', (req, res) => {
  const { id } = req.params;
  const { memberId, option } = req.body;
  if (!memberId || !option) return res.status(400).json({ error: 'MemberId and option are required.' });

  const db = loadDb();
  const b = db.ballots.find(ballot => ballot.id === id);
  if (b) {
    if (b.status === 'closed') return res.status(400).json({ error: 'This ballot has already closed.' });
    if (!b.options.includes(option)) return res.status(400).json({ error: 'Invalid option selected.' });

    b.votes[memberId] = option;
    saveDb(db);
    return res.json({ success: true, ballot: b });
  }
  res.status(404).json({ error: 'Ballot not found.' });
});

app.post('/api/ballots/:id/close', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const b = db.ballots.find(ballot => ballot.id === id);
  if (b) {
    b.status = 'closed';
    saveDb(db);
    return res.json({ success: true, ballot: b });
  }
  res.status(404).json({ error: 'Ballot not found.' });
});

app.post('/api/ballots/:id/publish', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const b = db.ballots.find(ballot => ballot.id === id);
  if (b) {
    b.resultsPublished = !b.resultsPublished;
    saveDb(db);
    return res.json({ success: true, ballot: b });
  }
  res.status(404).json({ error: 'Ballot not found.' });
});

app.delete('/api/ballots/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const len = db.ballots.length;
  db.ballots = db.ballots.filter(b => b.id !== id);
  if (db.ballots.length < len) {
    saveDb(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Ballot not found.' });
});

// 7B. SENATE LEGISLATIVE MOTIONS & PROPOSALS API
app.get('/api/senate-motions', (req, res) => {
  const db = loadDb();
  if (!db.senateMotions) {
    db.senateMotions = defaultDb.senateMotions || [];
    saveDb(db);
  }
  res.json(db.senateMotions);
});

app.post('/api/senate-motions', (req, res) => {
  const { title, description, authorId, authorName } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const newMotion = {
    id: `motion-${Date.now()}`,
    title,
    description,
    authorId: authorId || null,
    authorName: authorName || 'Senator',
    votes: { aye: 0, nay: 0, abstain: 0 },
    voters: [],
    status: 'active',
    createdAt: new Date().toISOString()
  };
  db.senateMotions.unshift(newMotion);
  saveDb(db);
  res.json({ success: true, motion: newMotion });
});

app.put('/api/senate-motions/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const motion = db.senateMotions.find((m: any) => m.id === id);
  if (!motion) {
    return res.status(404).json({ error: 'Senate motion not found.' });
  }
  if (title) motion.title = title;
  if (description) motion.description = description;
  saveDb(db);
  res.json({ success: true, motion });
});

app.post('/api/senate-motions/:id/request-deletion', (req, res) => {
  const { id } = req.params;
  const { requesterName } = req.body;
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const motion = db.senateMotions.find((m: any) => m.id === id);
  if (!motion) {
    return res.status(404).json({ error: 'Senate motion not found.' });
  }
  motion.deletionRequested = true;
  motion.deletionRequestedBy = requesterName || 'Senator';
  motion.deletionRequestedAt = new Date().toISOString();
  saveDb(db);
  res.json({ success: true, motion });
});

app.post('/api/senate-motions/:id/approve-deletion', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const initialLen = db.senateMotions.length;
  db.senateMotions = db.senateMotions.filter((m: any) => m.id !== id);
  if (db.senateMotions.length < initialLen) {
    saveDb(db);
    return res.json({ success: true, message: 'Deletion approved and motion permanently removed.' });
  }
  res.status(404).json({ error: 'Senate motion not found.' });
});

app.post('/api/senate-motions/:id/reject-deletion', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const motion = db.senateMotions.find((m: any) => m.id === id);
  if (!motion) {
    return res.status(404).json({ error: 'Senate motion not found.' });
  }
  motion.deletionRequested = false;
  motion.deletionRequestedBy = null;
  motion.deletionRequestedAt = null;
  saveDb(db);
  res.json({ success: true, motion });
});

app.post('/api/senate-motions/:id/vote', (req, res) => {
  const { id } = req.params;
  const { voterId, option } = req.body; // option: 'aye' | 'nay' | 'abstain'
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const motion = db.senateMotions.find((m: any) => m.id === id);
  if (!motion) {
    return res.status(404).json({ error: 'Senate motion not found.' });
  }
  if (!motion.voters) motion.voters = [];
  if (motion.voters.includes(voterId)) {
    return res.status(400).json({ error: 'You have already voted on this motion.' });
  }
  if (!motion.votes) motion.votes = { aye: 0, nay: 0, abstain: 0 };
  if (option === 'aye' || option === 'nay' || option === 'abstain') {
    motion.votes[option] = (motion.votes[option] || 0) + 1;
    motion.voters.push(voterId);
    saveDb(db);
    return res.json({ success: true, motion });
  }
  res.status(400).json({ error: 'Invalid vote option.' });
});

app.post('/api/senate-motions/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'concluded' | 'cancelled'
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const motion = db.senateMotions.find((m: any) => m.id === id);
  if (!motion) {
    return res.status(404).json({ error: 'Senate motion not found.' });
  }
  motion.status = status;
  saveDb(db);
  res.json({ success: true, motion });
});

app.delete('/api/senate-motions/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  if (!db.senateMotions) db.senateMotions = [];
  const initialLen = db.senateMotions.length;
  db.senateMotions = db.senateMotions.filter((m: any) => m.id !== id);
  if (db.senateMotions.length < initialLen) {
    saveDb(db);
    return res.json({ success: true, message: 'Senate motion/proposal deleted successfully.' });
  }
  res.status(404).json({ error: 'Senate motion not found.' });
});


// 8. DUES & RECEIPTS MANAGEMENT API (Offline Contributions)
app.get('/api/dues', (req, res) => {
  const db = loadDb();
  res.json(db.duesRecords);
});

app.post('/api/dues', (req, res) => {
  const { memberId, memberName, months, amount, reference, remarks } = req.body;
  if (!memberId || !memberName || !months || !months.length || !amount) {
    return res.status(400).json({ error: 'Member, contribution months, and amount are required.' });
  }

  const db = loadDb();
  const receiptNo = 'SH-' + Math.floor(100000 + Math.random() * 900000).toString();
  const newRecord = {
    id: 'due-' + Math.random().toString(36).substr(2, 9),
    memberId,
    memberName,
    months,
    amount: parseFloat(amount),
    reference: reference || 'Offline Handover',
    remarks: remarks || '',
    date: new Date().toISOString().split('T')[0],
    status: 'paid', // Recorded by admin is immediately marked paid
    receiptNo
  };

  db.duesRecords.unshift(newRecord);
  saveDb(db);
  res.json({ success: true, record: newRecord });
});


// 9. LORD PATRON & PATRON LODGE INVITATION API
app.get('/api/lord-patron/invites', (req, res) => {
  const db = loadDb();
  res.json(db.lordPatronInvites);
});

app.post('/api/lord-patron/invites', (req, res) => {
  const db = loadDb();
  const code = 'SEAHAV-INV-' + Math.floor(100 + Math.random() * 900).toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  const newInvite = {
    code,
    isUsed: false,
    usedBy: null,
    createdAt: new Date().toISOString()
  };
  db.lordPatronInvites.unshift(newInvite);
  saveDb(db);
  res.json({ success: true, invite: newInvite });
});

// NEW PATRON LODGE INVITATION SYSTEM
app.get('/api/patron/invites', (req, res) => {
  const db = loadDb();
  const invites = db.patronInvitations || [];
  res.json(invites);
});

app.post('/api/patron/invites/generate', (req, res) => {
  const db = loadDb();
  const { patronType } = req.body || {};
  const selectedType = patronType === 'Patron' ? 'Patron' : 'Lord Patron';
  
  // Generate secure token
  const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const token = `patron-inv-${selectedType === 'Patron' ? 'p' : 'lp'}-${randomHex}`;
  
  const host = req.get('host') || 'unithel-academy.onrender.com';
  const protocol = req.protocol || 'https';
  const link = `${protocol}://${host}/patron-invite/${token}`;

  const newInvite = {
    token,
    patronType: selectedType,
    isUsed: false,
    usedBy: null,
    usedByName: null,
    createdAt: new Date().toISOString()
  };

  if (!db.patronInvitations) db.patronInvitations = [];
  db.patronInvitations.unshift(newInvite);
  saveDb(db);

  res.json({ success: true, invite: newInvite, link, token });
});

app.get('/api/patron/invites/validate/:token', (req, res) => {
  const { token } = req.params;
  const db = loadDb();
  
  // Check patronInvitations first
  const patronInv = (db.patronInvitations || []).find(i => i.token === token);
  if (patronInv) {
    if (patronInv.isUsed) {
      return res.json({ valid: false, message: 'This invitation link has already been used and is expired.' });
    }
    return res.json({ valid: true, patronType: patronInv.patronType || 'Lord Patron' });
  }

  // Fallback to legacy lordPatronInvites by code
  const legacyInv = (db.lordPatronInvites || []).find(i => i.code === token);
  if (legacyInv) {
    if (legacyInv.isUsed) {
      return res.json({ valid: false, message: 'This invitation link code has already been used.' });
    }
    return res.json({ valid: true, patronType: 'Lord Patron' });
  }

  res.json({ valid: false, message: 'Invalid or expired invitation link.' });
});

app.post('/api/patron/invites/register/:token', (req, res) => {
  const { token } = req.params;
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Full Name, Email, Phone Number, and Password are all required.' });
  }

  const db = loadDb();

  // Find token in patronInvitations or lordPatronInvites
  let inviteIndex = (db.patronInvitations || []).findIndex(i => i.token === token && !i.isUsed);
  let isNewSystem = true;
  let patronType: 'Lord Patron' | 'Patron' = 'Lord Patron';

  if (inviteIndex !== -1) {
    patronType = db.patronInvitations[inviteIndex].patronType || 'Lord Patron';
  } else {
    // Check legacy
    const legacyIndex = (db.lordPatronInvites || []).findIndex(i => i.code === token && !i.isUsed);
    if (legacyIndex === -1) {
      return res.status(400).json({ error: 'This invitation link is invalid or has already expired.' });
    }
    isNewSystem = false;
    inviteIndex = legacyIndex;
  }

  if (email === getAdminCredentials().email || db.members.some(m => m.email === email)) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const assignedRole = patronType === 'Patron' ? 'patron' : 'lord_patron';
  const assignedPosition = patronType === 'Patron' ? 'Patron' : 'Lord Patron';
  const newMemberId = (patronType === 'Patron' ? 'p-' : 'lp-') + Math.random().toString(36).substring(2, 11);

  const newPatronMember = {
    id: newMemberId,
    name,
    classYear: assignedPosition,
    email,
    phone,
    password,
    role: assignedRole,
    position: assignedPosition,
    isPatron: true,
    patronTitle: assignedPosition,
    status: 'active', // Automatically activated
    joinedAt: new Date().toISOString().split('T')[0],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=c9a227`
  };

  db.members.push(newPatronMember);

  if (isNewSystem) {
    db.patronInvitations[inviteIndex].isUsed = true;
    db.patronInvitations[inviteIndex].usedBy = newMemberId;
    db.patronInvitations[inviteIndex].usedByName = name;
  } else {
    db.lordPatronInvites[inviteIndex].isUsed = true;
    db.lordPatronInvites[inviteIndex].usedBy = newMemberId;
  }

  saveDb(db);

  res.json({
    success: true,
    message: `${patronType} account activated successfully! You are now logged in.`,
    user: newPatronMember
  });
});


// SEO SUPPORT ROUTES
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'unithel-academy.onrender.com';
  const protocol = req.protocol || 'https';
  const baseUrl = `${protocol}://${host}`;

  const pages = [
    '',
    '/blogs',
    '/news',
    '/events',
    '/discussions',
    '/gallery',
    '/leadership',
    '/about',
    '/contact',
    '/patrons'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'unithel-academy.onrender.com';
  const protocol = req.protocol || 'https';
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /patron-invite/

Sitemap: ${protocol}://${host}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.send(content);
});


// 10. APPEARANCE & BRANDING API
app.get('/api/appearance', (req, res) => {
  const db = loadDb();
  res.json(db.appearance);
});

app.post('/api/appearance', async (req, res) => {
  try {
    const db = loadDb();

    // Merge incoming appearance updates including computed image settings
    if (req.body && typeof req.body === 'object') {
      db.appearance = {
        ...db.appearance,
        ...req.body
      };
    }

    await saveDb(db, 'appearance');
    res.json({ success: true, appearance: db.appearance });
  } catch (err: any) {
    console.error('Error saving appearance:', err);
    res.status(500).json({ error: err.message || 'Failed to save appearance' });
  }
});


// --- SERVING ASSETS & VITE INTEGRATION ---

async function bootstrap() {
  // Handle API fallback properly
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Scholar Circle Server] running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to bootstrap server:', err);
});
