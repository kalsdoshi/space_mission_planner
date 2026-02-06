
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Send, Bot, User, Loader2, Trash2, Cpu, Terminal, Sparkles, MessageSquare } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const MissionAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));
  const chatRef = useRef(aiRef.current.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are the NASA SLS Mission Support Assistant. You provide technical, professional guidance on Space Launch System (SLS) configurations (Block 1B, Block 2), orbital mechanics (Delta-V, C3 energy), and Artemis mission protocols. Use technical language but remain clear. Reference safety constraints like the 4.1g axial limit when relevant. Keep responses structured and concise.",
    }
  }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: input });
      
      let assistantContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

      for await (const chunk of responseStream) {
        const text = (chunk as GenerateContentResponse).text;
        assistantContent += text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Assistant Connection Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "CRITICAL ERROR: Uplink to support matrix failed. Please verify satellite connection and retry.", 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    chatRef.current = aiRef.current.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are the NASA SLS Mission Support Assistant. You provide technical guidance on SLS configurations and Artemis missions.",
      }
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 font-sans animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Assistant</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-3">
            <Bot className="w-4 h-4 text-brand-500" /> Interactive Technical Support Database (TSD)
          </p>
        </div>
        <button 
          onClick={clearChat}
          className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-red-500/30 hover:text-red-500 text-slate-400 dark:text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-sm"
        >
          <Trash2 className="w-4 h-4" /> Purge Session
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-xl dark:shadow-3xl flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-10"></div>
        
        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-8">
              <div className="w-24 h-24 rounded-[2rem] bg-brand-500/10 flex items-center justify-center relative">
                 <div className="absolute inset-0 animate-ping bg-brand-500/5 rounded-[2rem] opacity-20"></div>
                 <Sparkles className="w-10 h-10 text-brand-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-widest">Awaiting Uplink</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Query the Flight Support matrix regarding SLS Block 1B architecture, Artemis IV trajectory planning, or ESD-30000 technical constraints.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 w-full">
                {[
                  "What is the TLI payload capacity of Block 1B?",
                  "Explain C3 energy requirements for Mars missions.",
                  "Summarize structural G-force limits for SLS."
                ].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => { setInput(prompt); }}
                    className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-brand-500/10 hover:border-brand-500/20 transition-all text-left shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-6 animate-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-500' 
                  : 'bg-slate-100 dark:bg-indigo-500/20 border-slate-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-500'
                }`}>
                  {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>
                <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                   <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                     {msg.role === 'user' ? 'Personnel Access' : 'Mission Support AI'} // {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <div className={`p-6 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm ${
                     msg.role === 'user'
                     ? 'bg-brand-500 text-white rounded-tr-none'
                     : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300 rounded-tl-none shadow-xl'
                   }`}>
                     {msg.content || (loading && i === messages.length - 1 && <Loader2 className="w-4 h-4 animate-spin opacity-50" />)}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
          <form 
            onSubmit={handleSend}
            className="relative flex items-center"
          >
            <div className="absolute left-6 text-slate-400 dark:text-slate-700">
              <Terminal className="w-5 h-5" />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="ENTER COMMAND OR QUERY..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl py-6 pl-16 pr-24 text-slate-900 dark:text-white font-mono text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all tracking-wider placeholder-slate-300 dark:placeholder-slate-700 uppercase shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-4 px-6 py-3 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 disabled:opacity-30 text-white rounded-xl transition-all active:scale-95 flex items-center gap-3 shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <div className="mt-4 flex justify-between px-2">
             <div className="flex items-center gap-4 text-[8px] font-black text-slate-400 dark:text-slate-700 tracking-[0.4em] uppercase">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div> Link Optimized</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-500/50"></div> Encrypted Downlink</span>
             </div>
             <div className="text-[8px] font-black text-slate-400 dark:text-slate-700 tracking-[0.4em] uppercase">
                Gemini Architecture v3.1
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
