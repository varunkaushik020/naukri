import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = (apiCall, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiCall(...args);
            setData(response.data);
            
            if (options.successMessage) {
                toast.success(options.successMessage);
            }
            
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred';
            setError(errorMessage);
            
            if (options.errorMessage !== false) {
                toast.error(options.errorMessage || errorMessage);
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [apiCall, options.successMessage, options.errorMessage]);

    return { data, loading, error, execute };
};
