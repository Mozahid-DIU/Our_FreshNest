import api from './axios';

export const getFailures = () => api.get('/failures');
export const reportFailure = (data) => api.post('/failures', data);
export const getFailureAlternatives = () => api.get('/failures/alternatives');
export const createFailureAlternative = (failureId, data) => api.post(`/failures/${failureId}/alternatives`, data);
export const decideFailureAlternative = (id, data) => api.patch(`/failures/alternatives/${id}/decision`, data);
export const acceptFailureAlternative = (id) => api.patch(`/failures/alternatives/${id}/accept`);