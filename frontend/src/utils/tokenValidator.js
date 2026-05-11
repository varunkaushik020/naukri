
export const validateToken = (token) => {
    if (!token) {
        return { isValid: false, error: 'Token is missing' };
    }

    if (typeof token !== 'string') {
        return { isValid: false, error: `Token is not a string (type: ${typeof token})` };
    }

    if (!token.trim()) {
        return { isValid: false, error: 'Token is empty' };
    }

    if (token === 'undefined' || token === 'null' || token === 'false' || token === 'true') {
        return { isValid: false, error: `Token contains invalid value: "${token}"` };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        return {
            isValid: false,
            error: `Invalid JWT format: expected 3 parts, got ${parts.length}`
        };
    }

    if (token.length < 50) {
        return {
            isValid: false,
            error: `Token too short (${token.length} chars), expected at least 50`
        };
    }

    return { isValid: true };
};

export const getValidToken = () => {
    const storedToken = localStorage.getItem('token');

    const validation = validateToken(storedToken);

    if (!validation.isValid) {
        console.error('Invalid token:', validation.error);

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return null;
    }

    return storedToken;
};
