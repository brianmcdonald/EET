
import React, { useState, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import type { EventData, Movement, Coordinates } from './types';
import { EVENT_TYPE_OPTIONS, TRIGGER_OPTIONS, INITIAL_EVENT_DATA, COUNTRY_OPTIONS } from './constants';
import Header from './components/Header';
import Input from './components/Input';
import Select from './components/Select';
import MovementCard from './components/MovementPairCard';
import MapModal from './components/MapModal';

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
    today.setHours(23, 59, 59, 999);

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
        const apiUrl = process.env.API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/submit-event`, {
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
          const errorBody = await response.text();
          console.error('Server error response:', errorBody);
          setSubmissionMessage(`Submission failed: ${response.status} - ${response.statusText}. Please check the console for details.`);
        }
      } catch (error) {
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Header />
      <MapModal isOpen={isMapOpen} onClose={handleMapClose} onCoordinateSelect={handleCoordinateSelect} country={formData.country} />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Event Details Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight={600}>
                Event Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Select label="Country" name="country" value={formData.country} onChange={handleInputChange} options={COUNTRY_OPTIONS} required error={errors.country}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Input label="Your Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="reporter@example.org" error={errors.email}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Input label="Event Start Date" name="eventStart" type="date" value={formData.eventStart} onChange={handleInputChange} required error={errors.eventStart}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Input label="Event End Date" name="eventEnd" type="date" value={formData.eventEnd} onChange={handleInputChange} required error={errors.eventEnd}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select label="Event Type" name="eventType" value={formData.eventType} onChange={handleInputChange} options={EVENT_TYPE_OPTIONS} required error={errors.eventType}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select label="Trigger" name="trigger" value={formData.trigger} onChange={handleInputChange} options={TRIGGER_OPTIONS} required error={errors.trigger}/>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Movements Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight={600}>
                Movements
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              </Box>
              <Button
                type="button"
                onClick={addMovement}
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Add Movement
              </Button>
            </CardContent>
          </Card>

          {/* Priority Needs Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight={600}>
                Priority Needs
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Input label="Priority Need 1" name="priorityNeed1" value={formData.priorityNeed1} onChange={handleInputChange} placeholder="e.g., Shelter" required error={errors.priorityNeed1} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Input label="Priority Need 2" name="priorityNeed2" value={formData.priorityNeed2} onChange={handleInputChange} placeholder="e.g., Food" required error={errors.priorityNeed2} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Input label="Priority Need 3" name="priorityNeed3" value={formData.priorityNeed3} onChange={handleInputChange} placeholder="e.g., Water" required error={errors.priorityNeed3} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Narrative Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight={600}>
                Narrative
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Input
                label="Narrative Summary"
                name="narrativeSummary"
                isTextArea
                rows={6}
                value={formData.narrativeSummary}
                onChange={handleInputChange}
                required
                labelHint="Describe the event in detail"
                error={errors.narrativeSummary}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                type="button"
                onClick={handleExportJSON}
                variant="outlined"
                color="secondary"
                startIcon={<DownloadIcon />}
              >
                JSON
              </Button>
              <Button
                type="button"
                onClick={handleExportCSV}
                variant="outlined"
                color="secondary"
                startIcon={<DownloadIcon />}
              >
                CSV
              </Button>
            </Box>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              size="large"
              endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ minWidth: 160 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Event'}
            </Button>
          </Box>

          {/* Submission Message */}
          {submissionMessage && (
            <Box sx={{ mt: 3 }}>
              <Alert severity={Object.keys(errors).length > 0 ? 'error' : 'success'}>
                {submissionMessage}
              </Alert>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default App;
