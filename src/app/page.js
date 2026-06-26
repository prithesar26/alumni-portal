import Link from 'next/link';
import { GraduationCap, ArrowRight, Briefcase, Users, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import StatsDashboard from '@/components/StatsDashboard';
import CompanyShowcase from '@/components/CompanyShowcase';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Header */}
      <header className="px-4 lg:px-8 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-indigo-400" />
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
            AlumniNexus
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            Join Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center">
        {/* Glow ambient */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Tagline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-6">
          <Zap className="h-3 w-3" />
          Connecting Campus and Corporate
        </div>

        {/* Hero title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Unlock the Power of Your{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
            College Network
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Bridging the gap between students and senior alumni. Share career advice, mentorship requests, discussions, and discover jobs or internship opportunities.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3.5 text-base font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 group cursor-pointer"
          >
            Get Started as Student
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3.5 text-base font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white rounded-xl transition-all cursor-pointer"
          >
            Register as Alumni
          </Link>
        </div>

        {/* Statistics Dashboard Section */}
        <StatsDashboard />

        {/* Company Showcase Section */}
        <CompanyShowcase />

        {/* Features grid */}
        <div className="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl text-left hover:border-indigo-500/30 transition-all duration-300">
            <div className="p-3 bg-indigo-500/10 rounded-xl w-fit mb-5">
              <Briefcase className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Jobs & Internships</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Post and discover exclusive professional job positions and internships. Directly apply or ask referrers for support.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-left hover:border-purple-500/30 transition-all duration-300">
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-5">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Mentorship Network</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Directly find and send mentorship requests to alumni working at top tech, consulting, and finance corporations.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-left hover:border-pink-500/30 transition-all duration-300">
            <div className="p-3 bg-pink-500/10 rounded-xl w-fit mb-5">
              <MessageSquare className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Knowledge Discussions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Start discussion threads on interview prep, career choices, research paths, or general technology stacks.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 w-full py-10 border-t border-b border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white">2,500+</h4>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Active Alumni</p>
          </div>
          <div>
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white">400+</h4>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Companies Represented</p>
          </div>
          <div>
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white">850+</h4>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Internships Posted</p>
          </div>
          <div>
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white">96%</h4>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Success Match Rate</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-600 border-t border-white/5">
        &copy; {new Date().getFullYear()} AlumniNexus Portal. Crafted with passion for student-alumni networking.
      </footer>
    </div>
  );
}
