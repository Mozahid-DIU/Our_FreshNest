import api from './axios';

export const getProposals = () => api.get('/proposals');
export const createProposal = (data) => api.post('/proposals', data);
export const updateProposal = (id, data) => api.patch(`/proposals/${id}`, data);