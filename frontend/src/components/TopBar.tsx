import React, { useEffect, useState } from 'react';

const TopBar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to IST
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setTime(timeStr);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[52px] bg-base flex items-center justify-between px-6 border-b border-custom z-50 relative shrink-0">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] glow-cyan"></div>
      
      {/* Left */}
      <div className="flex items-center">
        <h1 className="font-display font-bold text-lg text-primary tracking-[-0.5px]">INTERCEPT</h1>
      </div>
      
      {/* Center */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center font-data text-xs text-primary">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse-ring mr-2" style={{boxShadow: '0 0 8px #00D4FF'}}></div>
        LIVE FEED &middot; IST {time}
      </div>
      
      {/* Right */}
      <div className="flex items-center gap-4 text-sm text-primary font-display">
        <div className="flex items-center gap-2">
          <span className="text-muted">JURISDICTION:</span> DELHI NCR
        </div>
        <div className="flex items-center gap-2 border-l border-custom pl-4">
          <span>INSP. V. SHARMA</span>
        </div>
        <div className="w-8 h-8 rounded bg-warning/20 border border-warning flex items-center justify-center font-data text-xs text-warning">
          4
        </div>
      </div>
    </div>
  );
};

export default TopBar;
