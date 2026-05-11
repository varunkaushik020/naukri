import { createContext, useState, useContext, useEffect } from 'react';
import { validateToken } from '../../utils/tokenValidator';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [mfaToken, setMfaToken] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { authAPI } = await import('../../services/api/api');
            const response = await authAPI.login({ email, password });
            const { token: newToken, user: userData, requiresMFA } = response.data;

            const validation = validateToken(newToken);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: 'Server returned invalid token. Please contact support.',
                };
            }

            setMfaToken(newToken);
            setToken(newToken);
            localStorage.setItem('token', newToken);

            if (userData) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }

            return { success: true, requiresMFA, user: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const verifyMFA = async (email, otp) => {
        try {
            const { authAPI } = await import('../../services/api/api');
            const tokenForMFA = mfaToken || localStorage.getItem('token');

            const response = await authAPI.verifyOTP({ email, otp, token: tokenForMFA });
            const { token: newToken, user: userData } = response.data;

            const validation = validateToken(newToken);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: 'Server returned invalid token. Please contact support.',
                };
            }

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setMfaToken(null);

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'MFA verification failed',
                remainingAttempts: error.response?.data?.remainingAttempts,
            };
        }
    };

    const register = async (userData) => {
        try {
            const { authAPI } = await import('../../services/api/api');
            const response = await authAPI.register(userData);

            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const resendOTP = async (email) => {
        try {
            const { authAPI } = await import('../../services/api/api');
            const response = await authAPI.sendOTP({ email });
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to resend OTP',
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateUserProfile = async (updatedData) => {
        try {
            const { authAPI } = await import('../../services/api/api');
            const token = localStorage.getItem('token');

            if (!token) {
                return {
                    success: false,
                    message: 'Authentication token not found. Please login again.',
                };
            }

            const profileData = {
                name: updatedData.name,
                profile: {
                    phone: updatedData.phone,
                    location: updatedData.location,
                    skills: updatedData.skills,
                    experience: updatedData.experience,
                    expectedSalary: updatedData.expectedSalary,
                    resume: updatedData.resume,
                    summary: updatedData.summary,
                    education: updatedData.education,
                    resumeFileName: updatedData.resumeFileName,
                    resumeFileType: updatedData.resumeFileType,
                    dateOfBirth: updatedData.dateOfBirth,
                    gender: updatedData.gender,
                    nationality: updatedData.nationality,
                    address: updatedData.address,
                    city: updatedData.city,
                    state: updatedData.state,
                    pincode: updatedData.pincode,
                    languages: updatedData.languages,
                },
            };

            const response = await authAPI.updateProfile(profileData);

            if (response.data.success) {
                const { data } = response.data;
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                return { success: true, user: data };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to update profile',
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile',
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        verifyMFA,
        resendOTP,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
