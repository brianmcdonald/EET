
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Avatar,
  Alert,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import EditLocationIcon from '@mui/icons-material/EditLocation';
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

const LocationSelector: React.FC<{
  label: string;
  value: Coordinates | null;
  onClick: () => void;
  error?: string;
}> = ({label, value, onClick, error}) => (
  <Card variant="outlined" sx={{ bgcolor: error ? 'error.lighter' : 'background.paper', borderColor: error ? 'error.main' : 'divider' }}>
    <CardContent>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: value ? 'primary.main' : 'grey.300', width: 48, height: 48 }}>
            <LocationOnIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {label}
            </Typography>
            {value ? (
              <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                Lat: {value.lat.toFixed(4)}, Lon: {value.lon.toFixed(4)}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click to choose on map
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant={value ? 'outlined' : 'contained'}
          color={value ? 'secondary' : 'primary'}
          onClick={onClick}
          startIcon={<EditLocationIcon />}
          sx={{ whiteSpace: 'nowrap', minWidth: 140 }}
        >
          {value ? 'Change' : 'Select on Map'}
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </CardContent>
  </Card>
);

const MovementCard: React.FC<MovementCardProps> = ({ movement, index, onRemove, onChange, onRequestMapOpen, isLast, errors }) => {
  return (
    <Card elevation={2} sx={{ bgcolor: 'grey.50' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Chip label={`Movement #${index + 1}`} color="primary" variant="outlined" />
          <Button
            type="button"
            onClick={() => onRemove(movement.id)}
            disabled={isLast}
            color="error"
            startIcon={<DeleteIcon />}
            size="small"
          >
            Remove
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
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

          <Box mt={1}>
            <Input
              label="Number of Individuals"
              name={`movements.${index}.individuals`}
              type="number"
              value={movement.individuals}
              onChange={(e) => onChange(index, 'individuals', parseInt(e.target.value, 10) || 0)}
              error={errors.individuals}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MovementCard;
