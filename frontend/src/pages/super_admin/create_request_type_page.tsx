import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, FormControl,
  FormControlLabel, IconButton, InputLabel, MenuItem,
  Select, Stack, Switch, TextField, Typography, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { FieldType, CreateFieldDto } from '../../types/request_types.types';

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
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 3, px: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/super-admin/request-types')}
          color="inherit"
          size="small"
        >
          Retour
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight={700} mb={1}>Nouveau type de demande</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Définissez le nom, la description et les champs spécifiques à ce type de demande.
      </Typography>

      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 2 }}>{formError || error}</Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Nom du type de demande"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>Champs</Typography>
        <Button startIcon={<AddIcon />} onClick={addField} size="small">
          Ajouter un champ
        </Button>
      </Stack>

      <Stack spacing={2}>
        {fields.map((field, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Stack spacing={2} flex={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Nom du champ"
                      value={field.fieldName}
                      onChange={(e) => updateField(index, { fieldName: e.target.value })}
                      fullWidth
                      required
                    />
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={field.fieldType}
                        label="Type"
                        onChange={(e) => updateField(index, { fieldType: e.target.value as FieldType })}
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
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.isRequired}
                        onChange={(e) => updateField(index, { isRequired: e.target.checked })}
                      />
                    }
                    label="Champ obligatoire"
                  />
                </Stack>
                <IconButton
                  color="error"
                  onClick={() => removeField(index)}
                  disabled={fields.length === 1}
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button onClick={() => navigate('/super-admin/request-types')} color="inherit">
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Création...' : 'Créer le type de demande'}
        </Button>
      </Stack>
    </Box>
  );
}