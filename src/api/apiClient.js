import axios from 'axios';
import { translate } from '../i18n';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/wp-json';
const apiClient = axios.create({ baseURL, withCredentials: true });
const refreshClient = axios.create({ baseURL, withCredentials: true });
let refreshPromise = null;
const saveToken = (token) => { if (token) sessionStorage.setItem('assessment_access_token', token); };
const clearSession = () => { sessionStorage.removeItem('assessment_access_token'); sessionStorage.removeItem('assessment_user'); };
const getAccessTokenExpiry = (token = sessionStorage.getItem('assessment_access_token')) => {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return 0;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000 || 0;
  } catch { return 0; }
};
const refreshAccessToken = async () => { if (!refreshPromise) { refreshPromise = refreshClient.post('/assessment/v1/auth/refresh').then(({ data }) => { saveToken(data.token); return data.token; }).finally(() => { refreshPromise = null; }); } return refreshPromise; };
apiClient.interceptors.request.use((config) => { const token = sessionStorage.getItem('assessment_access_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
apiClient.interceptors.response.use((response) => response, async (error) => { const request = error.config; if (error.response?.status === 401 && !request?._retried && !request?.url?.includes('/auth/')) { request._retried = true; try { const token = await refreshAccessToken(); request.headers.Authorization = `Bearer ${token}`; return apiClient(request); } catch (refreshError) { clearSession(); return Promise.reject(refreshError); } } return Promise.reject(error); });
export const apiErrorMessage = (error, t = (key) => translate(sessionStorage.getItem('assessment_language') || 'vi', key)) => { const status = error.response?.status; if (status === 401) return t('sessionExpired'); if (status === 403) return t('forbidden'); if (status === 404) return t('notFound'); if (status === 422) return error.response?.data?.message || t('validation'); if (status >= 500) return t('serverError'); return t('networkError'); };
export { clearSession, getAccessTokenExpiry, refreshAccessToken };
export default apiClient;
