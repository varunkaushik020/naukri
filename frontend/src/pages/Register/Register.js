import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { Button, Input } from '../../components/common';
import { validatePassword } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'seeker' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            toast.error(passwordValidation.errors[0]);
            return;
        }

        setLoading(true);
        const result = await register(formData);
        if (result.success) {
            toast.success(result.message);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <div className="register-header">
                    <h1>Create Account</h1>
                    <p>Join Naukri Portal today</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <Input
                        type="text"
                        label="Full Name"
                        placeholder="Enter your full name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="email"
                        label="Email Address"
                        placeholder="Enter your email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="Create a password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="password"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <div className="form-group">
                        <label style={{ marginBottom: '12px', display: 'block' }}>I am a <span style={{ color: '#dc2626' }}>*</span></label>
                        <div className="role-selection">
                            <label className={`role-option ${formData.role === 'seeker' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="seeker"
                                    checked={formData.role === 'seeker'}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="role-content">
                                    <div className="role-icon">ðŸ‘¤</div>
                                    <div className="role-text">
                                        <strong>Job Seeker</strong>
                                        <span>Looking for job opportunities</span>
                                    </div>
                                </div>
                            </label>
                            <label className={`role-option ${formData.role === 'recruiter' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={formData.role === 'recruiter'}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="role-content">
                                    <div className="role-icon">ðŸ¢</div>
                                    <div className="role-text">
                                        <strong>Recruiter</strong>
                                        <span>Hiring and posting jobs</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="gradient"
                        fullWidth
                        loading={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="register-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="link">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
