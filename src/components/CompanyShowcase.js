import React from 'react';

export default function CompanyShowcase() {
  const companies = [
    {
      name: 'Google',
      alumniCount: 25,
      logo: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
      ),
      borderColor: 'group-hover:border-blue-500/30',
      glowColor: 'bg-blue-500/5',
    },
    {
      name: 'Microsoft',
      alumniCount: 18,
      logo: (
        <svg viewBox="0 0 23 23" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022"/>
          <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7FBA00"/>
          <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00A4EF"/>
          <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900"/>
        </svg>
      ),
      borderColor: 'group-hover:border-cyan-500/30',
      glowColor: 'bg-cyan-500/5',
    },
    {
      name: 'Amazon',
      alumniCount: 22,
      logo: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 14c4 3.5 10.5 5.5 18 2" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/>
          <path d="M17.5 13.5l3 2 1.5 3.5" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 4c-3 0-5 1.5-5 4 0 2 1 3 3 3 2.5 0 3.5-1.2 4-2.8.4-1.6 0-4.2-2-4.2zm-.4 4.5c-.6 0-1.2-.4-1.2-1.2 0-.9.6-1.5 1.5-1.5.6 0 .9.4.9 1.1 0 .8-.6 1.6-1.2 1.6z" fill="#ffffff" opacity="0.9"/>
        </svg>
      ),
      borderColor: 'group-hover:border-amber-500/30',
      glowColor: 'bg-amber-500/5',
    },
    {
      name: 'Zoho',
      alumniCount: 15,
      logo: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#E62E2D"/>
          <rect x="14" y="2" width="8" height="8" rx="1.5" fill="#009FDE"/>
          <rect x="2" y="14" width="8" height="8" rx="1.5" fill="#F4B400"/>
          <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#00A65A"/>
        </svg>
      ),
      borderColor: 'group-hover:border-red-500/30',
      glowColor: 'bg-red-500/5',
    },
    {
      name: 'Infosys',
      alumniCount: 40,
      logo: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4h4v16H4V4zm6 0h4v10h-4V4zm0 12h4v4h-4v-4zm6-12h4v6h-4V4zm0 8h4v8h-4v-8z" fill="#007CC3"/>
        </svg>
      ),
      borderColor: 'group-hover:border-blue-400/30',
      glowColor: 'bg-blue-400/5',
    },
    {
      name: 'TCS',
      alumniCount: 55,
      logo: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12c4-6 8-6 12 0s4 6 8 0" stroke="#00B0F0" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M2 8c4-6 8-6 12 0s4 6 8 0" stroke="#0056B3" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
      ),
      borderColor: 'group-hover:border-sky-400/30',
      glowColor: 'bg-sky-400/5',
    },
    {
      name: 'Accenture',
      alumniCount: 28,
      logo: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4l10 8-10 8" stroke="#A100FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      borderColor: 'group-hover:border-purple-500/30',
      glowColor: 'bg-purple-500/5',
    },
    {
      name: 'Cognizant',
      alumniCount: 35,
      logo: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="#0033A0" strokeWidth="2.5" strokeDasharray="30 8"/>
          <circle cx="12" cy="12" r="5" fill="#00D2C4" opacity="0.8"/>
        </svg>
      ),
      borderColor: 'group-hover:border-teal-400/30',
      glowColor: 'bg-teal-400/5',
    },
  ];

  return (
    <div className="w-full my-16">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Our Alumni Network Powers Leading Companies
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Connecting students with professionals across top global organizations.
        </p>
      </div>

      {/* Grid of Company Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {companies.map((company, idx) => (
          <div
            key={idx}
            className={`group glass-panel p-6 rounded-2xl glass-card-hover flex flex-col items-center text-center relative overflow-hidden transition-all duration-300`}
          >
            {/* Soft light glow behind logo on card hover */}
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${company.glowColor}`} />
            
            {/* Logo container */}
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
              {company.logo}
            </div>

            {/* Info */}
            <h3 className="text-base font-bold text-white tracking-tight">{company.name}</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">{company.alumniCount} Alumni</p>
          </div>
        ))}
      </div>
    </div>
  );
}
