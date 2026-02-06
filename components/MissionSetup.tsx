
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlockVersion, Destination, Mission, Maneuver, CONSTANTS, HardwareConfig } from '../types';
import { dbService } from '../services/dbService';
import { analyzeMissionProfile } from '../services/geminiService';
import { Save, Loader2, Cpu, Settings, Package, Gauge, Info, ChevronRight, Truck, Database, CheckCircle2, Circle, Rocket, Wind } from 'lucide-react';

const HARDWARE_STATS = {
    engines: {
        RS25: { thrust: 2279, weight: 3.5 },
    },
    srb: {
        Block1: { thrust: 16000, weight: 590 },
        DarkKnight: { thrust: 18000, weight: 610 },
        BOLE: { thrust: 20000, weight: 650 }
    },
    stage: {
        ICPS: { weight: 30, thrust: 110, isp: 462 },
        EUS: { weight: 120, thrust: 440, isp: 462 }
    }
};

export const MissionSetup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'hardware' | 'maneuver'>('profile');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [missionName, setMissionName] = useState('Artemis V');
  const [destination, setDestination] = useState<Destination>(Destination.MOON);
  const [payload, setPayload] = useState(38);
  
  const [hardware, setHardware] = useState<HardwareConfig>({
      core_engines: 4,
      srb_type: 'Block 1',
      upper_stage: 'ICPS'
  });

  const [maneuver, setManeuver] = useState({
    burn_duration: 120,
    delta_v: 2500,
  });

  const [savedMissions, setSavedMissions] = useState<Mission[]>([]);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    const m = await dbService.getMissions();
    setSavedMissions(m);
  };

  const vehicleStats = (() => {
      const coreThrust = hardware.core_engines * HARDWARE_STATS.engines.RS25.thrust;
      const srbThrust = 2 * HARDWARE_STATS.srb[hardware.srb_type.replace(' ', '') === 'Block1' ? 'Block1' : hardware.srb_type === 'Dark Knight' ? 'DarkKnight' : 'BOLE'].thrust;
      const totalThrust = coreThrust + srbThrust;
      const coreMass = 1000;
      const srbMass = 2 * HARDWARE_STATS.srb[hardware.srb_type.replace(' ', '') === 'Block1' ? 'Block1' : hardware.srb_type === 'Dark Knight' ? 'DarkKnight' : 'BOLE'].weight;
      const stageMass = HARDWARE_STATS.stage[hardware.upper_stage].weight;
      const totalMass = coreMass + srbMass + stageMass + payload;
      const twr = totalThrust / (totalMass * 9.81);
      return { totalThrust, totalMass, twr };
  })();

  const handleSave = async () => {
      setLoading(true);
      const newMission: Mission = {
          id: crypto.randomUUID(),
          mission_name: missionName,
          block_version: hardware.upper_stage === 'EUS' ? BlockVersion.BLOCK_2 : BlockVersion.BLOCK_1B,
          payload_mass: payload,
          destination: destination,
          c3_energy: destination === Destination.MARS ? 15 : 0,
          hardware_config: hardware,
          created_at: new Date().toISOString()
      };
      const acceleration = maneuver.delta_v / maneuver.burn_duration;
      const gForce = acceleration / 9.81;
      const newManeuver: Maneuver = {
          id: crypto.randomUUID(),
          mission_id: newMission.id,
          burn_duration: maneuver.burn_duration,
          delta_v: maneuver.delta_v,
          calculated_g_force: gForce,
          status: gForce > CONSTANTS.MAX_AXIAL_G ? 'REJECTED' : 'APPROVED',
          created_at: new Date().toISOString()
      };
      await dbService.saveMission(newMission);
      await dbService.saveManeuver(newManeuver);
      setLoading(false);
      loadMissions();
  };

  const handleAnalyze = async () => {
      setAnalyzing(true);
      const m: Mission = {
          id: 'temp',
          mission_name: missionName,
          block_version: hardware.upper_stage === 'EUS' ? BlockVersion.BLOCK_2 : BlockVersion.BLOCK_1B,
          payload_mass: payload,
          destination: destination,
          c3_energy: 0,
          hardware_config: hardware,
          created_at: new Date().toISOString()
      };
      const result = await analyzeMissionProfile(m, [{...maneuver, calculated_g_force: 0, status: 'APPROVED'} as any]);
      setAiAnalysis(result);
      setAnalyzing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 font-sans">
       <div className="flex-1 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight uppercase">Architect</h2>
                    <p className="text-slate-800 dark:text-slate-400 mt-3 flex items-center gap-3 font-bold uppercase tracking-widest text-[11px]">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500 shadow-[0_0_10px_#0ea5e9]"></span>
                        </span>
                        Systems Engineering & Trajectory Design
                    </p>
                </div>
                <button 
                    onClick={handleAnalyze} 
                    disabled={analyzing} 
                    className="relative group bg-white dark:bg-brand-500/5 border border-slate-300 dark:border-brand-500/20 hover:border-purple-500 dark:hover:border-purple-500/50 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                    <div className="absolute inset-0 bg-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-3">
                      {analyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Cpu className="w-4 h-4"/>} 
                      Neural Diagnostics
                    </div>
                </button>
            </div>

            {/* Wizard Container */}
            <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="flex bg-slate-100 dark:bg-white/[0.02] border-b border-slate-300 dark:border-white/5">
                    {[
                        { id: 'profile', icon: <Info className="w-4 h-4"/>, label: 'PROFILE' },
                        { id: 'hardware', icon: <Package className="w-4 h-4"/>, label: 'VEHICLE' },
                        { id: 'maneuver', icon: <Settings className="w-4 h-4"/>, label: 'ORBIT' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-6 text-[10px] font-black tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative group ${
                                activeTab === tab.id 
                                ? 'text-brand-700 dark:text-brand-500 bg-white dark:bg-transparent'
                                : 'text-slate-700 dark:text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'
                            }`}
                        >
                            <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>{tab.icon}</span>
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-10 min-h-[460px]">
                    {activeTab === 'profile' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black ml-1">Mission Callsign</label>
                                    <input 
                                        type="text" 
                                        value={missionName}
                                        onChange={e => setMissionName(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-white/10 rounded-2xl p-5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all font-mono text-base text-slate-950 dark:text-white font-bold shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black ml-1">Destination Node</label>
                                    <div className="relative">
                                        <select 
                                            value={destination}
                                            onChange={e => setDestination(e.target.value as any)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-white/10 rounded-2xl p-5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all font-mono text-base text-slate-950 dark:text-white font-bold appearance-none shadow-sm"
                                        >
                                            {Object.values(Destination).map(d => <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-950 dark:text-white">{d}</option>)}
                                        </select>
                                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 w-5 h-5 text-slate-600 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                     <div className="flex justify-between items-end">
                                        <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black ml-1">Payload Configuration</label>
                                        <div className="font-mono text-4xl font-bold text-brand-700 dark:text-brand-500 flex items-baseline gap-2">
                                            {payload} <span className="text-xs text-slate-700 font-black uppercase tracking-[0.2em]">metric tonnes</span>
                                        </div>
                                     </div>
                                     <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-300 dark:border-white/5 rounded-3xl shadow-inner">
                                        <input 
                                            type="range" min="10" max="60" step="1"
                                            value={payload}
                                            onChange={e => setPayload(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-700 dark:text-slate-500 font-black tracking-widest mt-6">
                                            <span>MIN: 10T</span>
                                            <span>AVG: 35T</span>
                                            <span>MAX: 60T</span>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hardware' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div>
                                 <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black mb-6 block ml-1">Core Stage Propulsion Matrix</label>
                                 <div className="grid grid-cols-2 gap-6">
                                     {[3, 4].map(count => (
                                         <button
                                            key={count}
                                            onClick={() => setHardware(h => ({...h, core_engines: count as any}))}
                                            className={`group relative p-7 rounded-[2rem] border-2 transition-all text-left overflow-hidden ${
                                                hardware.core_engines === count 
                                                ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-500 shadow-md' 
                                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/5 hover:border-brand-500/40'
                                            }`}
                                         >
                                             <div className="flex items-center justify-between mb-4">
                                                 <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-xl ${hardware.core_engines === count ? 'bg-brand-700 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-600'}`}>
                                                        <Rocket className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-mono text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-500">RS-25 BLOCK 2</span>
                                                 </div>
                                                 {hardware.core_engines === count ? <CheckCircle2 className="w-5 h-5 text-brand-700" /> : <Circle className="w-5 h-5 text-slate-400 dark:text-slate-800" />}
                                             </div>
                                             <div className={`font-black text-3xl transition-colors ${hardware.core_engines === count ? 'text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-700'}`}>{count}x <span className="text-xl font-normal opacity-50">THRUSTERS</span></div>
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black mb-6 block ml-1">Solid Propellant Augmentation</label>
                                 <div className="grid grid-cols-3 gap-5">
                                     {['Block 1', 'Dark Knight', 'BOLE'].map(type => (
                                         <button
                                            key={type}
                                            onClick={() => setHardware(h => ({...h, srb_type: type as any}))}
                                            className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                                                hardware.srb_type === type 
                                                ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-500/50 text-orange-900 dark:text-orange-400' 
                                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/5 hover:border-orange-500/50'
                                            }`}
                                         >
                                             <div className="font-mono text-[9px] font-black tracking-[0.2em] text-slate-700 dark:text-slate-500 mb-3 uppercase">NORTHROP GRUMMAN</div>
                                             <div className="font-black text-base text-slate-950 dark:text-white group-hover:text-orange-800 dark:group-hover:text-orange-400 transition-colors">{type}</div>
                                         </button>
                                     ))}
                                 </div>
                             </div>

                              <div>
                                 <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black mb-6 block ml-1">Exploration Upper Stage (EUS)</label>
                                 <div className="grid grid-cols-2 gap-6">
                                     {['ICPS', 'EUS'].map(type => (
                                         <button
                                            key={type}
                                            onClick={() => setHardware(h => ({...h, upper_stage: type as any}))}
                                            className={`p-8 rounded-[2rem] border-2 transition-all text-left flex flex-col justify-between h-36 ${
                                                hardware.upper_stage === type 
                                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' 
                                                : 'border-slate-300 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-emerald-600/50'
                                            }`}
                                         >
                                             <div className={`font-black text-3xl ${hardware.upper_stage === type ? 'text-slate-950 dark:text-white' : 'text-slate-600'}`}>{type}</div>
                                             <div className="text-[10px] font-black text-slate-700 dark:text-slate-500 tracking-[0.2em] uppercase">{type === 'ICPS' ? 'Interim Cryogenic' : 'Exploration Advanced'}</div>
                                         </button>
                                     ))}
                                 </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'maneuver' && (
                         <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black ml-1">Ignition Window (SEC)</label>
                                    <input 
                                        type="number"
                                        value={maneuver.burn_duration}
                                        onChange={e => setManeuver({...maneuver, burn_duration: Number(e.target.value)})}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-white/10 rounded-2xl p-5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all font-mono text-3xl text-slate-950 dark:text-white font-bold shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black ml-1">Target Delta-V (M/S)</label>
                                    <input 
                                        type="number"
                                        value={maneuver.delta_v}
                                        onChange={e => setManeuver({...maneuver, delta_v: Number(e.target.value)})}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-white/10 rounded-2xl p-5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all font-mono text-3xl text-slate-950 dark:text-white font-bold shadow-sm"
                                    />
                                </div>
                             </div>
                             
                             <div className="p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] relative overflow-hidden shadow-inner">
                                 <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 dark:bg-brand-500/10 blur-[80px]"></div>
                                 <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-400 mb-10 flex items-center gap-3 uppercase tracking-[0.4em]">
                                     <Gauge className="w-5 h-5 text-brand-700" /> Dynamic Loading Analysis
                                 </h4>
                                 <div className="space-y-10 relative z-10">
                                    <div>
                                        <div className="flex justify-between text-[10px] mb-4 text-slate-800 dark:text-slate-500 font-black tracking-widest uppercase">
                                            <span>AXIAL STRESS GRADIENT</span>
                                            <span>THRESHOLD: {CONSTANTS.MAX_AXIAL_G}G</span>
                                        </div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative p-0.5">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-700 relative ${
                                                    (maneuver.delta_v / maneuver.burn_duration / 9.81) > CONSTANTS.MAX_AXIAL_G ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 shadow-md'
                                                }`}
                                                style={{ width: `${Math.min(((maneuver.delta_v / maneuver.burn_duration / 9.81) / 5) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-6 text-right font-mono text-5xl font-bold text-slate-950 dark:text-white tracking-tighter">
                                            {(maneuver.delta_v / maneuver.burn_duration / 9.81).toFixed(2)}<span className="text-sm font-black text-slate-700 ml-2 uppercase tracking-widest">G</span>
                                        </div>
                                    </div>
                                 </div>
                             </div>
                         </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02] flex justify-between items-center px-10">
                     {activeTab !== 'profile' ? (
                        <button onClick={() => setActiveTab(activeTab === 'maneuver' ? 'hardware' : 'profile')} className="px-8 py-3 text-[11px] font-black text-slate-800 dark:text-slate-500 hover:text-slate-950 dark:hover:text-white transition-all uppercase tracking-[0.2em] active:scale-95">Prev Stage</button>
                     ) : <div></div>}
                     
                     {activeTab !== 'maneuver' ? (
                        <button onClick={() => setActiveTab(activeTab === 'profile' ? 'hardware' : 'maneuver')} className="px-10 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                            Sequence <ChevronRight className="w-4 h-4" />
                        </button>
                     ) : (
                        <button onClick={handleSave} disabled={loading} className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                            Commit Data
                        </button>
                     )}
                </div>
            </div>
            
            {aiAnalysis && (
                <div className="bg-white dark:bg-slate-950 border border-purple-400 dark:border-purple-500/20 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="absolute top-0 left-0 w-2.5 h-full bg-purple-600"></div>
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <Cpu className="w-48 h-48 text-purple-600" />
                    </div>
                    <h3 className="text-purple-800 dark:text-purple-400 font-black text-[11px] tracking-[0.4em] mb-6 flex items-center gap-4 uppercase">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]"></div>
                        Heuristic Analysis Result
                    </h3>
                    <p className="text-slate-950 dark:text-slate-300 leading-relaxed text-lg font-black max-w-2xl">{aiAnalysis}</p>
                </div>
            )}
       </div>

       <div className="w-full lg:w-[420px] flex flex-col gap-10">
            <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-[3rem] p-10 shadow-xl dark:shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-10 animate-scan"></div>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-600/5 rounded-full blur-[100px] group-hover:bg-brand-600/10 transition-all duration-700"></div>
                
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-800 dark:text-slate-500 mb-10 font-black flex items-center gap-3 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_#0ea5e9]"></span>
                    REAL-TIME METRICS
                </h3>
                
                <div className="space-y-12 relative z-10">
                    <div className="space-y-2">
                        <div className="text-[9px] uppercase tracking-[0.4em] text-slate-800 dark:text-slate-500 font-black">LIFTOFF FORCE</div>
                        <div className="text-5xl font-mono font-bold text-slate-950 dark:text-white tracking-tighter flex items-baseline gap-3">
                            {vehicleStats.totalThrust.toLocaleString()} <span className="text-xs font-sans text-slate-700 dark:text-slate-500 font-black uppercase tracking-widest">kN</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-[9px] uppercase tracking-[0.4em] text-slate-800 dark:text-slate-500 font-black">GROSS SYSTEM MASS</div>
                        <div className="text-5xl font-mono font-bold text-slate-950 dark:text-white tracking-tighter flex items-baseline gap-3">
                            {vehicleStats.totalMass.toLocaleString()} <span className="text-xs font-sans text-slate-700 dark:text-slate-500 font-black uppercase tracking-widest">T</span>
                        </div>
                    </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="text-[9px] uppercase tracking-[0.4em] text-slate-800 dark:text-slate-500 font-black">TWR COEFFICIENT</div>
                            <div className={`text-3xl font-mono font-bold ${vehicleStats.twr > 1.2 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-500'}`}>
                                {vehicleStats.twr.toFixed(3)}
                            </div>
                        </div>
                        <div className="h-3.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-200 dark:border-white/10">
                             <div 
                                className={`h-full rounded-full ${vehicleStats.twr > 1.2 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-amber-500'} transition-all duration-1000 ease-out`} 
                                style={{width: `${Math.min(vehicleStats.twr * 30, 100)}%`}}
                             ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-[3rem] p-10 flex-1 shadow-xl">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-800 dark:text-slate-500 mb-8 font-black flex items-center gap-4">
                    <Database className="w-4 h-4 text-brand-700"/> MISSION REPOSITORY
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                    {savedMissions.length === 0 ? (
                        <div className="text-center py-24 text-slate-700 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] border-2 border-dashed border-slate-400 dark:border-white/5 rounded-[2.5rem]">
                            Repository Empty
                        </div>
                    ) : (
                        savedMissions.map(m => (
                            <div key={m.id} className="group relative p-7 rounded-[2rem] border border-slate-400 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-brand-50 dark:hover:bg-white/[0.05] hover:border-brand-500/60 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-lg" onClick={() => navigate('/recorder', { state: { missionId: m.id } })}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="min-w-0">
                                        <div className="font-black text-slate-950 dark:text-slate-200 text-sm group-hover:text-brand-800 dark:group-hover:text-brand-400 transition-colors tracking-wide uppercase truncate">{m.mission_name}</div>
                                        <div className="text-[9px] text-slate-800 dark:text-slate-600 font-mono mt-1.5 font-bold">{new Date(m.created_at).toLocaleDateString()} // ID: {m.id.split('-')[0]}</div>
                                    </div>
                                    <span className="shrink-0 text-[9px] bg-slate-200 dark:bg-white/10 text-slate-950 dark:text-white font-black px-3 py-1.5 rounded-xl tracking-widest uppercase ml-3 shadow-sm">{m.hardware_config?.upper_stage || 'BLK 1B'}</span>
                                </div>
                                <div className="flex items-center gap-6 text-[10px] text-slate-800 dark:text-slate-500 font-black tracking-widest relative z-10 uppercase">
                                    <div className="flex items-center gap-2.5">
                                        <Truck className="w-3.5 h-3.5 text-brand-700" /> {m.payload_mass}T
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Wind className="w-3.5 h-3.5 text-brand-700" /> {m.destination}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
       </div>
    </div>
  );
};
