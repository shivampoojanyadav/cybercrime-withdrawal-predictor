import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus, BarChart3, ShieldAlert } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import NewComplaint from './pages/NewComplaint';
import Analytics from './pages/Analytics';

import Intercepts from './pages/Intercepts';

import Suspects from './pages/Suspects';
import Dossier from './pages/Dossier';

function Sidebar() {
  const location = useLocation();
  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Live Intercepts', path: '/intercepts', icon: <ShieldAlert size={20} /> },
    { name: 'Suspects DB', path: '/suspects', icon: <FilePlus size={20} /> },
    { name: 'Intake Form', path: '/intake', icon: <FilePlus size={20} /> },
  ];

  return (
    <div className="w-64 h-full bg-surface border-r border-custom flex flex-col shrink-0 shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-custom">
        <h1 className="text-xl font-bold text-main flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
            <ShieldAlert size={18} className="text-white" />
          </div>
          INTERCEPT
        </h1>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {links.map(link => {
          const active = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-black text-white shadow-md' : 'text-muted hover:bg-gray-100 hover:text-main'}`}
            >
              {link.icon}
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-custom bg-gray-50/50">
         <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
           <span className="text-xs font-bold text-main uppercase tracking-wider">Secure Uplink</span>
         </div>
      </div>
    </div>
  );
}

function TopBar({ cell, setCell }: { cell: string, setCell: (c: string) => void }) {
  return (
    <div className="h-16 w-full bg-surface border-b border-custom flex items-center justify-between px-8 shrink-0">
      <div className="text-sm font-bold text-muted tracking-tight uppercase">
        Command Intelligence System
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Region:</span>
          <select 
            value={cell} 
            onChange={(e) => setCell(e.target.value)}
            className="bg-transparent text-main text-sm font-bold focus:outline-none cursor-pointer"
          >
            <option value="">All Regions</option>
            <option value="Delhi">Delhi NCT</option>
            <option value="Noida">Noida Cyber Cell</option>
            <option value="Jaipur">Jaipur HQ</option>
            <option value="Lucknow">Lucknow Division</option>
            <option value="Indore">Indore Branch</option>
          </select>
        </div>
        <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:scale-105 transition-transform">
          IS
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [cell, setCell] = useState('');

  return (
    <Router>
      <div className="flex h-screen w-screen bg-base overflow-hidden selection:bg-black selection:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <TopBar cell={cell} setCell={setCell} />
          <div className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard cell={cell} />} />
              <Route path="/intake" element={<NewComplaint />} />
              <Route path="/analytics" element={<Analytics cell={cell} />} />
              <Route path="/intercepts" element={<Intercepts cell={cell} />} />
              <Route path="/suspects" element={<Suspects cell={cell} />} />
              <Route path="/complaint/:id" element={<Dossier />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
