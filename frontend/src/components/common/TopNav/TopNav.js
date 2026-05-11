import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext/AuthContext';
import ICONS from '../../../constants/icons';
import { getIconLabel } from '../../../utils/iconHelper';
import './TopNav.css';

const TopNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleNavigation = (path) => { navigate(path); setShowUserMenu(false); };
    const handleLogout = () => { logout(); navigate('/login'); };

    const getNavItems = () => {
        if (user?.role === 'seeker') return [
            { path: '/seeker/dashboard', label: 'Jobs', icon: 'JOBS', iconKey: 'JOBS' },
            { path: '/seeker/applications', label: 'My Applications', icon: 'APPLICATIONS', iconKey: 'APPLICATIONS' },
            { path: '/seeker/profile', label: 'Profile', icon: 'PROFILE', iconKey: 'PROFILE' },
        ];
        else if (user?.role === 'recruiter') return [
            { path: '/recruiter/dashboard', label: 'Dashboard', icon: 'DASHBOARD', iconKey: 'DASHBOARD' },
            { path: '/recruiter/profile', label: 'Profile', icon: 'PROFILE', iconKey: 'PROFILE' },
            { path: '/recruiter/jobs', label: 'Post Jobs', icon: 'ADD', iconKey: 'ADD' },
        ];
        else if (user?.role === 'admin') return [
            { path: '/admin/dashboard', label: 'Dashboard', icon: 'DASHBOARD', iconKey: 'DASHBOARD' },
            { path: '/admin/companies', label: 'Verify Companies', icon: 'VERIFY', iconKey: 'VERIFY' },
        ];
        return [];
    };

    const navItems = getNavItems();

    return (
        <nav className="top-nav">
            <div className="nav-container">
                <div className="nav-left">
                    <div className="logo" onClick={() => navigate(user?.role === 'seeker' ? '/seeker/dashboard' : user?.role === 'recruiter' ? '/recruiter/dashboard' : '/admin/dashboard')}>
                        <span className="logo-icon" role="img" aria-label={getIconLabel('LOGO')}>{ICONS.LOGO}</span>
                        <span className="logo-text">Naukri Portal</span>
                    </div>

                    <div className="nav-links">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                                aria-label={item.label}
                            >
                                <span className="nav-link-icon" role="img" aria-label={getIconLabel(item.iconKey)}>{ICONS[item.iconKey]}</span>
                                <span className="nav-link-text">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="nav-right">
                    <div className="user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="user-name-nav">{user?.name?.split(' ')[0] || 'User'}</span>
                        <span className="dropdown-arrow" role="img" aria-label={getIconLabel('ARROW_DOWN')}>{ICONS.ARROW_DOWN}</span>
                    </div>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="dropdown-header">
                                <div className="dropdown-avatar">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="dropdown-info">
                                    <div className="dropdown-name">{user?.name}</div>
                                    <div className="dropdown-email">{user?.email}</div>
                                    <span className={`dropdown-role role-${user?.role}`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <button
                                className="dropdown-item"
                                onClick={() => handleNavigation(user?.role === 'seeker' ? '/seeker/profile' : '/recruiter/profile')}
                                aria-label="View Profile"
                            >
                                <span className="dropdown-item-icon" role="img" aria-label={getIconLabel('PROFILE')}>{ICONS.PROFILE}</span>
                                View Profile
                            </button>

                            <button className="dropdown-item" aria-label="Settings">
                                <span className="dropdown-item-icon" role="img" aria-label={getIconLabel('SETTINGS')}>{ICONS.SETTINGS}</span>
                                Settings
                            </button>

                            <button className="dropdown-item" aria-label="Help & Support">
                                <span className="dropdown-item-icon" role="img" aria-label="Help">ℹ️</span>
                                Help & Support
                            </button>

                            <div className="dropdown-divider"></div>

                            <button className="dropdown-item logout" onClick={handleLogout} aria-label="Logout">
                                <span className="dropdown-item-icon" role="img" aria-label={getIconLabel('LOGOUT')}>{ICONS.LOGOUT}</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopNav;
