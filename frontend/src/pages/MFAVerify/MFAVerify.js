import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { navigateByRole } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './MFAVerify.css';

const MFAVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyMFA, resendOTP } = useAuth();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 6) setOtp(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }
        setLoading(true);
        const result = await verifyMFA(email, otp);
        if (result.success) {
            toast.success('MFA verification successful!');
            navigateByRole(navigate, result.user);
        } else {
            toast.error(result.message || 'Invalid OTP');
            setOtp('');
        }
        setLoading(false);
    };

    const handleResendCode = async () => {
        if (!email) {
            toast.error('Email not found. Please login again.');
            return;
        }

        setResendLoading(true);

        const result = await resendOTP(email);

        if (result.success) {
            toast.success('A new OTP has been sent to your email');
            setOtp('');
        } else {
            toast.error(result.message || 'Failed to resend OTP');
        }

        setResendLoading(false);
    };

    return (
        <div className="mfa-container">
            <div className="mfa-box">
                <div className="mfa-header">
                    <h1>ðŸ MFA Verification</h1>
                    <p>Enter the 6-digit code sent to your email</p>
                    {email && (
                        <div className="email-display">
                            ðŸ“§ {email}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="mfa-form">
                    <div className="form-group">
                        <label>Verification Code</label>
                        <input
                            value={otp}
                            onChange={handleChange}
                            className="form-control otp-input"
                            placeholder="000000"
                            maxLength="6"
                            autoFocus
                            required
                        />
                        <p className="hint">Check your email or backend console for the 6-digit code (e.g., 123456)</p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                </form>

                <div className="mfa-footer">
                    <button
                        onClick={handleResendCode}
                        className="btn btn-link"
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                    <p>
                        <Link to="/login" className="link">
                            â† Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MFAVerify;
