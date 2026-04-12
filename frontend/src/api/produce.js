import api from './axios';

export const getProduce = () => api.get('/produce');
export const addProduce = (data) => api.post('/produce', data);
export const updateProduceStatus = (id, status) => api.patch(`/produce/${id}/status`, { status });
export const deleteProduce = (id) => api.delete(`/produce/${id}`);