import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, LogType, Package } from './types';
import PackageHud from './components/PackageHud';
import { processAICommand, generateInterfaceData, generatePackageInfo } from './services/geminiService';
import { VISUAL_REGISTRY } from './components/Visuals';

const INITIAL_PACKAGES: Package[] = [
  { name: '@core/kernel', version: '9.0.1', description: 'OmniShell Neural Kernel', type: 'SYSTEM', installedAt: new Date() },
  { name: 'omni-cli', version: '1.4.0', description: 'Command Line Interface Adapter', type: 'SYSTEM', installedAt: new Date() },
];

const App: React.FC = () => {
  // Login State
  const [userName, setUserName] = useState<string | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [isBooting, setIsBooting] = useState(true);

  // Terminal State
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Environment State
  const [layoutMode, setLayoutMode] = useState<'standard' | 'centered' | 'wide'>('standard');
  const [inputStyle, setInputStyle] = useState<'classic' | 'floating' | 'block'>('classic');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLInputElement>(null);

  // Boot Effect
  useEffect(() => {
    setTimeout(() => setIsBooting(false), 1500);
  }, []);

  // Theme Management Effect (Applies themeConfig to CSS variables)
  const applyTheme = (theme: Package['themeConfig']) => {
    const root = document.documentElement;
    if (theme) {
      root.style.setProperty('--color-bg', theme.backgroundColor);
      root.style.setProperty('--color-text', theme.textColor);
      root.style.setProperty('--color-accent', theme.textColor); // Simplify accent to text for generated themes
      root.style.setProperty('--color-dim', theme.textColor + '88'); // 50% opacity hex
      root.style.setProperty('--font-main', theme.fontFamily);
      setLayoutMode(theme.layoutMode);
      setInputStyle(theme.inputStyle);
    } else {
      // Default / Reset
      root.style.setProperty('--color-bg', '#000000');
      root.style.setProperty('--color-text', '#cccccc');
      root.style.setProperty('--font-main', "'Fira Code', monospace");
      setLayoutMode('standard');
      setInputStyle('classic');
    }
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus Handling
  const handleContainerClick = () => {
    const selection = window.getSelection();
    if (selection && selection.type === 'Range') return;
    if (userName) inputRef.current?.focus();
    else loginRef.current?.focus();
  };

  const addLog = (type: LogType, content: string) => {
    setHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        type,
        content,
        timestamp: new Date()
      }
    ]);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    setUserName(loginInput.trim());
    addLog(LogType.SYSTEM, `Welcome back, ${loginInput.trim()}. Neural uplink established.`);
    addLog(LogType.INFO, "Type 'help' for available system commands.");
  };

  // --- Handlers ---

  const handleLaunchApp = (pkg: Package) => {
    addLog(LogType.SYSTEM, `Executing binary: ${pkg.name}...`);
    
    // 1. Apply visual theme
    if (pkg.themeConfig) {
      applyTheme(pkg.themeConfig);
      addLog(LogType.INFO, `[ENV] Loaded visual profile: ${pkg.name}_theme`);
    } else {
      applyTheme(undefined); // Reset if no theme
      addLog(LogType.WARN, `[ENV] No visual profile found. Using system default.`);
    }

    // 2. Render GUI (Simulate App Opening)
    setTimeout(() => {
       const guiTitle = `${pkg.name.toUpperCase()} GUI`;
       const interfaceData = {
         title: guiTitle,
         systemStatus: 'RUNNING',
         modules: [
           { name: 'CPU', value: '12%', status: 'OK' },
           { name: 'MEM', value: '450MB', status: 'OK' },
           { name: 'NET', value: 'CONNECTED', status: 'OK' },
           { name: 'ENV', value: 'MODIFIED', status: 'WARN' }
         ],
         logs: [`Loaded ${pkg.name}`, `Applied ${pkg.themeConfig?.fontFamily || 'default'} font`, 'Ready for input']
       };
       // @ts-ignore
       const payload = JSON.stringify({ component: 'DYNAMIC_INTERFACE', data: interfaceData });
       addLog(LogType.COMPONENT, payload);
    }, 600);
  };

  const handleUninstall = (pkgName: string) => {
    if (pkgName === '@core/kernel') return;
    setPackages(prev => prev.filter(p => p.name !== pkgName));
    addLog(LogType.SYSTEM, `Package '${pkgName}' removed.`);
  };

  const handleReinstall = (pkgName: string) => { /* ... existing logic ... */ };

  const executeSystemCommand = async (cmd: string, args: string[]): Promise<boolean> => {
    switch (cmd.toLowerCase()) {
      case 'clear':
      case 'cls':
        setHistory([]);
        return true;
      case 'reset':
        applyTheme(undefined);
        addLog(LogType.SYSTEM, "Environment reset to factory defaults.");
        return true;
      case 'help':
        addLog(LogType.INFO, `
  Commands:
  install <name>  : Install a new app (with unique theme)
  reset           : Reset visual theme to default
  clear           : Clear screen
  simulate <topic>: Generate dashboard
  beach / matrix  : Visual demos
        `);
        return true;
      // ... keep existing visual commands ...
      case 'beach':
        addLog(LogType.COMPONENT, 'BEACH');
        return true;
      case 'matrix':
        addLog(LogType.COMPONENT, 'MATRIX');
        return true;
      case 'simulate':
        const topic = args.join(' ');
        if (!topic) return true;
        const data = await generateInterfaceData(topic);
        if (data) addLog(LogType.COMPONENT, JSON.stringify({ component: 'DYNAMIC_INTERFACE', data }));
        return true;

      case 'install':
        const pkgName = args[0];
        if (!pkgName) {
           addLog(LogType.ERROR, "Usage: install <name>");
           return true;
        }
        addLog(LogType.SYSTEM, `Downloading ${pkgName}...`);
        const info = await generatePackageInfo(pkgName);
        if (info) {
          setPackages(prev => [...prev, {
            name: pkgName,
            version: info.version,
            description: info.description,
            type: 'USER',
            installedAt: new Date(),
            themeConfig: info.themeConfig
          }]);
          addLog(LogType.INFO, `Installed ${pkgName}. Check [APPS] menu to launch.`);
        }
        return true;

      default: return false;
    }
  };

  const handleSubmit = async (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputValue('');
    setIsProcessing(true);

    addLog(LogType.COMMAND, trimmed);
    const parts = trimmed.split(' ');
    const processed = await executeSystemCommand(parts[0], parts.slice(1));

    if (!processed) {
      const context = history.slice(-5).map(h => h.content);
      const res = await processAICommand(trimmed, context);
      addLog(res.type, res.output);
    }
    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
       /* existing history logic */
       e.preventDefault();
       if (historyIndex < commandHistory.length - 1) {
         setHistoryIndex(i => i + 1);
         setInputValue(commandHistory[commandHistory.length - 1 - (historyIndex + 1)]);
       }
    } else if (e.key === 'ArrowDown') {
       /* existing history logic */
       e.preventDefault();
       if (historyIndex > 0) {
         setHistoryIndex(i => i - 1);
         setInputValue(commandHistory[commandHistory.length - 1 - (historyIndex - 1)]);
       } else {
         setHistoryIndex(-1);
         setInputValue('');
       }
    } else if (e.key === 'Enter') {
      if (inputValue.trim()) handleSubmit(inputValue);
    }
  };

  // --- Render Helpers ---
  const renderLogContent = (entry: LogEntry) => {
      // Re-use existing render logic for logs/components
      if (entry.type === LogType.COMPONENT) {
       let componentKey = entry.content;
       let componentData = null;
       if (entry.content.trim().startsWith('{')) {
         try {
           const parsed = JSON.parse(entry.content);
           componentKey = parsed.component;
           componentData = parsed.data;
         } catch (e) {}
       }
       const VisualComponent = VISUAL_REGISTRY[componentKey];
       return VisualComponent ? <VisualComponent data={componentData} /> : <span>[Unknown]</span>;
    }
    return <span>{entry.content}</span>;
  };

  // --- LOGIN SCREEN ---
  if (!userName) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono p-4">
        {isBooting ? (
          <div className="animate-pulse text-xl">INITIALIZING KERNEL...</div>
        ) : (
          <div className="w-full max-w-md border border-white p-8 bg-black shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)]">
            <h1 className="text-2xl font-bold mb-6 text-center tracking-widest">OMNISHELL ACCESS</h1>
            <form onSubmit={handleLoginSubmit} className="flex flex-col space-y-4">
              <label className="text-xs uppercase tracking-widest text-gray-400">Identity Verification</label>
              <input 
                ref={loginRef}
                autoFocus
                type="text" 
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                className="bg-transparent border-b-2 border-white focus:border-green-500 outline-none py-2 text-center text-xl"
                placeholder="ENTER NAME"
              />
              <button type="submit" className="border border-white hover:bg-white hover:text-black py-2 mt-4 uppercase transition-colors">
                Initialize Session
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div 
      className={`min-h-screen bg-terminal-bg text-terminal-text font-mono p-4 md:p-8 transition-colors duration-500 ${layoutMode === 'centered' ? 'flex flex-col items-center' : ''}`}
      onClick={handleContainerClick}
    >
      <PackageHud 
        packages={packages} 
        onUninstall={handleUninstall} 
        onReinstall={handleReinstall} 
        onLaunch={handleLaunchApp}
      />
      
      <div className={`w-full ${layoutMode === 'centered' ? 'max-w-2xl text-center' : layoutMode === 'wide' ? 'max-w-full' : 'max-w-4xl mx-auto'} mb-24`}>
        {history.map((entry) => (
          <div key={entry.id} className="mb-2 break-words leading-relaxed whitespace-pre-wrap">
            {entry.type === LogType.COMMAND && (
              <div className={`flex ${layoutMode === 'centered' ? 'justify-center' : 'items-start'} text-terminal-accent`}>
                <span className="mr-2 opacity-75">visitor@omnishell:~$</span>
                <span className="font-bold">{entry.content}</span>
              </div>
            )}
            {/* Log Styles */}
            <div className={`${entry.type === LogType.ERROR ? 'text-terminal-error font-bold' : entry.type === LogType.INFO ? 'text-terminal-highlight' : entry.type === LogType.SYSTEM ? 'text-terminal-dim' : 'text-terminal-text'}`}>
              {renderLogContent(entry)}
            </div>
          </div>
        ))}
        {isProcessing && <div className="text-terminal-dim animate-pulse">Processing...</div>}
        <div ref={bottomRef} />
      </div>

      {/* Dynamic Input Area */}
      <div className={`fixed bottom-0 left-0 w-full p-4 ${inputStyle === 'floating' ? 'mb-8' : 'bg-terminal-bg border-t border-terminal-dim'}`}>
        <div className={`max-w-4xl mx-auto flex items-center text-lg ${inputStyle === 'floating' ? 'bg-terminal-bg border border-terminal-accent p-4 shadow-lg rounded' : ''}`}>
          <span className="text-terminal-accent mr-3 hidden md:inline">{userName}@omnishell:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent border-none outline-none text-terminal-text placeholder-terminal-dim caret-terminal-accent ${inputStyle === 'block' ? 'caret-[10px] block-caret' : ''}`}
            placeholder={inputStyle === 'floating' ? "Enter command..." : ""}
            autoFocus
          />
        </div>
      </div>
      
      {inputStyle === 'block' && (
        <style>{`.block-caret { caret-shape: block; }`}</style>
      )}
    </div>
  );
};

export default App;
