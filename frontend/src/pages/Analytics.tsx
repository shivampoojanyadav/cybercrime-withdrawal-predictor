import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function Analytics({ cell }: { cell?: string }) {
  // Generate slightly different data based on cell to show changes
  const multiplier = cell === 'Delhi' ? 1.5 : cell === 'Noida' ? 0.8 : cell === 'Gurugram' ? 1.2 : cell === 'Mumbai' ? 2.0 : 1.0;

  const trendData = [
    { time: '00:00', complaints: Math.round(12 * multiplier), intercepts: Math.round(2 * multiplier) },
    { time: '04:00', complaints: Math.round(8 * multiplier), intercepts: Math.round(1 * multiplier) },
    { time: '08:00', complaints: Math.round(25 * multiplier), intercepts: Math.round(5 * multiplier) },
    { time: '12:00', complaints: Math.round(40 * multiplier), intercepts: Math.round(12 * multiplier) },
    { time: '16:00', complaints: Math.round(55 * multiplier), intercepts: Math.round(18 * multiplier) },
    { time: '20:00', complaints: Math.round(30 * multiplier), intercepts: Math.round(8 * multiplier) },
  ];

  const riskData = [
    { zone: cell || 'All Regions', highRisk: Math.round(40 * multiplier), mediumRisk: Math.round(24 * multiplier), lowRisk: Math.round(20 * multiplier) },
  ];
  return (
    <div className="flex flex-col gap-8 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-main tracking-tight">Intelligence Analytics</h2>
          <div className="text-sm text-muted mt-1">Holistic view of predictive accuracy and threat vectors.</div>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface border border-custom px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all">Export Report</button>
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm transition-all">Generate AI Summary</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Chart */}
        <div className="card p-6 flex flex-col min-h-[350px]">
          <h3 className="font-semibold text-main mb-6">Threat Volume (24h Trend)</h3>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIntercepts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaints)" name="Registered Threats" />
                <Area type="monotone" dataKey="intercepts" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIntercepts)" name="Successful Intercepts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card p-6 flex flex-col min-h-[350px]">
          <h3 className="font-semibold text-main mb-6">Risk Distribution by Jurisdiction</h3>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="zone" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: '#f9fafb' }}
                   contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                <Bar dataKey="highRisk" stackId="a" fill="#ef4444" name="High Risk Targets" radius={[0, 0, 4, 4]} />
                <Bar dataKey="mediumRisk" stackId="a" fill="#f59e0b" name="Medium Risk" />
                <Bar dataKey="lowRisk" stackId="a" fill="#3b82f6" name="Low Risk" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-main mb-4">AI Model Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
             <div className="text-sm text-muted mb-1">Prediction Accuracy</div>
             <div className="text-2xl font-bold text-main">94.2%</div>
           </div>
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
             <div className="text-sm text-muted mb-1">False Positive Rate</div>
             <div className="text-2xl font-bold text-main">2.1%</div>
           </div>
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
             <div className="text-sm text-muted mb-1">Avg Lead Time (Hrs)</div>
             <div className="text-2xl font-bold text-main">4.5</div>
           </div>
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
             <div className="text-sm text-muted mb-1">Total Cash Saved</div>
             <div className="text-2xl font-bold text-green-600">₹4.2 Cr</div>
           </div>
        </div>
      </div>
    </div>
  );
}