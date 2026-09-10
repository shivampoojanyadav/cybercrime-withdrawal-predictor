import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { case: 'SIH-0F3A2B1C', time_complaint: new Date('2026-09-09T12:00:00').getTime(), window_start: new Date('2026-09-09T13:00:00').getTime(), window_end: new Date('2026-09-09T15:00:00').getTime(), y: 1 },
  { case: 'SIH-9X4C5D2A', time_complaint: new Date('2026-09-09T12:30:00').getTime(), window_start: new Date('2026-09-09T14:30:00').getTime(), window_end: new Date('2026-09-09T16:30:00').getTime(), y: 2 },
  { case: 'SIH-1Y2B3C4D', time_complaint: new Date('2026-09-09T13:15:00').getTime(), window_start: new Date('2026-09-09T14:00:00').getTime(), window_end: new Date('2026-09-09T14:45:00').getTime(), y: 3 },
];

const Timeline: React.FC = () => {
  const formatTime = (tickItem: number) => {
    const d = new Date(tickItem);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full p-2 flex flex-col">
      <div className="font-data text-[10px] text-muted mb-1 px-4">PREDICTION TIMELINE (NEXT 4 HRS)</div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="time_complaint" 
              name="time" 
              domain={['dataMin - 3600000', 'dataMax + 7200000']} 
              tickFormatter={formatTime} 
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#4A7A9B' }}
              axisLine={{ stroke: '#0E2A40' }}
              tickLine={{ stroke: '#0E2A40' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              hide 
              domain={[0, 4]} 
            />
            <ZAxis type="number" range={[50, 50]} />
            <Scatter name="Complaints" data={data} fill="#00D4FF">
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill="#00D4FF" />
              ))}
            </Scatter>
            <Scatter name="Predictions" data={data} fill="#FF6B2B" shape="square">
              {data.map((_entry, index) => (
                 <Cell key={`cell-pred-${index}`} fill="#FF6B2B" opacity={0.3} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Timeline;