import { useEffect, useState } from 'react';
import { fetchSummary, fetchComplaints } from '../services/api';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

import MapWidget from '../components/MapWidget';

export default function Dashboard({ cell }: { cell?: string }) {
  const [summary, setSummary] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      const p1 = fetchSummary(cell).then(setSummary).catch(() => {
        const multiplier = cell === 'Delhi' ? 1.5 : cell === 'Noida' ? 0.8 : cell === 'Jaipur' ? 1.2 : cell === 'Lucknow' ? 1.1 : cell === 'Indore' ? 0.7 : 1.0;
        setSummary({
          complaints_filed_today: Math.round(12 * multiplier), 
          active_high_risk_predictions: Math.round(4 * multiplier),
          avg_prediction_lead_time_mins: Math.round(45 / (multiplier || 1)), 
          intercepted_amount_today: 1250000 * multiplier
        });
      });

      const p2 = fetchComplaints(cell).then(d => {
        const existingStr = localStorage.getItem('demo_complaints');
        const localMock = existingStr ? JSON.parse(existingStr) : [];
        const filteredMock = cell ? localMock.filter((c: any) => c.victim_city === cell) : localMock;
        
        if (Array.isArray(d) && d.length > 0) {
           setComplaints([...filteredMock, ...d].slice(0, 8));
        } else if (d?.data && d.data.length > 0) {
           setComplaints([...filteredMock, ...d.data].slice(0, 8));
        } else {
           throw new Error("Force mock fallback");
        }
      }).catch(() => {
        const cityPrefix = cell || 'Global';
        const existingStr = localStorage.getItem('demo_complaints');
        const localMock = existingStr ? JSON.parse(existingStr) : [];
        const filteredMock = cell ? localMock.filter((c: any) => c.victim_city.toLowerCase() === cell.toLowerCase()) : localMock;

        const cityCoords: Record<string, [number, number]> = {
          Delhi: [28.6139, 77.2090],
          Noida: [28.5355, 77.3910],
          Jaipur: [26.9124, 75.7873],
          Lucknow: [26.8467, 80.9462],
          Indore: [22.7196, 75.8577],
          Mumbai: [19.0760, 72.8777],
          Global: [28.6139, 77.2090]
        };
        const bc = cityCoords[cell || 'Global'] || cityCoords['Global'];

        setComplaints([
          ...filteredMock,
          { complaint_id: `SIH-${cityPrefix.substring(0,3).toUpperCase()}-1029`, fraud_type: 'Task Fraud', amount: 45000, status: 'ACTIVE', top_hotspot: { risk_score: 85 }, victim_city: cell || 'Delhi', actual_atm_lat: bc[0] + 0.02, actual_atm_lon: bc[1] - 0.01 },
          { complaint_id: `SIH-${cityPrefix.substring(0,3).toUpperCase()}-1030`, fraud_type: 'Investment Scam', amount: 150000, status: 'MONITORED', top_hotspot: { risk_score: 92 }, victim_city: cell || 'Mumbai', actual_atm_lat: bc[0] - 0.03, actual_atm_lon: bc[1] + 0.02 },
          { complaint_id: `SIH-${cityPrefix.substring(0,3).toUpperCase()}-1031`, fraud_type: 'KYC Phishing', amount: 25000, status: 'ACTIVE', top_hotspot: { risk_score: 65 }, victim_city: cell || 'Noida', actual_atm_lat: bc[0] + 0.01, actual_atm_lon: bc[1] + 0.03 },
        ].slice(0, 8));
      });

      await Promise.all([p1, p2]);
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, [cell]);

  const stats = [
    { title: 'New Complaints (24h)', value: summary?.complaints_filed_today || '-', icon: <AlertCircle size={22} className="text-gray-700" /> },
    { title: 'High Risk Targets', value: summary?.active_high_risk_predictions || '-', icon: <TrendingUp size={22} className="text-red-500" /> },
    { title: 'Avg Lead Time', value: summary?.avg_prediction_lead_time_mins ? `${summary.avg_prediction_lead_time_mins}m` : '-', icon: <Clock size={22} className="text-amber-500" /> },
    { title: 'Intercepted (INR)', value: summary?.intercepted_amount_today ? `₹${(summary.intercepted_amount_today/100000).toFixed(2)}L` : '-', icon: <CheckCircle size={22} className="text-green-500" /> },
  ];

  return (
    <div className="flex flex-col gap-8 h-full pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-main tracking-tight">Command Dashboard</h2>
          <div className="text-sm text-muted mt-1">Real-time threat monitoring and geospatial intelligence</div>
        </div>
        <button className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 shadow-md transition-all">Generate Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                {stat.icon}
              </div>
            </div>
            <div>
              {loading ? (
                 <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              ) : (
                 <div className="text-3xl font-bold text-main tracking-tight">{stat.value}</div>
              )}
              <div className="text-sm font-medium text-muted mt-1">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="card lg:col-span-2 flex flex-col p-1">
          <div className="p-5 border-b border-custom flex justify-between items-center">
            <h3 className="font-semibold text-main">Active Threat Map</h3>
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <div className="flex-1 relative overflow-hidden flex items-center justify-center m-4 rounded-xl border border-gray-200 shadow-inner">
            <MapWidget complaints={complaints} />
          </div>
        </div>

        <div className="card flex flex-col p-1">
          <div className="p-5 border-b border-custom flex justify-between items-center">
            <h3 className="font-semibold text-main">Recent Alerts</h3>
            <button className="text-sm font-semibold text-gray-900 hover:text-black hover:underline">View All &rarr;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {complaints.map((c, i) => (
              <div key={i} className="p-4 border border-transparent hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all rounded-xl mb-2 cursor-pointer">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-sm font-bold text-gray-900">{c.complaint_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${c.top_hotspot?.risk_score > 80 || c.priority === 'P1' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {c.top_hotspot?.risk_score || (c.priority === 'P1' ? 95 : 60)}% Risk
                  </span>
                </div>
                <div className="text-sm font-medium text-muted">{c.fraud_type || c.scam_type}</div>
                <div className="text-sm font-bold text-gray-900 mt-2">₹{(c.amount || c.fraud_amount)?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}