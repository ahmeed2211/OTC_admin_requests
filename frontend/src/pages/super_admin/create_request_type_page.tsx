import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, FormControl,
  FormControlLabel, IconButton, InputLabel, MenuItem,
  Select, Stack, Switch, TextField, Typography, Alert,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { FieldType, CreateFieldDto } from '../../types/request_types.types';
import Navbar from '../../components/super_admin/Navbar';

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  [FieldType.TEXT]: 'Texte',
  [FieldType.NUMBER]: 'Nombre',
  [FieldType.DATE]: 'Date',
  [FieldType.BOOLEAN]: 'Oui / Non',
  [FieldType.FILE]: 'Fichier',
};

const emptyField = (): CreateFieldDto => ({
  fieldName: '',
  fieldType: FieldType.TEXT,
  isRequired: false,
  description: '',
});

export default function CreateRequestTypePage() {
  const navigate = useNavigate();
  const { createRequestType, loading, error } = useRequestTypes();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<CreateFieldDto[]>([emptyField()]);
  const [formError, setFormError] = useState<string | null>(null);

  const updateField = (index: number, patch: Partial<CreateFieldDto>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const addField = () => setFields((prev) => [...prev, emptyField()]);

  const removeField = (index: number) =>
    setFields((prev) => prev.filter((_, i) => i !== index));

  const validate = (): string | null => {
    if (!name.trim()) return 'Le nom du type de demande est requis.';
    if (fields.length === 0) return 'Ajoutez au moins un champ.';
    for (const f of fields) {
      if (!f.fieldName.trim()) return 'Chaque champ doit avoir un nom.';
    }
    const names = fields.map((f) => f.fieldName.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      return 'Les noms de champs doivent être uniques.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);

    try {
      await createRequestType({
        name: name.trim(),
        description: description.trim() || undefined,
        fields: fields.map((f) => ({
          ...f,
          fieldName: f.fieldName.trim(),
          description: f.description?.trim() || undefined,
        })),
      });
      navigate('/super-admin/request-types');
    } catch {}
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Navbar showBack />
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            Nouveau type de demande
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Définissez le nom, la description et les champs spécifiques à ce type de demande.
          </Typography>
        </Paper>

        {(error || formError) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {formError || error}
          </Alert>
        )}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Nom du type de demande"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
            />
          </Stack>
        </Paper>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>
            Champs
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addField}
            size="small"
            sx={{
              color: '#22c55e',
              '&:hover': { bgcolor: '#f0fdf4' },
              py: 0.5,
            }}
          >
            Ajouter un champ
          </Button>
        </Stack>

        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Stack spacing={2} flex={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Nom du champ"
                      value={field.fieldName}
                      onChange={(e) => updateField(index, { fieldName: e.target.value })}
                      fullWidth
                      required
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: '#64748b' }}>Type</InputLabel>
                      <Select
                        value={field.fieldType}
                        label="Type"
                        onChange={(e) => updateField(index, { fieldType: e.target.value as FieldType })}
                        sx={{ bgcolor: '#f8fafc' }}
                      >
                        {Object.values(FieldType).map((ft) => (
                          <MenuItem key={ft} value={ft}>{FIELD_TYPE_LABELS[ft]}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <TextField
                    label="Description (optionnel)"
                    value={field.description}
                    onChange={(e) => updateField(index, { description: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.isRequired}
                        onChange={(e) => updateField(index, { isRequired: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#22c55e',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            bgcolor: '#22c55e',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        Champ obligatoire
                      </Typography>
                    }
                  />
                </Stack>
                <IconButton
                  color="error"
                  onClick={() => removeField(index)}
                  disabled={fields.length === 1}
                  sx={{
                    mt: 1,
                    color: '#64748b',
                    '&:hover': {
                      bgcolor: '#fef2f2',
                      color: '#ef4444',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ my: 3, borderColor: '#f1f5f9' }} />
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            onClick={() => navigate('/super-admin/request-types')}
            sx={{
              color: '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: '#22c55e',
              '&:hover': {
                bgcolor: '#16a34a',
              },
            }}
          >
            {loading ? 'Création...' : 'Créer le type de demande'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}