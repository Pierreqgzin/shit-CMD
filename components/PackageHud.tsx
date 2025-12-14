import React, { useState } from 'react';
import { Package } from '../types';

interface PackageHudProps {
  packages: Package[];
  onUninstall: (pkgName: string) => void;
  onReinstall: (pkgName: string) => void;
  onLaunch: (pkg: Package) => void;
}

const PackageHud: React.FC<PackageHudProps> = ({ packages, onUninstall, onReinstall, onLaunch }) => {
  const [activeMenu, setActiveMenu] = useState<'none' | 'system' | 'apps'>('none');

  const systemPackages = packages.filter(p => p.type === 'SYSTEM');
  const userPackages = packages.filter(p => p.type === 'USER');

  const toggleMenu = (menu: 'system' | 'apps') => {
    setActiveMenu(activeMenu === menu ? 'none' : menu);
  };

  const renderSystemList = () => (
    <div className="fixed top-14 right-4 z-50 w-80 bg-terminal-bg border border-terminal-text shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-terminal-dim">
      <div className="border-b border-terminal-text p-2 bg-terminal-text text-terminal-bg font-bold text-center uppercase text-xs flex justify-between">
        <span>CORE MODULES</span>
        <button onClick={() => setActiveMenu('none')} className="hover:bg-terminal-bg hover:text-terminal-text px-1">X</button>
      </div>
      <div className="p-2">
        {systemPackages.map((pkg) => (
           <div key={pkg.name} className="border-b border-terminal-dim/30 py-2 last:border-0">
             <div className="flex justify-between">
                <span className="font-bold text-terminal-highlight">{pkg.name}</span>
                <span className="text-xs text-terminal-dim">v{pkg.version}</span>
             </div>
             <div className="text-[10px] text-terminal-text/70">{pkg.description}</div>
           </div>
        ))}
      </div>
    </div>
  );

  const renderAppsList = () => (
    <div className="fixed top-14 right-4 z-50 w-96 bg-terminal-bg border border-terminal-accent shadow-[0px_0px_15px_-3px] shadow-terminal-accent/30">
      <div className="border-b border-terminal-accent p-2 bg-terminal-accent text-terminal-bg font-bold text-center uppercase tracking-widest text-xs flex justify-between items-center">
        <span>INSTALLED APPS</span>
        <button onClick={() => setActiveMenu('none')} className="hover:bg-terminal-bg hover:text-terminal-text px-1">X</button>
      </div>

      <div className="p-2 max-h-[60vh] overflow-y-auto grid grid-cols-1 gap-2">
        {userPackages.length === 0 ? (
          <div className="text-center py-8 text-terminal-dim italic text-xs">
            NO APPLICATIONS INSTALLED<br/>
            Type 'install &lt;name&gt;' to add.
          </div>
        ) : (
          userPackages.map((pkg) => (
            <button 
              key={pkg.name} 
              onClick={() => {
                onLaunch(pkg);
                setActiveMenu('none');
              }}
              className="group border border-terminal-dim hover:border-terminal-accent p-3 text-left transition-all hover:bg-terminal-accent/10 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-terminal-text group-hover:text-terminal-accent uppercase">{pkg.name}</span>
                <span className="text-[10px] border border-terminal-dim px-1 rounded text-terminal-dim">LAUNCH</span>
              </div>
              <div className="text-[10px] text-terminal-dim truncate">{pkg.description}</div>
              
              {/* Uninstall Small Button */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onUninstall(pkg.name);
                }}
                className="absolute bottom-1 right-1 text-[9px] text-terminal-error opacity-0 group-hover:opacity-100 hover:underline cursor-pointer"
              >
                UNINSTALL
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        <button 
          onClick={() => toggleMenu('system')}
          className={`border px-3 py-1 font-mono text-xs transition-colors uppercase ${activeMenu === 'system' ? 'bg-terminal-text text-terminal-bg' : 'bg-terminal-bg text-terminal-text'}`}
        >
          [ SYSTEM ]
        </button>
        <button 
          onClick={() => toggleMenu('apps')}
          className={`border px-3 py-1 font-mono text-xs transition-colors uppercase ${activeMenu === 'apps' ? 'bg-terminal-accent text-terminal-bg border-terminal-accent' : 'bg-terminal-bg text-terminal-accent border-terminal-accent'}`}
        >
          [ + APPS + ]
        </button>
      </div>

      {activeMenu === 'system' && renderSystemList()}
      {activeMenu === 'apps' && renderAppsList()}
    </>
  );
};

export default PackageHud;
