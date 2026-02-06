
import React, { useState } from 'react';
import { Shield, Target, Zap, Rocket, Info, ChevronRight, Cpu, Globe, X, ExternalLink, Activity, Thermometer, Gauge, BookOpen, Code } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [modal, setModal] = useState<'diagrams' | 'specs' | null>(null);

  const SpecModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Shield className="w-40 h-40 text-brand-500" />
        </div>
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Technical Specifications</h3>
            <p className="text-brand-600 dark:text-brand-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Document Ref: NASA ESD 30000</p>
          </div>
          <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-brand-600">
                <Gauge className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Axial Load Limit</span>
              </div>
              <div className="text-2xl font-black text-slate-950 dark:text-white">4.1 G</div>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-bold">Structural Integration Constraint</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lateral Load Limit</span>
              </div>
              <div className="text-2xl font-black text-slate-950 dark:text-white">0.5 G</div>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-bold">Payload Fairing Envelope</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <Thermometer className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Thermal Window</span>
              </div>
              <div className="text-2xl font-black text-slate-950 dark:text-white">6°F - 130°F</div>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-bold">Avionics Operating Range</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <Rocket className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">C3 Energy (Mars)</span>
              </div>
              <div className="text-2xl font-black text-slate-950 dark:text-white">15 km²/s²</div>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-bold">Hyperbolic Excess Velocity</p>
            </div>
          </div>
          
          <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-2xl p-6 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
            Note: All mission parameters must be validated against these program constants before commit. Violations will trigger an automated No-Go sequence in the Architect module.
          </div>
        </div>
      </div>
    </div>
  );

  const DiagramModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden flex flex-col h-[80vh]">
        <div className="flex justify-between items-start mb-8 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Vehicle Stack Visualization</h3>
            <p className="text-brand-600 dark:text-brand-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">NASA Space Launch System - Block 1B/2</p>
          </div>
          <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex gap-10 overflow-hidden">
          <div className="w-32 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-white/5 p-4 flex flex-col items-center justify-end relative shrink-0">
             <div className="w-12 h-16 bg-brand-500/20 rounded-t-full mb-1 border border-brand-500/30"></div> 
             <div className="w-16 h-24 bg-brand-500/40 border border-brand-500/50 mb-1 relative"> 
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-brand-950 dark:text-white/50 rotate-90 whitespace-nowrap uppercase">UPPER STAGE</div>
             </div>
             <div className="w-20 h-64 bg-orange-500/40 border border-orange-500/50 relative"> 
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-orange-950 dark:text-white/50 rotate-90 whitespace-nowrap uppercase">CORE STAGE</div>
                <div className="absolute -left-6 bottom-0 w-6 h-48 bg-slate-200 dark:bg-slate-400/40 rounded-full border border-slate-300 dark:border-white/10 shadow-sm"></div> 
                <div className="absolute -right-6 bottom-0 w-6 h-48 bg-slate-200 dark:bg-slate-400/40 rounded-full border border-slate-300 dark:border-white/10 shadow-sm"></div> 
             </div>
             <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 flex justify-around p-1"> 
                <div className="w-3 h-4 bg-orange-600 rounded-b-sm animate-pulse"></div>
                <div className="w-3 h-4 bg-orange-600 rounded-b-sm animate-pulse"></div>
                <div className="w-3 h-4 bg-orange-600 rounded-b-sm animate-pulse"></div>
                <div className="w-3 h-4 bg-orange-600 rounded-b-sm animate-pulse"></div>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
             {[
               { title: "Payload / Orion", desc: "The Orion spacecraft provides the habitable volume for deep space transit." },
               { title: "Exploration Upper Stage (EUS)", desc: "A powerful second stage for Block 1B/2, replacing the ICPS for higher TLI capacity." },
               { title: "Core Stage", desc: "The 212-foot tall orange tank containing liquid hydrogen and liquid oxygen for the 4 RS-25 engines." },
               { title: "Solid Rocket Boosters (SRB)", desc: "Derived from the shuttle program but upgraded to 5 segments, providing 75% of initial thrust." }
             ].map((item, i) => (
               <div key={i} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-brand-500/30 transition-all shadow-sm">
                  <h4 className="text-slate-950 dark:text-white font-black text-sm uppercase tracking-widest mb-2">{item.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {modal === 'specs' && <SpecModal />}
      {modal === 'diagrams' && <DiagramModal />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Program Overview</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-black flex items-center gap-3">
            <Shield className="w-4 h-4 text-brand-600" /> National Aeronautics and Space Administration (NASA) SLS Profile
          </p>
        </div>
        <div className="flex gap-4">
            <a 
              href="https://www.nasa.gov/exploration/systems/sls/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-600 hover:border-brand-500/50 transition-all flex items-center gap-2 shadow-sm"
            >
              NASA Portal <ExternalLink className="w-3 h-3" />
            </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Mission Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4 text-brand-600 dark:text-brand-500">
                <Target className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">NASA Artemis Mandate</span>
              </div>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white leading-tight max-w-2xl">
                The Backbone of Human Deep Space Exploration
              </h3>
              <p className="text-slate-700 dark:text-slate-400 text-lg leading-relaxed font-bold">
                The NASA Space Launch System (SLS) is the only rocket capable of sending the Orion spacecraft, astronauts, and heavy supplies to the Moon in a single launch. As part of the Artemis program, SLS enables sustainable lunar exploration and serves as the gateway for the first human missions to Mars.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-3 shadow-sm">
                   <div className="text-brand-700 dark:text-brand-400 font-black text-xs tracking-widest uppercase">Block 1B Capability</div>
                   <p className="text-slate-700 dark:text-slate-500 text-sm font-bold">Exploration Upper Stage (EUS) powered, delivering 34-40t to Trans-Lunar Injection (TLI).</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-3 shadow-sm">
                   <div className="text-indigo-700 dark:text-indigo-400 font-black text-xs tracking-widest uppercase">Block 2 Evolution</div>
                   <p className="text-slate-700 dark:text-slate-500 text-sm font-bold">Utilizing BOLE SRBs to exceed 45t TLI payload capacity for planetary logistics.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="text-amber-500" />, label: 'Thrust', val: '9.5M Lbs', sub: 'Max Liftoff' },
              { icon: <Cpu className="text-emerald-600" />, label: 'Logic', val: 'NASA RTOS', sub: 'Flight Software' },
              { icon: <Globe className="text-blue-600" />, label: 'NASA Center', val: 'MSFC', sub: 'Marshall Space Flight' }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] text-center space-y-3 shadow-md">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                <div className="text-2xl font-black text-slate-950 dark:text-white">{stat.val}</div>
                <div className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Constraints & Specs */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 animate-scan opacity-20"></div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Technical Specs</h4>
            <div className="space-y-6">
              {[
                { label: 'Axial Limit', val: '4.1 G', color: 'red' },
                { label: 'Lateral Limit', val: '0.5 G', color: 'orange' },
                { label: 'Thermal Window', val: '6°F - 130°F', color: 'emerald' },
                { label: 'Comm Link', val: 'NASA Deep Space', color: 'brand' }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center group/item">
                  <span className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest">{spec.label}</span>
                  <span className={`text-xs font-mono font-black text-${spec.color}-700 dark:text-${spec.color}-500 bg-${spec.color}-500/10 px-3 py-1 rounded-lg border border-${spec.color}-500/20`}>{spec.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-brand-900/40">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Rocket className="w-24 h-24 rotate-45" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-200 mb-6">Commander Status</h4>
            <p className="text-sm font-black leading-relaxed mb-8 relative z-10 text-brand-50">
              This terminal is an authorized interface for NASA SLS Flight Operations. All orbital maneuvers are subject to ESD-30000 structural verification.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest relative z-10">
               <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
               NASA GROUND SYSTEMS NOMINAL
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Footer Hub */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Documentation Hub</div>
            <div className="text-sm font-black text-slate-700 dark:text-slate-300">NASA-STD-5001 Structural Reference</div>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setModal('diagrams')}
             className="px-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
           >
             View Diagrams
           </button>
           <button 
             onClick={() => setModal('specs')}
             className="px-6 py-3 bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-sm"
           >
             Full Specs
           </button>
        </div>
      </div>

      {/* Finishing Touches: Technical Footer */}
      <div className="pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-80">
         <div className="flex items-center gap-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Code className="w-3 h-3 text-brand-600" /> React 19 / Vite</span>
            <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-emerald-600" /> Telemetry v2.1.0</span>
            <span className="flex items-center gap-2"><Shield className="w-3 h-3 text-indigo-600" /> ESD-30000 Compliance</span>
         </div>
         <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            © 2025 STELRIS FLIGHT OPERATIONS // US GOVERNMENT UNRESTRICTED
         </div>
      </div>
    </div>
  );
};
