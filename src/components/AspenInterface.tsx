import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Power, Shield, Zap, 
  Settings, Terminal as TerminalIcon, Activity, 
  Cpu, HardDrive, Volume2, Sun, Wifi, 
  ChevronRight, Command, MessageSquare 
} from 'lucide-react';
import { 
  LineChart, Line, ResponsiveContainer, 
  YAxis, AreaChart, Area, XAxis 
} from 'recharts';
import { VoiceManager } from '../lib/voice';
import { generateAspenResponse } from '../lib/gemini';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { toast } from 'sonner';

// Mock system data generator
const generateMockData = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    time: i,
    val: 40 + Math.random() * 40,
  }));
};

export default function AspenInterface() {
  const [isPoweringOn, setIsPoweringOn] = useState(true);
  const [isSystemOnline, setIsSystemOnline] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(65);
  const [cpuLoad, setCpuLoad] = useState(generateMockData(20));
  const [memLoad, setMemLoad] = useState(generateMockData(20));
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: [{ text: string }] }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const voiceManagerRef = useRef<VoiceManager | null>(null);

  const addTerminalLine = (line: string) => {
    setTerminalLines(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  useEffect(() => {
    // Initial boot sequence
    const timer = setTimeout(() => {
      setIsPoweringOn(false);
      setIsSystemOnline(true);
      addTerminalLine("A.S.P.E.N. CORE INITIALIZED");
      addTerminalLine("NEURAL NETWORK CONNECTED");
      addTerminalLine("SYSTEMS ONLINE");
      
      // Initialize Voice
      voiceManagerRef.current = new VoiceManager(
        handleWakeWord,
        handleVoiceResult
      );
      voiceManagerRef.current.speak("Systems online. Active System Performance Enhancement Network is at your service.");
    }, 2500);

    // Dynamic data updates
    const dataInterval = setInterval(() => {
      setCpuLoad(prev => [...prev.slice(1), { time: prev[prev.length - 1].time + 1, val: 30 + Math.random() * 50 }]);
      setMemLoad(prev => [...prev.slice(1), { time: prev[prev.length - 1].time + 1, val: 50 + Math.random() * 20 }]);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(dataInterval);
    };
  }, []);

  const handleWakeWord = () => {
    setIsListening(true);
    voiceManagerRef.current?.speak("Yes sir! Up with something?");
    addTerminalLine("WAKE WORD DETECTED: ASPEN");
  };

  const handleOpenApp = (appName: string) => {
    addTerminalLine(`INITIALIZING MODULE: ${appName.toUpperCase()}`);
    toast.success(`Opening ${appName}...`, {
      description: `Targeting memory sector ${Math.floor(Math.random() * 1000)}xH. System link established.`,
    });
    voiceManagerRef.current?.speak(`Accessing ${appName} modules now, sir.`);
  };

  const handleVoiceResult = async (text: string) => {
    if (!text || isProcessing) return;
    
    setIsListening(false);
    setIsProcessing(true);
    const command = text.toLowerCase();
    addTerminalLine(`USER COMMAND: ${text}`);

    // Check for specific commands first
    if (command.includes("shutdown") || command.includes("switch off") || command.includes("turn off") || command.includes("power off")) {
      await handleShutdown();
      return;
    }

    if (command.includes("open") || command.includes("launch") || command.includes("start")) {
      const apps = ["terminal", "browser", "media", "system", "camera", "settings"];
      const targetApp = apps.find(app => command.includes(app));
      if (targetApp) {
        handleOpenApp(targetApp);
        setIsProcessing(false);
        return;
      }
    }

    if (command.includes("brightness")) {
      if (command.includes("increase") || command.includes("up") || command.includes("more")) setBrightness(prev => Math.min(100, prev + 15));
      else if (command.includes("decrease") || command.includes("down") || command.includes("less")) setBrightness(prev => Math.max(0, prev - 15));
      else if (command.includes("max")) setBrightness(100);
      else if (command.includes("min")) setBrightness(0);
      addTerminalLine("CALIBRATING DISPLAY LUMINANCE...");
    }

    if (command.includes("volume") || command.includes("sound")) {
      if (command.includes("increase") || command.includes("up") || command.includes("more")) setVolume(prev => Math.min(100, prev + 15));
      else if (command.includes("decrease") || command.includes("down") || command.includes("less")) setVolume(prev => Math.max(0, prev - 15));
      else if (command.includes("mute")) setVolume(0);
      else if (command.includes("max")) setVolume(100);
      addTerminalLine("ADJUSTING AUDIO RESONANCE...");
    }

    const response = await generateAspenResponse(text, chatHistory);
    
    if (response) {
      setChatHistory(prev => [...prev, 
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: response }] }
      ]);
      addTerminalLine(`ASPEN: ${response.substring(0, 50)}...`);
      voiceManagerRef.current?.speak(response);
    }
    
    setIsProcessing(false);
  };

  const handleShutdown = async () => {
    voiceManagerRef.current?.speak("Understood, sir. Initiating system sleep sequence. Goodbye.", () => {
      setIsShuttingDown(true);
      setTimeout(() => {
        window.close(); // Most browsers will block this, so we just show an overlay
      }, 2000);
    });
  };

  const toggleListening = () => {
    if (isListening) {
      voiceManagerRef.current?.stop();
      setIsListening(false);
    } else {
      voiceManagerRef.current?.start();
      setIsListening(true);
      toast.info("Microphone Active: Say 'Aspen' or type your command.");
    }
  };

  if (isPoweringOn) {
    return (
      <div className="fixed inset-0 bg-[#030a0f] flex flex-col items-center justify-center scanline">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="w-48 h-48 rounded-full border-4 border-[#00f3ff]/20 animate-pulse flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-[#00f3ff]/40 animate-spin-slow"></div>
            <Shield className="absolute text-[#00f3ff] w-12 h-12 crt-glow" />
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 terminal-font text-[#00f3ff] text-sm tracking-widest text-center"
        >
          <p>A.S.P.E.N. BOOT SEQUENCE</p>
          <div className="w-64 h-1 bg-[#00f3ff]/10 mt-4 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="h-full bg-[#00f3ff]"
            />
          </div>
          <p className="mt-2 text-xs opacity-50">BYPASSING FIREWALLS... SYNCING CORES...</p>
        </motion.div>
      </div>
    );
  }

  if (isShuttingDown) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center scanline z-[10000]">
        <motion.p 
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="terminal-font text-[#00f3ff] tracking-[1em]"
        >
          DISCONNECTED
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 grid grid-cols-[280px_1fr_280px] grid-rows-[auto_1fr_auto] gap-5 bg-[radial-gradient(circle_at_50%_50%,#0A1A1A_0%,#050505_100%)] scanline max-w-[1440px] mx-auto overflow-hidden">
      {/* Header HUD */}
      <header className="col-span-3 flex justify-between items-end border-b border-[#00FFD5]/30 pb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-[0.2em] text-[#00FFD5] terminal-font drop-shadow-[0_0_10px_rgba(0,255,213,0.5)]">A.S.P.E.N.</h1>
          </div>
        </div>

        <div className="flex gap-10 items-center">
          <div className="flex items-center gap-2 terminal-font text-[12px] text-[#00FFD5]">
            <div className="w-2 h-2 bg-[#00FFD5] rounded-full shadow-[0_0_8px_#00FFD5] animate-pulse"></div>
            SYSTEMS ONLINE // ACTIVE_LISTEN_V2.4
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="border-[#00FFD5]/20 hover:bg-[#00FFD5]/10 hover:text-[#00FFD5] h-8 w-8 rounded-full"
            onClick={handleShutdown}
          >
            <Power className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Grid Content */}
        
        {/* Left Column: System Status */}
        <aside className="panel flex flex-col gap-5 glass-panel p-5 overflow-y-auto custom-scrollbar">
           <div className="flex justify-between terminal-font text-[11px] uppercase tracking-wider text-[#606C76]">
             <span>System Core</span>
             <span>01</span>
           </div>

           <div className="space-y-5 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span>Brightness</span>
                  <span className="text-[#00FFD5]">{brightness}%</span>
                </div>
                <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} max={100} step={1} className="flex-1" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span>System Audio</span>
                  <span className="text-[#00FFD5]">{volume}%</span>
                </div>
                <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} step={1} className="flex-1" />
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#606C76] uppercase">
                  <span>CPU Frequency</span>
                  <span className="text-[#00FFD5]">STABLE</span>
                </div>
                <div className="h-16 w-full opacity-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cpuLoad}>
                      <Area type="monotone" dataKey="val" stroke="#00FFD5" fill="#00FFD5" fillOpacity={0.1} strokeWidth={1} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4">
                <div className="terminal-font text-[11px] uppercase tracking-wider text-[#606C76] mb-4">
                  Environment
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => handleOpenApp('Terminal')} variant="outline" className="h-10 bg-white/5 border-white/5 text-[10px] uppercase text-[#606C76] hover:text-[#00FFD5] hover:border-[#00FFD5]/30 rounded-md transition-all">Terminal</Button>
                  <Button onClick={() => handleOpenApp('Browser')} variant="outline" className="h-10 bg-white/5 border-white/5 text-[10px] uppercase text-[#606C76] hover:text-[#00FFD5] rounded-md">Browser</Button>
                  <Button onClick={() => handleOpenApp('Media Center')} variant="outline" className="h-10 bg-white/5 border-white/5 text-[10px] uppercase text-[#606C76] hover:text-[#00FFD5] rounded-md">Media</Button>
                  <Button onClick={() => handleOpenApp('System Config')} variant="outline" className="h-10 bg-white/5 border-white/5 text-[10px] uppercase text-[#606C76] hover:text-[#00FFD5] rounded-md">System</Button>
                </div>
              </div>
           </div>
        </aside>

        {/* Center Canvas: The Core */}
        <main className="flex flex-col items-center justify-center relative">
           <div className="flex-1 flex flex-col items-center justify-center relative">
              <motion.div 
                className="relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={toggleListening}
              >
                <div className="w-[300px] h-[300px] border border-[#00FFD5]/10 rounded-full flex items-center justify-center relative">
                   {/* Outer Pulse Ring */}
                   <AnimatePresence>
                     {isListening && (
                       <motion.div 
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1.4, opacity: [0, 0.4, 0] }}
                         transition={{ repeat: Infinity, duration: 2 }}
                         className="absolute inset-0 border border-[#00FFD5] rounded-full blur-sm"
                       />
                     )}
                   </AnimatePresence>
                   
                   <div className={`absolute w-[220px] h-[220px] border-2 border-dashed border-[#00FFD5]/20 rounded-full ${isListening ? 'animate-spin-slow' : 'opacity-10'}`}></div>
                   <motion.div 
                    animate={isListening ? { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-[140px] h-[140px] bg-[radial-gradient(circle,var(--color-aspen-accent)_0%,transparent_70%)] rounded-full shadow-[0_0_50px_rgba(0,255,213,0.3)] flex items-center justify-center border border-[#00FFD5]/30"
                   >
                     <Zap className={`w-10 h-10 ${isListening ? 'text-[#00FFD5] drop-shadow-[0_0_8px_white]' : 'text-white/20'}`} />
                   </motion.div>
                </div>
              </motion.div>

              <div className="mt-10 text-center terminal-font max-w-lg px-4 min-h-[80px]">
                 <div className="text-[18px] opacity-40 italic tracking-wide mb-2 line-clamp-1">
                   {terminalLines.length > 0 ? terminalLines[terminalLines.length - 1].split(']').pop() : '"Aspen..."'}
                 </div>
                 <AnimatePresence mode="wait">
                   {(isProcessing || chatHistory.length > 0) && (
                     <motion.div 
                       key={isProcessing ? 'proc' : chatHistory.length}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="text-[#00FFD5] font-bold text-xl drop-shadow-[0_0_8px_rgba(0,255,213,0.5)] leading-tight"
                     >
                       {isProcessing ? "ANALYZING REQUEST..." : chatHistory[chatHistory.length - 1]?.parts[0].text.substring(0, 100)}
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </main>

        {/* Right Column: Performance & Logs */}
        <aside className="panel flex flex-col gap-5 glass-panel p-5 overflow-hidden">
           <div className="flex justify-between terminal-font text-[11px] uppercase tracking-wider text-[#606C76]">
             <span>Performance</span>
             <span>02</span>
           </div>
           
           <div className="space-y-0 flex-1 flex flex-col min-h-0">
              <div className="pb-4">
                {[
                  { label: "CPU LOAD", value: "24.8%" },
                  { label: "MEM UTIL", value: "4.2 / 12GB" },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[12px] text-[#606C76]">{stat.label}</span>
                    <span className="text-[12px] terminal-font text-[#00FFD5]">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Terminal Logs integrated here */}
              <div className="flex-1 flex flex-col min-h-0 border-t border-white/5 pt-4">
                <div className="terminal-font text-[10px] uppercase tracking-widest text-[#606C76] mb-2 flex items-center justify-between">
                  <span>Comm Log</span>
                  <TerminalIcon className="w-3 h-3" />
                </div>
                <div className="flex-1 overflow-y-auto terminal-font text-[10px] space-y-2 pr-2 custom-scrollbar">
                  {terminalLines.map((line, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-[#00FFD5]/30 shrink-0">::</span>
                      <span className={line.includes('ASPEN:') ? 'text-[#00FFD5]' : 'text-[#E0E0E0]/60'}>{line.split(']').pop()}</span>
                    </div>
                  ))}
                  <div className="animate-pulse bg-[#00FFD5] w-1 h-3 inline-block"></div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-auto">
                <div className="terminal-font text-[11px] uppercase tracking-wider text-[#606C76] mb-3">
                  Permissions
                </div>
                <div className="flex flex-col gap-2">
                  <div className="permission-tag">FULL_ACCESS: YES</div>
                  <div className="permission-tag">SYS_MOD: YES</div>
                  <div className="permission-tag">ALWAYS_ON: YES</div>
                </div>
              </div>
           </div>
        </aside>

      {/* Bottom Interface: Interactions */}
      <footer className="col-span-3 h-16 bg-black/40 px-6 rounded-full border border-white/10 flex items-center gap-5">
        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_#00FFD5] ${isListening ? 'bg-[#00FFD5] animate-pulse' : 'bg-white/10'}`}></div>
        <div className="flex-1 terminal-font text-[14px] text-[#606C76] overflow-hidden whitespace-nowrap overflow-ellipsis">
          {isListening ? "Waiting for voice command or touch input..." : "SYSTEM IDLE // AWAITING SECURE LINK"}
          <input 
            type="text" 
            autoFocus
            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none pl-14 pr-4 text-white opacity-0 focus:opacity-100 placeholder:text-[#606C76]"
            placeholder="TYPE COMMAND..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleVoiceResult((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
        <div className="terminal-font text-[12px] text-[#606C76] tracking-widest px-4 border-l border-white/10">ENC_ACTIVE</div>
      </footer>
      
      <style>{`
        .spin-slow { animation: spin 8s linear infinite; }
        .ping-slow { animation: ping 4s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .ping-slower { animation: ping 6s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ping { 75%, 100% { transform: scale(1.1); opacity: 0; } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 243, 255, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
