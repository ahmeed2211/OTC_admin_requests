import { useState, useCallback } from 'react';
import { viewAttachment as viewAttachmentApi, downloadAttachment as downloadAttachmentApi } from '../api/attachment.api';

export const useAttachments = () => {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openBlob = (blob: Blob, filename: string, download: boolean) => {
    const url = window.URL.createObjectURL(blob);
    if (download) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    } else {
      window.open(url, '_blank');
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  };

  const viewAttachment = useCallback(async (id: string, filename: string) => {
    setPendingId(id);
    setError(null);
    try {
      const { data } = await viewAttachmentApi(id);
      openBlob(data, filename, false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Impossible d'ouvrir le fichier.");
    } finally {
      setPendingId(null);
    }
  }, []);

  const downloadAttachmentFile = useCallback(async (id: string, filename: string) => {
    setPendingId(id);
    setError(null);
    try {
      const { data } = await downloadAttachmentApi(id);
      openBlob(data, filename, true);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Impossible de télécharger le fichier.');
    } finally {
      setPendingId(null);
    }
  }, []);

  return { viewAttachment, downloadAttachmentFile, pendingId, error };
};