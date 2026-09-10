import { useState, useEffect } from 'react';
import { fetchComplaints } from '../services/api';
import { Search, Filter, ShieldAlert, Fingerprint } from 'lucide-react';

export default function Suspects({ cell }: { cell?: string }) {
  const [suspects, setSuspects] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchComplaints(cell).then(d => {
      const existingStr = localStorage.getItem('demo_complaints');
      const localMock = existingStr ? JSON.parse(existingStr) : [];
      const filteredMock = cell ? localMock.filter((c: any) => c.victim_city.toLowerCase() === cell.toLowerCase()) : localMock;
      
      const all = Array.isArray(d) ? d : (d?.data || []);
      const combined = [...filteredMock, ...all];
      const unique = Array.from(new Map(combined.map((c: any) => [c.mule_account, c])).values());
      
      if (unique.length > 0) setSuspects(unique);
      else throw new Error("Force mock fallback");
    }).catch(() => {
      const existingStr = localStorage.getItem('demo_complaints');
      const localMock = existingStr ? JSON.parse(existingStr) : [];
      const filteredMock = cell ? localMock.filter((c: any) => c.victim_city.toLowerCase() === cell.toLowerCase()) : localMock;
      
      const mocks = generateMockSuspects(cell);
      const combined = [...filteredMock, ...mocks];
      const unique = Array.from(new Map(combined.map((c: any) => [c.mule_account, c])).values());
      setSuspects(unique);
    }).finally(() => {
      setLoading(false);
    });
  }, [cell]);

  const generateMockSuspects = (region?: string) => {
    const r = region || 'Delhi';
    return [
      { mule_holder_name: 'AKRAM KHAN', victim_city: r, mule_account: '304928102948', mule_bank: 'SBI', scam_type: 'Sextortion', priority: 'P1' },
      { mule_holder_name: 'MD KALEEM ANSARI', victim_city: r, mule_account: '20193849102834', mule_bank: 'Bandhan', scam_type: 'KYC Phishing', priority: 'P2' },
      { mule_holder_name: 'SURESH BABU G', victim_city: r, mule_account: '481029381029', mule_bank: 'Kotak', scam_type: 'Loan App Fraud', priority: 'P1' },
      { mule_holder_name: 'DINESH KUMAR YADAV', victim_city: r, mule_account: '10049281920194', mule_bank: 'HDFC', scam_type: 'Investment Scam', priority: 'P2' },
    ];
  };

  const filtered = suspects.filter(s => 
    s.mule_holder_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.mule_account?.includes(search)
  );

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-main tracking-tight">Suspect Database</h2>
          <div className="text-sm text-muted mt-1">Cross-referenced mule accounts and identified threat actors.</div>
        </div>
        <div className="flex items-center gap-4 bg-surface border border-custom px-3 py-2 rounded-xl shadow-sm w-80">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search name or account..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
          />
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-custom bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-main flex items-center gap-2">
            <Fingerprint size={18} className="text-blue-600" />
            Known Mule Accounts
          </h3>
          <button className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-main">
            <Filter size={16} /> Filter
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10 border-b border-custom">
              <tr>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Suspect Name</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Mule Account</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Bank Node</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider">Scam Linkage</th>
                <th className="py-3 px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-gray-100 animate-pulse">
                    <td className="py-4 px-6"><div className="h-5 w-32 bg-gray-200 rounded mb-1"></div><div className="h-3 w-20 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-6"><div className="h-6 w-16 bg-gray-200 rounded-md"></div></td>
                    <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="py-4 px-6 text-right"><div className="h-6 w-20 bg-gray-200 rounded-md ml-auto"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted font-medium">No suspects found in this jurisdiction.</td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{s.mule_holder_name || "UNKNOWN SUBJECT"}</div>
                      <div className="text-xs text-muted font-semibold mt-0.5">Target: {s.victim_city} Area</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm font-semibold tracking-tight text-gray-700">
                      {s.mule_account}
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-block px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                        {s.mule_bank || s.source_bank}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-600">
                      {s.scam_type || s.fraud_type}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {s.priority === 'P1' ? (
                        <span className="flex items-center justify-end gap-1.5 text-red-600 font-bold text-xs uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100 w-fit ml-auto">
                          <ShieldAlert size={14} /> Critical
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1.5 text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 w-fit ml-auto">
                          High
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}