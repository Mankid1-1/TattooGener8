import React, { useState } from 'react';
import { PurchaseStatus, Product } from '../types';
import { SUBSCRIPTION_PRODUCT } from '../services/storeService';
import { Check, ShieldCheck, Crown, Zap, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
  onRestore: () => Promise<void>;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, onRestore }) => {
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      await onUpgrade();
      setStatus('success');
      setTimeout(onClose, 2000); // Auto close after success
    } catch (e) {
      setStatus('error');
      setErrorMsg("Transaction cancelled or failed.");
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleRestore = async () => {
    setStatus('loading');
    try {
      await onRestore();
      setStatus('idle'); 
      onClose();
    } catch (e) {
      setStatus('error');
      setErrorMsg("No active subscriptions found.");
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="bg-ink-900 w-full md:max-w-md md:rounded-[2rem] rounded-t-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-ink-700">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Header Image/Gradient */}
        <div className="relative h-48 bg-black flex items-center justify-center overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent z-10"></div>
          {/* Abstract dark art background */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]"></div>
          
          <div className="relative z-20 text-center transform translate-y-2">
            <div className="w-16 h-16 bg-accent-gold rounded-full mx-auto shadow-[0_0_30px_rgba(251,191,36,0.4)] flex items-center justify-center mb-3">
               <Crown className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-display font-black text-white tracking-tight">TATTOOCRATE <span className="text-accent-gold">PRO</span></h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Features */}
          <div className="space-y-6 mb-8">
            <FeatureRow 
              icon={<Zap className="w-5 h-5 text-accent-gold" />}
              title="Full Portfolio Generation"
              desc="Generate 28 variations at once."
            />
             <FeatureRow 
              icon={<Crown className="w-5 h-5 text-accent-gold" />}
              title="Advanced Studio Editor"
              desc="Add custom motifs, typography & adjust stencils."
            />
            <FeatureRow 
              icon={<ShieldCheck className="w-5 h-5 text-accent-gold" />}
              title="Commercial License"
              desc="Own your generated designs."
            />
          </div>

          {/* Pricing Card */}
          <div className="border border-accent-gold/30 rounded-xl p-4 bg-accent-gold/5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent-gold text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                Professional
            </div>
            <p className="text-sm font-bold text-accent-gold mb-1 uppercase tracking-wide">Monthly Access</p>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{SUBSCRIPTION_PRODUCT.price}</span>
                <span className="text-ink-400 font-medium">/ month</span>
            </div>
            <p className="text-xs text-ink-400 mt-2">7-day free trial, cancel anytime.</p>
          </div>

          {/* Action Button */}
          <button 
            onClick={handlePurchase}
            disabled={status === 'loading' || status === 'success'}
            className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide ${
                status === 'success' ? 'bg-green-600 text-white' :
                status === 'error' ? 'bg-red-600 text-white' :
                'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            {status === 'success' && <Check className="w-5 h-5" />}
            
            {status === 'idle' && "Start Free Trial"}
            {status === 'loading' && "Processing..."}
            {status === 'success' && "Welcome to the Studio"}
            {status === 'error' && "Try Again"}
          </button>
          
          {errorMsg && (
              <p className="text-center text-red-500 text-xs font-bold mt-2 animate-in fade-in">{errorMsg}</p>
          )}

          {/* Restore Link */}
          <button 
            onClick={handleRestore}
            className="w-full mt-4 text-xs font-bold text-ink-500 hover:text-white transition-colors uppercase tracking-widest"
          >
             Restore Purchases
          </button>

          {/* Legal Footer (Required for App Store) */}
          <div className="mt-8 pt-4 border-t border-ink-800 text-[10px] text-ink-600 text-center leading-relaxed font-mono">
             <p className="mb-2">
                Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
             </p>
             <div className="flex justify-center gap-4">
                <a href="#" className="underline hover:text-white">Privacy</a>
                <a href="#" className="underline hover:text-white">Terms</a>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center shrink-0 shadow-inner">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-white text-sm leading-tight uppercase tracking-wide">{title}</h4>
      <p className="text-xs text-ink-400 font-medium">{desc}</p>
    </div>
  </div>
);