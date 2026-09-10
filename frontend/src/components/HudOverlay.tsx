import React, { useState, useEffect } from 'react';
import { fetchComplaints, fetchPrediction } from '../services/api';

const HudOverlay: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Cases
  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetchComplaints();
        if(d?.data) setCases(d.data);
      } catch(e) {
        setCases([
          { complaint_id: 'TR-9901', fraud_type: 'PHISHING', amount: 89000, top_hotspot: { risk_score: 98, city: 'DELHI' } },
          { complaint_id: 'TR-9902', fraud_type: 'MULE EXTRACT', amount: 450000, top_hotspot: { risk_score: 85, city: 'NOIDA' } }
        ]);
      }
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  // Load Prediction
  useEffect(() => {
    if(!selectedCase) return;
    const loadPred = async () => {
      try {
        const d = await fetchPrediction(selectedCase.complaint_id);
        setPrediction(d);
      } catch(e) {
        setPrediction({
          confidence: 98.4,
          predicted_window: '0h 15m',
          intercept_plan: [
            "1. DISPATCH UNIT-714 to Sector 4 (ETA 4 mins).",
            "2. INITIATE FREEZE protocol on HDFC mule accounts.",
            "3. ACTIVATE CCTV grid."
          ],
          patrol_units: [
            { id: "UNIT-714", status: "AVAILABLE", eta_mins: 4 }
          ]
        });
      }
    };
    loadPred();
  }, [selectedCase]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
      
      {/* TOP HEADER */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-cyan tracking-[0.2em] glow-text-cyan pointer-events-auto cursor-default">
            SYSTEM // OMNI-EYE
          </h1>
          <div className="font-mono text-xs text-pink mt-1 tracking-widest flex items-center">
             <div className="w-2 h-2 bg-pink rounded-full mr-2 animate-pulse"></div>
             CRITICAL THREAT TRACKING ACTIVE
          </div>
        </div>

        <div className="text-right glass-panel p-3 min-w-[200px] border-l-4 border-cyan pointer-events-auto">
          <div className="font-mono text-dim text-[10px] uppercase">Global Time Sync</div>
          <div className="font-mono text-xl text-white tracking-widest">{currentTime}</div>
        </div>
      </header>

      {/* MIDDLE SECTION - PANELS */}
      <div className="flex-1 my-6 flex justify-between items-stretch">
        
        {/* LEFT: TARGET QUEUE */}
        <div className="w-[300px] glass-panel pointer-events-auto flex flex-col border-t-2 border-cyan overflow-hidden">
          <div className="p-3 bg-[rgba(0,255,255,0.1)] border-b border-[rgba(0,255,255,0.2)]">
            <h2 className="font-mono text-sm text-cyan tracking-widest font-bold">TARGET QUEUE</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {cases.map((c, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCase(c)}
                className={`p-3 border transition-all cursor-pointer glitch-hover
                  ${selectedCase?.complaint_id === c.complaint_id 
                    ? 'border-pink bg-[rgba(255,0,127,0.15)] shadow-[0_0_15px_rgba(255,0,127,0.3)]' 
                    : 'border-[rgba(255,255,255,0.1)] hover:border-cyan hover:bg-[rgba(0,255,255,0.05)]'}`}
              >
                <div className="flex justify-between font-mono text-xs mb-2">
                  <span className="text-dim">ID: {c.complaint_id}</span>
                  <span className={c.top_hotspot?.risk_score > 90 ? 'text-pink' : 'text-yellow'}>
                    RISK {c.top_hotspot?.risk_score || '--'}%
                  </span>
                </div>
                <div className="text-lg font-bold text-white tracking-wider">{c.fraud_type}</div>
                <div className="font-mono text-sm text-cyan mt-1">₹{c.amount?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: INTERCEPT PLAN (only visible when case selected) */}
        {selectedCase && prediction && (
          <div className="w-[350px] glass-panel pointer-events-auto flex flex-col border-t-2 border-pink border-b-2 border-pink relative overflow-hidden">
            {/* Scanline effect on panel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,127,0.2)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>

            <div className="p-4 border-b border-[rgba(255,0,127,0.3)] flex justify-between items-center bg-[rgba(255,0,127,0.05)]">
              <h2 className="font-mono text-sm text-pink tracking-widest font-bold glow-text-pink">T.A.C. PLAN</h2>
              <div className="text-xs font-mono text-white bg-pink px-2 py-1">ACTION REQ</div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="mb-6 flex justify-between items-end border-b border-[rgba(255,255,255,0.1)] pb-2">
                <div>
                   <div className="text-[10px] text-dim font-mono">CONFIDENCE LOCUS</div>
                   <div className="text-3xl text-cyan font-bold">{prediction.confidence}%</div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-dim font-mono">T-MINUS (EST)</div>
                   <div className="text-xl text-yellow font-mono">{prediction.predicted_window}</div>
                </div>
              </div>

              <div className="mb-4">
                 <div className="text-xs text-pink font-mono mb-2 uppercase tracking-widest border-l-2 border-pink pl-2">AI Generated Strategy</div>
                 <div className="flex flex-col gap-3">
                   {prediction.intercept_plan?.map((step: string, i: number) => (
                      <div key={i} className="text-sm text-white font-mono leading-relaxed opacity-90 border border-[rgba(255,255,255,0.1)] p-2 bg-[rgba(0,0,0,0.3)]">
                        {step}
                      </div>
                   ))}
                 </div>
              </div>

              <div className="mt-8">
                <div className="text-[10px] text-dim font-mono mb-2">NEARBY TACTICAL UNITS</div>
                {prediction.patrol_units?.map((u: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-[rgba(0,255,102,0.1)] border border-[rgba(0,255,102,0.3)] p-2 mb-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green rounded-full mr-2 shadow-[0_0_5px_#00FF66]"></div>
                      <span className="font-mono text-xs text-white">{u.id}</span>
                    </div>
                    <span className="font-mono text-xs text-green">ETA: {u.eta_mins}m</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[rgba(255,0,127,0.3)]">
              <button className="w-full bg-[rgba(255,0,127,0.2)] border-2 border-pink text-pink font-bold tracking-widest text-lg py-3 hover:bg-pink hover:text-black transition-colors glitch-hover">
                EXECUTE DISPATCH
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <footer className="flex justify-between items-end border-t border-[rgba(255,255,255,0.1)] pt-2 pointer-events-auto">
         <div className="font-mono text-[10px] text-dim">SECURE NODE: ALPHA-NINER // ENCRYPTED</div>
         <div className="flex gap-4">
           <button className="text-cyan font-mono text-xs tracking-widest hover:text-white transition-colors uppercase border-b border-cyan pb-1">Database</button>
           <button className="text-cyan font-mono text-xs tracking-widest hover:text-white transition-colors uppercase border-b border-cyan pb-1">Network Trace</button>
         </div>
      </footer>
    </div>
  );
};

export default HudOverlay;