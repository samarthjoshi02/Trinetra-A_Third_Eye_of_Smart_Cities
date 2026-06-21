import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, User, Lock, Mail, ChevronRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, error, user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Pre-fill role from search query if provided
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin' || roleParam === 'citizen') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthLoading(true);

    if (!email || !password || (isRegistering && !name)) {
      setLocalError("Please fill out all credentials.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        const success = await register(name, email, role, password);
        if (success) {
          // Auto login after registering
          const loginSuccess = await login(email, password);
          if (loginSuccess) {
            navigate(role === 'admin' ? '/admin' : '/citizen');
          }
        }
      } else {
        const loginSuccess = await login(email, password);
        if (loginSuccess) {
          navigate(role === 'admin' ? '/admin' : '/citizen');
        }
      }
    } catch (err: any) {
      setLocalError(err.message || "Authentication process failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#02020a] overflow-hidden flex items-center justify-center font-inter p-4">
      {/* Background stars */}
      <div className="cyber-stars"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-blue shadow-cyber mb-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-orbitron font-black text-black text-xl">T</span>
          </div>
          <h2 className="font-orbitron font-extrabold text-2xl tracking-wider text-white uppercase">TRINETRA PORTAL</h2>
          <p className="text-[10px] font-mono tracking-widest text-cyber-cyan">IDENTITY & ACCESS MANAGEMENT CONSOLE</p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card p-8 rounded-xl shadow-cyber border-t-4 border-t-cyber-cyan/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-gray-600">SECURE SHELL v1.42</div>

          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('citizen')}
              className={`p-3 rounded border text-center transition flex flex-col items-center justify-center ${
                role === 'citizen'
                  ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                  : 'border-cyber-border bg-black/40 text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              <User className="h-5 w-5 mb-1" />
              <span className="font-orbitron text-xs font-bold tracking-wider">CITIZEN</span>
              <span className="text-[8px] font-mono opacity-60">PORTAL</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-3 rounded border text-center transition flex flex-col items-center justify-center ${
                role === 'admin'
                  ? 'border-cyber-blue bg-cyber-blue/10 text-cyber-blue shadow-[0_0_10px_rgba(79,172,254,0.15)]'
                  : 'border-cyber-border bg-black/40 text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              <Shield className="h-5 w-5 mb-1" />
              <span className="font-orbitron text-xs font-bold tracking-wider">ADMIN</span>
              <span className="text-[8px] font-mono opacity-60">COMMAND CENTER</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Display Errors */}
            {(localError || error) && (
              <div className="p-3 bg-cyber-red/10 border border-cyber-red/35 rounded text-xs text-cyber-red font-mono leading-relaxed">
                [ACCESS ERROR]: {localError || error}
              </div>
            )}

            {/* Name field for registration */}
            {isRegistering && (
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">User Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full glass-input py-2.5 pl-10 pr-4 rounded text-sm"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Terminal Identity (Email)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@trinetra.gov.in"
                  className="w-full glass-input py-2.5 pl-10 pr-4 rounded text-sm"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Access Passcode</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input py-2.5 pl-10 pr-4 rounded text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className={`w-full py-3 rounded text-sm font-bold font-orbitron tracking-wider flex items-center justify-center space-x-2 transition ${
                role === 'admin' ? 'btn-cyan' : 'btn-cyan'
              } ${authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{authLoading ? 'COMPILING SECURITY...' : isRegistering ? 'EXECUTE REGISTRATION' : 'EXECUTE AUTHENTICATION'}</span>
              {!authLoading && <ChevronRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Toggle register */}
          <div className="mt-6 pt-4 border-t border-cyber-border/30 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-mono text-cyber-cyan hover:underline hover:text-white transition"
            >
              {isRegistering
                ? '← BACK TO SYSTEM LOGIN CONSOLE'
                : 'CREATE SECURE CITIZEN TELEMETRY ACCOUNT →'}
            </button>
          </div>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-4 p-3 glass-card rounded text-[9px] font-mono text-gray-500 text-left space-y-1">
          <div className="text-cyber-cyan font-bold uppercase tracking-wider mb-1">[DEMO TELEMETRY ACCESS CREDENTIALS]</div>
          <div>• Administrator: <span className="text-gray-300">admin@trinetra.gov.in</span> / <span className="text-gray-300">admin123</span></div>
          <div>• Citizen Account: <span className="text-gray-300">citizen@trinetra.gov.in</span> / <span className="text-gray-300">citizen123</span></div>
        </div>
      </div>
    </div>
  );
};
