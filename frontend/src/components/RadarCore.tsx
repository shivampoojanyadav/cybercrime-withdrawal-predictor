import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const RadarCore: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2R1bW15In0.dummy';
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [77.211342, 28.615496], // Delhi
        zoom: 12,
        pitch: 60, // 3D angle
        bearing: -20,
        attributionControl: false
      });

      map.current.on('load', () => {
        // Add 3D buildings layer
        map.current?.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 11,
          'paint': {
            'fill-extrusion-color': '#020205',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.8
          }
        });
      });
    } catch(e) {
      console.warn("Mapbox error, falling back.");
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <div ref={mapContainer} className="w-full h-full opacity-60 mix-blend-screen filter contrast-125 sepia-[.2] hue-rotate-180" />
      
      {/* Central Radar Sweep Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] pointer-events-none">
        <div className="w-full h-full rounded-full border border-[rgba(0,255,255,0.1)] relative">
          {/* Concentric rings */}
          <div className="absolute inset-10 border border-[rgba(0,255,255,0.05)] rounded-full"></div>
          <div className="absolute inset-24 border border-[rgba(0,255,255,0.05)] rounded-full"></div>
          <div className="absolute inset-40 border border-[rgba(0,255,255,0.05)] rounded-full"></div>
          
          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[rgba(0,255,255,0.1)]"></div>
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[rgba(0,255,255,0.1)]"></div>
          
          {/* Sweeper */}
          <div className="absolute inset-0 radar-spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default RadarCore;