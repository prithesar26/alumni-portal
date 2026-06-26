'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Briefcase, MapPin, Building, DollarSign, ExternalLink, 
  Search, Plus, X, Loader2, Calendar, FileText 
} from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  
  // Search & Filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal form states (Post Opportunity)
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [acceptsPortal, setAcceptsPortal] = useState(true);

  // Apply Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    filterJobsList();
  }, [jobs, search, typeFilter]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.user.role === 'student') {
          fetchAppliedJobs();
        }
      }
    } catch (err) {
      console.error('Error fetching current user', err);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await fetch('/api/jobs/apply');
      if (res.ok) {
        const data = await res.json();
        setAppliedJobIds(data.applications.map(a => a.job_id));
      }
    } catch (err) {
      console.error('Error fetching applied jobs', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const filterJobsList = () => {
    let list = [...jobs];

    // Filter by type
    if (typeFilter !== 'All') {
      list = list.filter(j => j.type === typeFilter);
    }

    // Filter by search text
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(j => 
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(list);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setModalLoading(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, company, location, type, description, requirements, salaryRange, applyLink,
          acceptsPortalApplications: acceptsPortal
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post job');

      setSuccess('Job opportunity posted successfully!');
      
      // Reset form fields
      setTitle('');
      setCompany('');
      setLocation('');
      setType('Full-time');
      setDescription('');
      setRequirements('');
      setSalaryRange('');
      setApplyLink('');
      setAcceptsPortal(true);

      // Refresh list
      await fetchJobs();

      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenApplyModal = (job) => {
    setSelectedJob(job);
    setCoverLetter('');
    setResumeUrl('');
    setApplyError('');
    setApplySuccess('');
    setShowApplyModal(true);
  };

  const handleApplyJob = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');
    setApplyLoading(true);

    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          coverLetter,
          resumeUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setApplySuccess('Application submitted successfully!');
      setAppliedJobIds([...appliedJobIds, selectedJob.id]);

      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess('');
      }, 1500);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  const typeOptions = ['All', 'Full-time', 'Part-time', 'Internship', 'Contract'];

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Jobs & Internship Portal</h1>
            <p className="text-sm text-slate-400 mt-1">
              Explore opportunities posted directly by your alumni network and current students.
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4.5 w-4.5" />
            Post Opportunity
          </button>
        </div>

        {/* Filters Panel */}
        <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="w-full md:max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search title, company, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Type filters */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {typeOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setTypeFilter(opt)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer shrink-0 ${
                  typeFilter === opt
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

        </div>

        {/* Jobs List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-semibold mt-3">Fetching postings...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="glass-panel py-16 px-4 rounded-2xl text-center">
            <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Opportunities Found</h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search criteria or filter, or be the first to post a new listing!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between glass-card-hover border border-white/5 relative overflow-hidden"
              >
                <div>
                  {/* Job Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      job.type === 'Internship'
                        ? 'text-pink-400 bg-pink-500/10 border-pink-500/20'
                        : job.type === 'Full-time'
                        ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {job.type}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Title & Company */}
                  <h3 className="text-lg font-bold text-white leading-tight">{job.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-slate-500" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {job.location}
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center gap-0.5 font-semibold text-emerald-400">
                        <DollarSign className="h-4 w-4" />
                        {job.salary_range}
                      </span>
                    )}
                  </div>

                  {/* Description & Requirements */}
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Description
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Key Requirements</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {job.requirements}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold text-slate-500">Referrer</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{job.poster_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{job.poster_role}</p>
                  </div>

                  <div className="flex gap-2">
                    {job.accepts_portal_applications === 1 ? (
                      currentUser?.role === 'student' ? (
                        appliedJobIds.includes(job.id) ? (
                          <span className="flex items-center gap-1 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg shrink-0">
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenApplyModal(job)}
                            className="flex items-center gap-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/10 shrink-0"
                          >
                            Apply on Portal
                          </button>
                        )
                      ) : (
                        <span className="text-[9px] px-2.5 py-1.5 bg-white/5 text-slate-400 font-medium rounded-lg border border-white/5 inline-block text-center shrink-0">
                          Portal Apply Enabled
                        </span>
                      )
                    ) : (
                      job.apply_link && (
                        <a
                          href={job.apply_link.startsWith('http') ? job.apply_link : `mailto:${job.apply_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/10 shrink-0"
                        >
                          Apply Now
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 sm:p-8 relative shadow-2xl">
            
            {/* Close Button */}
            <button
              onClick={() => { setShowModal(false); setError(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              Post Job / Internship
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Create a listing that will be visible to all portal students and alumni.
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

            <form onSubmit={handlePostJob} className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opportunity Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frontend Intern"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / Bangalore"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Job Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Salary / Stipend Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. $40k - $60k / ₹25k/mo"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Apply URL or Contact Email</label>
                  <input
                    type="text"
                    value={applyLink}
                    onChange={(e) => setApplyLink(e.target.value)}
                    placeholder="e.g. https://careers.co / careers@co.com"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="acceptsPortal"
                  checked={acceptsPortal}
                  onChange={(e) => setAcceptsPortal(e.target.checked)}
                  className="w-4.5 h-4.5 rounded bg-slate-950/40 border border-white/15 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="acceptsPortal" className="text-xs text-slate-300 font-semibold select-none cursor-pointer">
                  Accept applications directly through this portal
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Job Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Outline the role responsibilities..."
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Requirements / Candidate Profile *</label>
                <textarea
                  required
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows="2"
                  placeholder="Required skills, years of experience, or branches..."
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {modalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Post Listing'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            
            {/* Close */}
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              Apply for {selectedJob.title}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              at <span className="text-indigo-400 font-bold">{selectedJob.company}</span>
            </p>

            {applyError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
                {applyError}
              </div>
            )}
            {applySuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs">
                {applySuccess}
              </div>
            )}

            <form onSubmit={handleApplyJob} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Resume URL / Link *</label>
                <input
                  type="url"
                  required
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="e.g. https://drive.google.com/... or resume PDF link"
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Cover Letter / Pitch *</label>
                <textarea
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows="4"
                  placeholder="Introduce yourself and explain why you're a great fit for this position..."
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={applyLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {applyLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Application'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
