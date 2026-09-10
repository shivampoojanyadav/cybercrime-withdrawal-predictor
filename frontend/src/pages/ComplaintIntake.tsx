import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ComplaintIntake: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [selectedTags, setSelectedTags] = useState<string[]>(['OTP Fraud']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tags = ['OTP Fraud', 'Fake Customer Care', 'Investment Scam', 'Task Fraud', 'Loan App Extortion'];
  const paymentModes = ['UPI', 'NEFT', 'Card', 'Wallet'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/');
    }, 3000);
  };

  return (
    <div className="w-full h-full bg-base overflow-y-auto overflow-x-hidden relative">
      <div className="max-w-[680px] w-full mx-auto p-8 left-aligned pb-24">
        <h1 className="font-display font-bold text-xl text-primary mb-8">NEW COMPLAINT INTAKE</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* SECTION: Victim details */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-display text-xs text-muted uppercase tracking-wider">Victim details</span>
              <div className="h-[1px] bg-custom flex-1"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-display text-sm text-muted">Full Name</label>
                <input type="text" className="bg-surface border border-custom text-primary p-2 font-display text-base focus:outline-none focus:border-b-2 focus:border-b-primary focus:border-t-custom focus:border-l-custom focus:border-r-custom" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-display text-sm text-muted">Contact Number</label>
                <input type="text" className="bg-surface border border-custom text-primary p-2 font-data text-base focus:outline-none focus:border-b-2 focus:border-b-primary focus:border-t-custom focus:border-l-custom focus:border-r-custom" required />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="font-display text-sm text-muted">Location (Tap map to pin)</label>
                <div className="h-[160px] bg-surface border border-custom relative overflow-hidden flex items-center justify-center">
                  <div className="font-data text-xs text-muted">MAPBOX INSTANCE PLACEHOLDER</div>
                  <div className="absolute inset-0 bg-[#020B18]/50"></div>
                  <div className="absolute w-4 h-4 text-warning cursor-crosshair">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: Incident details */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-display text-xs text-muted uppercase tracking-wider">Incident details</span>
              <div className="h-[1px] bg-custom flex-1"></div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-display text-sm text-muted">Amount Lost</label>
                <div className="flex items-center bg-surface border border-custom focus-within:border-b-2 focus-within:border-b-primary focus-within:border-t-custom focus-within:border-l-custom focus-within:border-r-custom">
                  <span className="font-data text-muted text-lg pl-3">₹</span>
                  <input type="number" className="bg-transparent text-primary p-2 font-data text-[28px] w-full focus:outline-none leading-none" defaultValue="0" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-display text-sm text-muted">Date & Time of Incident</label>
                  <div className="flex gap-2">
                    <input type="date" className="bg-surface border border-custom text-primary p-2 font-data text-sm flex-1 focus:outline-none focus:border-b-2 focus:border-b-primary" required />
                    <input type="time" className="bg-surface border border-custom text-primary p-2 font-data text-sm flex-1 focus:outline-none focus:border-b-2 focus:border-b-primary" required />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-display text-sm text-muted">Source Bank</label>
                  <input type="text" className="bg-surface border border-custom text-primary p-2 font-display text-base focus:outline-none focus:border-b-2 focus:border-b-primary" placeholder="e.g. SBI, HDFC" required />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-display text-sm text-muted">Payment Method</label>
                <div className="flex border border-custom bg-surface">
                  {paymentModes.map(mode => (
                    <button 
                      key={mode} 
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`flex-1 py-2 font-display text-sm transition-colors border-r border-custom last:border-r-0 ${paymentMode === mode ? 'bg-primary/20 text-primary' : 'text-muted hover:text-primary hover:bg-surface-hover'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-display text-sm text-muted">Modus Operandi</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm font-display border transition-colors ${selectedTags.includes(tag) ? 'border-primary text-primary bg-primary/10' : 'border-custom text-muted hover:text-primary hover:border-primary/50'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <button type="submit" className="w-full h-[48px] bg-primary text-[#061525] font-display font-bold text-base hover:bg-primary/90 transition-colors mt-4 uppercase tracking-wide">
            Submit Complaint & Run Prediction
          </button>
        </form>
      </div>

      {/* Submitting Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-base flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Scanline Animation */}
            <div className="absolute inset-0 w-full h-[2px] bg-primary glow-cyan animate-scan opacity-70"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 border border-primary/30 flex items-center justify-center mb-6 relative">
                 <div className="absolute inset-2 border border-primary/60 animate-pulse"></div>
                 <div className="absolute inset-4 bg-primary/20"></div>
              </div>
              <h2 className="font-display text-2xl text-primary font-bold tracking-widest">ANALYSING COMPLAINT...</h2>
              <div className="font-data text-muted text-sm mt-4">RUNNING XGBOOST CLASSIFIER / EXTRACTING HOTSPOTS</div>
            </div>
            
            {/* Grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,42,64,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(14,42,64,0.3)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplaintIntake;
