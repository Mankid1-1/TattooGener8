import React from 'react';
import { AppSettings, AppTier, PaperSize, BodyPlacement } from '../types';
import { Settings, Key, Trash2, CreditCard, FileText, User } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  tier: AppTier;
  onResetApp: () => void;
  onRestorePurchases: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  settings, 
  onUpdateSettings, 
  tier, 
  onResetApp,
  onRestorePurchases
}) => {

  const handleChangeKey = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        window.location.reload(); 
      } else {
        alert("API Key selection is managed by the host environment.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-black text-white uppercase tracking-widest">Studio Settings</h2>
        <p className="text-ink-400 font-mono text-sm">CONFIGURE YOUR WORKSPACE</p>
      </div>

      {/* Account / Subscription */}
      <div className="bg-ink-800 rounded-xl shadow-lg border border-ink-700 overflow-hidden">
        <div className="p-4 bg-ink-900 border-b border-ink-700 flex items-center gap-2 font-bold text-ink-400 uppercase tracking-wide text-xs">
           <CreditCard className="w-4 h-4" /> Membership Status
        </div>
        <div className="p-4">
           <div className="flex items-center justify-between mb-4">
              <div>
                 <p className="font-bold text-white">Current Tier</p>
                 <p className="text-sm text-ink-500">{tier === AppTier.PRO ? 'Professional Artist' : 'Apprentice (Free)'}</p>
              </div>
              <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${tier === AppTier.PRO ? 'bg-accent-gold text-black' : 'bg-ink-700 text-ink-300'}`}>
                 {tier}
              </div>
           </div>
           
           <button 
             onClick={onRestorePurchases}
             className="w-full py-3 border border-ink-600 rounded-lg text-ink-400 font-bold text-sm hover:bg-ink-700 hover:text-white transition-colors uppercase tracking-wide"
           >
             Restore Purchases
           </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-ink-800 rounded-xl shadow-lg border border-ink-700 overflow-hidden">
        <div className="p-4 bg-ink-900 border-b border-ink-700 flex items-center gap-2 font-bold text-ink-400 uppercase tracking-wide text-xs">
           <Settings className="w-4 h-4" /> Studio Preferences
        </div>
        
        <div className="divide-y divide-ink-700">
           {/* Paper Size */}
           <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded bg-ink-700 flex items-center justify-center text-accent-gold">
                    <FileText className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="font-bold text-white">Stencil Paper</p>
                    <p className="text-xs text-ink-500">Format for flash sheets</p>
                 </div>
              </div>
              <div className="flex bg-ink-900 p-1 rounded-lg border border-ink-700">
                 {Object.values(PaperSize).map(size => (
                    <button
                      key={size}
                      onClick={() => onUpdateSettings({ ...settings, paperSize: size })}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                         settings.paperSize === size 
                         ? 'bg-ink-700 text-white shadow-sm' 
                         : 'text-ink-500 hover:text-ink-300'
                      }`}
                    >
                       {size}
                    </button>
                 ))}
              </div>
           </div>

            {/* Default Placement */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded bg-ink-700 flex items-center justify-center text-accent-gold">
                    <User className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="font-bold text-white">Default Placement</p>
                    <p className="text-xs text-ink-500">Preferred visualization</p>
                 </div>
              </div>
              <select 
                value={settings.defaultPlacement}
                onChange={(e) => onUpdateSettings({...settings, defaultPlacement: e.target.value as BodyPlacement})}
                className="bg-ink-900 border border-ink-700 text-white text-sm font-bold rounded-lg focus:ring-accent-gold focus:border-accent-gold block p-2.5 outline-none"
              >
                  {Object.values(BodyPlacement).map(p => (
                      <option key={p} value={p}>{p}</option>
                  ))}
              </select>
           </div>
        </div>
      </div>

      {/* System */}
      <div className="bg-ink-800 rounded-xl shadow-lg border border-ink-700 overflow-hidden">
        <div className="p-4 bg-ink-900 border-b border-ink-700 flex items-center gap-2 font-bold text-ink-400 uppercase tracking-wide text-xs">
           <Key className="w-4 h-4" /> System
        </div>
        <div className="p-4 space-y-4">
           <div className="flex items-center justify-between">
              <div>
                 <p className="font-bold text-white">API Connection</p>
                 <p className="text-xs text-ink-500">Gemini AI Configuration</p>
              </div>
              <button 
                onClick={handleChangeKey}
                className="px-4 py-2 bg-ink-950 text-white rounded border border-ink-700 text-sm font-bold hover:border-accent-gold transition-colors"
              >
                 Change Key
              </button>
           </div>

           <div className="border-t border-ink-700 pt-4">
              <button 
                onClick={() => {
                   if(confirm("This will delete all saved flash sheets. Continue?")) {
                      onResetApp();
                   }
                }}
                className="flex items-center gap-2 text-red-500 font-bold text-sm hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                 <Trash2 className="w-4 h-4" /> Clear Local Data
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};