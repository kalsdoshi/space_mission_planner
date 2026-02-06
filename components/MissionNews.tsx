import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Globe, Search, Loader2, ExternalLink, Calendar, Rocket, Terminal } from 'lucide-react';

export const MissionNews: React.FC = () => {
  const [intel, setIntel] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIntel = async () => {
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Provide a detailed briefing on the latest status of NASA's Space Launch System (SLS) and Artemis missions as of early 2025. Include current testing status, upcoming flight schedules, and any significant recent milestones or delays.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      
      setIntel(response.text || 'No data retrieved.');
      setSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (error) {
      console.error("Intel Fetch Failed:", error);
      setIntel("ERROR: Uplink to NASA Ground Systems failed. Verify satellite link integrity.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIntel();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Intel</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-3">
                  <Globe className="w-4 h-4 text-brand-500" /> Real-time Real-world SLS Tactical Intelligence
              </p>
          </div>
          <button 
            onClick={fetchIntel} 
            disabled={loading}
            className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-brand-500/20 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Refresh Intel
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32"></div>
                
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <Rocket className="w-16 h-16 text-brand-500 animate-bounce" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-brand-500/20 blur-sm"></div>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Syncing with NASA Ground Control...</p>
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none">
                        <div className="flex items-center gap-4 mb-10">
                            <Terminal className="w-6 h-6 text-brand-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Decrypted Tactical Briefing</span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                            {intel}
                        </div>
                    </div>
                )}
             </div>
          </div>

          <div className="space-y-8">
              <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Calendar className="w-32 h-32" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-10 relative z-10">Source Verification</h3>
                  <div className="space-y-4 relative z-10">
                      {sources.length === 0 && !loading ? (
                          <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-center py-10">No external source links</div>
                      ) : (
                          sources.map((src, i) => (
                              <a 
                                key={i}
                                href={src.web?.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-4 bg-white/5 hover:bg-brand-500/20 border border-white/5 hover:border-brand-500/30 rounded-2xl transition-all group"
                              >
                                  <div className="flex justify-between items-center">
                                      <div className="flex-1 min-w-0 pr-4">
                                          <div className="text-xs font-black uppercase tracking-wide truncate group-hover:text-brand-400">{src.web?.title || 'External Intelligence'}</div>
                                          <div className="text-[9px] text-slate-500 mt-1 truncate">{src.web?.uri}</div>
                                      </div>
                                      <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-brand-500 transition-colors" />
                                  </div>
                              </a>
                          ))
                      )}
                  </div>
              </div>

              <div className="glass-panel rounded-[2.5rem] p-10 flex flex-col gap-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Tactical Constraints</h3>
                  <div className="space-y-3">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Uplink Nominal</span>
                      </div>
                      <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_#0ea5e9]"></div>
                          <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">ESD-30000 Verified</span>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ground Log v5.2</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};