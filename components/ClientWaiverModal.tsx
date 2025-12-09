import React, { useState } from 'react';
import { ClientWaiver } from '../types';
import { X, Check, ShieldAlert, PenTool } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ClientWaiverModalProps {
  onSign: (waiver: ClientWaiver) => void;
  onClose: () => void;
}

export const ClientWaiverModal: React.FC<ClientWaiverModalProps> = ({ onSign, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    pregnant: false,
    chemical: false,
    skin: false,
    mental: false,
    signature: ''
  });

  const isFormValid = formData.name && formData.dob && formData.signature.length > 2;

  const handleSubmit = () => {
    if (!isFormValid) return;
    
    // Check contraindications
    if (formData.pregnant || formData.chemical) {
        alert("Warning: Based on your responses (Pregnancy or Influence), we cannot proceed with the tattoo session for safety and liability reasons.");
        return;
    }

    const waiver: ClientWaiver = {
        signed: true,
        clientName: formData.name,
        dob: formData.dob,
        signature: formData.signature,
        dateSigned: Date.now(),
        medical: {
            pregnant: formData.pregnant,
            chemicalDependency: formData.chemical,
            skinConditions: formData.skin,
            mentalStatus: formData.mental
        }
    };
    onSign(waiver);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-black w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header - Mimicking DHS Form Style */}
        <div className="p-6 border-b-2 border-black flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest">Client Intake & Consent</h2>
                <p className="text-xs font-mono mt-1 text-gray-600">FORM TC-2024-ENG • TATTOOCRATE STUDIO</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 font-sans">
            
            {/* Section 1: Client Info */}
            <div className="space-y-4">
                <h3 className="font-bold border-b border-gray-300 pb-1 uppercase text-sm">1. Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Client Name</label>
                        <input 
                            type="text" 
                            className="w-full border-b border-black bg-gray-50 px-2 py-1 outline-none focus:bg-yellow-50"
                            placeholder="Full Legal Name"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1">Date of Birth</label>
                        <input 
                            type="date" 
                            className="w-full border-b border-black bg-gray-50 px-2 py-1 outline-none focus:bg-yellow-50"
                            value={formData.dob}
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Medical Questionnaire (Based on PDF) */}
            <div className="space-y-4">
                <h3 className="font-bold border-b border-gray-300 pb-1 uppercase text-sm">2. Medical Questionnaire</h3>
                <p className="text-sm text-gray-600 italic mb-4">
                    Please answer the following questions honestly for your safety. Information is kept confidential.
                </p>
                
                <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                        <span className="text-sm font-bold">Are you currently pregnant or nursing? (PDF Q7)</span>
                        <input type="checkbox" className="w-5 h-5 accent-black" checked={formData.pregnant} onChange={e => setFormData({...formData, pregnant: e.target.checked})} />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                        <span className="text-sm font-bold">Are you under the influence of drugs or alcohol? (PDF Q6)</span>
                        <input type="checkbox" className="w-5 h-5 accent-black" checked={formData.chemical} onChange={e => setFormData({...formData, chemical: e.target.checked})} />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                        <span className="text-sm font-bold">Do you have skin conditions (psoriasis, eczema) at the site?</span>
                        <input type="checkbox" className="w-5 h-5 accent-black" checked={formData.skin} onChange={e => setFormData({...formData, skin: e.target.checked})} />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                        <span className="text-sm font-bold">Do you have a condition affecting mental capacity? (PDF Q5)</span>
                        <input type="checkbox" className="w-5 h-5 accent-black" checked={formData.mental} onChange={e => setFormData({...formData, mental: e.target.checked})} />
                    </label>
                </div>
            </div>

            {/* Section 3: Authorization (Based on PDF Page 2) */}
            <div className="space-y-4">
                <h3 className="font-bold border-b border-gray-300 pb-1 uppercase text-sm">3. Authorization & Electronic Signature</h3>
                <div className="bg-gray-100 p-4 text-xs text-gray-700 leading-relaxed border-l-4 border-black">
                    <p className="mb-2"><strong>Giving Permission:</strong> I attest that the information provided above is true and accurate. I understand that tattooing is a permanent procedure.</p>
                    <p className="mb-2"><strong>Consequences:</strong> I release the artist and studio from all liability regarding the procedure and aftercare.</p>
                    <p><strong>Digital Signature:</strong> By typing my name below, I understand that I am electronically signing this form. I attest that my electronic signature has the same legal effect as a handwritten signature. (MN Stat. §325L.07)</p>
                </div>

                <div className="mt-4">
                     <label className="block text-xs font-bold uppercase mb-2">Client Signature (Type Full Name)</label>
                     <div className="relative">
                        <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full border-2 border-gray-300 rounded p-3 pl-10 font-script text-2xl focus:border-black outline-none"
                            placeholder="Sign here..."
                            value={formData.signature}
                            onChange={e => setFormData({...formData, signature: e.target.value})}
                        />
                     </div>
                </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-black uppercase">Cancel</button>
            <Tooltip content={!isFormValid ? "Complete all required fields" : "Submit Waiver"}>
                <button 
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`px-8 py-3 rounded text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isFormValid ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                    <Check className="w-4 h-4" /> Sign & Proceed
                </button>
            </Tooltip>
        </div>

      </div>
    </div>
  );
};