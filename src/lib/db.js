import path from 'path';
import fs from 'fs';

let sqlite3;
let sqlite;

try {
  sqlite3 = require('sqlite3').verbose();
  sqlite = require('sqlite');
} catch (e) {
  console.warn("SQLITE3 native module not available or failed to load. Falling back to JSON database file.");
}

const DB_PATH = path.join(process.cwd(), 'database.sqlite');
const MOCK_DB_PATH = path.join(process.cwd(), 'database_mock.json');

let dbConnection = null;

// Mock database store for fallback
export let mockDb = {
  users: [],
  jobs: [],
  discussions: [],
  comments: [],
  mentorship_requests: [],
  job_applications: [],
  mentorship_chats: [],
  mentorship_meetings: [],
  upcoming_events: []
};

// Load mock database if it exists
function loadMockDb() {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      const data = fs.readFileSync(MOCK_DB_PATH, 'utf8');
      mockDb = JSON.parse(data);
      // Ensure all collections exist
      if (!mockDb.job_applications) mockDb.job_applications = [];
      if (!mockDb.mentorship_chats) mockDb.mentorship_chats = [];
      if (!mockDb.mentorship_meetings) mockDb.mentorship_meetings = [];
      if (!mockDb.upcoming_events) mockDb.upcoming_events = [];
    } else {
      // Seed mock upcoming events
      mockDb.upcoming_events = [
        {
          id: 1,
          title: 'Alumni Networking Night 2026',
          description: 'Connect with senior alumni from Google, Microsoft, and McKinsey in this campus event.',
          event_date: '2026-07-15 18:00:00',
          location: 'Main Campus Auditorium'
        },
        {
          id: 2,
          title: 'Tech Mock Interview Workshop',
          description: 'Get prepared for tech recruitment with 1-on-1 mock interviews led by alumni.',
          event_date: '2026-07-22 14:00:00',
          location: 'Seminar Hall B'
        },
        {
          id: 3,
          title: 'Finance & Consulting Career Panel',
          description: 'Alumni panel discussing career paths, resume drafting, and consulting case interviews.',
          event_date: '2026-08-05 16:30:00',
          location: 'Virtual Room (Zoom)'
        }
      ];
      saveMockDb();
    }
  } catch (err) {
    console.error("Failed to load mock database", err);
  }
}

function saveMockDb() {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(mockDb, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to save mock database", err);
  }
}

