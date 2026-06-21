import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  AlertOctagon, AlertTriangle, Upload, 
  Activity, LogOut, ChevronRight 
} from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const { 
    user, logout, issues, trafficReports, reportIssue, triggerSOS 
  } = useApp();
  
  const navigate = useNavigate();

  // Form states
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState('Connaught Place, Delhi');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // AI Simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    detected: string;
    confidence: number;
    priority: string;
  } | null>(null);

  // SOS States
  const [activeSOS, setActiveSOS] = useState<{
    id: string;
    type: string;
    seconds: number;
  } | null>(null);
  
  const sosTimerRef = useRef<any>(null);

  // Force login redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle SOS ticking timer
  useEffect(() => {
    if (activeSOS) {
      sosTimerRef.current = setInterval(() => {
        setActiveSOS(prev => {
          if (!prev) return null;
          return { ...prev, seconds: prev.seconds + 1 };
        });
      }, 1000);
    } else {
      if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    }

    return () => {
      if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    };
  }, [activeSOS]);

  // Format SOS timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Image Upload handler simulating AI detection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      
      // Trigger simulated AI Scan
      setIsScanning(true);
      setScanResult(null);
      
      setTimeout(() => {
        setIsScanning(false);
        // Calculate mock stats
        const categoriesMap: Record<string, { detected: string; priority: string }> = {
          pothole: { detected: "ROAD PAVEMENT DEPRESSION (POTHOLE)", priority: "HIGH" },
          garbage: { detected: "SOLID MUNICIPAL WASTE OVERFLOW", priority: "MEDIUM" },
          water: { detected: "HIGH-PRESSURE WATER LINE RUPTURE", priority: "HIGH" },
          streetlight: { detected: "NON-FUNCTIONAL LIGHTING INFRASTRUCTURE", priority: "LOW" },
          road: { detected: "STRUCTURAL PAVEMENT DISPLACEMENT", priority: "MEDIUM" }
        };
        
        const scanDetails = categoriesMap[category] || { detected: "CIVIC INFRASTRUCTURE ISSUE", priority: "MEDIUM" };
        
        setScanResult({
          detected: scanDetails.detected,
          confidence: roundNum(92.5 + Math.random() * 5.4),
          priority: scanDetails.priority
        });
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const roundNum = (num: number) => Math.round(num * 10) / 10;

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    // Get coordinates based on zone selection
    const zoneCoords: Record<string, { lat: number; lng: number }> = {
      "Connaught Place, Delhi": { lat: 28.6304, lng: 77.2177 },
      "Indiranagar, Bengaluru": { lat: 12.9719, lng: 77.6412 },
      "Bandra Kurla Complex, Mumbai": { lat: 19.0607, lng: 72.8633 },
      "Hitech City, Hyderabad": { lat: 17.4483, lng: 78.3741 },
      "Salt Lake, Kolkata": { lat: 22.5802, lng: 88.4273 },
      "T Nagar, Chennai": { lat: 13.0405, lng: 80.2337 }
    };
    const coords = zoneCoords[zone] || { lat: 12.9719, lng: 77.6412 };

    const success = await reportIssue(
      category,
      description,
      imageUrl,
      zone,
      coords.lat + (Math.random() * 0.005 - 0.0025),
      coords.lng + (Math.random() * 0.005 - 0.0025)
    );

    if (success) {
      setDescription('');
      setImageUrl(null);
      setScanResult(null);
      alert("Civic complaint registered successfully. AI telemetry routed to municipal center.");
    }
  };

  const handleSOSActivation = async (type: 'medical' | 'fire' | 'accident' | 'crime') => {
    // Determine random coordinates around Bengaluru or selected zone
    const lat = 12.9719 + (Math.random() * 0.02 - 0.01);
    const lng = 77.6412 + (Math.random() * 0.02 - 0.01);

    const sos = await triggerSOS(type, "Indiranagar Command Radius", lat, lng);
    if (sos) {
      setActiveSOS({
        id: sos.id,
        type: type,
        seconds: 0
      });
    }
  };

  const handleSOSDeactivate = () => {
    setActiveSOS(null);
  };

  // Filter complaints logged by current user
  const userIssues = issues.filter(issue => issue.reported_by === user?.email);

  return (
    <div className="min-h-screen bg-[#02020a] text-gray-100 flex flex-col relative font-inter">
      {/* Background Starfield */}
      <div className="cyber-stars"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-cyber-border/40 backdrop-blur-md bg-cyber-bg/20">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center shadow-cyber">
            <span className="font-orbitron font-extrabold text-black text-base">T</span>
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-base text-white m-0 tracking-wider">TRINETRA</h1>
            <p className="text-[8px] font-mono tracking-widest text-cyber-cyan">CITIZEN MUNICIPAL PORTAL</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{user.name}</p>
              <p className="text-[9px] font-mono text-cyber-cyan tracking-wider">ID: {user.email}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded border border-cyber-red/20 text-cyber-red hover:bg-cyber-red/10 transition"
              title="Log Out Terminal"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {/* Main Grid */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: SOS Activation & Report Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Card 1: Critical SOS Alerter */}
          <div className="glass-card p-6 rounded-xl border border-cyber-red/35 shadow-[0_0_15px_rgba(255,42,95,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-cyber-red animate-pulse">EMERGENCY CORE // ACTIVE</div>
            
            <h3 className="font-orbitron font-bold text-lg text-white mb-2 tracking-wider flex items-center space-x-2">
              <AlertOctagon className="h-5 w-5 text-cyber-red" />
              <span>EMERGENCY SOS COORDINATION</span>
            </h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              If you are witnessing a life-threatening crisis, click below. This will capture your exact coordinates,
              transmit an alert to the Admin Command Control center instantly, and dispatch emergency response assets.
            </p>

            {activeSOS ? (
              <div className="p-6 bg-cyber-red/10 border border-cyber-red rounded-lg flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-cyber-red flex items-center justify-center sos-pulse shadow-redGlow">
                  <AlertOctagon className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <h4 className="font-orbitron font-black text-xl text-cyber-red tracking-wider">SOS METRICS: ACTIVE</h4>
                  <p className="text-xs font-mono text-gray-400 mt-1 uppercase">Dispatch teams tracking beacon coords</p>
                </div>
                {/* Reaction Timer */}
                <div className="px-6 py-2 bg-black/60 rounded border border-cyber-red/50 text-center font-mono">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block">RESPONSE DISPATCH TIMER</span>
                  <span className="text-2xl font-bold text-white tracking-widest">{formatTimer(activeSOS.seconds)}</span>
                </div>
                <button
                  onClick={handleSOSDeactivate}
                  className="px-6 py-1.5 rounded text-xs font-mono font-bold border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/20 transition"
                >
                  [DEACTIVATE BEACON ALARM]
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { type: 'medical', label: 'MEDICAL', color: 'btn-red' },
                  { type: 'fire', label: 'FIRE ALARM', color: 'btn-red' },
                  { type: 'accident', label: 'ACCIDENT', color: 'btn-red' },
                  { type: 'crime', label: 'CRIME DEPT', color: 'btn-red' }
                ].map((sosItem) => (
                  <button
                    key={sosItem.type}
                    onClick={() => handleSOSActivation(sosItem.type as any)}
                    className="btn-red py-4 px-2 rounded-lg flex flex-col items-center justify-center tracking-wider text-xs font-orbitron"
                  >
                    <AlertTriangle className="h-5 w-5 mb-1.5 text-white" />
                    <span>{sosItem.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Report Civic Issue Form */}
          <div className="glass-card p-6 rounded-xl relative">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-cyber-cyan">SCANNER SYS // ACTIVE</div>

            <h3 className="font-orbitron font-bold text-lg text-white mb-6 tracking-wider flex items-center space-x-2">
              <Activity className="h-5 w-5 text-cyber-cyan" />
              <span>REPORT CIVIC ISSUE // AI DETECTION</span>
            </h3>

            <form onSubmit={handleIssueSubmit} className="space-y-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full glass-input p-2.5 rounded text-xs uppercase"
                  >
                    <option value="pothole">Pothole</option>
                    <option value="garbage">Garbage Overflow</option>
                    <option value="water">Water Leakage</option>
                    <option value="streetlight">Broken Streetlight</option>
                    <option value="road">Road Damage</option>
                  </select>
                </div>

                {/* Zone Coordinates Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Reporting Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full glass-input p-2.5 rounded text-xs"
                  >
                    <option value="Connaught Place, Delhi">Connaught Place, Delhi</option>
                    <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
                    <option value="Bandra Kurla Complex, Mumbai">Bandra Kurla Complex, Mumbai</option>
                    <option value="Hitech City, Hyderabad">Hitech City, Hyderabad</option>
                    <option value="Salt Lake, Kolkata">Salt Lake, Kolkata</option>
                    <option value="T Nagar, Chennai">T Nagar, Chennai</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Incident Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe details of the issue (e.g. leaking main pipe near junction)"
                  className="w-full glass-input p-3 rounded text-xs h-20 resize-none"
                  required
                />
              </div>

              {/* Image Upload / AI Simulator */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Upload Scan Photo</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-cyber-border rounded-lg cursor-pointer bg-black/40 hover:bg-cyber-cyan/5 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-6 w-6 text-gray-500 mb-2" />
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wide">Select scan image</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>

                  {/* Picture Preview and Scanner simulation */}
                  <div className="w-full h-32 border border-cyber-border rounded-lg bg-black/80 flex items-center justify-center relative overflow-hidden">
                    {imageUrl ? (
                      <div className="relative w-full h-full">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        
                        {isScanning && (
                          <div className="absolute inset-0 bg-cyber-cyan/10">
                            <div className="scanner-bar"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-orbitron text-[9px] font-bold text-cyber-cyan tracking-wider bg-black/85 px-2 py-1 rounded animate-pulse border border-cyber-cyan">AI INFERENCE PROCESSING...</span>
                            </div>
                          </div>
                        )}

                        {scanResult && !isScanning && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/85 p-2 border-t border-cyber-cyan/35 text-[9px] font-mono text-left space-y-0.5">
                            <div className="text-cyber-green font-bold flex items-center justify-between">
                              <span>AI SCAN COMPLETED</span>
                              <span>{scanResult.confidence}%</span>
                            </div>
                            <div className="text-gray-300 font-semibold truncate">{scanResult.detected}</div>
                            <div className="text-gray-500 flex justify-between">
                              <span>Severity Priority:</span>
                              <span className={`font-bold ${
                                scanResult.priority === 'HIGH' ? 'text-cyber-red' :
                                scanResult.priority === 'MEDIUM' ? 'text-cyber-gold' : 'text-cyber-cyan'
                              }`}>{scanResult.priority}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono text-gray-600 uppercase">NO PHOTO CONTEXT</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isScanning}
                className="btn-cyan w-full py-3 rounded text-xs font-bold font-orbitron tracking-widest uppercase flex items-center justify-center space-x-2"
              >
                <span>ROUTE TELEMETRY TO COMMAND CENTER</span>
                <ChevronRight className="h-4 w-4 text-black" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Track Ticket Feed & Traffic Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Section 1: Quick Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-lg text-left">
              <span className="text-[8px] font-mono text-gray-500 block uppercase">YOUR FILED COMPLAINTS</span>
              <span className="text-xl font-orbitron font-extrabold text-white mt-1 block">{userIssues.length}</span>
            </div>
            <div className="glass-card p-4 rounded-lg text-left">
              <span className="text-[8px] font-mono text-gray-500 block uppercase">RESOLVED ALERTS</span>
              <span className="text-xl font-orbitron font-extrabold text-cyber-green mt-1 block">
                {userIssues.filter(i => i.status === 'resolved').length}
              </span>
            </div>
          </div>

          {/* Section 2: Complaint Timeline Tracking Feed */}
          <div className="glass-card p-5 rounded-xl text-left space-y-4">
            <h4 className="font-orbitron font-bold text-sm text-white tracking-wider uppercase border-b border-cyber-border pb-2">
              COMPLAINTS TELEMETRY LOGS
            </h4>

            {userIssues.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono py-4">No active civic tickets logged from this device terminal.</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {userIssues.map((issue) => (
                  <div key={issue.id} className="p-3 bg-black/40 border border-cyber-border/40 rounded space-y-2.5">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-cyber-cyan font-bold">#{issue.id.substring(0, 6).toUpperCase()}</span>
                      <span className="text-gray-500">{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="text-xs">
                      <div className="font-semibold text-white uppercase text-[10px] tracking-wide">{issue.category}</div>
                      <p className="text-gray-400 text-[11px] mt-0.5">{issue.description}</p>
                    </div>

                    {/* Step Timeline Indicator */}
                    <div className="grid grid-cols-4 gap-1 text-center text-[7px] font-mono relative">
                      {[
                        { key: 'submitted', label: 'SUBMITTED' },
                        { key: 'under_review', label: 'REVIEW' },
                        { key: 'in_progress', label: 'RESOLVING' },
                        { key: 'resolved', label: 'COMPLETED' }
                      ].map((step, idx) => {
                        const statusWeights: Record<string, number> = {
                          submitted: 1,
                          under_review: 2,
                          in_progress: 3,
                          resolved: 4
                        };
                        const activeWeight = statusWeights[issue.status] || 1;
                        const stepWeight = idx + 1;
                        const isDone = stepWeight <= activeWeight;

                        return (
                          <div key={step.key} className="space-y-1">
                            <div className={`h-1.5 w-full rounded-sm ${isDone ? 'bg-cyber-cyan shadow-[0_0_5px_rgba(0,242,254,0.5)]' : 'bg-gray-800'}`}></div>
                            <span className={isDone ? 'text-cyber-cyan font-bold' : 'text-gray-600'}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Live Traffic updates indicator */}
          <div className="glass-card p-5 rounded-xl text-left space-y-4">
            <h4 className="font-orbitron font-bold text-sm text-white tracking-wider uppercase border-b border-cyber-border pb-2">
              NEIGHBORHOOD TRAFFIC FLOWS
            </h4>
            <div className="space-y-2">
              {trafficReports.slice(0, 4).map((report, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-black/40 border border-cyber-border/20 rounded">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-300 block leading-tight">{report.area}</span>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">WEATHER: {report.weather} // ROUTE: {report.alternate_route}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    report.congestion === 'High' ? 'bg-red-950/80 text-cyber-red border border-red-900 shadow-redGlow' :
                    report.congestion === 'Medium' ? 'bg-yellow-950/80 text-cyber-gold border border-yellow-900 shadow-goldGlow' :
                    'bg-green-950/80 text-cyber-green border border-green-900 shadow-greenGlow'
                  }`}>{report.congestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
