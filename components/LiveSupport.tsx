import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Radio, Terminal, Loader2, Volume2, ShieldCheck, Activity } from 'lucide-react';

// Implementation helpers for Base64 and Audio
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveSupport: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<{user?: string, support?: string}[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startCommLink = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      sessionRef.current = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Comm Link established.");
            setIsActive(true);
            setIsConnecting(false);
            
            // Start streaming microphone
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionRef.current.sendRealtimeInput({ media: pcmBlob });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              setIsSpeaking(true);
              const base64 = message.serverContent.modelTurn.parts[0].inlineData.data;
              const buffer = await decodeAudioData(decode(base64), audioContextRef.current!, 24000, 1);
              const source = audioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current!.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current!.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
            }
            
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
                setTranscripts(prev => [{ support: message.serverContent.outputTranscription.text }, ...prev.slice(0, 5)]);
            }
            if (message.serverContent?.inputTranscription) {
                setTranscripts(prev => [{ user: message.serverContent.inputTranscription.text }, ...prev.slice(0, 5)]);
            }
          },
          onclose: () => {
            setIsActive(false);
            stopCommLink();
          },
          onerror: (e) => console.error("Live API Error:", e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are the NASA Flight Support AI for the SLS Program. You are calm, highly technical, and professional. You provide real-time guidance on mission parameters, structural limits (max 4.1g), and historical SLS data. Keep responses concise and focused as if over a radio link.",
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });
    } catch (error) {
      console.error("Comm Link Connection Failed:", error);
      setIsConnecting(false);
    }
  };

  const stopCommLink = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    setIsActive(false);
  };

  return (
    <div className="space-y-10 h-full flex flex-col animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Comm Link</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-3">
                    <Radio className="w-4 h-4 text-brand-500" /> Real-time Encryption-Grade Voice Channel to Flight Support
                </p>
            </div>
            {!isActive ? (
                <button 
                  onClick={startCommLink} 
                  disabled={isConnecting}
                  className="px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-brand-500/30 active:scale-95 transition-all"
                >
                    {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                    {isConnecting ? 'Initializing Frequency...' : 'Establish Link'}
                </button>
            ) : (
                <button 
                  onClick={stopCommLink} 
                  className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-red-500/30 active:scale-95 transition-all animate-pulse"
                >
                    <MicOff className="w-5 h-5" />
                    Terminate Link
                </button>
            )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-0">
            {/* Visualizer and Status */}
            <div className="flex flex-col gap-10">
                <div className="bg-slate-950 border border-white/10 rounded-[3rem] p-12 flex flex-col items-center justify-center relative overflow-hidden flex-1 shadow-3xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent pointer-events-none"></div>
                    
                    {/* Pulsing Visualizer */}
                    <div className="relative mb-12">
                        <div className={`w-48 h-48 rounded-full border-4 border-brand-500/20 flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-100' : 'scale-90 opacity-20'}`}>
                            <div className={`w-32 h-32 rounded-full border-2 border-brand-500/40 flex items-center justify-center ${isActive && isSpeaking ? 'animate-[ping_2s_infinite]' : ''}`}>
                                <div className={`w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center shadow-[0_0_30px_#0ea5e9] ${isActive ? 'opacity-100' : 'opacity-20'}`}>
                                    <Volume2 className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        {isActive && (
                            <div className="absolute -inset-8 pointer-events-none opacity-20">
                                <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-4">
                        <div className={`text-[11px] font-black uppercase tracking-[0.5em] transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {isActive ? 'Carrier Signal Lock Established' : 'Signal Lost // Searching for Frequency'}
                        </div>
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex flex-col items-center gap-1">
                                <Activity className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-800'}`} />
                                <span className="text-[8px] font-black uppercase text-slate-700">TX</span>
                            </div>
                            <div className="h-px w-20 bg-white/10"></div>
                            <div className="flex flex-col items-center gap-1">
                                <ShieldCheck className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-800'}`} />
                                <span className="text-[8px] font-black uppercase text-slate-700">AES-256</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transcript Area */}
            <div className="glass-panel rounded-[3rem] p-12 flex flex-col gap-8 overflow-hidden">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypted Audio Stream</h3>
                    <Terminal className="w-4 h-4 text-slate-700" />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                    {transcripts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 font-black uppercase tracking-widest text-[10px] opacity-20 text-center gap-4">
                            <Radio className="w-12 h-12" />
                            No radio traffic detected
                        </div>
                    ) : (
                        transcripts.map((t, i) => (
                            <div key={i} className={`flex flex-col gap-2 animate-in slide-in-from-bottom-2 ${t.user ? 'items-end' : 'items-start'}`}>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    {t.user ? 'Personnel // TX' : 'Flight Support // RX'}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed ${
                                    t.user 
                                    ? 'bg-brand-500 text-white rounded-tr-none' 
                                    : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                                }`}>
                                    {t.user || t.support}
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