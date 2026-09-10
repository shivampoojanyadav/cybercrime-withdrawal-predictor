import React, { useEffect, useState } from 'react';
import { fetchComplaints } from '../services/api';

interface Case {
  complaint_id: string;
  fraud_type: string;
  amount: number;
  status: string;
  priority: string;
  time_since: string;
  prediction_ready: boolean;
  complaint_time?: string;
  top_hotspot?: any;
}

interface Props {
  onSelectCase: (id: string) => void;
  activeCaseId: string | null;
}

const CaseFeed: React.FC<Props> = ({ onSelectCase, activeCaseId }) => {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchComplaints();
        if (data && data.data) {
          const mapped = data.data.map((c: any) => {
             // Calculate time since
             const cTime = new Date(c.complaint_time).getTime();
             const now = new Date().getTime();
             const diffMins = Math.floor((now - cTime) / 60000);
             const timeStr = diffMins > 60 ? `${Math.floor(diffMins/60)}h ago` : `${diffMins}m ago`;
             return {
                ...c,
                time_since: timeStr,
                prediction_ready: !!c.top_hotspot
             };
          });
          setCases(mapped);
        }
      } catch (err) {
        console.warn('Failed to load real complaints, falling back to mock.', err);
        // Fallback mock data
        setCases([
          { complaint_id: 'SIH-0F3A2B1C', fraud_type: 'Task Fraud', amount: 74886.0, status: 'ACTIVE', priority: 'CRITICAL', time_since: '2m ago', prediction_ready: true },
          { complaint_id: 'SIH-9X4C5D2A', fraud_type: 'Investment Scam', amount: 1500000.0, status: 'ACTIVE', priority: 'HIGH', time_since: '14m ago', prediction_ready: true },
        ]);
      }
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBorderColor = (priority: string, status: string) => {
    if (status === 'CLEARED') return 'bg-safe';
    if (priority === 'CRITICAL' || priority === 'HIGH') return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-custom shrink-0 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary font-display">ACTIVE COMPLAINTS</h2>
        <div className="font-data text-xs text-primary bg-primary/10 px-2 py-1">
          {cases.filter(c => c.status !== 'CLEARED').length} LIVE
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {cases.map((c, i) => (
          <div 
            key={c.complaint_id}
            onClick={() => onSelectCase(c.complaint_id)}
            className={`w-full p-4 border-b border-custom cursor-pointer transition-colors relative group
              ${activeCaseId === c.complaint_id ? 'bg-surface-hover' : 'hover:bg-surface-hover'}`}
          >
            {/* Left Edge Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${getBorderColor(c.priority, c.status)} 
              ${i === 0 ? 'animate-pulse' : ''} group-hover:glow-cyan`}></div>
            
            <div className="flex justify-between items-start mb-1">
              <span className="font-data text-xs text-muted">{c.complaint_id}</span>
              <span className="font-data text-xs text-muted">{c.time_since}</span>
            </div>
            
            <div className="text-base font-semibold font-display text-primary mb-1">
              {c.fraud_type.toUpperCase()}
            </div>
            
            <div className="text-lg font-display text-warning font-semibold">
              ₹{c.amount.toLocaleString('en-IN')}
            </div>

            {c.prediction_ready && (
              <div className="mt-3 inline-block font-data text-[10px] text-primary border border-primary/30 bg-primary/5 px-2 py-1">
                PREDICTION READY
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-custom shrink-0 bg-base">
        <div className="font-data text-xs text-muted mb-2">THREAT LEVEL</div>
        <div className="flex h-2 w-full gap-1">
          <div className="h-full bg-warning flex-grow" style={{flex: 2}}></div>
          <div className="h-full bg-primary flex-grow" style={{flex: 5}}></div>
          <div className="h-full bg-safe flex-grow" style={{flex: 3}}></div>
        </div>
        <div className="flex justify-between text-[10px] font-data text-muted mt-1">
          <span>2 CRITICAL</span>
          <span>5 HIGH</span>
          <span>3 MED</span>
        </div>
      </div>
    </div>
  );
};

export default CaseFeed;
