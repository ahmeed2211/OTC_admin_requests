import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, CircularProgress,
  Divider, FormControl, InputLabel, MenuItem, Select,
  Stack, Step, StepLabel, Stepper, TextField,
  Typography, Alert, Chip, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { useRequestTypes } from '../../hooks/useRequestTypes';
import { useRequests } from '../../hooks/useRequests';
import { RequestType, RequestTypeField, FieldType } from '../../types/request_types.types';
import { FieldValueDto } from '../../types/request.types';

const STEPS = ['Type de demande', 'Informations', 'Confirmation'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const getYesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const DynamicField = ({
  field,
  value,
  onChange,
  error,
}: {
  field: RequestTypeField;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) => {
  const label = (
    <>
      {field.fieldName}
      {field.isRequired && <span style={{ color: '#ef4444' }}> *</span>}
    </>
  );

  if (field.fieldType === FieldType.BOOLEAN) {
    return (
      <FormControl fullWidth error={!!error}>
        <InputLabel>
          {field.fieldName}
          {field.isRequired && ' *'}
        </InputLabel>
        <Select
          value={value}
          label={`${field.fieldName}${field.isRequired ? ' *' : ''}`}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Sélectionner</MenuItem>
          <MenuItem value="true">Oui</MenuItem>
          <MenuItem value="false">Non</MenuItem>
        </Select>
        {error && <Typography variant="caption" color="error">{error}</Typography>}
        {field.description && <Typography variant="caption" color="text.secondary">{field.description}</Typography>}
      </FormControl>
    );
  }

  return (
    <TextField
      label={label as any}
      fullWidth
      type={
        field.fieldType === FieldType.NUMBER ? 'number' :
        field.fieldType === FieldType.DATE ? 'date' : 'text'
      }
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error ?? field.description}
      slotProps={field.fieldType === FieldType.DATE ? { inputLabel: { shrink: true } } : undefined}
    />
  );
};

export default function SubmitRequestPage() {
  const navigate = useNavigate();
  const { getRequestTypes, getRequestTypeById, loading: typesLoading } = useRequestTypes();
  const { createRequest, loading: submitting, error: submitError } = useRequests();

  const [activeStep, setActiveStep] = useState(0);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [requestComment, setRequestComment] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getRequestTypes().then(setRequestTypes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTypeId) {
      setSelectedType(null);
      setFieldValues({});
      return;
    }
    getRequestTypeById(selectedTypeId)
      .then((rt) => {
        setSelectedType(rt);
        const initial: Record<string, string> = {};
        rt.fields.forEach((f) => {
          if (f.fieldType === FieldType.DATE) {
            initial[f.id] = getYesterday();
          } else {
            initial[f.id] = '';
          }
        });
        setFieldValues(initial);
        setFieldErrors({});
      })
      .catch(() => {});
  }, [selectedTypeId]); 

  const setFieldValue = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = ''; 
    if (!selected.length) return;

    const rejected: string[] = [];
    const accepted: File[] = [];

    selected.forEach((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        rejected.push(`${f.name} (type non autorisé)`);
      } else if (f.size > MAX_FILE_SIZE) {
        rejected.push(`${f.name} (> 10 Mo)`);
      } else {
        accepted.push(f);
      }
    });

    setFileError(rejected.length ? `Fichiers ignorés : ${rejected.join(', ')}` : '');
    setFiles((prev) => [...prev, ...accepted]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => !!selectedTypeId;

  const validateStep2 = () => {
    if (!selectedType) return false;
    const errors: Record<string, string> = {};

    selectedType.fields.forEach((f) => {
      const val = fieldValues[f.id]?.trim();
      if (f.isRequired && (!val || val === '')) {
        errors[f.id] = `${f.fieldName} est requis(e).`;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) return;
    if (activeStep === 1 && !validateStep2()) return;
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async () => {
    const fvArray: FieldValueDto[] = Object.entries(fieldValues)
      .filter(([, v]) => v.trim() !== '')
      .map(([fieldId, value]) => ({ fieldId, value }));

    try {
      await createRequest(
        {
          requestTypeId: selectedTypeId,
          requestComment: requestComment || undefined,
          fieldValues: fvArray,
        },
        files,
      );
      setSuccess(true);
      setTimeout(() => navigate('/my-requests'), 2000);
    } catch {}
  };

  const renderStep0 = () => (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Sélectionnez le type de demande que vous souhaitez soumettre.
      </Typography>
      {typesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {requestTypes.map((rt) => (
            <Card
              key={rt.id}
              variant="outlined"
              onClick={() => setSelectedTypeId(rt.id)}
              sx={{
                cursor: 'pointer',
                borderColor: selectedTypeId === rt.id ? 'primary.main' : 'divider',
                borderWidth: selectedTypeId === rt.id ? 2 : 1,
                bgcolor: selectedTypeId === rt.id ? 'primary.50' : 'background.paper',
                transition: 'all .15s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box>
                  <Typography fontWeight={600}>{rt.name}</Typography>
                  {rt.description && (
                    <Typography variant="caption" color="text.secondary">{rt.description}</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );

  const renderStep1 = () => (
    <Stack spacing={3}>
      {selectedType && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
            CHAMPS SPÉCIFIQUES - {selectedType.name.toUpperCase()}
          </Typography>
          <Stack spacing={2}>
            {selectedType.fields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={fieldValues[field.id] ?? ''}
                onChange={(val) => setFieldValue(field.id, val)}
                error={fieldErrors[field.id]}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Divider />

      <TextField
        label="Commentaire additionnel"
        multiline
        rows={3}
        fullWidth
        value={requestComment}
        onChange={(e) => setRequestComment(e.target.value)}
        placeholder="Informations complémentaires sur votre demande..."
        inputProps={{ maxLength: 1000 }}
        helperText={`${requestComment.length}/1000`}
      />

      <Divider />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
          PIÈCES JOINTES
        </Typography>
        <Button
          component="label"
          variant="outlined"
          startIcon={<AttachFileIcon />}
          size="small"
        >
          Ajouter des fichiers
          <input
            type="file"
            hidden
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={handleFilesSelected}
          />
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          PDF, images ou Word - 10 Mo max par fichier.
        </Typography>

        {fileError && (
          <Alert severity="warning" sx={{ mt: 1.5 }} onClose={() => setFileError('')}>
            {fileError}
          </Alert>
        )}

        {files.length > 0 && (
          <Stack spacing={1} mt={1.5}>
            {files.map((f, i) => (
              <Chip
                key={`${f.name}-${i}`}
                label={`${f.name} (${formatSize(f.size)})`}
                onDelete={() => removeFile(i)}
                deleteIcon={<CloseIcon />}
                variant="outlined"
                sx={{ justifyContent: 'space-between', maxWidth: 420 }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );

  const renderStep2 = () => (
    <Stack spacing={2}>
      <Alert severity="info">
        Veuillez vérifier les informations avant de soumettre votre demande.
      </Alert>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>TYPE DE DEMANDE</Typography>
          <Typography fontWeight={600}>{selectedType?.name}</Typography>
        </CardContent>
      </Card>

      {selectedType && selectedType.fields.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" mb={1.5}>CHAMPS RENSEIGNÉS</Typography>
            <Stack spacing={1}>
              {selectedType.fields.map((field) => {
                const value = fieldValues[field.id];
                if (!value || value.trim() === '') return null;
                return (
                  <Stack key={field.id} direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{field.fieldName + ':'}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {field.fieldType === FieldType.BOOLEAN ? (value === 'true' ? 'Oui' : 'Non') : value}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {requestComment && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>COMMENTAIRE</Typography>
            <Typography variant="body2">{requestComment}</Typography>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              PIÈCES JOINTES ({files.length})
            </Typography>
            <Stack spacing={0.5}>
              {files.map((f, i) => (
                <Typography key={`${f.name}-${i}`} variant="body2">
                  {f.name} - {formatSize(f.size)}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', py: 3, px: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/my-requests')} color="inherit" size="small">
          Retour
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight={700} mb={1}>Nouvelle demande</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Suivez les étapes pour soumettre votre demande administrative.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Demande soumise avec succès ! Redirection vers vos demandes...
        </Alert>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
      )}

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          {activeStep === 0 && renderStep0()}
          {activeStep === 1 && renderStep1()}
          {activeStep === 2 && renderStep2()}
        </CardContent>
      </Card>

      <Stack direction="row" justifyContent="space-between" mt={3}>
        <Button onClick={handleBack} disabled={activeStep === 0} color="inherit">
          Retour
        </Button>
        {activeStep < STEPS.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={activeStep === 0 && !selectedTypeId}>
            Suivant
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={submitting || success}
          >
            {submitting ? 'Envoi en cours...' : 'Soumettre la demande'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}