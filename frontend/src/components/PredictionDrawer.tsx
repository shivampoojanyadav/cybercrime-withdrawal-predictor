import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchPrediction } from '../services/api';

interface Props {
  caseId: string;
  onClose: () => void;
}

const PredictionDrawer: React.FC<Props> = ({ caseId, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(4321);
  const [predictionData, setPredictionData] = useState<any>(null);

  useEffect(() => {
    const loadPrediction = async () => {
      try {
        const data = await fetchPrediction(caseId);
        setPredictionData(data);
        if (data.seconds_remaining) {
          setTimeLeft(data.seconds_remaining);
        }
      } catch (err) {
        console.warn('Prediction API failed, using mock data.');
        setPredictionData({
          confidence_pct: 62.3,
          top_hotspots: [
            { name: "Delhi Corridor (cluster 0)", distance_km: 2.4, rank: 1 },
            { name: "Noida Sector 15", distance_km: 8.1, rank: 2 }
          ]
        });
      }
    };
    loadPrediction();
  }, [caseId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-custom flex justify-between items-center bg-base">
        <div>
          <div className="font-data text-xs text-muted">CASE ID</div>
          <div className="font-data text-sm text-primary">{caseId}</div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-custom bg-surface-hover">
        <h3 className="font-display font-semibold text-primary mb-4 text-sm">PREDICTION OUTPUT</h3>
        
        {/* Confidence Arc */}
        <div className="flex justify-center mb-6 relative">
          <svg width="160" height="80" viewBox="0 0 160 80" className="overflow-visible">
            {/* Background Arc */}
            <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="var(--color-border)" strokeWidth="12" strokeLinecap="round" />
            {/* Foreground Arc */}
            <path d="M 10 80 A 70 70 0 0 1 120 20" fill="none" stroke="var(--color-warning)" strokeWidth="12" strokeLinecap="round" />
          </svg>
          <div className="absolute bottom-0 text-center">
            <div className="font-display text-xl font-bold text-warning leading-none">
               {predictionData ? predictionData.confidence_pct : '--'}%
            </div>
            <div className="font-data text-[10px] text-muted mt-1">CONFIDENCE</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {predictionData?.top_hotspots?.map((hs: any, i: number) => (
           i === 0 ? (
            <div key={i} className="border border-warning bg-warning/5 p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-data text-[10px] text-warning bg-warning/20 px-1 inline-block mb-1">RANK {i+1}</div>
                  <div className="font-display font-bold text-primary uppercase">{hs.name}</div>
                </div>
                <div className="font-data text-xs text-muted">{hs.distance_km || 'N/A '} km</div>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                 <span className="font-data text-[10px] text-muted mr-1">ATM DENSITY:</span>
                 <div className="w-1.5 h-1.5 bg-primary"></div>
                 <div className="w-1.5 h-1.5 bg-primary"></div>
                 <div className="w-1.5 h-1.5 bg-primary"></div>
                 <div className="w-1.5 h-1.5 bg-primary"></div>
                 <div className="w-1.5 h-1.5 bg-border"></div>
              </div>

              <div className="mb-4">
                <div className="font-data text-[10px] text-muted mb-1">EST. WITHDRAWAL IN</div>
                <div className="font-data text-lg text-warning">{formatTimeLeft(timeLeft)}</div>
              </div>

              <button className="w-full bg-warning/20 border border-warning text-warning font-display font-bold py-2 text-sm hover:bg-warning hover:text-base transition-colors">
                DEPLOY ALERT
              </button>
            </div>
           ) : (
            <div key={i} className="border border-custom p-3 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-data text-[10px] text-muted border border-border px-1 inline-block mb-1">RANK {i+1}</div>
                  <div className="font-display font-bold text-primary uppercase">{hs.name}</div>
                </div>
                <div className="font-data text-xs text-muted">{hs.distance_km || 'N/A '} km</div>
              </div>
              
              <button className="w-full border border-primary text-primary font-display font-bold py-1.5 text-sm hover:bg-primary/10 mt-2 transition-colors">
                DEPLOY ALERT
              </button>
            </div>
           )
        ))}
      </div>

      <div className="p-4 border-t border-custom bg-base shrink-0">
        <button className="w-full bg-primary text-base font-display font-bold py-3 text-sm hover:bg-primary/90 transition-colors">
          GENERATE FIELD BRIEF
        </button>
      </div>
    </div>
  );
};

export default PredictionDrawer;
