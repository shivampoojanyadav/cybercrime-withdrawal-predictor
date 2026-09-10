import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icons not loading properly in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapWidget({ complaints }: { complaints: any[] }) {
  // We don't need to fetch predictions, the new backend provides actual_atm_lat / lon
  // on the complaint object itself.
  const activeTargets = complaints.filter(c => c.actual_atm_lat && c.actual_atm_lon);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[28.6139, 77.2090]} // New Delhi
        zoom={11} 
        style={{ height: "100%", width: "100%", zIndex: 1, borderRadius: '12px' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {activeTargets.map((c, i) => {
          const isHighRisk = c.priority === 'P1' || (c.top_hotspot && c.top_hotspot.risk_score > 80);
          return (
             <CircleMarker 
                key={i}
                center={[c.actual_atm_lat, c.actual_atm_lon]} 
                radius={isHighRisk ? 12 : 8}
                pathOptions={{
                  color: isHighRisk ? '#ef4444' : '#f59e0b',
                  fillColor: isHighRisk ? '#ef4444' : '#f59e0b',
                  fillOpacity: 0.4,
                  weight: 2
                }}
             >
                <Popup>
                  <div className="text-main p-1">
                    <strong className="block mb-1 text-sm">{c.complaint_id}</strong>
                    <div className="text-xs text-muted mb-1">Target: {c.victim_city || c.victim_state} Area</div>
                    <div className="text-xs font-semibold text-main">Scam: {c.scam_type || c.fraud_type}</div>
                  </div>
                </Popup>
             </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}