import axios from 'axios';
import { getValidToken } from '../../utils/tokenValidator';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const isFormData = config.data instanceof FormData;
        if (isFormData) {
            delete config.headers['Content-Type'];
        }

        const token = getValidToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('API Interceptor Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath.startsWith('/login') ||
                currentPath.startsWith('/register') ||
                currentPath.startsWith('/mfa');

            if (!isAuthPage) {
                console.info('Token may be expired. Error:', error.response?.data?.message);
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    sendOTP: (data) => api.post('/auth/send-otp', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

export const fileAPI = {
    uploadResume: (formData) => api.post('/files/upload/resume', formData),
    getResumeUrl: () => api.get('/files/resume/url'),
    removeResume: () => api.delete('/files/resume'),
};

export const jobAPI = {
    getJobs: (params) => api.get('/jobs', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    createJob: (data) => api.post('/jobs', data),
    updateJob: (id, data) => api.put(`/jobs/${id}`, data),
    withdrawJob: (id) => api.delete(`/jobs/${id}`),
    closeJob: (id) => api.put(`/jobs/${id}/close`),
    getMyJobs: (params) => api.get('/jobs/recruiter/my-jobs', { params }),
    getRecruiterDashboardStats: () => api.get('/jobs/recruiter/dashboard-stats'),
    getRecentApplicants: (params) => api.get('/jobs/recruiter/recent-applicants', { params }),
};

export const applicationAPI = {
    applyForJob: (data) => api.post('/applications', data),
    getMyApplications: (params) => api.get('/applications/my-applications', { params }),
    getApplicationsForJob: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
    updateApplicationStatus: (id, data) => api.put(`/applications/${id}/status`, data),
    withdrawApplication: (id, data) => api.put(`/applications/${id}/withdraw`, data),
    getApplicationById: (id) => api.get(`/applications/${id}`),
};

export const companyAPI = {
    registerCompany: (data) => api.post('/companies', data),
    getCompanies: (params) => api.get('/companies', { params }),
    getCompanyById: (id) => api.get(`/companies/${id}`),
    updateCompany: (id, data) => api.put(`/companies/${id}`, data),
    getMyCompanies: () => api.get('/companies/my-companies'),
};

export const adminAPI = {
    getPendingCompanies: () => api.get('/admin/companies/pending'),
    verifyCompany: (id) => api.put(`/admin/companies/${id}/verify`),
    rejectCompany: (id, data) => api.put(`/admin/companies/${id}/reject`, data),
    getAnalytics: () => api.get('/admin/analytics'),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    toggleUserLock: (id) => api.put(`/admin/users/${id}/toggle-lock`),
};

export default api;
