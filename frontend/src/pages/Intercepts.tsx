import { useState, useEffect } from 'react';
import { ShieldAlert, Crosshair, MapPin, Activity } from 'lucide-react';

export default function Intercepts({ cell }: { cell?: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // We mock active alerts based on the selected cell
    const generateAlerts = () => {
      const active = [
        { id: 'ALT-1092', target: 'Bandhan Bank ATM, Sector 14', city: 'Delhi', eta: 12, risk: 95, status: 'DISPATCHED', units: ['QRT-Alpha', 'PCR-71'] },
        { id: 'ALT-1093', target: 'SBI ATM, Phase 3', city: 'Noida', eta: 24, risk: 88, status: 'PENDING', units: [] },
        { id: 'ALT-1094', target: 'HDFC Kiosk, Cyber City', city: 'Gurugram', eta: 8, risk: 91, status: 'DISPATCHED', units: ['QRT-Delta'] },
        { id: 'ALT-1095', target: 'Axis Bank ATM, Andheri East', city: 'Mumbai', eta: 45, risk: 75, status: 'PENDING', units: [] },
      ];

      if (cell) {
        setAlerts(active.filter(a => a.city === cell || cell === 'All Regions'));
      } else {
        setAlerts(active);
      }
    };
    generateAlerts();
    const int = setInterval(generateAlerts, 5000);
    return () => clearInterval(int);
  }, [cell]);

  return (
    <div className="flex flex-col gap-8 h-full pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-main tracking-tight">Active AI Intercepts</h2>
          <div className="text-sm text-muted mt-1">Real-time tactical deployment feed for predicted cashout points.</div>
        </div>
        <button className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 shadow-md transition-all flex items-center gap-2">
          <ShieldAlert size={18} />
          SCRAMBLE ALL QRT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-t-4 border-t-red-500 bg-red-50/20">
          <div className="text-sm text-muted font-semibold uppercase tracking-wider mb-2">Critical Windows</div>
          <div className="text-4xl font-bold text-main">{alerts.filter(a => a.eta <= 15).length}</div>
          <div className="text-xs text-muted mt-2">Cashout expected in &lt; 15 mins</div>
        </div>
        <div className="card p-6 border-t-4 border-t-amber-500 bg-amber-50/20">
          <div className="text-sm text-muted font-semibold uppercase tracking-wider mb-2">Units Deployed</div>
          <div className="text-4xl font-bold text-main">{alerts.filter(a => a.status === 'DISPATCHED').length}</div>
          <div className="text-xs text-muted mt-2">Active interception in progress</div>
        </div>
        <div className="card p-6 border-t-4 border-t-blue-500 bg-blue-50/20">
          <div className="text-sm text-muted font-semibold uppercase tracking-wider mb-2">Success Rate (24h)</div>
          <div className="text-4xl font-bold text-main">84.2%</div>
          <div className="text-xs text-muted mt-2">Mules apprehended vs predicted</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-custom flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-main flex items-center gap-2">
              <Activity size={18} className="text-red-500" />
              Live Deployment Feed
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {alerts.length === 0 ? (
              <div className="text-center text-muted p-10">No active intercepts in this jurisdiction.</div>
            ) : (
              alerts.slice(0, 2).map((a, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all bg-white relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${a.status === 'DISPATCHED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold text-gray-900">{a.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${a.status === 'DISPATCHED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted mt-2">
                        <MapPin size={16} />
                        {a.target}
                      </div>
                      {a.units.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted mt-2 font-semibold">
                          <Crosshair size={16} className="text-blue-600" />
                          Units: <span className="text-main">{a.units.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-gray-900 tracking-tighter">
                        {a.eta} <span className="text-sm font-semibold text-muted tracking-normal">mins</span>
                      </div>
                      <div className="text-xs font-semibold text-red-600 uppercase tracking-widest mt-1">ETA</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-gray-200">
           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200 shadow-inner">
             <ShieldAlert size={28} className="text-gray-400" />
           </div>
           <h3 className="text-lg font-bold text-gray-900 mb-2">Predictive Route Optimization</h3>
           <p className="text-sm text-muted">Advanced AI patrol routing and automated drone dispatch integration.</p>
           <span className="mt-6 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest shadow-sm">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}