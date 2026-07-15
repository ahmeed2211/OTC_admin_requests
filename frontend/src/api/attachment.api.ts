import api from './axios.config';

export const viewAttachment = (id: string): Promise<{ data: Blob }> =>
  api.get(`/attachments/${id}/view`, { responseType: 'blob' });

export const downloadAttachment = (id: string): Promise<{ data: Blob }> =>
  api.get(`/attachments/${id}/download`, { responseType: 'blob' });

export const deleteAttachment = (id: string): Promise<{ data: { message: string } }> =>
  api.delete(`/attachments/${id}`);