// Database initialization
export async function initDb() {
  if (dbConnection) return dbConnection;

  if (sqlite && sqlite3) {
    try {
      dbConnection = await sqlite.open({
        filename: DB_PATH,
        driver: sqlite3.Database
      });

      // Enable foreign keys
      await dbConnection.exec('PRAGMA foreign_keys = ON;');

      // Create Tables
      await dbConnection.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT CHECK(role IN ('student', 'alumni')) NOT NULL,
          name TEXT NOT NULL,
          branch TEXT NOT NULL,
          grad_year INTEGER NOT NULL,
          company TEXT,
          job_title TEXT,
          bio TEXT,
          skills TEXT,
          profile_picture TEXT,
          linkedin_url TEXT,
          github_url TEXT,
          current_semester INTEGER,
          cgpa REAL,
          career_goal TEXT,
          dream_company TEXT,
          interested_domain TEXT,
          learning_progress TEXT,
          projects TEXT,
          is_verified INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          type TEXT CHECK(type IN ('Full-time', 'Part-time', 'Internship', 'Contract')) NOT NULL,
          description TEXT NOT NULL,
          requirements TEXT NOT NULL,
          salary_range TEXT,
          apply_link TEXT,
          accepts_portal_applications INTEGER DEFAULT 1,
          posted_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS discussions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT NOT NULL,
          author_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          discussion_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          author_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS mentorship_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          alumni_id INTEGER NOT NULL,
          topic TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT CHECK(status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
          purpose TEXT,
          questions TEXT,
          preferred_time TEXT,
          expected_career_goal TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (alumni_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS job_applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          cover_letter TEXT,
          resume_url TEXT,
          status TEXT CHECK(status IN ('pending', 'shortlisted', 'rejected')) DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS mentorship_chats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (request_id) REFERENCES mentorship_requests(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS mentorship_meetings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          meeting_time TEXT NOT NULL,
          meeting_link TEXT,
          status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
          feedback TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (request_id) REFERENCES mentorship_requests(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS upcoming_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          event_date TEXT NOT NULL,
          location TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Run migrations for existing databases
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN linkedin_url TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN github_url TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE jobs ADD COLUMN accepts_portal_applications INTEGER DEFAULT 1;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN current_semester INTEGER;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN cgpa REAL;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN career_goal TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN dream_company TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN interested_domain TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN learning_progress TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN projects TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;');
      } catch (e) {}

      try {
        await dbConnection.exec('ALTER TABLE mentorship_requests ADD COLUMN purpose TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE mentorship_requests ADD COLUMN questions TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE mentorship_requests ADD COLUMN preferred_time TEXT;');
      } catch (e) {}
      try {
        await dbConnection.exec('ALTER TABLE mentorship_requests ADD COLUMN expected_career_goal TEXT;');
      } catch (e) {}

      // Seed upcoming events if table is empty
      const eventsCount = await dbConnection.get('SELECT COUNT(*) as count FROM upcoming_events');
      if (eventsCount.count === 0) {
        await dbConnection.exec(`
          INSERT INTO upcoming_events (title, description, event_date, location) VALUES
          ('Alumni Networking Night 2026', 'Connect with senior alumni from Google, Microsoft, and McKinsey in this campus event.', '2026-07-15 18:00:00', 'Main Campus Auditorium'),
          ('Tech Mock Interview Workshop', 'Get prepared for tech recruitment with 1-on-1 mock interviews led by alumni.', '2026-07-22 14:00:00', 'Seminar Hall B'),
          ('Finance & Consulting Career Panel', 'Alumni panel discussing career paths, resume drafting, and consulting case interviews.', '2026-08-05 16:30:00', 'Virtual Room (Zoom)');
        `);
      }

      // Automatically mark existing alumni as verified for visual excellence
      await dbConnection.exec("UPDATE users SET is_verified = 1 WHERE role = 'alumni'");

      console.log("SQLite Database initialized and tables verified.");
      return dbConnection;
    } catch (err) {
      console.error("Error initializing SQLite database. Falling back to JSON database.", err);
      dbConnection = "MOCK";
      loadMockDb();
      return dbConnection;
    }
  } else {
    dbConnection = "MOCK";
    loadMockDb();
    return dbConnection;
  }
}

// SQL Query executor helpers
export async function dbQuery(sql, params = []) {
  const connection = await initDb();
  if (connection === "MOCK") {
    return runMockQuery(sql, params);
  }
  return await connection.all(sql, params);
}

export async function dbGet(sql, params = []) {
  const connection = await initDb();
  if (connection === "MOCK") {
    const rows = runMockQuery(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }
  return await connection.get(sql, params);
}

export async function dbRun(sql, params = []) {
  const connection = await initDb();
  if (connection === "MOCK") {
    return runMockRun(sql, params);
  }
  const result = await connection.run(sql, params);
  return { id: result.lastID, changes: result.changes };
}

// Pure JS Simulation of the SQL schema for safety
function runMockQuery(sql, params) {
  loadMockDb();
  const normalizedSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

  // MOCK: SELECT * FROM users WHERE email = ?
  if (normalizedSql.startsWith('select * from users where email =')) {
    const email = params[0];
    return mockDb.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // MOCK: SELECT * FROM users WHERE id = ?
  if (normalizedSql.startsWith('select * from users where id =')) {
    const id = parseInt(params[0]);
    return mockDb.users.filter(u => u.id === id);
  }

  // MOCK: SELECT * FROM users WHERE role = 'alumni'
  if (normalizedSql.includes('select * from users') && (normalizedSql.includes("role = 'alumni'") || normalizedSql.includes("role = ?"))) {
    // If params has alumni, we filter for that
    const roleParam = params.find(p => typeof p === 'string' && (p === 'alumni' || p === 'student'));
    const targetRole = roleParam || 'alumni';
    let list = mockDb.users.filter(u => u.role === targetRole);
    
    // Search filter mock if query is built dynamically
    if (params.length > 0) {
      const search = params[0]?.toLowerCase();
      if (search && search !== '%%') {
        const cleanSearch = search.replace(/%/g, '');
        list = list.filter(u => 
          u.name.toLowerCase().includes(cleanSearch) || 
          (u.skills && u.skills.toLowerCase().includes(cleanSearch)) ||
          (u.company && u.company.toLowerCase().includes(cleanSearch)) ||
          (u.branch && u.branch.toLowerCase().includes(cleanSearch))
        );
      }
    }
    return list;
  }

  // MOCK: SELECT * FROM jobs
  if (normalizedSql.startsWith('select * from jobs') || normalizedSql.includes('select j.*, u.name')) {
    let jobs = mockDb.jobs.map(j => {
      const user = mockDb.users.find(u => u.id === j.posted_by);
      return { ...j, name: user ? user.name : 'Unknown Alumni', branch: user ? user.branch : '', grad_year: user ? user.grad_year : '' };
    });
    // Sort descending by id
    jobs.sort((a, b) => b.id - a.id);
    return jobs;
  }

  // MOCK: SELECT * FROM discussions
  if (normalizedSql.startsWith('select * from discussions') || normalizedSql.includes('select d.*, u.name')) {
    let discussions = mockDb.discussions.map(d => {
      const user = mockDb.users.find(u => u.id === d.author_id);
      return { ...d, name: user ? user.name : 'Anonymous', role: user ? user.role : 'student' };
    });
    discussions.sort((a, b) => b.id - a.id);
    return discussions;
  }

  // MOCK: SELECT * FROM comments WHERE discussion_id = ?
  if (normalizedSql.includes('from comments') && normalizedSql.includes('discussion_id =')) {
    const discId = parseInt(params[0]);
    let comments = mockDb.comments
      .filter(c => c.discussion_id === discId)
      .map(c => {
        const user = mockDb.users.find(u => u.id === c.author_id);
        return { ...c, name: user ? user.name : 'Anonymous', role: user ? user.role : 'student' };
      });
    comments.sort((a, b) => a.id - b.id);
    return comments;
  }

  // MOCK: SELECT * FROM mentorship_requests WHERE student_id = ? OR alumni_id = ?
  if (normalizedSql.includes('from mentorship_requests')) {
    const userId = parseInt(params[0]);
    let requests = mockDb.mentorship_requests.filter(r => r.student_id === userId || r.alumni_id === userId);
    return requests.map(r => {
      const student = mockDb.users.find(u => u.id === r.student_id);
      const alumni = mockDb.users.find(u => u.id === r.alumni_id);
      return {
        ...r,
        student_name: student ? student.name : 'Student',
        student_branch: student ? student.branch : '',
        alumni_name: alumni ? alumni.name : 'Alumni',
        alumni_company: alumni ? alumni.company : ''
      };
    });
  }

  // MOCK: SELECT * FROM job_applications
  if (normalizedSql.includes('from job_applications')) {
    loadMockDb();
    if (normalizedSql.includes('student_id = ? and job_id = ?') || normalizedSql.includes('student_id = ? and job_id = ?')) {
      const studentId = parseInt(params[0]);
      const jobId = parseInt(params[1]);
      return mockDb.job_applications.filter(ja => ja.student_id === studentId && ja.job_id === jobId);
    }
    
    if (normalizedSql.includes('where ja.student_id = ?') || normalizedSql.includes('where student_id = ?')) {
      const studentId = parseInt(params[0]);
      const apps = mockDb.job_applications.filter(ja => ja.student_id === studentId);
      return apps.map(ja => {
        const job = mockDb.jobs.find(j => j.id === ja.job_id);
        return {
          ...ja,
          job_title: job ? job.title : 'Position',
          job_company: job ? job.company : 'Company'
        };
      });
    }

    if (normalizedSql.includes('j.posted_by = ?') || normalizedSql.includes('posted_by = ?')) {
      const posterId = parseInt(params[0]);
      const posterJobs = mockDb.jobs.filter(j => j.posted_by === posterId);
      const posterJobIds = posterJobs.map(j => j.id);
      
      const apps = mockDb.job_applications.filter(ja => posterJobIds.includes(ja.job_id));
      return apps.map(ja => {
        const student = mockDb.users.find(u => u.id === ja.student_id);
        const job = mockDb.jobs.find(j => j.id === ja.job_id);
        return {
          ...ja,
          student_name: student ? student.name : 'Student',
          student_branch: student ? student.branch : '',
          student_grad_year: student ? student.grad_year : '',
          student_email: student ? student.email : '',
          student_skills: student ? student.skills : '',
          job_title: job ? job.title : ''
        };
      });
    }
    
    return mockDb.job_applications;
  }

  return [];
}

function runMockRun(sql, params) {
  loadMockDb();
  const normalizedSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

// MOCK: INSERT INTO users
  if (normalizedSql.startsWith('insert into users')) {
    const newUser = {
      id: mockDb.users.length + 1,
      email: params[0],
      password_hash: params[1],
      role: params[2],
      name: params[3],
      branch: params[4],
      grad_year: parseInt(params[5]),
      company: params[6] || null,
      job_title: params[7] || null,
      bio: params[8] || null,
      skills: params[9] || '',
      profile_picture: params[10] || null,
      linkedin_url: null,
      github_url: null,
      created_at: new Date().toISOString()
    };
    mockDb.users.push(newUser);
    saveMockDb();
    return { id: newUser.id, changes: 1 };
  }

  // MOCK: UPDATE users
  if (normalizedSql.startsWith('update users')) {
    // Expect params: name, branch, grad_year, company, job_title, bio, skills, [linkedin_url, github_url], id
    const id = parseInt(params[params.length - 1]);
    const userIndex = mockDb.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockDb.users[userIndex].name = params[0];
      mockDb.users[userIndex].branch = params[1];
      mockDb.users[userIndex].grad_year = parseInt(params[2]);
      mockDb.users[userIndex].company = params[3];
      mockDb.users[userIndex].job_title = params[4];
      mockDb.users[userIndex].bio = params[5];
      mockDb.users[userIndex].skills = params[6];
      if (params.length >= 9) {
        mockDb.users[userIndex].linkedin_url = params[7];
        mockDb.users[userIndex].github_url = params[8];
      }
      saveMockDb();
      return { id: id, changes: 1 };
    }
    return { id: null, changes: 0 };
  }

  // MOCK: INSERT INTO jobs
  if (normalizedSql.startsWith('insert into jobs')) {
    const acceptsPortal = params.length >= 10 ? parseInt(params[8]) : 1;
    const postedBy = parseInt(params[params.length - 1]);
    const newJob = {
      id: mockDb.jobs.length + 1,
      title: params[0],
      company: params[1],
      location: params[2],
      type: params[3],
      description: params[4],
      requirements: params[5],
      salary_range: params[6] || null,
      apply_link: params[7] || null,
      accepts_portal_applications: acceptsPortal,
      posted_by: postedBy,
      created_at: new Date().toISOString()
    };
    mockDb.jobs.push(newJob);
    saveMockDb();
    return { id: newJob.id, changes: 1 };
  }

  // MOCK: INSERT INTO discussions
  if (normalizedSql.startsWith('insert into discussions')) {
    const newDiscussion = {
      id: mockDb.discussions.length + 1,
      title: params[0],
      content: params[1],
      category: params[2],
      author_id: parseInt(params[3]),
      created_at: new Date().toISOString()
    };
    mockDb.discussions.push(newDiscussion);
    saveMockDb();
    return { id: newDiscussion.id, changes: 1 };
  }

  // MOCK: INSERT INTO comments
  if (normalizedSql.startsWith('insert into comments')) {
    const newComment = {
      id: mockDb.comments.length + 1,
      discussion_id: parseInt(params[0]),
      content: params[1],
      author_id: parseInt(params[2]),
      created_at: new Date().toISOString()
    };
    mockDb.comments.push(newComment);
    saveMockDb();
    return { id: newComment.id, changes: 1 };
  }

  // MOCK: INSERT INTO mentorship_requests
  if (normalizedSql.startsWith('insert into mentorship_requests')) {
    const newRequest = {
      id: mockDb.mentorship_requests.length + 1,
      student_id: parseInt(params[0]),
      alumni_id: parseInt(params[1]),
      topic: params[2],
      message: params[3],
      status: 'pending',
      purpose: params[4] || null,
      questions: params[5] || null,
      preferred_time: params[6] || null,
      expected_career_goal: params[7] || null,
      created_at: new Date().toISOString()
    };
    mockDb.mentorship_requests.push(newRequest);
    saveMockDb();
    return { id: newRequest.id, changes: 1 };
  }

  // MOCK: UPDATE mentorship_requests SET status = ? WHERE id = ?
  if (normalizedSql.includes('update mentorship_requests') && normalizedSql.includes('status =')) {
    const status = params[0];
    const id = parseInt(params[1]);
    const reqIndex = mockDb.mentorship_requests.findIndex(r => r.id === id);
    if (reqIndex !== -1) {
      mockDb.mentorship_requests[reqIndex].status = status;
      saveMockDb();
      return { id: id, changes: 1 };
    }
  }

  // MOCK: INSERT INTO job_applications
  if (normalizedSql.startsWith('insert into job_applications')) {
    const newApp = {
      id: mockDb.job_applications.length + 1,
      job_id: parseInt(params[0]),
      student_id: parseInt(params[1]),
      cover_letter: params[2],
      resume_url: params[3],
      status: 'pending',
      created_at: new Date().toISOString()
    };
    mockDb.job_applications.push(newApp);
    saveMockDb();
    return { id: newApp.id, changes: 1 };
  }

  // MOCK: UPDATE job_applications SET status = ? WHERE id = ?
  if (normalizedSql.includes('update job_applications') && normalizedSql.includes('status =')) {
    const status = params[0];
    const id = parseInt(params[1]);
    const appIndex = mockDb.job_applications.findIndex(ja => ja.id === id);
    if (appIndex !== -1) {
      mockDb.job_applications[appIndex].status = status;
      saveMockDb();
      return { id: id, changes: 1 };
    }
  }

  return { id: null, changes: 0 };
}
