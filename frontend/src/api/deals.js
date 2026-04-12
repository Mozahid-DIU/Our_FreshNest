import api from './axios';

export const getDeals = () => api.get('/deals');
export const createDeal = (data) => api.post('/deals', data);
export const respondDeal = (id, status) => api.patch(`/deals/${id}`, { status });