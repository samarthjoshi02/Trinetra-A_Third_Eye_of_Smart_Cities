import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { CivicIssue, EmergencySOS } from '../context/AppContext';
import { LiveCityMap } from '../components/LiveCityMap';
import { 
  ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip 
} from 'recharts';
import { 
  ShieldAlert, Cpu, HelpCircle, 
  Send, Terminal, LogOut, CloudSun, Play 
} from 'lucide-react';

export const AdminCommandCenter: React.FC = () => {
  const { 
    user, logout, issues, emergencies, trafficReports, notifications, stats,
    updateIssueStatus, updateEmergencyStatus, predictTraffic, sendChatMessage 
  } = useApp();
  
  const navigate = useNavigate();

  // Selected elements for modal/details
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [, setSelectedEmergency] = useState<EmergencySOS | null>(null);
  
  // Dashboard Tabs: 'control' | 'issues' | 'emergencies' | 'traffic' | 'analytics' | 'ai'
  const [activeTab, setActiveTab] = useState<'control' | 'issues' | 'emergencies' | 'traffic' | 'analytics' | 'ai'>('control');
  
  // Traffic Predictor states
  const [predictArea, setPredictArea] = useState('Connaught Place Outer Circle');
  const [predictTime, setPredictTime] = useState('09:00');
  const [predictWeather, setPredictWeather] = useState('sunny');
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'system'; text: string }[]>([
    { sender: 'system', text: "Namaste Command Director! I am TRINETRA AI. I can compile live smart city metrics. Ask me about unresolved complaints, active SOS alerts, or traffic hotspots." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/citizen');
    }
  }, [user, navigate]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setPredictionResult(null);
    
    // Simulate thinking delay
    setTimeout(async () => {
      const result = await predictTraffic(predictArea, predictTime, predictWeather);
      setPredictionResult(result);
      setPredicting(false);
    }, 1500);
  };

  const handleSendChat = async (promptText?: string) => {
    const query = promptText || chatInput;
    if (!query.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!promptText) setChatInput('');
    setChatLoading(true);

    const response = await sendChatMessage(query);
    setChatMessages(prev => [...prev, { sender: 'system', text: response }]);
    setChatLoading(false);
  };

  // Recharts colors
  const CYAN_BLUE_COLORS = ['#00f2fe', '#4facfe', '#00ff87', '#f5a623', '#ff2a5f'];

  // Timers utility for active emergencies
  const calculateElapsedMinutes = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - created) / 60000);
    return diff > 0 ? `${diff}m ago` : 'just now';
  };

  return (
    <div className="min-h-screen bg-[#010108] text-gray-100 flex flex-col relative font-inter crt-scanlines">
      {/* Stars and Grid Background */}
      <div className="cyber-stars"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

      {/* Main Top Command Telemetry Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center border-b border-cyber-border/40 backdrop-blur-md bg-cyber-bg/25 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center shadow-cyber">
            <span className="font-orbitron font-black text-black text-lg">T</span>
          </div>
          <div>
            <h1 className="font-orbitron font-black text-lg text-white m-0 tracking-wider">TRINETRA COMMAND CORE</h1>
            <div className="flex items-center space-x-2 text-[8px] font-mono tracking-widest text-cyber-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse"></span>
              <span>OPERATOR STATUS: ONLINE // SYSTEM SECURED</span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex flex-wrap gap-2">
          {[
            { id: 'control', label: 'CONTROL ROOM' },
            { id: 'emergencies', label: 'TACTICAL SOS' },
            { id: 'issues', label: 'CIVIC BOARD' },
            { id: 'traffic', label: 'TRAFFIC INTEL' },
            { id: 'analytics', label: 'ANALYTICS' },
            { id: 'ai', label: 'TRINETRA AI' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded text-[10px] font-orbitron font-bold tracking-wider transition ${
                activeTab === tab.id
                  ? 'border border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                  : 'border border-cyber-border bg-black/40 text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Info / Log out */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right text-[10px] font-mono leading-tight">
              <span className="text-gray-400 block uppercase">Director ID</span>
              <span className="text-white font-bold">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded border border-cyber-red/20 text-cyber-red hover:bg-cyber-red/10 transition"
              title="Deactivate Operator Session"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {/* Top Statistics HUD Cards */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'ACTIVE SOS ALERTS',
            value: stats?.metrics.activeEmergencies ?? 0,
            color: 'text-cyber-red',
            border: 'border-t-cyber-red',
            glow: 'rgba(255,42,95,0.15)',
            status: 'URGENT DISPATCH'
          },
          {
            label: 'OPEN CIVIC ISSUES',
            value: stats?.metrics.openIssues ?? 0,
            color: 'text-cyber-cyan',
            border: 'border-t-cyber-cyan',
            glow: 'rgba(0,242,254,0.15)',
            status: 'AI ROUTED TELEMETRY'
          },
          {
            label: 'CONGESTED ROADWAYS',
            value: stats?.metrics.highTrafficZones ?? 0,
            color: 'text-cyber-gold',
            border: 'border-t-cyber-gold',
            glow: 'rgba(245,166,35,0.15)',
            status: 'PREDICTIONS RUNNING'
          },
          {
            label: 'DISPATCH RESPONSE RATE',
            value: `${stats?.metrics.averageResponseTimeMinutes ?? 12.5}m`,
            color: 'text-cyber-green',
            border: 'border-t-cyber-green',
            glow: 'rgba(0,255,135,0.15)',
            status: 'SECURE TIMERS STABLE'
          }
        ].map((kpi, idx) => (
          <div 
            key={idx} 
            className={`glass-card p-4 rounded-lg text-left relative overflow-hidden border-t-2 ${kpi.border}`}
            style={{ boxShadow: `0 8px 32px 0 ${kpi.glow}` }}
          >
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">{kpi.label}</span>
            <span className={`text-3xl font-orbitron font-extrabold my-1 block ${kpi.color}`}>
              {kpi.value}
            </span>
            <span className="text-[8px] font-mono text-gray-400 block uppercase">{kpi.status}</span>
          </div>
        ))}
      </section>

      {/* Main Container Workspace */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Workspace Panel: GIS Map Overlay & Live Incident Ticker (7 columns) */}
        {activeTab === 'control' && (
          <div className="lg:col-span-7 space-y-6">
            {/* GIS Live Map component */}
            <div className="h-[400px] relative">
              <LiveCityMap
                issues={issues}
                emergencies={emergencies}
                trafficReports={trafficReports}
                onSelectIssue={(issue) => {
                  setSelectedIssue(issue);
                  setActiveTab('issues');
                }}
                onSelectEmergency={(emergency) => {
                  setSelectedEmergency(emergency);
                  setActiveTab('emergencies');
                }}
              />
            </div>

            {/* Scrolling Incident Log Feed */}
            <div className="glass-card p-4 rounded-xl text-left">
              <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider mb-3 flex items-center space-x-2 border-b border-cyber-border pb-1.5">
                <Terminal className="h-4 w-4 text-cyber-cyan" />
                <span>COMMAND CENTER LIVE TICKER (MOCK AUDIT LOG)</span>
              </h3>

              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-600 font-mono py-2">System alert network idle.</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-2 rounded bg-black/40 border border-cyber-border/20 text-[10px] font-mono flex justify-between items-start space-x-4`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className={`h-1.5 w-1.5 rounded-full mt-1.5 ${
                          notif.type === 'emergency' ? 'bg-cyber-red animate-ping' :
                          notif.type === 'issue' ? 'bg-cyber-cyan' : 'bg-cyber-green'
                        }`}></span>
                        <span className="text-gray-300 leading-normal">{notif.message}</span>
                      </div>
                      <span className="text-gray-600 whitespace-nowrap">{calculateElapsedMinutes(notif.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Workspace Panel (or Full Panel depending on active tab) */}
        <div className={`flex flex-col ${activeTab === 'control' ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          
          {/* CONTROL TAB RIGHT COLUMN: Mini view showing Immediate Action Boards */}
          {activeTab === 'control' && (
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              
              {/* Mini SOS dispatch module */}
              <div className="glass-card p-5 rounded-xl text-left space-y-4 flex-grow">
                <div className="flex justify-between items-center border-b border-cyber-border pb-2">
                  <h4 className="font-orbitron font-bold text-xs text-white tracking-wider uppercase flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-cyber-red animate-pulse" />
                    <span>IMMEDIATE SOS DEPLOY BOARD</span>
                  </h4>
                  <span className="text-[8px] font-mono bg-cyber-red/10 border border-cyber-red/40 px-1.5 py-0.5 rounded text-cyber-red font-bold">CRITICAL</span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                  {emergencies.filter(e => e.status !== 'resolved').length === 0 ? (
                    <p className="text-xs text-gray-500 font-mono py-8 text-center">No active critical SOS signals detected.</p>
                  ) : (
                    emergencies.filter(e => e.status !== 'resolved').map((sos) => (
                      <div key={sos.id} className="p-3 bg-cyber-red/5 border border-cyber-red/20 rounded space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-cyber-red font-bold uppercase tracking-wider">{sos.type} SOS</span>
                          <span className="text-gray-500">{calculateElapsedMinutes(sos.createdAt)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono leading-snug">Zone: {sos.location.zone}</p>
                        
                        <div className="flex space-x-2 pt-1.5">
                          {sos.status === 'pending' && (
                            <button
                              onClick={() => updateEmergencyStatus(sos.id, 'accepted')}
                              className="px-2.5 py-1 bg-cyber-red/20 text-cyber-red border border-cyber-red/40 hover:bg-cyber-red/40 transition rounded text-[9px] font-mono font-bold"
                            >
                              [ACCEPT DEPLOYMENT]
                            </button>
                          )}
                          {sos.status === 'accepted' && (
                            <button
                              onClick={() => updateEmergencyStatus(sos.id, 'responding')}
                              className="px-2.5 py-1 bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 hover:bg-cyber-blue/40 transition rounded text-[9px] font-mono font-bold"
                            >
                              [DISPATCH RESPONSE TEAM]
                            </button>
                          )}
                          {sos.status === 'responding' && (
                            <button
                              onClick={() => updateEmergencyStatus(sos.id, 'resolved')}
                              className="px-2.5 py-1 bg-cyber-green/20 text-cyber-green border border-cyber-green/40 hover:bg-cyber-green/40 transition rounded text-[9px] font-mono font-bold"
                            >
                              [RESOLVE CASE]
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Mini Civic queue module */}
              <div className="glass-card p-5 rounded-xl text-left space-y-4 mt-6">
                <h4 className="font-orbitron font-bold text-xs text-white tracking-wider uppercase border-b border-cyber-border pb-2 flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-cyber-cyan" />
                  <span>PENDING CIVIC INTELLIGENCE REPORTS</span>
                </h4>

                <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1">
                  {issues.filter(i => i.status !== 'resolved').slice(0, 3).map((issue) => (
                    <div key={issue.id} className="p-2.5 bg-black/40 border border-cyber-border/20 rounded flex justify-between items-center">
                      <div className="space-y-0.5 truncate mr-3">
                        <span className="text-[10px] font-bold text-gray-200 block truncate">{issue.category.toUpperCase()} at {issue.location.zone.split(',')[0]}</span>
                        <span className="text-[8px] font-mono text-gray-500 uppercase">AI DETECTED CONFD: {issue.ai_confidence}% // PRIORITY: {issue.priority}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setActiveTab('issues');
                        }}
                        className="px-2 py-0.5 bg-cyber-cyan/15 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/30 transition rounded text-[8px] font-mono"
                      >
                        MANAGE
                      </button>
                    </div>
                  ))}
                  {issues.filter(i => i.status !== 'resolved').length > 3 && (
                    <button 
                      onClick={() => setActiveTab('issues')}
                      className="w-full text-center text-[9px] font-mono text-cyber-cyan hover:underline mt-1 block"
                    >
                      VIEW ALL PENDING ISSUES ({issues.filter(i => i.status !== 'resolved').length}) →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SOS TAB PANEL */}
          {activeTab === 'emergencies' && (
            <div className="glass-card p-6 rounded-xl text-left space-y-6">
              <h3 className="font-orbitron font-bold text-base text-white border-b border-cyber-border pb-2 uppercase tracking-widest flex justify-between items-center">
                <span>TACTICAL SOS EMERGENCY BOARD</span>
                <span className="text-xs font-mono text-cyber-red animate-pulse">ACTIVE FEED EN ROUTE</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-cyber-border text-gray-500 text-[10px] tracking-widest uppercase">
                      <th className="py-3 px-4 text-left">SOS ID</th>
                      <th className="py-3 px-4 text-left">INCIDENT TYPE</th>
                      <th className="py-3 px-4 text-left">ZONE LOCATION</th>
                      <th className="py-3 px-4 text-left">STATUS</th>
                      <th className="py-3 px-4 text-left">CREATION TIME</th>
                      <th className="py-3 px-4 text-left">DISPATCH ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-600">No emergency logs loaded in system memory.</td>
                      </tr>
                    ) : (
                      emergencies.map((sos) => (
                        <tr key={sos.id} className="border-b border-cyber-border/40 hover:bg-cyber-cyan/5 transition">
                          <td className="py-3.5 px-4 font-bold text-cyber-red">#SOS-{sos.id.substring(0, 4).toUpperCase()}</td>
                          <td className="py-3.5 px-4 font-bold text-white uppercase">{sos.type}</td>
                          <td className="py-3.5 px-4 text-gray-400">{sos.location.zone}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              sos.status === 'resolved' ? 'bg-green-950/80 text-cyber-green border border-green-900' :
                              sos.status === 'responding' ? 'bg-blue-950/80 text-cyber-blue border border-blue-900 animate-pulse' :
                              sos.status === 'accepted' ? 'bg-yellow-950/80 text-cyber-gold border border-yellow-900' :
                              'bg-red-950/80 text-cyber-red border border-red-900 animate-ping'
                            }`}>{sos.status}</span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">{new Date(sos.createdAt).toLocaleTimeString()}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex space-x-2">
                              {sos.status === 'pending' && (
                                <button
                                  onClick={() => updateEmergencyStatus(sos.id, 'accepted')}
                                  className="px-2 py-0.5 rounded bg-cyber-red/10 hover:bg-cyber-red/30 text-cyber-red border border-cyber-red/30 transition text-[9px]"
                                >
                                  Accept
                                </button>
                              )}
                              {sos.status === 'accepted' && (
                                <button
                                  onClick={() => updateEmergencyStatus(sos.id, 'responding')}
                                  className="px-2 py-0.5 rounded bg-cyber-blue/10 hover:bg-cyber-blue/30 text-cyber-blue border border-cyber-blue/30 transition text-[9px]"
                                >
                                  Deploy Crew
                                </button>
                              )}
                              {sos.status === 'responding' && (
                                <button
                                  onClick={() => updateEmergencyStatus(sos.id, 'resolved')}
                                  className="px-2 py-0.5 rounded bg-cyber-green/10 hover:bg-cyber-green/30 text-cyber-green border border-cyber-green/30 transition text-[9px]"
                                >
                                  Resolve Case
                                </button>
                              )}
                              {sos.status === 'resolved' && (
                                <span className="text-gray-600">[COMPLETED]</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CIVIC BOARD TAB PANEL */}
          {activeTab === 'issues' && (
            <div className="glass-card p-6 rounded-xl text-left space-y-6">
              <h3 className="font-orbitron font-bold text-base text-white border-b border-cyber-border pb-2 uppercase tracking-widest flex justify-between items-center">
                <span>CIVIC ISSUES MANAGEMENT BOARD</span>
                <span className="text-xs font-mono text-cyber-cyan">INTELLIGENCE LOGS ACTIVE</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-cyber-border text-gray-500 text-[10px] tracking-widest uppercase">
                      <th className="py-3 px-4 text-left">ISSUE ID</th>
                      <th className="py-3 px-4 text-left">CATEGORY</th>
                      <th className="py-3 px-4 text-left">DESCRIPTION</th>
                      <th className="py-3 px-4 text-left">ZONE AREA</th>
                      <th className="py-3 px-4 text-left">AI CONFIDENCE</th>
                      <th className="py-3 px-4 text-left">PRIORITY</th>
                      <th className="py-3 px-4 text-left">STATUS</th>
                      <th className="py-3 px-4 text-left">COMPLAINT STATE ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-600">No civic issues reported in active cache.</td>
                      </tr>
                    ) : (
                      issues.map((issue) => (
                        <tr key={issue.id} className={`border-b border-cyber-border/40 hover:bg-cyber-cyan/5 transition ${selectedIssue?.id === issue.id ? 'bg-cyber-cyan/5 border-l-2 border-l-cyber-cyan' : ''}`}>
                          <td className="py-3.5 px-4 font-bold text-cyber-cyan">#{issue.id.substring(0, 6).toUpperCase()}</td>
                          <td className="py-3.5 px-4 font-bold text-white uppercase">{issue.category}</td>
                          <td className="py-3.5 px-4 text-gray-300 max-w-xs truncate" title={issue.description}>{issue.description}</td>
                          <td className="py-3.5 px-4 text-gray-400">{issue.location.zone.split(',')[0]}</td>
                          <td className="py-3.5 px-4 text-cyber-cyan font-bold">{issue.ai_confidence}%</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              issue.priority === 'high' ? 'bg-red-950/40 text-cyber-red border border-red-900/60' :
                              issue.priority === 'medium' ? 'bg-yellow-950/40 text-cyber-gold border border-yellow-900/60' :
                              'bg-green-950/40 text-cyber-green border border-green-900/60'
                            }`}>{issue.priority}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              issue.status === 'resolved' ? 'bg-green-950/80 text-cyber-green border border-green-900' :
                              issue.status === 'in_progress' ? 'bg-yellow-950/80 text-cyber-gold border border-yellow-900' :
                              issue.status === 'under_review' ? 'bg-blue-950/80 text-cyber-blue border border-blue-900' :
                              'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}>{issue.status.replace('_', ' ')}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex space-x-2">
                              {issue.status === 'submitted' && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, 'under_review')}
                                  className="px-2 py-0.5 rounded bg-cyber-blue/10 hover:bg-cyber-blue/30 text-cyber-blue border border-cyber-blue/30 transition text-[9px]"
                                >
                                  Accept Review
                                </button>
                              )}
                              {issue.status === 'under_review' && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, 'in_progress')}
                                  className="px-2 py-0.5 rounded bg-cyber-gold/10 hover:bg-cyber-gold/30 text-cyber-gold border border-cyber-gold/30 transition text-[9px]"
                                >
                                  Assign Crew
                                </button>
                              )}
                              {issue.status === 'in_progress' && (
                                <button
                                  onClick={() => updateIssueStatus(issue.id, 'resolved')}
                                  className="px-2 py-0.5 rounded bg-cyber-green/10 hover:bg-cyber-green/30 text-cyber-green border border-cyber-green/30 transition text-[9px]"
                                >
                                  Resolve Issue
                                </button>
                              )}
                              {issue.status === 'resolved' && (
                                <span className="text-gray-600">[SOLVED]</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TRAFFIC INTEL TAB PANEL */}
          {activeTab === 'traffic' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Forecast controls (4 cols) */}
              <div className="lg:col-span-4 glass-card p-5 rounded-xl text-left space-y-4">
                <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider border-b border-cyber-border pb-2 flex items-center space-x-2">
                  <CloudSun className="h-5 w-5 text-cyber-cyan" />
                  <span>CONGESTION PREDICTOR</span>
                </h3>

                <form onSubmit={handlePredict} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Arterial Area Zone</label>
                    <select
                      value={predictArea}
                      onChange={(e) => setPredictArea(e.target.value)}
                      className="w-full glass-input p-2.5 rounded text-xs"
                    >
                      <option value="Connaught Place Outer Circle">Connaught Place, Delhi</option>
                      <option value="Indiranagar 100 Feet Road">Indiranagar, Bengaluru</option>
                      <option value="BKC G-Block Highway">Bandra Kurla Complex, Mumbai</option>
                      <option value="Hitech City Flyover">Hitech City, Hyderabad</option>
                      <option value="EM Bypass Salt Lake">Salt Lake, Kolkata</option>
                      <option value="T Nagar flyover junction">T Nagar, Chennai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Simulation Hour</label>
                    <input
                      type="time"
                      value={predictTime}
                      onChange={(e) => setPredictTime(e.target.value)}
                      className="w-full glass-input p-2.5 rounded text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Weather Status</label>
                    <select
                      value={predictWeather}
                      onChange={(e) => setPredictWeather(e.target.value)}
                      className="w-full glass-input p-2.5 rounded text-xs uppercase"
                    >
                      <option value="sunny">Sunny / Normal</option>
                      <option value="rainy">Heavy Rain / Monsoon</option>
                      <option value="foggy">Dense Fog / Winter Smog</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={predicting}
                    className="btn-cyan w-full py-2.5 rounded text-xs font-bold font-orbitron tracking-widest uppercase flex items-center justify-center space-x-2"
                  >
                    <span>{predicting ? 'RUNNING FORECAST...' : 'EXECUTE PREDICTION'}</span>
                    {!predicting && <Play className="h-4.5 w-4.5 text-black" />}
                  </button>
                </form>
              </div>

              {/* Right Column: Prediction HUD Displays (8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div className="glass-card p-5 rounded-xl text-left space-y-4 flex-grow flex flex-col justify-center">
                  {predictionResult ? (
                    <div className="space-y-6 animate-pulse-slow">
                      <div className="border-b border-cyber-border pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-orbitron font-black text-lg text-white uppercase">{predictionResult.area}</h4>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">ANALYSIS COMPLETE // ROUTE OPTIMIZATION STABLE</span>
                        </div>
                        <span className={`px-4 py-1.5 rounded-lg text-xs font-bold font-orbitron tracking-wider uppercase border ${
                          predictionResult.congestion === 'High' ? 'bg-red-950/80 text-cyber-red border-red-900 shadow-redGlow' :
                          predictionResult.congestion === 'Medium' ? 'bg-yellow-950/80 text-cyber-gold border-yellow-900 shadow-goldGlow' :
                          'bg-green-950/80 text-cyber-green border-green-900 shadow-greenGlow'
                        }`}>{predictionResult.congestion} CONGESTION</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Gauge */}
                        <div className="p-4 bg-black/40 border border-cyber-border rounded-lg text-center space-y-2">
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-bold">GRID ACCIDENT RISK GRADE</span>
                          <span className={`text-4xl font-orbitron font-extrabold block ${
                            predictionResult.risk_score >= 70 ? 'text-cyber-red' :
                            predictionResult.risk_score >= 40 ? 'text-cyber-gold' : 'text-cyber-green'
                          }`}>{predictionResult.risk_score}%</span>
                          <span className="text-[8px] font-mono text-gray-400 uppercase">Based on environmental variables</span>
                        </div>

                        {/* Alternate Route Suggestion */}
                        <div className="p-4 bg-black/40 border border-cyber-border rounded-lg text-left flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-cyber-cyan uppercase tracking-widest block font-bold mb-1">SUGGESTED ALTERNATE ROUTE</span>
                            <p className="text-sm font-semibold text-white leading-relaxed font-orbitron">{predictionResult.alternate_route}</p>
                          </div>
                          <span className="text-[8px] font-mono text-gray-500 uppercase mt-2">Diverting traffic sensors... done.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-2">
                      <HelpCircle className="h-10 w-10 text-gray-600 mx-auto animate-bounce" />
                      <p className="text-xs text-gray-500 font-mono uppercase">Enter prediction criteria and compile simulation.</p>
                    </div>
                  )}
                </div>

                {/* Sub-grid of past reports */}
                <div className="glass-card p-4 rounded-xl text-left mt-6">
                  <span className="text-[10px] font-orbitron font-bold text-white uppercase tracking-wider block mb-3 border-b border-cyber-border pb-1">RECENT CONGESTION REPORTS</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {trafficReports.slice(0, 3).map((report, idx) => (
                      <div key={idx} className="p-2 bg-black/40 border border-cyber-border/20 rounded flex justify-between items-center text-[9px] font-mono">
                        <div className="truncate mr-2">
                          <span className="text-gray-300 font-bold block truncate">{report.area.split(',')[0]}</span>
                          <span className="text-[8px] text-gray-500 block uppercase">TIME: {report.time}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          report.congestion === 'High' ? 'text-cyber-red bg-red-950/40' :
                          report.congestion === 'Medium' ? 'text-cyber-gold bg-yellow-950/40' : 'text-cyber-green bg-green-950/40'
                        }`}>{report.congestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB PANEL */}
          {activeTab === 'analytics' && (
            <div className="glass-card p-6 rounded-xl text-left space-y-6">
              <h3 className="font-orbitron font-bold text-base text-white border-b border-cyber-border pb-2 uppercase tracking-widest">
                SYSTEM TELEMETRY GRAPHICS & ANALYTICS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Chart 1: Issue Distribution */}
                <div className="p-4 bg-black/40 border border-cyber-border rounded-lg space-y-3">
                  <h4 className="font-orbitron text-xs font-bold text-cyber-cyan uppercase tracking-wider">CIVIC ISSUE CATEGORY SENSORS</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.charts.issueDistribution ?? []}>
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#08081c', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#fff' }} />
                        <Bar dataKey="value" fill="#4facfe" radius={[4, 4, 0, 0]}>
                          {(stats?.charts.issueDistribution ?? []).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CYAN_BLUE_COLORS[index % CYAN_BLUE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Emergency SOS distribution */}
                <div className="p-4 bg-black/40 border border-cyber-border rounded-lg space-y-3">
                  <h4 className="font-orbitron text-xs font-bold text-cyber-red uppercase tracking-wider">CRITICAL EMERGENCY SOS RADAR FREQUENCY</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.charts.emergencyDistribution ?? []}>
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#08081c', border: '1px solid rgba(255, 42, 95, 0.3)', color: '#fff' }} />
                        <Bar dataKey="value" fill="#ff2a5f" radius={[4, 4, 0, 0]}>
                          {(stats?.charts.emergencyDistribution ?? []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Fire' ? '#f5a623' : entry.name === 'Crime' ? '#a855f7' : '#ff2a5f'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRINETRA AI CHAT TAB PANEL */}
          {activeTab === 'ai' && (
            <div className="glass-card p-6 rounded-xl text-left space-y-4 flex flex-col h-[520px]">
              <h3 className="font-orbitron font-bold text-base text-white border-b border-cyber-border pb-2 uppercase tracking-widest flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-cyber-cyan" />
                <span>TRINETRA AI SYSTEM TERMINAL</span>
              </h3>

              {/* Chat Log container */}
              <div className="flex-grow overflow-y-auto space-y-3 p-3 bg-black/60 border border-cyber-border/40 rounded-lg min-h-[300px] text-xs font-mono">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`p-2.5 rounded max-w-[85%] leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-cyber-cyan/15 border border-cyber-cyan/35 text-cyber-cyan ml-auto' 
                        : 'bg-cyber-card border border-cyber-border/30 text-gray-300 mr-auto'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-gray-500 block uppercase mb-1">
                      {msg.sender === 'user' ? 'OPERATOR CLIENT QUERY' : 'TRINETRA COGNITIVE RESPONSE'}
                    </span>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="p-2.5 rounded bg-cyber-card border border-cyber-border/30 text-cyber-cyan mr-auto animate-pulse max-w-[50%]">
                    <span className="text-[9px] font-bold text-gray-500 block uppercase mb-1">TRINETRA COGNITIVE RESPONSE</span>
                    <span>COMPILING TELEMETRY PARAMETERS...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Clickable Quick queries */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Suggested Telemetry Queries:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Show unresolved complaints.",
                    "Show emergency hotspots.",
                    "Display high congestion zones.",
                    "Show today's analytics."
                  ].map((queryText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChat(queryText)}
                      className="px-2.5 py-1 bg-cyber-cyan/5 hover:bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/20 rounded transition text-[9px] font-mono"
                    >
                      &gt; {queryText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                className="flex items-center space-x-2 pt-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask TRINETRA AI (e.g. show emergency hotspots)..."
                  className="flex-grow glass-input py-2.5 px-4 rounded text-xs font-mono"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 rounded bg-cyber-cyan text-black hover:bg-cyber-cyan/80 transition flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
