import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, CircularProgress, Divider,
  FormControl, FormControlLabel, IconButton, InputLabel,
  MenuItem, Select, Stack, Switch, TextField, Typography,
  Alert, Chip, Paper,
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

  useEffect(() => { load(); }, [id]);

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#f8fafc' }}>
        <CircularProgress size={36} sx={{ color: '#22c55e' }} />
      </Box>
    );
  }

  if (!requestType) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{formError || 'Type de demande introuvable.'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          size="small"
          sx={{
            color: '#64748b',
            mb: 3,
            '&:hover': {
              color: '#22c55e',
              bgcolor: '#f0fdf4',
            },
          }}
        >
          Retour
        </Button>

        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {requestType.name}
          </Typography>
          <Chip
            label={requestType.isActive ? 'Actif' : 'Inactif'}
            size="small"
            sx={{
              bgcolor: requestType.isActive ? '#f0fdf4' : '#f1f5f9',
              color: requestType.isActive ? '#16a34a' : '#64748b',
              fontWeight: 500,
              border: 'none',
            }}
          />
        </Stack>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Modifiez les informations générales et les champs de ce type de demande.
        </Typography>

        {(error || formError) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{formError || error}</Alert>
        )}
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Modifications enregistrées.</Alert>
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
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
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
                  Type de demande actif
                </Typography>
              }
            />
            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSaveMetadata}
                disabled={loading}
                sx={{
                  bgcolor: '#22c55e',
                  '&:hover': { bgcolor: '#16a34a' },
                }}
              >
                Enregistrer
              </Button>
            </Stack>
          </Stack>
        </Paper>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', mb: 1.5 }}>
          Champs existants ({requestType.fields?.length ?? 0})
        </Typography>

        <Stack spacing={1.5} mb={3}>
          {(requestType.fields ?? []).length === 0 && (
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Aucun champ défini pour ce type.
            </Typography>
          )}
          {requestType.fields?.map((field) => (
            <Paper
              key={field.id}
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {field.fieldName}
                    </Typography>
                    <Chip
                      label={FIELD_TYPE_LABELS[field.fieldType]}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#e2e8f0', color: '#475569' }}
                    />
                    {field.isRequired && (
                      <Chip
                        label="Requis"
                        size="small"
                        sx={{ bgcolor: '#fef3c7', color: '#d97706', border: 'none', fontWeight: 500 }}
                      />
                    )}
                  </Stack>
                  {field.description && (
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                      {field.description}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveExistingField(field.id)}
                  sx={{
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

        <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
            Ajouter des champs
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addNewFieldRow}
            size="small"
            sx={{
              color: '#22c55e',
              '&:hover': { bgcolor: '#f0fdf4' },
            }}
          >
            Nouveau champ
          </Button>
        </Stack>

        {newFields.length > 0 && (
          <>
            <Stack spacing={2} mb={2}>
              {newFields.map((field, index) => (
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
                          onChange={(e) => updateNewField(index, { fieldName: e.target.value })}
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
                            onChange={(e) => updateNewField(index, { fieldType: e.target.value as FieldType })}
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
                        onChange={(e) => updateNewField(index, { description: e.target.value })}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' } }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.isRequired}
                            onChange={(e) => updateNewField(index, { isRequired: e.target.checked })}
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
                      onClick={() => removeNewFieldRow(index)}
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
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => setNewFields([])}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: '#fef2f2' },
                }}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={handleAddFields}
                disabled={loading}
                sx={{
                  bgcolor: '#22c55e',
                  '&:hover': { bgcolor: '#16a34a' },
                }}
              >
                Ajouter les champs
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
}