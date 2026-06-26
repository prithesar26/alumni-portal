'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StatsDashboard from '@/components/StatsDashboard';
import { 
  User, Mail, GraduationCap, Briefcase, Award, FileText, 
  Settings, CheckCircle, XCircle, Clock, Save, Edit3, ArrowRight 
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit form states
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [currentSemester, setCurrentSemester] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [dreamCompany, setDreamCompany] = useState('');
  const [interestedDomain, setInterestedDomain] = useState('');
  const [learningProgress, setLearningProgress] = useState('');
  const [projects, setProjects] = useState('');

  // Smart Matching Recommendations states
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const userRes = await fetch('/api/auth/me');
      let currentLoggedUser = null;
      if (userRes.ok) {
        const userData = await userRes.json();
        currentLoggedUser = userData.user;
        setUser(userData.user);
        
        // Prep edit fields
        setName(userData.user.name);
        setBranch(userData.user.branch);
        setGradYear(userData.user.grad_year);
        setCompany(userData.user.company || '');
        setJobTitle(userData.user.job_title || '');
        setBio(userData.user.bio || '');
        setSkills(userData.user.skills || '');
        setLinkedinUrl(userData.user.linkedin_url || '');
        setGithubUrl(userData.user.github_url || '');
        setCurrentSemester(userData.user.current_semester || '');
        setCgpa(userData.user.cgpa || '');
        setCareerGoal(userData.user.career_goal || '');
        setDreamCompany(userData.user.dream_company || '');
        setInterestedDomain(userData.user.interested_domain || '');
        setLearningProgress(userData.user.learning_progress || '');
        setProjects(userData.user.projects || '');
      }

      // Fetch mentorship requests
      const requestsRes = await fetch('/api/mentorship');
      if (requestsRes.ok) {
        const reqData = await requestsRes.json();
        setRequests(reqData.requests);
      }

      // Fetch job applications
      const appsRes = await fetch('/api/jobs/apply');
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setJobApplications(appsData.applications || []);
      }

      // Smart recommendation calculations (student role only)
      if (currentLoggedUser && currentLoggedUser.role === 'student') {
        const alumniRes = await fetch('/api/alumni');
        const jobsRes = await fetch('/api/jobs');
        if (alumniRes.ok && jobsRes.ok) {
          const alumniData = await alumniRes.json();
          const jobsData = await jobsRes.json();
          
          const studentSkills = (currentLoggedUser.skills || '')
            .toLowerCase()
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

          if (studentSkills.length > 0) {
            // Match Mentors (Alumni sharing overlapping skills)
            const mentors = alumniData.alumni.map(alum => {
              const alumSkills = (alum.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
              const overlap = studentSkills.filter(s => alumSkills.includes(s));
              return { ...alum, score: overlap.length, matchingSkills: overlap };
            }).filter(m => m.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
            setRecommendedMentors(mentors);

            // Match Jobs (Jobs matching student profile skills)
            const jobsList = jobsData.jobs.map(job => {
              const reqText = (job.requirements + ' ' + job.title + ' ' + job.description).toLowerCase();
              const matches = studentSkills.filter(s => reqText.includes(s));
              return { ...job, score: matches.length, matchingSkills: matches };
            }).filter(j => j.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
            setRecommendedJobs(jobsList);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, branch, gradYear, company, jobTitle, bio, skills, linkedinUrl, githubUrl,
          currentSemester, cgpa, careerGoal, dreamCompany, interestedDomain, learningProgress, projects
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setUser(data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      // Recalculate matchers based on updated profile skills
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMentorshipAction = async (requestId, status) => {
    try {
      const res = await fetch('/api/mentorship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });

      if (res.ok) {
        // Refresh requests
        const requestsRes = await fetch('/api/mentorship');
        if (requestsRes.ok) {
          const reqData = await requestsRes.json();
          setRequests(reqData.requests);
        }
      }
    } catch (err) {
      console.error('Error updating mentorship request', err);
    }
  };

  const handleJobApplicationAction = async (applicationId, status) => {
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status })
      });

      if (res.ok) {
        // Refresh applications
        const appsRes = await fetch('/api/jobs/apply');
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setJobApplications(appsData.applications || []);
        }
      }
    } catch (err) {
      console.error('Error updating job application status', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-semibold">Loading Portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl"></div>
          <div>
            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              You are logged in as a <span className="text-indigo-300 font-semibold uppercase">{user?.role}</span>.
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Statistics Dashboard Section */}
        <StatsDashboard />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Main Panels */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Editing Form or View */}
            {editing ? (
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white">Edit Your Profile Info</h2>
                  <button
                    onClick={() => { setEditing(false); setError(''); }}
                    className="text-xs text-slate-400 hover:text-white font-semibold"
                  >
                    Cancel
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branch / Dept</label>
                      <input
                        type="text"
                        required
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Graduation Year</label>
                      <input
                        type="number"
                        required
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    
                    {user?.role === 'alumni' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Company</label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {user?.role === 'alumni' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Skills (Comma Separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, CSS, Python"
                      className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">LinkedIn Profile Link</label>
                      <input
                        type="text"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GitHub Profile Link</label>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="github.com/username"
                        className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {user?.role === 'student' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Semester</label>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={currentSemester}
                            onChange={(e) => setCurrentSemester(e.target.value)}
                            placeholder="e.g. 6"
                            className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CGPA</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)}
                            placeholder="e.g. 8.75"
                            className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Career Goal</label>
                          <input
                            type="text"
                            value={careerGoal}
                            onChange={(e) => setCareerGoal(e.target.value)}
                            placeholder="e.g. Software Developer"
                            className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dream Company</label>
                          <input
                            type="text"
                            value={dreamCompany}
                            onChange={(e) => setDreamCompany(e.target.value)}
                            placeholder="e.g. Google"
                            className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Interested Domain</label>
                          <input
                            type="text"
                            value={interestedDomain}
                            onChange={(e) => setInterestedDomain(e.target.value)}
                            placeholder="e.g. AI/ML, Web Dev"
                            className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Learning Progress</label>
                        <input
                          type="text"
                          value={learningProgress}
                          onChange={(e) => setLearningProgress(e.target.value)}
                          placeholder="e.g. Learning Next.js, building backend APIs"
                          className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Projects (Short Summary)</label>
                        <textarea
                          value={projects}
                          onChange={(e) => setProjects(e.target.value)}
                          rows="2"
                          placeholder="e.g. E-commerce app in React, Portfolio website"
                          className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">About Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    <Save className="h-4 w-4" />
                    Save Updates
                  </button>
                </form>
              </div>
            ) : (
              /* Profile Card Display */
              <div className="glass-panel p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-2xl">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      {user?.email}
                    </p>
                  </div>
                </div>

                {success && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div className="flex gap-3">
                    <GraduationCap className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Education Details</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{user?.branch}</p>
                      <p className="text-xs text-slate-400">Class of {user?.grad_year}</p>
                      {user?.role === 'student' && user?.current_semester && (
                        <p className="text-xs text-indigo-400 font-semibold mt-1">Semester: {user?.current_semester} | CGPA: {user?.cgpa || 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  {user?.role === 'alumni' && (
                    <div className="flex gap-3">
                      <Briefcase className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Current Work</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{user?.job_title}</p>
                        <p className="text-xs text-slate-400">at {user?.company}</p>
                        {user?.is_verified === 1 && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">Verified Alumni</span>
                        )}
                      </div>
                    </div>
                  )}

                  {user?.role === 'student' && (
                    <div className="flex gap-3">
                      <Briefcase className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Target Career & Company</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{user?.career_goal || 'Not specified'}</p>
                        <p className="text-xs text-slate-400">Dream Company: {user?.dream_company || 'Not specified'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {user?.role === 'student' && (user?.interested_domain || user?.learning_progress || user?.projects) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    {user?.interested_domain && (
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Interested Domain & Progress</p>
                        <p className="text-sm font-semibold text-indigo-300 mt-0.5">{user?.interested_domain}</p>
                        <p className="text-xs text-slate-400 mt-1">{user?.learning_progress || 'No learning progress updated'}</p>
                      </div>
                    )}
                    {user?.projects && (
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Academic & Personal Projects</p>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{user?.projects}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    Professional Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills ? (
                      user.skills.split(',').map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300 font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Bio Description
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {user?.bio || <span className="italic text-slate-500">No bio written yet. Click Edit Profile to add one.</span>}
                  </p>
                </div>

                {(user?.linkedin_url || user?.github_url) && (
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Connection Profiles</p>
                    <div className="flex flex-wrap gap-2.5">
                      {user?.linkedin_url && (
                        <a
                          href={user.linkedin_url.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                      {user?.github_url && (
                        <a
                          href={user.github_url.startsWith('http') ? user.github_url : `https://${user.github_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          GitHub Profile
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mentorship Requests Section */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-6">
                {user?.role === 'student' ? 'My Mentorship Requests' : 'Incoming Mentorship Requests'}
              </h2>

              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No mentorship requests found.</p>
                  {user?.role === 'student' && (
                    <p className="text-xs text-slate-500 mt-1">Browse the alumni directory to request guidance.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{req.partner_name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {user?.role === 'student' ? `(Alumni at ${req.partner_company})` : `(Student, ${req.partner_branch})`}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-indigo-300">Topic: {req.topic}</p>
                        <p className="text-xs text-slate-400 italic">"{req.message}"</p>
                        {req.status === 'accepted' && (
                          <div className="mt-2 space-y-2">
                            <p className="text-[10px] text-indigo-400 font-semibold">
                              Contact: <a href={`mailto:${req.partner_email}`} className="underline">{req.partner_email}</a>
                            </p>
                            <a
                              href={`/dashboard/mentorship/${req.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Open Connection Workspace
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          user?.role === 'alumni' ? (
                            <>
                              <button
                                onClick={() => handleMentorshipAction(req.id, 'accepted')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleMentorshipAction(req.id, 'declined')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Decline
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              <Clock className="h-3.5 w-3.5" />
                              Pending Response
                            </span>
                          )
                        ) : req.status === 'accepted' ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Accepted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            <XCircle className="h-3.5 w-3.5" />
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Job Applications Section */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-6">
                {user?.role === 'student' ? 'My Job Applications' : 'Job Applications Received'}
              </h2>

              {jobApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No job applications found.</p>
                  {user?.role === 'student' && (
                    <p className="text-xs text-slate-500 mt-1">Browse the jobs directory to submit applications.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {jobApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">
                            {user?.role === 'student' ? app.job_title : app.student_name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {user?.role === 'student' ? `(at ${app.job_company})` : `(Student, ${app.student_branch})`}
                          </span>
                        </div>
                        {user?.role === 'alumni' && (
                          <p className="text-xs font-semibold text-indigo-300">Applied for: {app.job_title}</p>
                        )}
                        <p className="text-xs text-slate-450 italic mt-1">"{app.cover_letter}"</p>
                        <p className="text-xs text-indigo-400 font-semibold mt-1">
                          Resume Link: <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-300">{app.resume_url}</a>
                        </p>
                        {user?.role === 'alumni' && (
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            Skills: {app.student_skills || 'None listed'}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === 'pending' ? (
                          user?.role === 'alumni' ? (
                            <>
                              <button
                                onClick={() => handleJobApplicationAction(app.id, 'shortlisted')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleJobApplicationAction(app.id, 'rejected')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              <Clock className="h-3.5 w-3.5" />
                              Under Review
                            </span>
                          )
                        ) : app.status === 'shortlisted' ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Shortlisted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            <XCircle className="h-3.5 w-3.5" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Column 3: Sidebar Shortcuts */}
          <div className="space-y-8">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Quick Shortcuts</h2>
              <div className="grid grid-cols-1 gap-3">
                <a
                  href="/alumni"
                  className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all group"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">Search Alumni Directory</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Find and request senior mentors</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="/jobs"
                  className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all group"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">Find Jobs & Internships</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Apply or share job listings</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </a>

                <a
                  href="/discussions"
                  className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all group"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">Q&A Knowledge sharing</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ask questions or start debates</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>

            {/* Smart Matches / Recommendations */}
            {user?.role === 'student' && (
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-950/20 to-slate-950/60 border border-white/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-lg"></div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4">
                  <Award className="h-4.5 w-4.5 text-indigo-400" />
                  Recommended Mentors
                </h3>
                
                {recommendedMentors.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No recommendations yet. List skills on your profile!</p>
                ) : (
                  <div className="space-y-3">
                    {recommendedMentors.map(mentor => (
                      <div key={mentor.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                        <p className="text-xs font-bold text-white">{mentor.name}</p>
                        <p className="text-[10px] text-slate-400">{mentor.job_title} at {mentor.company}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {mentor.matchingSkills.map((s, i) => (
                            <span key={i} className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-6 mb-4">
                  <Briefcase className="h-4.5 w-4.5 text-indigo-400" />
                  Matching Jobs
                </h3>

                {recommendedJobs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No matching job postings found.</p>
                ) : (
                  <div className="space-y-3">
                    {recommendedJobs.map(job => (
                      <div key={job.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                        <p className="text-xs font-bold text-white">{job.title}</p>
                        <p className="text-[10px] text-slate-400">{job.company} - {job.location}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {job.matchingSkills.map((s, i) => (
                            <span key={i} className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick networking tips */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-950/40 to-slate-950/60 border border-indigo-500/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-lg"></div>
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3">Networking Pro Tip</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When reaching out to alumni for mentorship, mention your shared college background and ask specific questions about their current team's tech stack or recruitment cycle. Clear, concise questions lead to a 75% higher reply rate!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
