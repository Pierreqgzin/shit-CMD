import React, { useEffect, useState, useRef } from 'react';
import { InterfaceData } from '../services/geminiService';

// --- BEACH VISUAL ---
export const BeachVisual: React.FC = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setFrame(f => f + 1), 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border border-terminal-dim p-4 my-2 font-mono text-xs select-none overflow-hidden relative h-48 w-full bg-terminal-bg max-w-lg mx-auto">
        {/* Sun */}
        <div className="absolute top-4 right-12 text-terminal-warn text-6xl animate-pulse opacity-90">
           ☀
        </div>
        
        {/* Sky / Birds */}
        <div className="absolute top-8 left-10 text-terminal-text opacity-70">
           {frame % 4 === 0 ? "v" : " v"} 
        </div>
        <div className="absolute top-12 left-24 text-terminal-text opacity-60 scale-75">
           {frame % 4 === 2 ? "v" : " v"}
        </div>

        {/* Palm Tree Trunk */}
        <div className="absolute bottom-12 left-10 text-terminal-dim font-bold whitespace-pre leading-3">
            {`
      /\\
     /  \\
    /    \\
   /      \\
  /        \\
  |        |
  |        |
            `}
        </div>

        {/* Water Animation */}
        <div className="absolute bottom-0 left-0 w-full h-20 overflow-hidden leading-4 whitespace-pre font-mono">
           {Array(5).fill(0).map((_, i) => (
             <div key={i} className={`${i % 2 === 0 ? "text-terminal-highlight" : "text-terminal-accent"} opacity-${100 - (i * 15)}`}>
               {(i + frame) % 2 === 0 
                 ? "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" 
                 : " ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~"}
             </div>
           ))}
        </div>

        {/* Status Label */}
        <div className="absolute top-2 left-2 text-[10px] bg-terminal-bg border border-terminal-dim px-2 text-terminal-dim">
           SIMULATION: TROPICS_01
        </div>
    </div>
  );
};

// --- MATRIX VISUAL ---
export const MatrixVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = 200;

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = Array(columns).fill(1);
    
    // Check if we are in color mode by checking a CSS variable value from the DOM
    const computedStyle = getComputedStyle(document.documentElement);
    // We'll use the 'accent' color which is Green in color mode, White in B&W
    const color = computedStyle.getPropertyValue('--color-accent').trim();

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color || '#0f0';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-terminal-dim my-2 w-full max-w-lg mx-auto bg-black relative">
       <canvas ref={canvasRef} className="block w-full h-48 opacity-80" />
       <div className="absolute bottom-2 right-2 text-[10px] text-terminal-accent animate-pulse">
         SYSTEM_BREACH_DETECTED
       </div>
    </div>
  );
};

// --- DYNAMIC INTERFACE VISUAL ---
export const DynamicInterfaceVisual: React.FC<{ data?: InterfaceData }> = ({ data }) => {
  if (!data) return <div className="text-terminal-error">DATA_CORRUPT</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-terminal-accent';
      case 'WARN': return 'text-terminal-warn';
      case 'ERR': return 'text-terminal-error';
      default: return 'text-terminal-dim';
    }
  };

  return (
    <div className="border border-terminal-text/50 my-2 max-w-lg mx-auto bg-terminal-bg/50 p-1 font-mono text-xs">
      {/* Header */}
      <div className="bg-terminal-dim/20 p-2 flex justify-between items-center border-b border-terminal-dim/30 mb-2">
        <span className="font-bold text-terminal-highlight tracking-widest uppercase">{data.title}</span>
        <span className="text-[10px] border border-terminal-dim px-1 animate-pulse">{data.systemStatus}</span>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {data.modules.map((mod, idx) => (
          <div key={idx} className="border border-terminal-dim/30 p-2 flex flex-col hover:bg-terminal-text/5 transition-colors">
            <div className="flex justify-between mb-1">
              <span className="text-terminal-text/80 uppercase text-[10px]">{mod.name}</span>
              <span className={`font-bold text-[10px] ${getStatusColor(mod.status)}`}>[{mod.status}]</span>
            </div>
            <div className="text-right font-mono text-terminal-accent">{mod.value}</div>
          </div>
        ))}
      </div>

      {/* Logs Footer */}
      <div className="border-t border-terminal-dim/30 pt-2 px-1">
        <div className="text-[10px] text-terminal-dim mb-1 uppercase">Event Log:</div>
        {data.logs.map((log, i) => (
          <div key={i} className="text-[10px] text-terminal-text/60 truncate">
            &gt; {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const VISUAL_REGISTRY: Record<string, React.FC<any>> = {
  'BEACH': BeachVisual,
  'MATRIX': MatrixVisual,
  'DYNAMIC_INTERFACE': DynamicInterfaceVisual
};