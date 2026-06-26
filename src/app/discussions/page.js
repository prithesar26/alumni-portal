'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  MessageSquare, User, Calendar, Tag, Search, Plus, 
  Send, X, Loader2, ArrowRight, BookOpen, AlertCircle 
} from 'lucide-react';

export default function Discussions() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Category & search filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modal / Thread Creation states
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Career Guidance');

  // Comment input state
  const [newComment, setNewComment] = useState('');
  const [postCommentLoading, setPostCommentLoading] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [categoryFilter]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const catQuery = categoryFilter !== 'All' ? `?category=${encodeURIComponent(categoryFilter)}` : '';
      const res = await fetch(`/api/discussions${catQuery}`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions);
        
        // Auto select first discussion if available and screen is desktop
        if (data.discussions.length > 0 && !selectedDiscussion) {
          handleSelectDiscussion(data.discussions[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching discussions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDiscussion = async (disc) => {
    setSelectedDiscussion(disc);
    setCommentsLoading(true);
    setComments([]);
    
    try {
      const res = await fetch(`/api/discussions/${disc.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Error fetching comments', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setModalLoading(true);

    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create discussion');

      setSuccess('Discussion thread created successfully!');
      setTitle('');
      setContent('');
      
      // Refresh discussions list
      await fetchDiscussions();

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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPostCommentLoading(true);
    try {
      const res = await fetch(`/api/discussions/${selectedDiscussion.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([...comments, data.comment]);
        setNewComment('');
        
        // Update comments count locally in thread list
        setDiscussions(prev => prev.map(d => {
          if (d.id === selectedDiscussion.id) {
            return { ...d, comment_count: (d.comment_count || 0) + 1 };
          }
          return d;
        }));
      }
    } catch (err) {
      console.error('Error posting comment', err);
    } finally {
      setPostCommentLoading(false);
    }
  };

  const categories = ['All', 'Career Guidance', 'Interview Prep', 'Higher Education', 'Technology Stacks', 'Campus Life'];
  
  const filteredDiscussions = discussions.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Q&A Knowledge sharing</h1>
            <p className="text-sm text-slate-400 mt-1">
              Ask career queries, search prep topics, and learn from corporate seniors.
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4.5 w-4.5" />
            Start Thread
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 border-b border-white/5 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setSelectedDiscussion(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer shrink-0 ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Split Pane Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 items-stretch">
          
          {/* LEFT: Topics Stream (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs mt-2">Loading threads...</p>
              </div>
            ) : filteredDiscussions.length === 0 ? (
              <div className="glass-panel p-8 rounded-xl text-center">
                <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No threads matching the category.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {filteredDiscussions.map((disc) => (
                  <button
                    key={disc.id}
                    onClick={() => handleSelectDiscussion(disc)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedDiscussion?.id === disc.id
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-white shadow-md'
                        : 'bg-slate-950/20 border-white/5 hover:border-white/10 hover:bg-slate-950/40 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {disc.category}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(disc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold leading-snug line-clamp-1">{disc.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{disc.content}</p>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        {disc.author_name}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                        {disc.comment_count || 0} answers
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Thread Detail & Answers View (3 Cols) */}
          <div className="lg:col-span-3">
            {selectedDiscussion ? (
              <div className="glass-panel p-6 rounded-2xl flex flex-col h-full justify-between space-y-6">
                
                {/* Header Information */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                        {selectedDiscussion.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(selectedDiscussion.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-extrabold text-white mt-4 leading-tight">
                    {selectedDiscussion.title}
                  </h2>

                  {/* Author Card info */}
                  <div className="flex items-center gap-3 mt-4 p-3 bg-slate-950/30 rounded-xl border border-white/5 w-fit">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {selectedDiscussion.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">{selectedDiscussion.author_name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 capitalize">
                        {selectedDiscussion.author_role} 
                        {selectedDiscussion.author_company ? ` at ${selectedDiscussion.author_company}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Content body */}
                  <p className="text-sm text-slate-300 leading-relaxed mt-6 whitespace-pre-line">
                    {selectedDiscussion.content}
                  </p>
                </div>

                {/* Answers / Comments Stream */}
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Responses & Discussion ({comments.length})
                  </h3>

                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-white/5 rounded-xl">
                      <p className="text-xs text-slate-500 italic">No responses yet. Be the first to answer!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      {comments.map((comm) => (
                        <div key={comm.id} className="p-3.5 bg-slate-950/20 border border-white/5 rounded-xl">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold text-white flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-400" />
                              {comm.author_name}
                              <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/5 text-indigo-400 border border-indigo-500/10">
                                {comm.author_role}
                              </span>
                            </span>
                            <span className="text-[8px] text-slate-500">
                              {new Date(comm.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{comm.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t border-white/5">
                  <input
                    type="text"
                    placeholder="Type your response or advice..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={postCommentLoading || !newComment.trim()}
                    className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                  >
                    {postCommentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>

              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center h-full text-center py-24">
                <BookOpen className="h-10 w-10 text-slate-600 mb-2" />
                <h3 className="text-sm font-bold text-white">Select a Topic</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Click on any discussion card in the left list stream to load details, answers, and replies.
                </p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Thread Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 sm:p-8 relative shadow-2xl">
            
            {/* Close */}
            <button
              onClick={() => { setShowModal(false); setError(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
              Start Discussion Thread
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Publish a question or request for info. It will be posted to the Q&A board.
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

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Topic / Question Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How to prepare for Stripe SWE hiring?"
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="Higher Education">Higher Education</option>
                  <option value="Technology Stacks">Technology Stacks</option>
                  <option value="Campus Life">Campus Life</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Detailed Content *</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="5"
                  placeholder="Write the full description, context, or code details of your query..."
                  className="w-full px-3 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {modalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Launch Thread'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
