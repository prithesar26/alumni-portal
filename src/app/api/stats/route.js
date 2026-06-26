import { NextResponse } from 'next/server';
import { dbGet, initDb, mockDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await initDb();
    
    let totalStudents = 0;
    let totalAlumni = 0;
    let verifiedAlumni = 0;
    let activeMentors = 0;
    let totalMentorshipRequests = 0;
    let acceptedMentorshipRequests = 0;
    let pendingMentorshipRequests = 0;
    let completedMentorshipSessions = 0;
    let totalJobPosts = 0;
    let totalInternshipPosts = 0;
    let totalApplications = 0;
    let studentsPlaced = 0;
    let activeCompanies = 0;
    let upcomingEvents = 0;

    if (connection === 'MOCK') {
      // Direct JS calculation from mockDb
      totalStudents = mockDb.users.filter(u => u.role === 'student').length;
      totalAlumni = mockDb.users.filter(u => u.role === 'alumni').length;
      verifiedAlumni = mockDb.users.filter(u => u.role === 'alumni' && u.is_verified === 1).length;
      
      const acceptedRequests = mockDb.mentorship_requests.filter(r => r.status === 'accepted');
      activeMentors = new Set(acceptedRequests.map(r => r.alumni_id)).size;
      
      totalMentorshipRequests = mockDb.mentorship_requests.length;
      acceptedMentorshipRequests = acceptedRequests.length;
      pendingMentorshipRequests = mockDb.mentorship_requests.filter(r => r.status === 'pending').length;
      
      completedMentorshipSessions = mockDb.mentorship_meetings.filter(m => m.status === 'completed').length;
      totalJobPosts = mockDb.jobs.length;
      totalInternshipPosts = mockDb.jobs.filter(j => j.type === 'Internship').length;
      totalApplications = mockDb.job_applications.length;
      
      const shortlistedApps = mockDb.job_applications.filter(a => a.status === 'shortlisted');
      studentsPlaced = new Set(shortlistedApps.map(a => a.student_id)).size;
      
      const companies = new Set();
      mockDb.jobs.forEach(j => { if (j.company) companies.add(j.company.toLowerCase().trim()); });
      mockDb.users.forEach(u => { if (u.role === 'alumni' && u.company) companies.add(u.company.toLowerCase().trim()); });
      activeCompanies = companies.size;
      
      upcomingEvents = mockDb.upcoming_events.length;
    } else {
      // Run optimized SQL queries
      const resStudents = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
      totalStudents = resStudents?.count || 0;

      const resAlumni = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'alumni'");
      totalAlumni = resAlumni?.count || 0;

      const resVerified = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'alumni' AND is_verified = 1");
      verifiedAlumni = resVerified?.count || 0;

      const resActiveMentors = await dbGet("SELECT COUNT(DISTINCT alumni_id) as count FROM mentorship_requests WHERE status = 'accepted'");
      activeMentors = resActiveMentors?.count || 0;

      const resTotalReqs = await dbGet("SELECT COUNT(*) as count FROM mentorship_requests");
      totalMentorshipRequests = resTotalReqs?.count || 0;

      const resAcceptedReqs = await dbGet("SELECT COUNT(*) as count FROM mentorship_requests WHERE status = 'accepted'");
      acceptedMentorshipRequests = resAcceptedReqs?.count || 0;

      const resPendingReqs = await dbGet("SELECT COUNT(*) as count FROM mentorship_requests WHERE status = 'pending'");
      pendingMentorshipRequests = resPendingReqs?.count || 0;

      const resCompletedSessions = await dbGet("SELECT COUNT(*) as count FROM mentorship_meetings WHERE status = 'completed'");
      completedMentorshipSessions = resCompletedSessions?.count || 0;

      const resJobPosts = await dbGet("SELECT COUNT(*) as count FROM jobs");
      totalJobPosts = resJobPosts?.count || 0;

      const resInternPosts = await dbGet("SELECT COUNT(*) as count FROM jobs WHERE type = 'Internship'");
      totalInternshipPosts = resInternPosts?.count || 0;

      const resApps = await dbGet("SELECT COUNT(*) as count FROM job_applications");
      totalApplications = resApps?.count || 0;

      const resPlaced = await dbGet("SELECT COUNT(DISTINCT student_id) as count FROM job_applications WHERE status = 'shortlisted'");
      studentsPlaced = resPlaced?.count || 0;

      const resCompanies = await dbGet(`
        SELECT COUNT(DISTINCT company) as count FROM (
          SELECT company FROM jobs WHERE company IS NOT NULL AND company != ''
          UNION
          SELECT company FROM users WHERE role = 'alumni' AND company IS NOT NULL AND company != ''
        )
      `);
      activeCompanies = resCompanies?.count || 0;

      const resEvents = await dbGet("SELECT COUNT(*) as count FROM upcoming_events");
      upcomingEvents = resEvents?.count || 0;
    }

    return NextResponse.json({
      totalStudents,
      totalAlumni,
      verifiedAlumni,
      activeMentors,
      totalMentorshipRequests,
      acceptedMentorshipRequests,
      pendingMentorshipRequests,
      completedMentorshipSessions,
      totalJobPosts,
      totalInternshipPosts,
      totalApplications,
      studentsPlaced,
      activeCompanies,
      upcomingEvents
    });
  } catch (error) {
    console.error('Fetch Stats API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching portal stats' },
      { status: 500 }
    );
  }
}
