'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Users, Search, Mail, GraduationCap, Briefcase, Award, 
  MessageSquare, X, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);

  // Mentorship Request Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [purpose, setPurpose] = useState('Career Advice');
  const [questions, setQuestions] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [expectedCareerGoal, setExpectedCareerGoal] = useState('');

  // AI Recommendation states
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    fetchAlumni();
    fetchCurrentUser();
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await fetch('/api/alumni/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations', err);
    } finally {
      setRecLoading(false);
    }
  };

  const fetchAlumni = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alumni${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setAlumni(data.alumni);
      }
    } catch (err) {
      console.error('Error fetching alumni directory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentStudent(data.user);
      }
    } catch (err) {
      console.error('Error fetching current user details', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlumni(search);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val) {
      fetchAlumni(); // Reset directory on clear
    }
  };

  const handleOpenMentorshipModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSendMentorshipRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setModalLoading(true);

    try {
      const res = await fetch('/api/mentorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniId: selectedMentor.id,
          topic,
          message,
          purpose,
          questions,
          preferredTime,
          expectedCareerGoal
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send request');

      setSuccess('Mentorship request sent successfully!');
      setTopic('');
      setMessage('');
      setPurpose('Career Advice');
      setQuestions('');
      setPreferredTime('');
      setExpectedCareerGoal('');
      
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Alumni Networking Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Search senior alumni working in different corporate environments. Reach out to request professional guidance.
          </p>
        </div>

        {/* AI Recommendations Section */}
        {currentStudent?.role === 'student' && recommendations.length > 0 && (
          <div className="mb-10 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">AI-Powered Mentor Matches</h2>
              <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">Personalized for you</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((mentor) => (
                <div 
                  key={`rec-${mentor.id}`}
                  className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/15 to-slate-950/60 relative overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-lg"></div>
                  
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-extrabold text-base shrink-0">
                          {mentor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors leading-tight">{mentor.name}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">{mentor.job_title} at {mentor.company}</p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                          {mentor.matchPercentage}% Match
                        </span>
                      </div>
                    </div>

                    {/* Match Reason */}
                    <p className="text-[11px] text-indigo-200/80 bg-indigo-950/25 border border-indigo-500/10 p-2.5 rounded-xl mt-4 leading-relaxed">
                      💡 {mentor.reason}
                    </p>

                    {/* Common Skills */}
                    {mentor.commonSkills && mentor.commonSkills.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Shared Skills</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {mentor.commonSkills.map((s, idx) => (
                            <span key={idx} className="text-[9px] px-2 py-0.5 bg-indigo-600/10 border border-indigo-500/20 rounded-md text-indigo-300 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleOpenMentorshipModal(mentor)}
                    className="mt-5 w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Book Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar Panel */}
        <form onSubmit={handleSearchSubmit} className="glass-panel p-4 rounded-2xl mb-8 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, branch, skills, company, or job title..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            Search
          </button>
        </form>

        {/* Alumni List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-semibold mt-3">Searching directory...</p>
          </div>
        ) : alumni.length === 0 ? (
          <div className="glass-panel py-16 px-4 rounded-2xl text-center">
            <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Alumni Profiles Found</h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your query keywords (e.g., try 'Google', 'CSE', 'React').
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((alum) => (
              <div
                key={alum.id}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between glass-card-hover border border-white/5"
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-lg shrink-0">
                      {alum.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{alum.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        {alum.branch} ('{alum.grad_year % 100})
                      </p>
                    </div>
                  </div>

                  {/* Company Info */}
                  {alum.company && (
                    <div className="mt-4 p-3 bg-slate-950/30 rounded-xl border border-white/5 flex gap-2.5 items-start">
                      <Briefcase className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white leading-none">{alum.job_title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">at {alum.company}</p>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {alum.bio && (
                    <p className="text-xs text-slate-300 mt-4 leading-relaxed line-clamp-3">
                      {alum.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {alum.skills && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex flex-wrap gap-1.5">
                        {alum.skills.split(',').slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-slate-400 font-medium"
                          >
                            {s.trim()}
                          </span>
                        ))}
                        {alum.skills.split(',').length > 4 && (
                          <span className="text-[9px] px-2 py-0.5 rounded-md text-slate-500 font-medium">
                            +{alum.skills.split(',').length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Request mentorship button */}
                <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                  {currentStudent?.role === 'student' ? (
                    <button
                      onClick={() => handleOpenMentorshipModal(alum)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold rounded-xl border border-indigo-500/20 hover:border-indigo-600 transition-all cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Request Mentorship
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center gap-1.5 justify-center py-2 px-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-500 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Student role required
                    </div>
                  )}

                  {alum.linkedin_url && (
                    <a
                      href={alum.linkedin_url.startsWith('http') ? alum.linkedin_url : `https://${alum.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-9.5 h-9.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-600 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                      title="LinkedIn Profile"
                    >
                      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}

                  {alum.github_url && (
                    <a
                      href={alum.github_url.startsWith('http') ? alum.github_url : `https://${alum.github_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-9.5 h-9.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-600 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                      title="GitHub Profile"
                    >
                      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Mentorship Request Modal Dialog */}
      {showModal && selectedMentor && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute top-4 right-12 text-indigo-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              Mentorship Request
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Connect with <span className="text-indigo-400 font-bold">{selectedMentor.name}</span> (Alumni class of {selectedMentor.grad_year}).
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleSendMentorshipRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Mentorship Topic *</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Mock Interview / Web Dev advice"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Purpose of Mentoring *</label>
                  <select
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Career Advice">Career Advice</option>
                    <option value="Mock Interview">Mock Interview</option>
                    <option value="Resume Review">Resume Review</option>
                    <option value="Industry Insights">Industry Insights</option>
                    <option value="Tech Stack Guidance">Tech Stack Guidance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Expected Career Goal *</label>
                  <input
                    type="text"
                    required
                    value={expectedCareerGoal}
                    onChange={(e) => setExpectedCareerGoal(e.target.value)}
                    placeholder="e.g. Frontend Engineer at Google"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Preferred Meeting Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Introduction & Message *</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  placeholder="Tell your senior what you are struggling with or hoping to learn..."
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Questions You Want to Ask *</label>
                <textarea
                  required
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  rows="2"
                  placeholder="List 1-3 specific questions you want to ask during the session..."
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {modalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Request'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
