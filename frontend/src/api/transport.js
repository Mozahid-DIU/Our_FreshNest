import api from './axios';

export const getTransport = () => api.get('/transport');
export const createTransport = (data) => api.post('/transport', data);
export const updateTransportStatus = (id, status) => api.patch(`/transport/${id}`, { status });