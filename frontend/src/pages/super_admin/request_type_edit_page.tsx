import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, CircularProgress, Divider,
  FormControl, FormControlLabel, IconButton, InputLabel,
  MenuItem, Select, Stack, Switch, TextField, Typography,
  Alert, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { RequestType, FieldType, CreateFieldDto } from '../../types/request_types.types';

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

export default function RequestTypeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getRequestTypeById, updateRequestType, addFields, removeField,
    loading, error,
  } = useRequestTypes();

  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [newFields, setNewFields] = useState<CreateFieldDto[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = async () => {
    if (!id) return;
    setFormError(null);
    try {
      const data = await getRequestTypeById(id);
      setRequestType(data);
      setName(data.name);
      setDescription(data.description ?? '');
      setIsActive(data.isActive);
    } catch (e: any) {
      setFormError(e.response?.data?.message ?? 'Erreur lors du chargement.');
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveMetadata = async () => {
    if (!id) return;
    setFormError(null);
    setSaveSuccess(false);
    try {
      await updateRequestType(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
      });
      setSaveSuccess(true);
      await load();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      setFormError(e.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    }
  };

  const handleRemoveExistingField = async (fieldId: string) => {
    if (!id) return;
    setFormError(null);
    try {
      await removeField(fieldId);
      await load();
    } catch (e: any) {
      setFormError(e.response?.data?.message ?? 'Erreur lors de la suppression du champ.');
    }
  };

  const addNewFieldRow = () => setNewFields((prev) => [...prev, emptyField()]);

  const updateNewField = (index: number, patch: Partial<CreateFieldDto>) => {
    setNewFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const removeNewFieldRow = (index: number) =>
    setNewFields((prev) => prev.filter((_, i) => i !== index));

  const handleAddFields = async () => {
    if (!id || newFields.length === 0) return;
    const invalid = newFields.some((f) => !f.fieldName.trim());
    if (invalid) {
      setFormError('Chaque nouveau champ doit avoir un nom.');
      return;
    }
    setFormError(null);
    try {
      await addFields(
        id,
        newFields.map((f) => ({
          ...f,
          fieldName: f.fieldName.trim(),
          description: f.description?.trim() || undefined,
        })),
      );
      setNewFields([]);
      await load();
    } catch (e: any) {
      setFormError(e.response?.data?.message ?? "Erreur lors de l'ajout des champs.");
    }
  };

  if (initialLoad) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!requestType) {
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error">{formError || 'Type de demande introuvable.'}</Alert>
      </Box>
    );
  }

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

      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
        <Typography variant="h5" fontWeight={700}>{requestType.name}</Typography>
        <Chip
          label={requestType.isActive ? 'Actif' : 'Inactif'}
          color={requestType.isActive ? 'success' : 'default'}
          size="small"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Modifiez les informations générales et les champs de ce type de demande.
      </Typography>

      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 2 }}>{formError || error}</Alert>
      )}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>Modifications enregistrées.</Alert>
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
            <FormControlLabel
              control={
                <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              }
              label="Type de demande actif"
            />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={handleSaveMetadata} disabled={loading}>
                Enregistrer
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
        Champs existants ({requestType.fields?.length ?? 0})
      </Typography>

      <Stack spacing={1.5} mb={3}>
        {(requestType.fields ?? []).length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Aucun champ défini pour ce type.
          </Typography>
        )}
        {requestType.fields?.map((field) => (
          <Card key={field.id} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={600}>{field.fieldName}</Typography>
                    <Chip label={FIELD_TYPE_LABELS[field.fieldType]} size="small" variant="outlined" />
                    {field.isRequired && (
                      <Chip label="Requis" size="small" color="warning" variant="outlined" />
                    )}
                  </Stack>
                  {field.description && (
                    <Typography variant="caption" color="text.secondary">
                      {field.description}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveExistingField(field.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>Ajouter des champs</Typography>
        <Button startIcon={<AddIcon />} onClick={addNewFieldRow} size="small">
          Nouveau champ
        </Button>
      </Stack>

      {newFields.length > 0 && (
        <Stack spacing={2} mb={2}>
          {newFields.map((field, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Stack spacing={2} flex={1}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Nom du champ"
                        value={field.fieldName}
                        onChange={(e) => updateNewField(index, { fieldName: e.target.value })}
                        fullWidth
                        required
                      />
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={field.fieldType}
                          label="Type"
                          onChange={(e) => updateNewField(index, { fieldType: e.target.value as FieldType })}
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
                      onChange={(e) => updateNewField(index, { description: e.target.value })}
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.isRequired}
                          onChange={(e) => updateNewField(index, { isRequired: e.target.checked })}
                        />
                      }
                      label="Champ obligatoire"
                    />
                  </Stack>
                  <IconButton color="error" onClick={() => removeNewFieldRow(index)} sx={{ mt: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" onClick={handleAddFields} disabled={loading}>
              Ajouter les champs
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}