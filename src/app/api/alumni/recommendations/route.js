import { NextResponse } from 'next/server';
import { dbQuery, dbGet, initDb, mockDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await initDb();
    
    // Fetch current student profile
    let student = null;
    if (connection === 'MOCK') {
      student = mockDb.users.find(u => u.id === session.id);
    } else {
      student = await dbGet('SELECT * FROM users WHERE id = ?', [session.id]);
    }

    if (!student || student.role !== 'student') {
      return NextResponse.json({ recommendations: [] });
    }

    // Fetch all alumni
    let alumniList = [];
    if (connection === 'MOCK') {
      alumniList = mockDb.users.filter(u => u.role === 'alumni');
    } else {
      alumniList = await dbQuery(
        `SELECT id, name, email, branch, grad_year, company, job_title, bio, skills, profile_picture, linkedin_url, github_url, is_verified 
         FROM users 
         WHERE role = 'alumni'`
      );
    }

    // Helper to extract clean array of skills
    const getSkillsArray = (skillsStr) => {
      if (!skillsStr) return [];
      return skillsStr
        .toLowerCase()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    };

    const studentSkills = getSkillsArray(student.skills);
    const studentBranch = (student.branch || '').toLowerCase().trim();
    const studentDreamCompany = (student.dream_company || '').toLowerCase().trim();
    const studentDomain = (student.interested_domain || '').toLowerCase().trim();

    const recommendations = alumniList.map(alumnus => {
      let score = 15; // baseline score
      const reasons = [];
      const commonSkills = [];

      const alumSkills = getSkillsArray(alumnus.skills);
      const alumBranch = (alumnus.branch || '').toLowerCase().trim();
      const alumCompany = (alumnus.company || '').toLowerCase().trim();
      const alumTitle = (alumnus.job_title || '').toLowerCase().trim();
      const alumBio = (alumnus.bio || '').toLowerCase().trim();

      // 1. Department Match (15 points)
      if (studentBranch && alumBranch === studentBranch) {
        score += 15;
        reasons.push(`Graduated from your department (${alumnus.branch})`);
      }

      // 2. Skills Match (up to 40 points)
      if (studentSkills.length > 0 && alumSkills.length > 0) {
        const overlap = studentSkills.filter(s => alumSkills.includes(s));
        if (overlap.length > 0) {
          const points = Math.min(overlap.length * 10, 40);
          score += points;
          
          // Get capitalization from student/alumni skills
          const originalAlumSkills = (alumnus.skills || '').split(',').map(s => s.trim());
          overlap.forEach(s => {
            const found = originalAlumSkills.find(os => os.toLowerCase() === s);
            if (found) commonSkills.push(found);
          });
          
          reasons.push(`Shares ${overlap.length} of your listed skills (${overlap.slice(0, 2).join(', ')})`);
        }
      }

      // 3. Dream Company Match (25 points)
      if (studentDreamCompany && alumCompany) {
        if (alumCompany.includes(studentDreamCompany) || studentDreamCompany.includes(alumCompany)) {
          score += 25;
          reasons.push(`Works at your dream company, ${alumnus.company}`);
        }
      }

      // 4. Domain / Title Match (20 points)
      if (studentDomain) {
        if (alumTitle.includes(studentDomain) || alumBio.includes(studentDomain) || (alumnus.skills || '').toLowerCase().includes(studentDomain)) {
          score += 20;
          reasons.push(`Experienced in your target domain of ${student.interested_domain}`);
        }
      }

      // Format a summary reason
      let finalReason = '';
      if (reasons.length > 0) {
        finalReason = reasons.join(' and ') + '.';
      } else {
        finalReason = `Senior in ${alumnus.branch || 'engineering'} with active industry experience.`;
      }

      // Cap match percentage between 45% and 98% for realistic matching feel
      const matchPercentage = Math.min(Math.max(score, 45), 98);

      return {
        ...alumnus,
        matchPercentage,
        reason: finalReason,
        commonSkills: commonSkills.slice(0, 3)
      };
    });

    // Sort by match percentage descending and take the top 3
    const topRecommendations = recommendations
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);

    return NextResponse.json({ recommendations: topRecommendations });
  } catch (error) {
    console.error('Fetch Recommendations API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating recommendations' },
      { status: 500 }
    );
  }
}
