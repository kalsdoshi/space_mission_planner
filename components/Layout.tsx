
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Rocket, Activity, Database, Sun, Moon, LogOut, User, Command, Cpu, MessageSquare, Info, Orbit } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { UserProfile } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    user: UserProfile | null;
    onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Mission Architect', path: '/', icon: <Rocket className="w-4 h-4" /> },
    { name: 'Maneuver Lab', path: '/simulator', icon: <Orbit className="w-4 h-4" /> },
    { name: 'Flight Recorder', path: '/recorder', icon: <Activity className="w-4 h-4" /> },
    { name: 'Mission Assistant', path: '/assistant', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Data Replay', path: '/replay', icon: <Database className="w-4 h-4" /> },
    { name: 'Program Overview', path: '/about', icon: <Info className="w-4 h-4" /> },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300">
      
      {/* Background Ambience Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden text-slate-900 dark:text-slate-100">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-brand-500/10 dark:bg-brand-400/5 blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-500/10 dark:bg-indigo-400/5 blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 relative z-20 flex flex-col border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/40 backdrop-blur-2xl transition-all shadow-xl dark:shadow-none">
        <div className="p-8 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center shadow-lg dark:shadow-2xl dark:shadow-brand-500/30 ring-1 ring-white/20">
                <Command className="w-7 h-7 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase">Stelris</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-600 dark:text-brand-500 font-black mt-2">Flight Ops v2.1</p>
            </div>
          </div>
        </div>
        
        {/* User Status */}
        <div className="mx-6 mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-brand-300 border border-slate-200 dark:border-white/10 shadow-sm">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#020617]"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-slate-900 dark:text-white truncate">{user.callsign}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <Cpu className="w-3 h-3 text-brand-600 dark:text-brand-500" />
                        <div className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-400 tracking-widest uppercase">{user.clearanceLevel} ACCESS</div>
                    </div>
                </div>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-10 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4 text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-500 font-black opacity-50">Interface Modules</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 shadow-sm dark:shadow-[0_0_20px_rgba(14,165,233,0.1)]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-950 dark:hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10 flex items-center gap-4">
                      <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-600 dark:text-brand-500' : ''}`}>{item.icon}</span>
                      <span className="font-bold text-sm tracking-wide">{item.name}</span>
                  </span>
                  {/* Active Indicator Line */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-brand-500 rounded-r-full transition-all duration-500 shadow-[0_0_15px_#0ea5e9] ${
                      isActive ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                  }`}></div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200 dark:border-white/5 space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Atmosphere</span>
                <button 
                    onClick={toggleTheme}
                    className="p-3 rounded-xl bg-white dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:bg-brand-500/10 hover:text-brand-600 transition-all border border-slate-200 dark:border-transparent hover:border-brand-500/30 shadow-sm dark:shadow-none"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
             </div>
             
             <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 text-xs font-black tracking-[0.2em] text-slate-600 hover:text-red-600 py-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-red-50 hover:border-red-500/40 transition-all group shadow-sm active:scale-95"
             >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> TERMINATE SESSION
             </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative z-10 scroll-smooth custom-scrollbar">
        <div className="container mx-auto p-10 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};
