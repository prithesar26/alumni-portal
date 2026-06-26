'use client';

import { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, ShieldCheck, Zap, MessageSquare, 
  CheckCircle, Clock, Award, Briefcase, FileText, 
  Building, Calendar, Flame, TrendingUp
} from 'lucide-react';

export default function StatsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const statsData = await res.json();
          setData(statsData);
        }
      } catch (err) {
        console.error('Error fetching live stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    // 5-second polling interval for real-time updates
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: 'Total Students',
      value: loading ? '...' : (data?.totalStudents ?? 0).toLocaleString(),
      icon: GraduationCap,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      badge: 'Active profiles',
    },
    {
      label: 'Registered Alumni',
      value: loading ? '...' : (data?.totalAlumni ?? 0).toLocaleString(),
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      badge: 'Senior network',
    },
    {
      label: 'Verified Alumni',
      value: loading ? '...' : (data?.verifiedAlumni ?? 0).toLocaleString(),
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      badge: 'Verified credentials',
    },
    {
      label: 'Active Mentors',
      value: loading ? '...' : (data?.activeMentors ?? 0).toLocaleString(),
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      badge: 'Ready to guide',
    },
    {
      label: 'Total Mentorship Requests',
      value: loading ? '...' : (data?.totalMentorshipRequests ?? 0).toLocaleString(),
      icon: MessageSquare,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      badge: 'Interactions',
    },
    {
      label: 'Accepted Requests',
      value: loading ? '...' : (data?.acceptedMentorshipRequests ?? 0).toLocaleString(),
      icon: CheckCircle,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      badge: 'Ongoing sessions',
    },
    {
      label: 'Pending Requests',
      value: loading ? '...' : (data?.pendingMentorshipRequests ?? 0).toLocaleString(),
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      badge: 'Awaiting reply',
    },
    {
      label: 'Completed Sessions',
      value: loading ? '...' : (data?.completedMentorshipSessions ?? 0).toLocaleString(),
      icon: Award,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      badge: 'Success stories',
    },
    {
      label: 'Total Job Posts',
      value: loading ? '...' : (data?.totalJobPosts ?? 0).toLocaleString(),
      icon: Briefcase,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      badge: 'Career paths',
    },
    {
      label: 'Internship Posts',
      value: loading ? '...' : (data?.totalInternshipPosts ?? 0).toLocaleString(),
      icon: Flame,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      badge: 'Early starts',
    },
    {
      label: 'Applications Submitted',
      value: loading ? '...' : (data?.totalApplications ?? 0).toLocaleString(),
      icon: FileText,
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/10',
      badge: 'Active candidates',
    },
    {
      label: 'Students Placed',
      value: loading ? '...' : (data?.studentsPlaced ?? 0).toLocaleString(),
      icon: TrendingUp,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      badge: 'Success placements',
    },
    {
      label: 'Active Companies',
      value: loading ? '...' : (data?.activeCompanies ?? 0).toLocaleString(),
      icon: Building,
      color: 'text-fuchsia-400',
      bgColor: 'bg-fuchsia-500/10',
      badge: 'Partner networks',
    },
    {
      label: 'Upcoming Events',
      value: loading ? '...' : (data?.upcomingEvents ?? 0).toLocaleString(),
      icon: Calendar,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      badge: 'Seminars & Mixers',
    },
  ];

  return (
    <div className="w-full my-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
        <h2 className="text-xl font-extrabold text-white tracking-tight">Live Portal Statistics</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group glass-panel p-6 rounded-2xl glass-card-hover flex flex-col justify-between relative overflow-hidden transition-all duration-300"
            >
              {/* Subtle light glow behind icon on card hover */}
              <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${stat.bgColor}`} />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.badge}</span>
                <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-0.5">
                  Live
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
