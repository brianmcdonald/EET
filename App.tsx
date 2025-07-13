
import React, { useState, useCallback, useRef } from 'react';
import type { EventData, Movement, Coordinates } from './types';
import { EVENT_TYPE_OPTIONS, TRIGGER_OPTIONS, INITIAL_EVENT_DATA, COUNTRY_OPTIONS } from './constants';
import Header from './components/Header';
import Input from './components/Input';
import Select from './components/Select';
import MovementCard from './components/MovementPairCard';
import MapModal from './components/MapModal';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold text-[#0A3A9A] border-b border-slate-200 pb-3 mb-6">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface ValidationErrors {
  [key: string]: string;
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<EventData>(INITIAL_EVENT_DATA);
  const [isMapOpen, setMapOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const mapSelectionCallbackRef = useRef<(coords: Coordinates) => void>(() => {});

  const clearError = (name: string) => {
    setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
    });
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    clearError(name);
    
    if (e.target instanceof HTMLInputElement && e.target.type === 'date') {
        if (value) {
            const date = new Date(value);
            const isoDate = date.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, [name]: isoDate }));
        } else {
            setFormData(prev => ({ ...prev, [name]: '' }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleMovementChange = useCallback((index: number, field: keyof Omit<Movement, 'id'>, value: string | number | Coordinates | null) => {
    clearError(`movements.${index}.${field}`);
    setFormData(prev => {
        const updatedMovements = [...prev.movements];
        const currentMovement = { ...updatedMovements[index] };
        (currentMovement[field] as any) = value;
        updatedMovements[index] = currentMovement;
        return { ...prev, movements: updatedMovements };
    });
  }, []);
  
  const addMovement = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      movements: [...prev.movements, { id: crypto.randomUUID(), from: null, to: null, individuals: 0 }],
    }));
  }, []);

  const removeMovement = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      movements: prev.movements.filter(p => p.id !== id),
    }));
  }, []);

  const handleRequestMapOpen = useCallback((pairIndex: number, field: 'from' | 'to') => {
    mapSelectionCallbackRef.current = (coords: Coordinates) => {
        clearError(`movements.${pairIndex}.${field}`);
        handleMovementChange(pairIndex, field, coords);
    };
    setMapOpen(true);
  }, [handleMovementChange]);

  const handleMapClose = useCallback(() => {
    setMapOpen(false);
  }, []);

  const handleCoordinateSelect = useCallback((coords: Coordinates) => {
    mapSelectionCallbackRef.current(coords);
    handleMapClose();
  }, [handleMapClose]);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    triggerDownload(blob, `emergency_event_report_${formData.country || 'data'}.json`);
  };

  const handleExportCSV = () => {
    const { movements, ...eventDetails } = formData;
    
    const escapeCsvCell = (cell: any): string => {
        const cellStr = String(cell ?? '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    };
    
    const headers = [
        'country', 'email', 'eventStart', 'eventEnd', 'eventType', 'trigger', 
        'priorityNeed1', 'priorityNeed2', 'priorityNeed3', 'narrativeSummary',
        'movement_id', 'movement_from_lat', 'movement_from_lon', 'movement_to_lat', 'movement_to_lon', 'movement_individuals'
    ];

    const rows = movements.map(movement => {
        const flatMovement = {
            movement_id: movement.id,
            movement_from_lat: movement.from?.lat,
            movement_from_lon: movement.from?.lon,
            movement_to_lat: movement.to?.lat,
            movement_to_lon: movement.to?.lon,
            movement_individuals: movement.individuals
        };
        const rowData = { ...eventDetails, ...flatMovement };
        return headers.map(header => escapeCsvCell(rowData[header as keyof typeof rowData])).join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `emergency_event_report_${formData.country || 'data'}.csv`);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (!formData.country) newErrors.country = 'Country is required.';
    if (!formData.email) {
        newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email address is invalid.';
    }
    if (!formData.eventStart) {
        newErrors.eventStart = 'Event start date is required.';
    } else if (new Date(formData.eventStart) > today) {
        newErrors.eventStart = 'Event start date cannot be in the future.';
    }
    if (!formData.eventEnd) {
        newErrors.eventEnd = 'Event end date is required.';
    } else if (new Date(formData.eventEnd) > today) {
        newErrors.eventEnd = 'Event end date cannot be in the future.';
    } else if (formData.eventStart && formData.eventEnd < formData.eventStart) {
        newErrors.eventEnd = 'End date cannot be before start date.';
    }
    if (!formData.eventType) newErrors.eventType = 'Event type is required.';
    if (!formData.trigger) newErrors.trigger = 'Trigger is required.';
    if (!formData.narrativeSummary.trim()) newErrors.narrativeSummary = 'Narrative summary is required.';
    if (!formData.priorityNeed1) newErrors.priorityNeed1 = 'Priority Need 1 is required.';
    if (!formData.priorityNeed2) newErrors.priorityNeed2 = 'Priority Need 2 is required.';
    if (!formData.priorityNeed3) newErrors.priorityNeed3 = 'Priority Need 3 is required.';

    formData.movements.forEach((m, i) => {
        if (!m.from) newErrors[`movements.${i}.from`] = 'Origin location is required.';
        if (!m.to) newErrors[`movements.${i}.to`] = 'Destination location is required.';
        if (!m.individuals || m.individuals <= 0) {
            newErrors[`movements.${i}.individuals`] = 'Number of individuals must be greater than 0.';
        }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionMessage(null);

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://13.134.130.43:8000/submit-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmissionMessage('Event submitted successfully!');
          setFormData(INITIAL_EVENT_DATA);
          setErrors({});
        } else {
          // Handle HTTP errors. Try to parse response as text first.
          const errorBody = await response.text();
          console.error('Server error response:', errorBody);
          setSubmissionMessage(`Submission failed: ${response.status} - ${response.statusText}. Please check the console for details.`);
        }
      } catch (error) {
        // Handle network errors (e.g., CORS, server down)
        console.error("Submission Error:", error);
        setSubmissionMessage('Error: Request failed. This might be a network issue or a CORS policy problem on the server. Check the browser console.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setSubmissionMessage('Please fix the errors before submitting.');
      console.log("Validation failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <Header />
      <MapModal isOpen={isMapOpen} onClose={handleMapClose} onCoordinateSelect={handleCoordinateSelect} country={formData.country} />
      <main className="max-w-5xl mx-auto mt-8 px-4">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <Section title="Event Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Country" name="country" value={formData.country} onChange={handleInputChange} options={COUNTRY_OPTIONS} required error={errors.country}/>
              <Input label="Your Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="reporter@example.org" error={errors.email}/>
              <Input label="Event Start Date" name="eventStart" type="date" value={formData.eventStart} onChange={handleInputChange} required error={errors.eventStart}/>
              <Input label="Event End Date" name="eventEnd" type="date" value={formData.eventEnd} onChange={handleInputChange} required error={errors.eventEnd}/>
              <Select label="Event Type" name="eventType" value={formData.eventType} onChange={handleInputChange} options={EVENT_TYPE_OPTIONS} required error={errors.eventType}/>
              <Select label="Trigger" name="trigger" value={formData.trigger} onChange={handleInputChange} options={TRIGGER_OPTIONS} required error={errors.trigger}/>
            </div>
          </Section>

          <Section title="Movements">
            <div className="space-y-4">
              {formData.movements.map((movement, index) => (
                <MovementCard
                  key={movement.id}
                  movement={movement}
                  index={index}
                  onChange={handleMovementChange}
                  onRemove={removeMovement}
                  isLast={formData.movements.length === 1}
                  onRequestMapOpen={handleRequestMapOpen}
                  errors={{
                    from: errors[`movements.${index}.from`],
                    to: errors[`movements.${index}.to`],
                    individuals: errors[`movements.${index}.individuals`],
                  }}
                />
              ))}
            </div>
            <button type="button" onClick={addMovement} className="mt-4 flex items-center gap-2 rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
              <AddIcon />
              Add Movement
            </button>
          </Section>

          <Section title="Priority Needs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Priority Need 1" name="priorityNeed1" value={formData.priorityNeed1} onChange={handleInputChange} placeholder="e.g., Shelter" required error={errors.priorityNeed1} />
              <Input label="Priority Need 2" name="priorityNeed2" value={formData.priorityNeed2} onChange={handleInputChange} placeholder="e.g., Food" required error={errors.priorityNeed2} />
              <Input label="Priority Need 3" name="priorityNeed3" value={formData.priorityNeed3} onChange={handleInputChange} placeholder="e.g., Water" required error={errors.priorityNeed3} />
            </div>
          </Section>
          
          <Section title="Narrative">
            <Input
              label="Narrative Summary"
              name="narrativeSummary"
              isTextArea
              rows={6}
              value={formData.narrativeSummary}
              onChange={handleInputChange}
              required
              labelHint="Describe the event in detail."
              error={errors.narrativeSummary}
            />
          </Section>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-200">
             <div className="flex gap-2">
                <button type="button" onClick={handleExportJSON} className="flex items-center justify-center rounded-md bg-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors">
                    <DownloadIcon /> JSON
                </button>
                <button type="button" onClick={handleExportCSV} className="flex items-center justify-center rounded-md bg-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors">
                   <DownloadIcon /> CSV
                </button>
             </div>
             <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center rounded-md bg-[#0A3A9A] px-6 py-2 text-base font-medium text-white hover:bg-[#082f7a] focus:outline-none focus:ring-2 focus:ring-[#0A3A9A] focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
               {isSubmitting ? <SpinnerIcon /> : 'Submit Event'}
              </button>
          </div>
          {submissionMessage && (
            <div className={`mt-4 text-center p-3 rounded-md ${Object.keys(errors).length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {submissionMessage}
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default App;
