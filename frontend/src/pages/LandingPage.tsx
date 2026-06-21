import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, AlertTriangle, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#02020a] overflow-hidden flex flex-col font-inter">
      {/* Space Starfield Effect */}
      <div className="cyber-stars"></div>

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

      {/* Futuristic Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-cyber-border/40 backdrop-blur-md bg-cyber-bg/20">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center shadow-cyber">
            <span className="font-orbitron font-extrabold text-black text-lg">T</span>
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-lg text-white leading-tight tracking-wider m-0">TRINETRA</h1>
            <p className="text-[9px] font-mono tracking-widest text-cyber-cyan">THE THIRD EYE OF SMART CITIES</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-1.5 rounded text-xs font-mono font-semibold border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 transition"
          >
            SYS.LOGIN // REGISTER
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center py-16">
        {/* Glow Telemetry Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/5 border border-cyber-cyan/25 mb-6 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan"></span>
          <span className="text-[10px] font-mono tracking-wider text-cyber-cyan uppercase">AI Smart City Operations Core Active</span>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl md:text-7xl font-orbitron font-black tracking-tight text-white mb-2 uppercase">
          TRINETRA
        </h1>
        <p className="text-sm md:text-base font-mono text-cyber-cyan tracking-[0.3em] uppercase mb-8">
          Predict. Protect. Prosper.
        </p>

        {/* Hero Description */}
        <p className="max-w-2xl text-gray-400 text-sm md:text-base leading-relaxed mb-10">
          An advanced, AI-powered Smart City Operating System integrating computer vision civic issue scanning, 
          predictive traffic congestion algorithms, real-time emergency SOS coordination, and dynamic 
          cognitive NLP analytics. Built for modern futuristic command centers.
        </p>

        {/* Launch Portals */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
          <button 
            onClick={() => navigate('/login?role=admin')}
            className="btn-cyan px-8 py-3 rounded-lg flex items-center justify-center space-x-3 text-sm tracking-wide font-orbitron"
          >
            <span>LAUNCH COMMAND CENTER</span>
            <Activity className="h-4 w-4" />
          </button>
          <button 
            onClick={() => navigate('/login?role=citizen')}
            className="px-8 py-3 rounded-lg bg-cyber-bg/60 border border-cyber-cyan/35 text-cyber-cyan hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition duration-300 flex items-center justify-center space-x-3 text-sm font-semibold tracking-wide font-orbitron"
          >
            <span>ACCESS CITIZEN PORTAL</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl">
          {[
            { label: 'AVG RESPONSE TIME', value: '12.5 MIN', desc: 'CRITICAL EVENT DISPATCH' },
            { label: 'PREDICTIVE ACCURACY', value: '94.8%', desc: 'AI TRAFFIC FORECASTING' },
            { label: 'CIVIC RESOLUTION RATE', value: '98.2%', desc: 'MUNICIPAL PROGRESS' },
            { label: 'ACTIVE EMERGENCY FEED', value: 'REAL-TIME', desc: 'SOS ALERTS LOGGED' }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-4 rounded-lg text-left relative overflow-hidden border-t-2 border-t-cyber-cyan/40">
              <p className="text-[9px] font-mono text-gray-500 tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-orbitron font-extrabold text-white mb-1">{stat.value}</h3>
              <p className="text-[8px] font-mono text-cyber-cyan/70 tracking-wide uppercase">{stat.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Platform Features Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-cyber-border/30">
        <h2 className="text-center font-orbitron font-extrabold text-3xl tracking-wider text-white mb-4 uppercase">
          SYSTEM MODULES & ARCHITECTURE
        </h2>
        <p className="text-center text-xs font-mono text-cyber-cyan uppercase tracking-widest mb-12">
          Integrated Command Modules
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-6 rounded-lg glass-card-hover text-left">
            <div className="h-10 w-10 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center mb-4 text-cyber-cyan">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">AI CIVIC DETECTION</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automated municipal threat analysis. Simulates computer vision models scan uploaded citizen reports, 
              instantly categorizing severity, identifying potholes, garbage dumps, water leaks, and mapping GPS tags.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-6 rounded-lg glass-card-hover text-left">
            <div className="h-10 w-10 rounded bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center mb-4 text-cyber-blue">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">TRAFFIC FORECASTING</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Predictive road networks grid calculations. Evaluates location metrics, temporal variables, 
              and weather index coefficients to predict congestions, output risk grades, and route alternate pathways.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-6 rounded-lg glass-card-hover text-left">
            <div className="h-10 w-10 rounded bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center mb-4 text-cyber-red">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">SOS COMMAND CENTER</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Direct emergency mobilization pipeline. Enables citizens to trigger medical, fire, crime, or accident alarms 
              instantly, sending geolocation tags and spawning response timers to dispatch active service operators.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Workflow Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 border-t border-cyber-border/30 bg-cyber-bg/30 backdrop-blur-sm">
        <h2 className="text-center font-orbitron font-extrabold text-2xl tracking-wider text-white mb-12 uppercase">
          OPERATIONAL COMMAND PIPELINE
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
          {[
            { step: '01', title: 'CITIZEN SOS', desc: 'SOS alert triggered with live coordinates.' },
            { step: '02', title: 'ALARM EMITTED', desc: 'Real-time alert hits command console.' },
            { step: '03', title: 'DISPATCH ASSIGNED', desc: 'Administrator directs localized responder team.' },
            { step: '04', title: 'CASE RESOLVED', desc: 'Telemetry dashboard status updates automatically.' }
          ].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="glass-card p-5 rounded-lg flex-1 text-left border-l-2 border-l-cyber-cyan relative">
                <span className="absolute right-4 top-2 font-orbitron font-black text-2xl text-cyber-cyan/10">{item.step}</span>
                <h4 className="font-orbitron font-bold text-sm text-white mb-1 tracking-wider">{item.title}</h4>
                <p className="text-[11px] text-gray-400">{item.desc}</p>
              </div>
              {idx < 3 && <div className="hidden md:block text-cyber-cyan font-mono animate-pulse">➔</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-8 border-t border-cyber-border/20 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono">
          <p>© 2026 TRINETRA Command and Control Portal. Government of India - Municipal Administration.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-cyber-cyan transition cursor-pointer">SECURE TELEMETRY</span>
            <span className="hover:text-cyber-cyan transition cursor-pointer">SYSTEM STATS: STABLE</span>
            <span className="hover:text-cyber-cyan transition cursor-pointer">API ENGINE v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
