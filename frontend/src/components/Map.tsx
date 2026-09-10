import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface Props {
  selectedCaseId: string | null;
}

const MapView: React.FC<Props> = ({ selectedCaseId: _selectedCaseId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, _setLng] = useState(77.211342);
  const [lat, _setLat] = useState(28.615496);
  const [zoom, _setZoom] = useState(11);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    // Use a dummy token or environment variable
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2R1bW15In0.dummy';
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false
      });

      map.current.on('load', () => {
        // Add dummy data source
        // In real app, fetch from API
      });
    } catch (error) {
      console.warn("Mapbox initialized failed (likely due to invalid token). Render placeholder.");
    }
  }, [lng, lat, zoom]);

  return (
    <div className="w-full h-full relative bg-[#020B18]">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls (Floating Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-surface/90 border border-custom p-1">
        <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
        </button>
        <div className="w-full h-[1px] bg-custom my-1"></div>
        <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </button>
      </div>

      {/* Fallback if Mapbox fails */}
      {!mapboxgl.accessToken || mapboxgl.accessToken.includes('dummy') && (
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <div className="w-64 h-64 border border-warning/30 rounded-full flex items-center justify-center animate-pulse-ring relative">
             <div className="w-32 h-32 border border-warning/50 rounded-full flex items-center justify-center absolute"></div>
          </div>
          <div className="absolute font-display text-warning tracking-widest text-lg bg-base px-4 py-2 border border-warning">
            LIVE MAP HERO (AWAITING TOKEN)
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
