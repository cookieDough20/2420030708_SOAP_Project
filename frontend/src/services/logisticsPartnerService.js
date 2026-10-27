import api from './api';

export const logisticsPartnerService = {
  createProfile: (data) => api.post('/logistics-partners', data),
  getAll: () => api.get('/logistics-partners'),
  getByEmail: (email) => api.get(`/logistics-partners/email/${email}`),
};
