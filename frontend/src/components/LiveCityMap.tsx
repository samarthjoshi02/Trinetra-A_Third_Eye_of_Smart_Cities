import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CivicIssue, EmergencySOS, TrafficData } from '../context/AppContext';

interface LiveCityMapProps {
  issues: CivicIssue[];
  emergencies: EmergencySOS[];
  trafficReports: TrafficData[];
  onSelectIssue?: (issue: CivicIssue) => void;
  onSelectEmergency?: (emergency: EmergencySOS) => void;
}

export const LiveCityMap: React.FC<LiveCityMapProps> = ({
  issues,
  emergencies,
  trafficReports,
  onSelectIssue,
  onSelectEmergency
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered over a generic location or India-representative coordinates
    // We'll center on a point that covers our Indian smart city seed coordinates
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
      attributionControl: false
    });

    // Load CartoDB Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersRef.current = markerGroup;

    return () => {
      map.remove();
    };
  }, []);

  // Update markers when issues, emergencies, or traffic change
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markersRef.current;

    if (!map || !markerGroup) return;

    // Clear existing markers
    markerGroup.clearLayers();

    const bounds: L.LatLngBounds = L.latLngBounds([]);
    let hasCoords = false;

    // 1. Plot emergencies (pulsing red markers)
    emergencies.forEach(emergency => {
      const { lat, lng, zone } = emergency.location;
      if (lat && lng) {
        hasCoords = true;
        bounds.extend([lat, lng]);

        const isResolved = emergency.status === 'resolved';

        // Custom pulsing marker for active SOS
        const sosIcon = L.divIcon({
          className: 'custom-sos-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              ${!isResolved ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60"></span>` : ''}
              <span class="relative inline-flex rounded-full h-4 w-4 ${isResolved ? 'bg-gray-500' : 'bg-red-500 shadow-[0_0_12px_#ff2a5f]'}"></span>
              ${!isResolved ? `<span class="absolute text-[8px] font-bold text-red-500 -top-4 font-orbitron animate-pulse">SOS</span>` : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: sosIcon })
          .bindPopup(`
            <div class="p-2 font-inter text-gray-100 min-w-[200px]">
              <div class="flex justify-between items-center border-b border-gray-700 pb-1 mb-2">
                <span class="font-orbitron font-bold text-red-500 text-xs">CRITICAL SOS</span>
                <span class="px-1.5 py-0.5 rounded text-[9px] bg-red-950/80 text-red-400 border border-red-800 uppercase font-mono">${emergency.status}</span>
              </div>
              <p class="text-sm font-semibold mb-1 uppercase">${emergency.type} incident</p>
              <p class="text-xs text-gray-400 mb-2">${zone}</p>
              <button class="w-full text-center py-1 text-xs font-semibold rounded bg-red-500 hover:bg-red-600 text-white transition font-orbitron" onclick="window.handleMapEmergencyClick('${emergency.id}')">
                RESPOND TO INCIDENT
              </button>
            </div>
          `);
        
        markerGroup.addLayer(marker);
      }
    });

    // 2. Plot civic issues (orange markers)
    issues.forEach(issue => {
      const { lat, lng, zone } = issue.location;
      if (lat && lng) {
        hasCoords = true;
        bounds.extend([lat, lng]);

        const isResolved = issue.status === 'resolved';

        const issueIcon = L.divIcon({
          className: 'custom-issue-marker',
          html: `
            <div class="relative flex items-center justify-center w-6 h-6">
              ${issue.status === 'in_progress' ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-40"></span>` : ''}
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${
                isResolved ? 'bg-green-500 shadow-[0_0_8px_rgba(0,255,135,0.4)]' : 
                issue.status === 'in_progress' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(245,166,35,0.4)]' : 
                'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.4)]'
              }"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([lat, lng], { icon: issueIcon })
          .bindPopup(`
            <div class="p-2 font-inter text-gray-100 min-w-[200px]">
              <div class="flex justify-between items-center border-b border-gray-700 pb-1 mb-2">
                <span class="font-orbitron font-bold text-cyan-400 text-xs">${issue.category.toUpperCase()}</span>
                <span class="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-800 uppercase font-mono">${issue.status}</span>
              </div>
              <p class="text-xs text-gray-300 mb-2 truncate">${issue.description}</p>
              <p class="text-[10px] text-gray-400 mb-2">${zone}</p>
              <button class="w-full text-center py-1 text-xs font-semibold rounded bg-cyan-500 hover:bg-cyan-600 text-black transition font-orbitron" onclick="window.handleMapIssueClick('${issue.id}')">
                VIEW DETAILS
              </button>
            </div>
          `);
        
        markerGroup.addLayer(marker);
      }
    });

    // 3. Expose action handlers globally so they work inside raw HTML Leaflet Popups
    (window as any).handleMapIssueClick = (id: string) => {
      const issue = issues.find(i => i.id === id);
      if (issue && onSelectIssue) onSelectIssue(issue);
    };

    (window as any).handleMapEmergencyClick = (id: string) => {
      const emergency = emergencies.find(e => e.id === id);
      if (emergency && onSelectEmergency) onSelectEmergency(emergency);
    };

    // Auto-fit bounds if markers exist to capture all seeded cities (Delhi, Mumbai, etc.)
    if (hasCoords && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [issues, emergencies, trafficReports, onSelectIssue, onSelectEmergency]);

  return (
    <div className="relative w-full h-full border border-cyber-border rounded-lg overflow-hidden shadow-cyber">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '380px' }} />
      {/* HUD Info Box overlay */}
      <div className="absolute top-2 right-2 bg-cyber-bg/95 border border-cyber-border rounded px-3 py-1.5 text-[10px] font-mono pointer-events-none z-[1000] shadow-cyber backdrop-blur-md">
        <div className="flex items-center space-x-2 text-cyan-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>HUD TRINETRA MAP SATELLITE: ACTIVE</span>
        </div>
      </div>
      {/* Legend overlay */}
      <div className="absolute bottom-2 left-2 bg-cyber-bg/95 border border-cyber-border rounded p-2 text-[9px] font-mono pointer-events-auto z-[1000] shadow-cyber backdrop-blur-md space-y-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-800 pb-1 mb-1 font-orbitron">Sensor Legend</div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-gray-300">Active SOS Alert</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
          <span className="text-gray-300">Reported Civic Issue</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
          <span className="text-gray-300">Issue In-Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-gray-300">Resolved Incident</span>
        </div>
      </div>
    </div>
  );
};
