import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, ChevronRight, UserPlus, Orbit, Terminal, Lock, Cpu } from 'lucide-react';
import { UserProfile, StoredUser } from '../types';
import { dbService } from '../services/dbService';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [callsign, setCallsign] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [stars, setStars] = useState<{x: number, y: number, s: number, d: number}[]>([]);

  useEffect(() => {
    const s = Array.from({length: 80}).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 1.5 + 0.5,
      d: Math.random() * 8 + 4
    }));
    setStars(s);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (accessCode !== confirmCode) { setError('TOKENS MISMATCH'); return; }
    if (accessCode.length < 4) { setError('SECURITY DEPTH INSUFFICIENT'); return; }
    setLoading(true);
    const result = await dbService.registerUser({
        callsign: callsign.toUpperCase(),
        accessCode: accessCode,
        clearanceLevel: 'L1',
        registeredAt: new Date().toISOString()
    });
    setLoading(false);
    if (result.success) {
        setSuccess('BIOMETRIC RECORD CREATED');
        setTimeout(() => { setMode('LOGIN'); setAccessCode(''); setConfirmCode(''); setSuccess(''); }, 1500);
    } else { setError(result.message); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await dbService.authenticateUser(callsign.toUpperCase(), accessCode);
    setLoading(false);
    if (result.success && result.user) {
        onLogin({ callsign: result.user.callsign, clearanceLevel: result.user.clearanceLevel, isLoggedIn: true });
    } else { setError(result.message || 'ACCESS DENIED'); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Background Starfield */}
      {stars.map((star, i) => (
         <div key={i} className="absolute bg-white rounded-full opacity-20 animate-pulse"
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.s}px`, height: `${star.s}px`, animationDuration: `${star.d}s` }}
         />
      ))}
      
      {/* Mesh Gradients */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-brand-900/10 rounded-full blur-[160px] pointer-events-none opacity-50"></div>
      <div className="absolute top-[-20%] left-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none opacity-40"></div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Cinematic Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
             <div className="relative inline-block mb-8 group">
                <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-10 rounded-full group-hover:opacity-20 transition-all duration-700"></div>
                <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto relative overflow-hidden shadow-2xl transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                    <Orbit className="w-14 h-14 text-brand-400 animate-spin-slow" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                </div>
             </div>
             <h1 className="text-5xl font-black text-white tracking-[0.4em] font-sans uppercase mb-4">SLS<span className="text-brand-500">COMMAND</span></h1>
             <div className="flex items-center justify-center gap-6">
                 <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-500/50"></div>
                 <p className="text-brand-500/60 text-xs tracking-[0.6em] font-black uppercase">Core Flight Systems Terminal</p>
                 <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-500/50"></div>
             </div>
        </div>

        {/* Authentication Core Card */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-1.5 rounded-[2.5rem] shadow-3xl relative overflow-hidden group">
             {/* Dynamic Scan Line */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-30 animate-scan"></div>

             <div className="bg-[#050b1a]/80 rounded-[2.2rem] p-12 border border-white/5 relative overflow-hidden">
                {/* HUD Elements */}
                <div className="absolute top-6 right-6 opacity-20"><Cpu className="w-12 h-12 text-brand-500" /></div>
                
                {/* Logic Toggle */}
                <div className="flex mb-12 bg-black/50 rounded-2xl p-1.5 border border-white/5 shadow-inner">
                    <button onClick={() => { setMode('LOGIN'); setError(''); setSuccess(''); }}
                        className={`flex-1 py-3 text-[10px] font-black tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-3 uppercase ${mode === 'LOGIN' ? 'bg-brand-600 text-white shadow-xl shadow-brand-900/40' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Shield className="w-4 h-4" /> AUTHORIZE
                    </button>
                    <button onClick={() => { setMode('REGISTER'); setError(''); setSuccess(''); }}
                        className={`flex-1 py-3 text-[10px] font-black tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-3 uppercase ${mode === 'REGISTER' ? 'bg-brand-600 text-white shadow-xl shadow-brand-900/40' : 'text-slate-500 hover:text-slate-300'}`}>
                        <UserPlus className="w-4 h-4" /> ENROLL
                    </button>
                </div>

                <form onSubmit={mode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black ml-2">Ident Callsign</label>
                        <div className="relative">
                            <input type="text" value={callsign} onChange={(e) => setCallsign(e.target.value)}
                                className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-5 px-6 text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all pl-14 font-mono uppercase tracking-[0.2em] placeholder-slate-800"
                                placeholder="PILOT_ID" required />
                            <Terminal className="w-5 h-5 text-slate-700 absolute left-5 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black ml-2">Access Fragment</label>
                         <div className="relative">
                            <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-5 px-6 text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all pl-14 font-mono tracking-widest placeholder-slate-800"
                                placeholder="••••••••" required />
                            <Lock className="w-5 h-5 text-slate-700 absolute left-5 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {mode === 'REGISTER' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
                            <label className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black ml-2">Verify Fragment</label>
                             <div className="relative">
                                <input type="password" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-white/5 rounded-2xl py-5 px-6 text-white focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all pl-14 font-mono tracking-widest placeholder-slate-800"
                                    placeholder="••••••••" required />
                                <Fingerprint className="w-5 h-5 text-slate-700 absolute left-5 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-black tracking-widest py-4 px-5 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                             {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest py-4 px-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                             {success}
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-brand-700 to-indigo-700 hover:from-brand-600 hover:to-indigo-600 text-white font-black text-xs tracking-[0.4em] py-5 rounded-2xl transition-all flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-50 mt-10 shadow-2xl shadow-brand-500/20 uppercase">
                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? 'SEQUENCING...' : (mode === 'LOGIN' ? 'INITIALIZE UPLINK' : 'REGISTER PERSONNEL')} 
                            {!loading && <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </button>
                </form>
             </div>
        </div>
        
        {/* Footer HUD Labels */}
        <div className="mt-12 flex flex-wrap justify-center gap-10 text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div> CRYPTO NOMINAL</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-500 rounded-full shadow-[0_0_5px_#0ea5e9]"></div> LINK ENCRYPTED</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_#f59e0b]"></div> ESD-30000 AUTH</span>
        </div>
      </div>
    </div>
  );
};