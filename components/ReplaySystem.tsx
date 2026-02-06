import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Mission, TelemetryLog, CONSTANTS } from '../types';
import { FileText, Download, Trash2, Database, ChevronRight, Activity, Loader2, AlertCircle, X, Trash } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ReplaySystem: React.FC = () => {
  const { theme } = useTheme();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    refreshMissions();
  }, []);

  const refreshMissions = async () => {
    const m = await dbService.getMissions();
    setMissions(m);
  };

  const handleLoadLogs = async (id: string) => {
    setLoading(true);
    setSelectedMissionId(id);
    const data = await dbService.getTelemetry(id);
    setLogs(data);
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!logs.length) return;
    
    const headers = ["Timestamp", "Altitude (km)", "Velocity (m/s)", "Pressure (kPa)", "Temp (F)", "Events"];
    const csvContent = [
      headers.join(","),
      ...logs.map(l => [
        l.timestamp,
        l.altitude,
        l.velocity,
        l.pressure,
        l.temp,
        l.events.join('|')
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sls_telemetry_${selectedMissionId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteMission = async () => {
    if (!selectedMissionId) return;
    try {
      await dbService.deleteMission(selectedMissionId);
      setSelectedMissionId('');
      setLogs([]);
      await refreshMissions();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  const performWipe = async () => {
    try {
        await dbService.clearAllData();
        setMissions([]);
        setLogs([]);
        setSelectedMissionId('');
        setIsWipeModalOpen(false);
        // Refresh to clean slate
        window.location.reload();
    } catch (error) {
        console.error("Purge failed:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Wipe Core Data Modal */}
      {isWipeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="bg-red-500/10 p-4 rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <button onClick={() => setIsWipeModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">Confirm Data Purge</h3>
            <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed mb-10 font-bold">
                This action will permanently delete ALL local mission profiles, telemetry logs, and trajectory data. This process is irreversible and strictly monitored by Flight Ops.
            </p>
            <div className="flex flex-col gap-4">
                <button 
                    onClick={performWipe}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20 active:scale-[0.98]"
                >
                    Initialize Purge
                </button>
                <button 
                    onClick={() => setIsWipeModalOpen(false)}
                    className="w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-300 dark:border-white/5 shadow-sm"
                >
                    Abort Operation
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Mission Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="bg-orange-500/10 p-4 rounded-2xl">
                    <Trash className="w-8 h-8 text-orange-600 dark:text-orange-500" />
                </div>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-4">Delete Profile</h3>
            <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed mb-10 font-bold">
                Are you sure you want to remove this mission profile and all associated flight data? This specific archive will be purged from the repository.
            </p>
            <div className="flex flex-col gap-4">
                <button 
                    onClick={handleDeleteMission}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-900/20 active:scale-[0.98]"
                >
                    Confirm Deletion
                </button>
                <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-300 dark:border-white/5 shadow-sm"
                >
                    Keep Profile
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Archive Replay</h2>
            <p className="text-slate-700 dark:text-slate-400 mt-2 font-black flex items-center gap-3">
                <Database className="w-4 h-4 text-brand-600" /> Personnel Access to Flight Record Database
            </p>
        </div>
        <button 
          onClick={() => setIsWipeModalOpen(true)} 
          className="group px-6 py-3 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 text-red-600 dark:text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-600/5 active:scale-95"
        >
            <Trash2 className="w-4 h-4 transition-transform group-hover:rotate-12" /> Wipe Core Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
        {/* Left List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-6 overflow-hidden shadow-xl">
            <h3 className="text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <FileText className="w-4 h-4 text-brand-600" /> Historical Log Files
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {missions.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 dark:text-slate-500 text-xs font-black uppercase tracking-widest border-2 border-dashed border-slate-300 dark:border-white/5 rounded-[2rem]">
                        Archive Empty
                    </div>
                ) : (
                    missions.map(m => (
                        <button
                            key={m.id}
                            onClick={() => handleLoadLogs(m.id)}
                            className={`w-full text-left p-5 rounded-2xl border transition-all relative overflow-hidden group shadow-sm ${
                                selectedMissionId === m.id 
                                ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-500/50 text-brand-800' 
                                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:border-brand-500/40'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-black text-sm uppercase tracking-wide truncate">{m.mission_name}</div>
                                    <div className="text-[10px] opacity-90 mt-1 font-mono font-bold text-slate-600 dark:text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedMissionId === m.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col overflow-hidden shadow-xl">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-slate-950 dark:text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-500" /> 
                    Telemetry Stream Buffer
                    {logs.length > 0 && <span className="bg-brand-600 dark:bg-brand-500 text-white text-[9px] px-3 py-1 rounded-full ml-4 font-black tracking-widest uppercase shadow-md">{logs.length} Data Nodes</span>}
                </h3>
                {selectedMissionId && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="text-[10px] bg-white dark:bg-white/5 hover:bg-orange-600 hover:text-white text-orange-600 dark:text-orange-400 px-5 py-3 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border border-orange-200 dark:border-orange-600/20"
                    >
                        <Trash className="w-3.5 h-3.5" /> Delete Profile
                    </button>
                    {logs.length > 0 && (
                      <button 
                        onClick={handleExportCSV} 
                        className="text-[10px] bg-slate-100 dark:bg-white/5 hover:bg-brand-600 hover:text-white text-slate-700 dark:text-slate-400 px-6 py-3 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest transition-all shadow-md active:scale-95 border border-slate-300 dark:border-white/5"
                      >
                          <Download className="w-4 h-4" /> Export CSV
                      </button>
                    )}
                  </div>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-200 dark:border-white/10 shadow-inner custom-scrollbar">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reconstructing Data Packets...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500/30 gap-4">
                        <FileText className="w-16 h-16" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Select Archive Point</span>
                    </div>
                ) : (
                    <table className="w-full text-xs text-left text-slate-800 dark:text-slate-300">
                        <thead className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-black tracking-[0.2em] bg-slate-200 dark:bg-slate-900/80 sticky top-0 backdrop-blur-md z-10 border-b border-slate-300 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-5">Timestamp (UTC)</th>
                                <th className="px-8 py-5">Alt (km)</th>
                                <th className="px-8 py-5">Vel (m/s)</th>
                                <th className="px-8 py-5">Temp (°F)</th>
                                <th className="px-8 py-5">Event Log</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {logs.map((row) => (
                                <tr key={row.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-brand-50 dark:hover:bg-white/[0.03] transition-colors">
                                    <td className="px-8 py-4 text-brand-700 dark:text-brand-500 font-bold">{row.timestamp.split('T')[1].split('.')[0]}</td>
                                    <td className="px-8 py-4 font-black">{row.altitude.toFixed(2)}</td>
                                    <td className="px-8 py-4 font-black">{row.velocity.toFixed(1)}</td>
                                    <td className={`px-8 py-4 font-black ${row.temp > CONSTANTS.MAX_TEMP_F ? 'text-red-600' : row.temp < CONSTANTS.MIN_TEMP_F ? 'text-blue-600' : ''}`}>{row.temp.toFixed(1)}</td>
                                    <td className="px-8 py-4">
                                        {row.events.length > 0 ? (
                                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-red-500/10 text-red-700 dark:text-red-500 rounded-lg border border-red-500/30">{row.events[0]}</span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 opacity-40">— NOMINAL</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};