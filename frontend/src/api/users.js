import api from './axios';

export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);