
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
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
        const map = L.map(containerRef.current).setView(view, zoom);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        map.on('click', handleMapClick);

        setSelectedCoords(null);
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        setTimeout(() => map.invalidateSize(), 100);
      }
    };

    setupMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, country, handleMapClick]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Typography variant="h6" component="div" fontWeight={600}>
          Select Location
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Alert severity="info" icon={<InfoIcon />}>
            Click anywhere on the map to place a marker, then confirm your selection.
          </Alert>
          {selectedCoords && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Selected: Lat: ${selectedCoords.lat}, Lon: ${selectedCoords.lon}`}
                color="success"
                variant="outlined"
                sx={{ fontFamily: 'monospace' }}
              />
            </Box>
          )}
        </Box>
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            width: '100%',
            height: '100%',
            borderTop: 1,
            borderColor: 'divider',
          }}
          id="map-container"
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedCoords}
          variant="contained"
          color="success"
          startIcon={<CheckIcon />}
        >
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapModal;
