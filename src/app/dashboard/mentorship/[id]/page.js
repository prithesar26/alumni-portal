'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  MessageSquare, Video, Send, Clock, CheckCircle, 
  Calendar, ArrowLeft, BookOpen, Sparkles, AlertCircle, 
  User, Mail, GraduationCap, Briefcase, Plus, CheckSquare 
} from 'lucide-react';

export default function MentorshipWorkspace() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [connection, setConnection] = useState(null);
  const [chats, setChats] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chat input
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef(null);

  // Meeting scheduler form
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [schedulingMeeting, setSchedulingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState('');

  // Alumni completion feedback form
  const [activeFeedbackMeetingId, setActiveFeedbackMeetingId] = useState(null);
  const [sessionFeedback, setSessionFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Initial fetch
    fetchWorkspaceData();
    fetchCurrentUser();

    // Polling chat every 3 seconds for near-real-time chat feel
    const chatInterval = setInterval(fetchChatsOnly, 3000);
    // Polling meetings every 10 seconds
    const meetingsInterval = setInterval(fetchMeetingsOnly, 10000);

    return () => {
      clearInterval(chatInterval);
      clearInterval(meetingsInterval);
    };
  }, [id]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching current user', err);
    }
  };

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const [connRes, chatRes, meetRes] = await Promise.all([
        fetch(`/api/mentorship/${id}`),
        fetch(`/api/mentorship/${id}/chat`),
        fetch(`/api/mentorship/${id}/meetings`)
      ]);

      if (connRes.ok && chatRes.ok && meetRes.ok) {
        const connData = await connRes.json();
        const chatData = await chatRes.json();
        const meetData = await meetRes.json();

        setConnection(connData.request);
        setChats(chatData.chats || []);
        setMeetings(meetData.meetings || []);
      } else {
        console.error('Failed to fetch some workspace resources');
      }
    } catch (err) {
      console.error('Error loading workspace data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatsOnly = async () => {
    try {
      const res = await fetch(`/api/mentorship/${id}/chat`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error('Error polling chat messages', err);
    }
  };

  const fetchMeetingsOnly = async () => {
    try {
      const res = await fetch(`/api/mentorship/${id}/meetings`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error('Error polling meetings', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/mentorship/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });

      if (res.ok) {
        const data = await res.json();
        setChats(prev => [...prev, data.chat]);
        setMessageText('');
      }
    } catch (err) {
      console.error('Error sending chat message', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingTime || schedulingMeeting) return;

    setSchedulingMeeting(true);
    setMeetingError('');

    try {
      const res = await fetch(`/api/mentorship/${id}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meetingTitle,
          meetingTime: meetingTime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule session');

      setMeetings(prev => [data.meeting, ...prev]);
      setMeetingTitle('');
      setMeetingTime('');
    } catch (err) {
      setMeetingError(err.message);
    } finally {
      setSchedulingMeeting(false);
    }
  };

  const handleCompleteMeeting = async (meetingId) => {
    if (!sessionFeedback.trim() || submittingFeedback) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/mentorship/${id}/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meetingId,
          status: 'completed',
          feedback: sessionFeedback
        })
      });

      if (res.ok) {
        setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: 'completed', feedback: sessionFeedback } : m));
        setActiveFeedbackMeetingId(null);
        setSessionFeedback('');
      }
    } catch (err) {
      console.error('Error completing meeting session', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to cancel this meeting session?')) return;

    try {
      const res = await fetch(`/api/mentorship/${id}/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meetingId,
          status: 'cancelled'
        })
      });

      if (res.ok) {
        setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: 'cancelled' } : m));
      }
    } catch (err) {
      console.error('Error cancelling meeting session', err);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-semibold">Opening Connection Workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  const isStudent = currentUser?.role === 'student';
  const partnerName = isStudent ? connection?.alumni_name : connection?.student_name;
  const partnerRole = isStudent ? 'Alumnus Mentor' : 'Student Mentee';
  const partnerCompany = isStudent ? connection?.alumni_company : null;
  const partnerBranch = !isStudent ? connection?.student_branch : null;

  return (
    <div className="min-h-screen bg-transparent flex flex-col pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Workspace Navigation & Summary Header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl"></div>
            
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-xl shrink-0">
                {partnerName?.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Mentorship Workspace</span>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5">
                  Session with {partnerName}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {partnerRole} {partnerCompany ? `at ${partnerCompany}` : partnerBranch ? `(${partnerBranch})` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-left md:text-right text-xs text-slate-500 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-6 shrink-0">
              <p className="font-bold text-slate-400 flex items-center md:justify-end gap-1"><BookOpen className="h-3.5 w-3.5" /> Topic: {connection?.topic}</p>
              <p className="mt-1">Established: {new Date(connection?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Mentorship Intention & Request Details Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-950/20">
          <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 mb-4">
            <Sparkles className="h-4 w-4" />
            Mentorship Request Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Purpose of Mentoring</p>
              <p className="font-semibold text-white mt-1">{connection?.purpose || 'General guidance'}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-4">Expected Career Goal</p>
              <p className="font-semibold text-indigo-300 mt-1">{connection?.expected_career_goal || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Mentee Introduction Note</p>
              <p className="text-xs leading-relaxed italic text-slate-400 mt-1">"{connection?.message}"</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Session Discussion Questions</p>
              <p className="text-xs leading-relaxed text-slate-300 mt-1 whitespace-pre-line">{connection?.questions || 'No specific questions added'}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 mt-4">Preferred Time Slot</p>
              <p className="text-xs text-amber-400 font-semibold mt-1">🕒 {connection?.preferred_time ? formatTime(connection.preferred_time) : 'Flexible slot'}</p>
            </div>
          </div>
        </div>

        {/* Two-Panel Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 items-stretch">
          
          {/* Left Panel - Private Chat (3 cols) */}
          <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col overflow-hidden h-[600px] border border-white/5">
            {/* Chat Panel Header */}
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40 shrink-0">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
                Discussion Chatroom
              </h3>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Secure Workspace
              </span>
            </div>

            {/* Chat Room Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-slate-950/10">
              {chats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No messages exchanged yet.</p>
                  <p className="text-[10px] mt-1 max-w-[250px]">Introduce yourself, ask your doubts, or coordinate on scheduling a meeting slot!</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const isOwn = chat.sender_id === currentUser?.id;
                  return (
                    <div
                      key={chat.id}
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold text-slate-500">
                        <span>{chat.sender_name}</span>
                        <span className="text-[8px] uppercase tracking-wider bg-white/5 px-1 rounded">
                          {chat.sender_role}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{chat.message}</p>
                      </div>
                      <span className="text-[8px] text-slate-600 mt-1">
                        {formatTime(chat.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-950/40 flex gap-2.5 shrink-0">
              <input
                type="text"
                placeholder="Type your question or coordinator message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={sendingMsg}
                className="flex-1 px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sendingMsg}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/25 shrink-0 flex items-center justify-center"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {/* Right Panel - Meetings Scheduler & Session History (2 cols) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between h-[600px] min-h-0">
            
            {/* Meeting Scheduler Box (Only if not completing feedback) */}
            <div className="glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/5 flex-1 min-h-0">
              
              {/* Box Title */}
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40 shrink-0">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Video className="h-4.5 w-4.5 text-indigo-400" />
                  Video Consultations
                </h3>
              </div>

              {/* Box Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0 bg-slate-950/10">
                
                {/* Feedback writing state */}
                {activeFeedbackMeetingId ? (
                  <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-xl space-y-3 animate-fadeIn">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                      Save Session History & Notes
                    </h4>
                    <p className="text-xs text-slate-400">
                      Write advice, summaries, or action plans for your mentee. Marking this session as completed will log it permanently.
                    </p>
                    <textarea
                      rows="4"
                      value={sessionFeedback}
                      onChange={(e) => setSessionFeedback(e.target.value)}
                      placeholder="Write session advice, feedback, or recommended goals..."
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setActiveFeedbackMeetingId(null); setSessionFeedback(''); }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCompleteMeeting(activeFeedbackMeetingId)}
                        disabled={!sessionFeedback.trim() || submittingFeedback}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        {submittingFeedback ? 'Saving...' : 'Complete & Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Meeting Scheduler Form (Student role matches best, but we allow both) */
                  <form onSubmit={handleScheduleMeeting} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3.5">
                    <h4 className="font-bold text-xs text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                      <Plus className="h-4 w-4 text-indigo-400" />
                      Schedule Next Session
                    </h4>
                    
                    {meetingError && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-[10px]">
                        {meetingError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Meeting Topic (e.g. Resume Review Session)"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          required
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={schedulingMeeting}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
                        >
                          {schedulingMeeting ? 'Scheduling...' : 'Schedule'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Meetings List / History */}
                <div className="space-y-3.5">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Scheduled Slots & Sessions</h4>
                  {meetings.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <Calendar className="h-6 w-6 mx-auto mb-1.5 opacity-45" />
                      <p className="text-[11px]">No consultations scheduled yet.</p>
                    </div>
                  ) : (
                    meetings.map((meet) => (
                      <div
                        key={meet.id}
                        className={`p-3.5 border rounded-xl flex flex-col gap-2 ${
                          meet.status === 'completed'
                            ? 'bg-emerald-950/5 border-emerald-500/10'
                            : meet.status === 'cancelled'
                            ? 'bg-slate-950/40 border-white/5 opacity-50'
                            : 'bg-indigo-950/5 border-indigo-500/10'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="font-bold text-xs text-white">{meet.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              🕒 {formatTime(meet.meeting_time)}
                            </p>
                          </div>
                          <span
                            className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                              meet.status === 'completed'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : meet.status === 'cancelled'
                                ? 'text-slate-400 bg-white/5'
                                : 'text-indigo-400 bg-indigo-500/10'
                            }`}
                          >
                            {meet.status}
                          </span>
                        </div>

                        {/* Meeting Actions */}
                        {meet.status === 'scheduled' && (
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <a
                              href={meet.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-indigo-500/10"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Join Call
                            </a>
                            
                            {!isStudent && (
                              <button
                                onClick={() => {
                                  setActiveFeedbackMeetingId(meet.id);
                                  setSessionFeedback('');
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}

                            <button
                              onClick={() => handleCancelMeeting(meet.id)}
                              className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-650 text-rose-400 hover:text-white border border-rose-500/15 hover:border-rose-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Feedback Display */}
                        {meet.status === 'completed' && meet.feedback && (
                          <div className="mt-1.5 p-2 bg-slate-950/40 border border-white/5 rounded-lg">
                            <p className="text-[8px] uppercase font-bold text-slate-500">Mentor's Feedback & Advice Notes</p>
                            <p className="text-[10px] text-slate-300 mt-1 leading-relaxed italic">
                              "{meet.feedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
