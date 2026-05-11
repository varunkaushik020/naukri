import { Card, Badge, Button } from '../../../components/common';
import './ProfileHeader.css';

const ProfileHeader = ({ user, profileData, companyData, editing, onEditToggle, saving }) => {
    return (
        <div className="profile-header-section">
            <Card className="profile-header-card">
                <div className="profile-header-bg"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {profileData.verified && (
                            <div className="profile-status-badge">
                                <span className="verified-icon">âœ“</span>
                                {profileData.verifiedLabel || 'Verified'}
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        <h1 className="profile-name">{user?.name || 'User Name'}</h1>
                        <p className="profile-designation">
                            {profileData.designation || 'Professional'}
                            {companyData && profileData.showCompany && ` at ${companyData.name}`}
                        </p>
                        <div className="profile-meta">
                            {profileData.metaItems?.map((item, index) => (
                                <span key={index} className="meta-item">
                                    <span className="meta-icon">{item.icon}</span>
                                    {item.value}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="profile-actions">
                        <Button
                            variant="primary"
                            onClick={onEditToggle}
                            disabled={saving}
                        >
                            {saving ? 'â³ Saving...' : editing ? 'âœ“ Save Profile' : 'âœï¸ Edit Profile'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProfileHeader;
