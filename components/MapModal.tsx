
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Coordinates } from '../types';

declare var L: any;

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoordinateSelect: (coords: Coordinates) => void;
  country?: string;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, onCoordinateSelect, country }) => {
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(null);

  const handleMapClick = useCallback((e: any) => {
    const { lat, lng } = e.latlng;
    const coords = { lat: parseFloat(lat.toFixed(6)), lon: parseFloat(lng.toFixed(6)) };
    setSelectedCoords(coords);

    if (markerRef.current) {
      markerRef.current.setLatLng(e.latlng);
    } else if (mapRef.current) {
      markerRef.current = L.marker(e.latlng).addTo(mapRef.current);
    }
  }, []);

  const handleConfirm = () => {
    if (selectedCoords) {
      onCoordinateSelect(selectedCoords);
    }
  };

  useEffect(() => {
    // If the modal is not open, do nothing. The cleanup function from the
    // previous render will have already handled destroying the map instance.
    if (!isOpen) {
      return;
    }

    const setupMap = async () => {
      let view: [number, number] = [20, 0];
      let zoom = 2;

      if (country && country.trim() !== '') {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(country)}&format=json&limit=1&polygon_geojson=0`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              view = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
              zoom = 6;
            }
          }
        } catch (error) {
          console.error("Failed to geocode country, using default view.", error);
        }
      }

      if (containerRef.current) {
        // Create a new map instance and store it in the ref
        const map = L.map(containerRef.current).setView(view, zoom);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        map.on('click', handleMapClick);

        // Clear any state from a previous session
        setSelectedCoords(null);
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        // Invalidate size to ensure it renders correctly after the modal appears
        setTimeout(() => map.invalidateSize(), 100);
      }
    };

    setupMap();

    // Cleanup function: will run when isOpen becomes false or when the component unmounts.
    // This is crucial for preventing Leaflet from trying to control a DOM element
    // that no longer exists or has been re-rendered.
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, country, handleMapClick]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="relative w-11/12 h-5/6 bg-white rounded-lg shadow-xl flex flex-col p-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Select Location</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close map">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="py-4">
            <p className="text-slate-600">Click anywhere on the map to place a marker, then confirm your selection.</p>
            {selectedCoords && (
                 <p className="font-mono text-sm text-slate-800 bg-slate-100 p-2 rounded-md mt-2">
                    Selected: Lat: {selectedCoords.lat}, Lon: {selectedCoords.lon}
                 </p>
            )}
        </div>
        <div ref={containerRef} className="flex-grow w-full h-full rounded-md border border-slate-300" id="map-container"></div>
        <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
            <button
                onClick={handleConfirm}
                disabled={!selectedCoords}
                className="rounded-md bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Selection
            </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
