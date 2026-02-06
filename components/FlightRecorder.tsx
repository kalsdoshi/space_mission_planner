
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { Play, Square, AlertTriangle, Thermometer, Gauge, Activity, ChevronRight, Database, Terminal, AlertCircle, X, RotateCcw, FastForward, Clock } from 'lucide-react';
import { Mission, TelemetryLog, CONSTANTS } from '../types';
import { dbService } from '../services/dbService';
import { useTheme } from '../contexts/ThemeContext';

export const FlightRecorder: React.FC = () => {
  const { theme } = useTheme();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<TelemetryLog[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [pendingMission, setPendingMission] = useState<Mission | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Simulation State Refs
  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTime = useRef(0); // seconds
  const currentAlt = useRef(0);
  const currentVel = useRef(0);
  const currentTemp = useRef(70); // Fahrenheit

  useEffect(() => {
    dbService.getMissions().then(setMissions);
    if (state?.missionId) {
      dbService.getMissionById(state.missionId).then(m => {
        if (m) setMission(m);
      });
    }
  }, [state]);

  const selectMission = (m: Mission) => {
      if (isSimulating) {
          setPendingMission(m);
          setIsConfirmModalOpen(true);
          return;
      }
      setMission(m);
      setTelemetry([]);
      setAlerts([]);
  };

  const confirmSwitch = () => {
      if (pendingMission) {
          stopSimulation();
          setMission(pendingMission);
          setTelemetry([]);
          setAlerts([]);
          setPendingMission(null);
      }
      setIsConfirmModalOpen(false);
  };

  const resetSimulation = async () => {
    setIsResetting(true);
    // Stops if running
    if (isSimulating) stopSimulation();
    
    // Clear buffer data from DB if mission exists
    if (mission) {
      await dbService.clearMissionTelemetry(mission.id);
    }
    
    // Clear local state
    setTelemetry([]);
    setAlerts([]);
    
    // Reset physics variables
    currentTime.current = 0;
    currentAlt.current = 0;
    currentVel.current = 0;
    currentTemp.current = 70;
    
    setIsResetting(false);
  };

  const generateDataPoint = (elapsed: number) => {
    // Simple physics-ish simulation
    currentVel.current += (Math.random() * 50) + 10; 
    currentAlt.current += currentVel.current * 0.001;
    const pressure = Math.max(0, 101 - (currentAlt.current * 0.5));
    const tempChange = (Math.random() * 10) - 4; 
    currentTemp.current += tempChange;

    const events: string[] = [];
    if (currentTemp.current < CONSTANTS.MIN_TEMP_F || currentTemp.current > CONSTANTS.MAX_TEMP_F) {
        events.push('THERMAL_VIOLATION');
        setAlerts(prev => [`[T+${elapsed}s] THERMAL VIOLATION: ${currentTemp.current.toFixed(1)}°F`, ...prev.slice(0, 4)]);
    }

    return {
        id: crypto.randomUUID(),
        mission_id: mission?.id || 'unknown',
        timestamp: new Date().toISOString(),
        altitude: parseFloat(currentAlt.current.toFixed(2)),
        velocity: parseFloat(currentVel.current.toFixed(2)),
        pressure: parseFloat(pressure.toFixed(2)),
        temp: parseFloat(currentTemp.current.toFixed(2)),
        events
    };
  };

  const startSimulation = (speed: number = simSpeed) => {
    if (!mission) return;
    setIsSimulating(true);

    if (simInterval.current) clearInterval(simInterval.current);

    const intervalMs = 1000 / speed;

    simInterval.current = setInterval(() => {
      currentTime.current += 1; // Always increment by 1 "second" per tick
      const dataPoint = generateDataPoint(currentTime.current);
      
      setTelemetry(prev => {
          const newData = [...prev, dataPoint];
          return newData.slice(-30); 
      });

      dbService.saveTelemetryBatch([dataPoint]);

    }, intervalMs); 
  };

  const stopSimulation = () => {
    if (simInterval.current) {
      clearInterval(simInterval.current);
      simInterval.current = null;
      setIsSimulating(false);
    }
  };

  const changeSpeed = (newSpeed: number) => {
    setSimSpeed(newSpeed);
    if (isSimulating) {
        startSimulation(newSpeed); // Restart with new interval
    }
  };

  useEffect(() => {
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, []);

  const lastReading = telemetry[telemetry.length - 1];

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-sans h-[calc(100vh-140px)] relative">
       {/* Confirmation Modal */}
       {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="bg-amber-500/10 p-4 rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <button onClick={() => setIsConfirmModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-500" />
                </button>
            </div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">Abort Active Uplink?</h3>
            <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed mb-10 font-bold">
                A telemetry simulation is currently active. Switching missions will terminate the current downlink and purge the real-time buffer. Confirm abort?
            </p>
            <div className="flex flex-col gap-4">
                <button 
                    onClick={confirmSwitch}
                    className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-900/20"
                >
                    Confirm & Switch
                </button>
                <button 
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-300 dark:border-white/5"
                >
                    Maintain Uplink
                </button>
            </div>
          </div>
        </div>
      )}

       {/* Sidebar: Mission Selection */}
       <aside className="w-full lg:w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-4 overflow-hidden shadow-xl">
          <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brand-500/10 rounded-xl">
                <Database className="w-5 h-5 text-brand-700 dark:text-brand-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">Active Repository</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {missions.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 dark:text-slate-500 text-xs font-black uppercase tracking-widest">No Projects Found</div>
              ) : (
                  missions.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => selectMission(m)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                            mission?.id === m.id 
                            ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-500/30 text-brand-800 dark:text-brand-500 shadow-sm' 
                            : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:border-brand-500/40'
                        }`}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-black text-sm truncate uppercase tracking-wide">{m.mission_name}</span>
                            <span className="text-[10px] opacity-80 font-mono font-black">{m.hardware_config?.upper_stage} • {m.payload_mass}T</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${mission?.id === m.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                      </button>
                  ))
              )}
          </div>
       </aside>

       {/* Main View */}
       <div className="flex-1 space-y-6 min-w-0 overflow-y-auto pr-2 custom-scrollbar">
          {!mission ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-white dark:bg-white/[0.02] rounded-[3rem] border-2 border-dashed border-slate-300 dark:border-white/5 animate-in fade-in zoom-in-95 shadow-inner">
                <div className="bg-slate-50 dark:bg-white/5 p-10 rounded-full mb-8">
                    <Terminal className="w-16 h-16 opacity-30 text-brand-700" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-950 dark:text-white uppercase tracking-widest">Select Control Logic</h3>
                <p className="mb-10 text-sm max-w-sm text-center text-slate-700 dark:text-slate-500 font-bold">Please select a mission profile from the repository sidebar to initialize the flight recorder downlink.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
               {/* Header */}
               <div className="bg-white dark:bg-[#0B1120] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl">
                  <div className="flex flex-col gap-6">
                     {/* Top Row: Icon + Info */}
                     <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-700 dark:text-brand-500 shadow-inner flex-shrink-0">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 flex-wrap">
                                <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                                    {mission.mission_name}
                                </h2>
                                <button 
                                    onClick={resetSimulation}
                                    disabled={isResetting}
                                    title="Purge Buffer & Reset Physics"
                                    className={`p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-500 hover:text-brand-700 transition-all active:scale-90 flex-shrink-0 ${isResetting ? 'animate-spin' : ''}`}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                {isSimulating && <span className="relative flex h-3 w-3 flex-shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_#ef4444]"></span>
                                </span>}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-700 dark:text-slate-500 mt-4 font-black uppercase tracking-[0.2em] flex-wrap">
                                <span className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-brand-800 dark:text-brand-500">ID: {mission.id.split('-')[0]}</span>
                                <span>•</span>
                                <span>{mission.hardware_config?.upper_stage} DOWNLINK NOMINAL</span>
                            </div>
                        </div>
                     </div>

                     {/* Bottom Row: Speed Controls + Button */}
                     <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                        {/* Speed Controls */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-300 dark:border-white/5 shadow-sm w-fit">
                           <div className="flex items-center gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-500">
                              <Clock className="w-3.5 h-3.5" /> Speed
                           </div>
                           <div className="flex gap-1">
                               {[0.5, 1, 2, 10].map((s) => (
                                   <button
                                       key={s}
                                       onClick={() => changeSpeed(s)}
                                       className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                           simSpeed === s 
                                           ? 'bg-brand-600 text-white shadow-lg' 
                                           : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-500'
                                       }`}
                                   >
                                       {s}x
                                   </button>
                               ))}
                           </div>
                        </div>

                        {/* Initialize/Abort Button */}
                        {!isSimulating ? (
                            <button onClick={() => startSimulation()} className="bg-brand-600 hover:bg-brand-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 border-b-4 border-brand-800 active:border-b-0 active:translate-y-1 whitespace-nowrap">
                               <Play className="w-5 h-5 fill-current" /> Initialize Sequence
                            </button>
                        ) : (
                            <button onClick={stopSimulation} className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl animate-pulse active:scale-95 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 whitespace-nowrap">
                               <Square className="w-5 h-5 fill-current" /> Abort Downlink
                            </button>
                        )}
                     </div>
                  </div>
               </div>

               {/* Telemetry HUD */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { icon: <Activity className="text-brand-700 dark:text-brand-500" />, label: 'Altitude', value: lastReading?.altitude.toFixed(1) || '0.0', unit: 'km', bg: 'brand' },
                        { icon: <Gauge className="text-indigo-700 dark:text-indigo-500" />, label: 'Velocity', value: lastReading?.velocity.toFixed(1) || '0.0', unit: 'm/s', bg: 'indigo' },
                        { icon: <Thermometer className="text-orange-700 dark:text-orange-500" />, label: 'Core Temp', value: lastReading?.temp.toFixed(1) || '70.0', unit: '°F', bg: 'orange' },
                    ].map((hud, i) => (
                        <div key={i} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] relative overflow-hidden group shadow-lg">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${hud.bg}-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125`}></div>
                            <div className="flex items-center gap-3 text-slate-800 dark:text-slate-500 mb-4 text-[10px] font-black uppercase tracking-widest">
                                {hud.icon} {hud.label}
                            </div>
                            <div className="text-4xl font-mono font-bold text-slate-950 dark:text-white tracking-tighter flex items-baseline gap-2">
                                {hud.value} <span className="text-xs font-sans text-slate-800 dark:text-slate-500 font-black tracking-widest uppercase">{hud.unit}</span>
                            </div>
                        </div>
                    ))}

                     <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] relative overflow-hidden shadow-lg">
                        <div className="flex items-center gap-3 text-slate-800 dark:text-slate-500 mb-4 text-[10px] font-black uppercase tracking-widest">
                            <AlertTriangle className="w-5 h-5 text-red-600" /> Event Monitor
                        </div>
                        <div className="text-[10px] font-mono h-14 overflow-hidden flex flex-col justify-end gap-1">
                            {alerts.length > 0 ? (
                                <div className="text-red-700 dark:text-red-500 animate-pulse font-black uppercase tracking-wider bg-red-500/10 p-2 rounded-xl border border-red-500/30 truncate">
                                    {alerts[0]}
                                </div>
                            ) : (
                                <div className="text-emerald-700 dark:text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_#10b981]"></div> 
                                    Downlink Stable
                                </div>
                            )}
                        </div>
                    </div>
               </div>

               {/* Charts Area */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px]">
                    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h4 className="text-slate-800 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Velocity Profile</h4>
                                {simSpeed > 1 && (
                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-brand-600 dark:text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                        <FastForward className="w-3 h-3" /> {simSpeed}x Warp
                                    </span>
                                )}
                            </div>
                            <div className="text-[10px] font-mono text-brand-800 dark:text-brand-500 bg-brand-500/10 px-2 py-1 rounded font-black">FEED_LIVE</div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry}>
                                    <defs>
                                        <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#cbd5e1'} opacity={0.2} vertical={false} />
                                    <XAxis hide dataKey="timestamp" />
                                    <YAxis 
                                        stroke="#475569" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => `${val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '16px', fontSize: '10px' }} 
                                        itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="velocity" 
                                        stroke="#0ea5e9" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorVel)" 
                                        isAnimationActive={false} 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                     <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-slate-800 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Thermal variance</h4>
                            <div className="text-[10px] font-mono text-orange-800 dark:text-orange-500 bg-orange-500/10 px-2 py-1 rounded font-black">SEN_ACTIVE</div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={telemetry}>
                                     <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#cbd5e1'} opacity={0.2} vertical={false} />
                                     <XAxis hide dataKey="timestamp" />
                                     <YAxis 
                                        stroke="#475569" 
                                        fontSize={10} 
                                        domain={[0, 150]} 
                                        tickLine={false}
                                        axisLine={false}
                                     />
                                     <Tooltip 
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '16px', fontSize: '10px' }} 
                                        itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                                     />
                                     <Line 
                                        type="monotone" 
                                        dataKey="temp" 
                                        stroke="#f97316" 
                                        strokeWidth={3} 
                                        dot={false} 
                                        isAnimationActive={false} 
                                     />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
               </div>
            </div>
          )}
       </div>
    </div>
  );
};
