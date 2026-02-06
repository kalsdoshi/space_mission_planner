
import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ZoomIn, ZoomOut, Info, Orbit, Zap, Gauge, ArrowRight } from 'lucide-react';

const GM = 3.986e14; // Earth standard gravitational parameter (m^3/s^2)
const EARTH_RADIUS = 6371000; // meters

interface OrbitalState {
  altitude: number; // km
  deltaV: number; // m/s
  zoom: number; // pixels per km
}

export const OrbitSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<OrbitalState>({
    altitude: 400, // LEO
    deltaV: 0,
    zoom: 0.05,
  });

  const [simTime, setSimTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef<number>(0);

  // Physics Calculations
  const r1 = EARTH_RADIUS + state.altitude * 1000; // Current radius (m)
  const v1 = Math.sqrt(GM / r1); // Circular velocity at current altitude
  const v2 = v1 + state.deltaV; // Velocity after burn
  
  const semiMajorAxis = 1 / (2 / r1 - (v2 * v2) / GM);
  
  let eccentricity = 0;
  if (state.deltaV >= 0) {
    eccentricity = 1 - r1 / semiMajorAxis;
  } else {
    eccentricity = r1 / semiMajorAxis - 1;
  }

  const periapsis = semiMajorAxis * (1 - eccentricity);
  const apoapsis = semiMajorAxis * (1 + eccentricity);
  const period = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / GM);
  const periapsisAlt = (periapsis - EARTH_RADIUS) / 1000;
  const apoapsisAlt = (apoapsis - EARTH_RADIUS) / 1000;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Starfield background
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<80; i++) {
          const x = (Math.sin(i * 132.1) * width + simTime/10) % width;
          const y = (Math.cos(i * 54.3) * height) % height;
          ctx.globalAlpha = Math.random() * 0.3 + 0.1;
          ctx.beginPath();
          ctx.arc(Math.abs(x), Math.abs(y), Math.random() * 1.2, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += 100) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y <= height; y += 100) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      const scale = state.zoom / 1000; 

      // Draw Earth
      const earthRadPx = EARTH_RADIUS * scale;
      const earthGrad = ctx.createRadialGradient(cx, cy, earthRadPx * 0.2, cx, cy, earthRadPx);
      earthGrad.addColorStop(0, '#1e40af');
      earthGrad.addColorStop(1, '#172554');
      
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadPx, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();
      
      // Atmosphere Glow
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Initial Orbit (Dashed)
      const r1Px = r1 * scale;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r1Px, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const aPx = semiMajorAxis * scale;
      const cPx = aPx * eccentricity;
      
      let centerX = cx;
      if (state.deltaV >= 0) {
        centerX = cx - cPx;
      } else {
        centerX = cx + cPx;
      }

      if (eccentricity < 1) {
          const bPx = aPx * Math.sqrt(1 - eccentricity * eccentricity);
          
          ctx.strokeStyle = state.deltaV === 0 ? '#0ea5e9' : (eccentricity > 0.8 ? '#f43f5e' : '#10b981');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(centerX, cy, aPx, bPx, 0, 0, Math.PI * 2);
          ctx.stroke();
          
          // Glow for current path
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.globalAlpha = 1;
      } else {
           ctx.font = 'bold 16px monospace';
           ctx.fillStyle = '#f43f5e';
           ctx.textAlign = 'center';
           ctx.fillText("CRITICAL: ESCAPE VELOCITY EXCEEDED", cx, cy - earthRadPx - 40);
      }

      // Draw Spacecraft
      if (eccentricity < 1) {
          const orbitalPeriod = period;
          const timeScale = 150; 
          const meanAnomaly = ((simTime * timeScale) % orbitalPeriod) / orbitalPeriod * 2 * Math.PI;
          
          let E = meanAnomaly;
          for(let k=0; k<5; k++) {
              E = E - (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
          }
          
          const sqrtOneMinusE = Math.sqrt(1 - eccentricity);
          const sqrtOnePlusE = Math.sqrt(1 + eccentricity);
          const tanNuOver2 = sqrtOnePlusE / sqrtOneMinusE * Math.tan(E / 2);
          const nu = 2 * Math.atan(tanNuOver2);
          
          const rAtNu = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(nu));
          const rPx = rAtNu * scale;

          let drawAngle = nu;
          if (state.deltaV < 0) {
             drawAngle = nu + Math.PI;
          }

          const shipX = cx + rPx * Math.cos(drawAngle);
          const shipY = cy + rPx * Math.sin(drawAngle);

          // Ship with core glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(shipX, shipY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Burn Marker
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(cx + r1Px, cy, 3, 0, Math.PI * 2);
          ctx.fill();
      }
    };

    render();
    if (isAnimating) {
        animationRef.current = requestAnimationFrame(() => setSimTime(t => t + 1/60));
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [state, simTime, isAnimating, semiMajorAxis, eccentricity, r1, v2]);

  return (
    <div className="flex flex-col gap-8 h-full font-sans animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Maneuver Lab</h2>
          <p className="text-slate-800 dark:text-slate-400 mt-2 font-black text-[11px] flex items-center gap-3 uppercase tracking-widest">
            <Orbit className="w-4 h-4 text-brand-700 shadow-[0_0_10px_#0ea5e9]" /> Orbital Trajectory Visualization & Delta-V Planning
          </p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setState(s => ({...s, deltaV: 0}))}
                className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-400 dark:border-white/10 hover:border-brand-500 hover:text-brand-800 text-slate-800 dark:text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-md"
            >
                <RotateCcw className="w-4 h-4" /> Reset Vector
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Visualizer Panel */}
        <div className="flex-1 bg-slate-950 border border-white/10 rounded-[3rem] shadow-3xl relative overflow-hidden flex flex-col group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-20 animate-scan"></div>
          
          <div className="absolute top-8 right-8 flex gap-3 z-20">
             <button onClick={() => setState(s => ({...s, zoom: s.zoom * 1.5}))} className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all shadow-lg backdrop-blur-md"><ZoomIn className="w-5 h-5" /></button>
             <button onClick={() => setState(s => ({...s, zoom: s.zoom / 1.5}))} className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all shadow-lg backdrop-blur-md"><ZoomOut className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 relative">
            <canvas ref={canvasRef} width={1600} height={1000} className="w-full h-full object-cover" />
          </div>
          
          <div className="p-8 border-t border-white/5 bg-white/[0.05] flex justify-between items-center px-10">
              <div className="flex items-center gap-10">
                  <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trajectory Status</div>
                      <div className={`text-xs font-black uppercase tracking-widest flex items-center gap-2.5 ${eccentricity < 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                         <div className={`w-2.5 h-2.5 rounded-full ${eccentricity < 1 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                         {eccentricity < 1 ? 'Stable Orbit' : 'Escape Trajectory'}
                      </div>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reference Node</div>
                      <div className="text-xs font-black text-slate-300 uppercase tracking-widest">Earth (WGS84)</div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-brand-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Impulse Logic Active</span>
              </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
          <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black">Initial Altitude</label>
                  <div className="text-2xl font-mono font-bold text-slate-950 dark:text-brand-500">{state.altitude} <span className="text-[10px] text-slate-700 dark:text-slate-600 font-black tracking-widest">KM</span></div>
                </div>
                <input 
                  type="range" min="200" max="2000" step="50"
                  value={state.altitude} 
                  onChange={(e) => setState(s => ({...s, altitude: Number(e.target.value)}))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-800 dark:text-slate-500 font-black">Planned Delta-V</label>
                  <div className={`text-2xl font-mono font-bold ${state.deltaV >= 0 ? 'text-emerald-700 dark:text-emerald-500' : 'text-orange-700 dark:text-orange-500'}`}>
                    {state.deltaV > 0 ? '+' : ''}{state.deltaV} <span className="text-[10px] text-slate-700 dark:text-slate-600 font-black tracking-widest">M/S</span>
                  </div>
                </div>
                <input 
                  type="range" min="-1500" max="3500" step="25"
                  value={state.deltaV} 
                  onChange={(e) => setState(s => ({...s, deltaV: Number(e.target.value)}))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-800 dark:text-slate-600 font-black tracking-widest uppercase">
                  <span>RETROGRADE</span>
                  <span>PROGRADE</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200 dark:border-white/5 space-y-8">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-300 dark:border-white/5 space-y-3 shadow-inner">
                        <div className="text-[9px] font-black text-slate-800 dark:text-slate-500 uppercase tracking-[0.2em]">Periapsis</div>
                        <div className="text-xl font-mono font-bold text-slate-950 dark:text-white tracking-tighter">{periapsisAlt.toFixed(0)}<span className="text-[10px] text-slate-700 ml-1.5 font-black uppercase">KM</span></div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-300 dark:border-white/5 space-y-3 shadow-inner">
                        <div className="text-[9px] font-black text-slate-800 dark:text-slate-500 uppercase tracking-[0.2em]">Apoapsis</div>
                        <div className="text-xl font-mono font-bold text-slate-950 dark:text-white tracking-tighter">{apoapsisAlt < 100000 ? apoapsisAlt.toFixed(0) : '∞'}<span className="text-[10px] text-slate-700 ml-1.5 font-black uppercase">KM</span></div>
                    </div>
                 </div>
                 
                 <div className="p-6 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-[2rem] space-y-5 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-slate-800 dark:text-slate-500">Eccentricity</span>
                        <span className="text-slate-950 dark:text-white font-mono font-black">{eccentricity.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-slate-800 dark:text-slate-500">Period</span>
                        <span className="text-slate-950 dark:text-white font-mono font-black">{eccentricity < 1 ? (period / 60).toFixed(1) : 'N/A'} MIN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-slate-800 dark:text-slate-500">Burn Velocity</span>
                        <span className="text-emerald-800 dark:text-emerald-500 font-mono font-black">{(v2).toFixed(1)} M/S</span>
                    </div>
                 </div>
              </div>
          </div>

          <div className="bg-brand-500/10 dark:bg-brand-600/10 border border-brand-500/30 dark:border-brand-500/20 rounded-[2.5rem] p-8 flex gap-5 items-start shadow-sm">
              <Info className="w-7 h-7 text-brand-700 shrink-0" />
              <p className="text-[10px] font-black text-slate-800 dark:text-slate-400 leading-relaxed uppercase tracking-widest">
                Trajectory modeling assumes Keplerian dynamics. Delta-V maneuvers are calculated as instantaneous impulses at the current orbital node.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};
