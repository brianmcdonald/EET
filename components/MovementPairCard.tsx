
import React from 'react';
import type { Movement, Coordinates } from '../types';
import Input from './Input';

interface MovementCardProps {
  movement: Movement;
  index: number;
  onRemove: (id: string) => void;
  onChange: (index: number, field: keyof Omit<Movement, 'id'>, value: string | number | Coordinates) => void;
  onRequestMapOpen: (pairIndex: number, field: 'from' | 'to') => void;
  isLast: boolean;
  errors: {
    from?: string;
    to?: string;
    individuals?: string;
  }
}

const RemoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-6.05a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const LocationSelector: React.FC<{label: string; value: Coordinates | null; onClick: () => void; error?: string;}> = ({label, value, onClick, error}) => (
    <div className={`bg-white p-4 rounded-lg border ${error ? 'border-red-500' : 'border-slate-200'} transition-colors`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full ${value ? 'bg-blue-100 text-[#0A3A9A]' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                  <MapPinIcon />
              </div>
              <div>
                  <h5 className="text-base font-semibold text-slate-800">{label}</h5>
                  {value ? (
                      <p className="font-mono text-sm text-slate-600">
                          {`Lat: ${value.lat.toFixed(4)}, Lon: ${value.lon.toFixed(4)}`}
                      </p>
                  ) : (
                      <p className="text-sm text-slate-500">
                          Click to choose on map
                      </p>
                  )}
              </div>
          </div>
          <button
            type="button"
            onClick={onClick}
            className={`flex-shrink-0 px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${value ? 'bg-slate-600 hover:bg-slate-700' : 'bg-[#0A3A9A] hover:bg-[#082f7a]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3A9A] transition-colors whitespace-nowrap`}
          >
            {value ? 'Change Location' : 'Select on Map'}
          </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
);

const MovementCard: React.FC<MovementCardProps> = ({ movement, index, onRemove, onChange, onRequestMapOpen, isLast, errors }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-slate-600">Movement #{index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(movement.id)}
          disabled={isLast}
          className="text-red-500 hover:text-red-700 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          <RemoveIcon />
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
          <LocationSelector
            label="From location"
            value={movement.from}
            onClick={() => onRequestMapOpen(index, 'from')}
            error={errors.from}
          />
          <LocationSelector
            label="To location"
            value={movement.to}
            onClick={() => onRequestMapOpen(index, 'to')}
            error={errors.to}
          />
      </div>
       <div className="mt-4">
          <Input
            label="Individuals"
            name={`movements.${index}.individuals`}
            type="number"
            value={movement.individuals}
            onChange={(e) => onChange(index, 'individuals', parseInt(e.target.value, 10) || 0)}
            error={errors.individuals}
          />
       </div>
    </div>
  );
};

export default MovementCard;
