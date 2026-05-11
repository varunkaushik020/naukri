import { Card, Badge } from '../../../components/common';
import './BioSection.css';

const BioSection = ({ bio, editing, onChange }) => {
    return (
        <Card className="profile-section-card">
            <div className="section-header">
                <h2>ðŸ“ About Me</h2>
            </div>
            {editing ? (
                <textarea
                    className="bio-textarea"
                    value={bio}
                    onChange={onChange}
                    placeholder="Tell others about yourself..."
                    rows="5"
                />
            ) : (
                <p className="bio-text">
                    {bio || 'No bio added yet.'}
                </p>
            )}
        </Card>
    );
};

export default BioSection;
