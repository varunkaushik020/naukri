import { Card, Badge } from '../../../components/common';
import './ExpertiseTags.css';

const ExpertiseTags = ({ expertise, editing, onAdd, onRemove }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onAdd(e.target.value.trim());
            e.target.value = '';
        }
    };

    return (
        <Card className="profile-section-card">
            <div className="section-header">
                <h2>ðŸŽ¯ {editing ? 'Add Expertise' : 'Expertise'}</h2>
            </div>
            <div className="expertise-tags">
                {expertise.map((skill, index) => (
                    <Badge key={index} variant="primary" className="expertise-tag">
                        {skill}
                        {editing && (
                            <button
                                className="remove-tag-btn"
                                onClick={() => onRemove(skill)}
                            >
                                Ã—
                            </button>
                        )}
                    </Badge>
                ))}
            </div>
            {editing && (
                <div className="add-expertise-section">
                    <input
                        type="text"
                        className="add-expertise-input"
                        placeholder="Add expertise (e.g., Python, React)"
                        onKeyPress={handleKeyPress}
                    />
                    <p className="hint">Press Enter to add</p>
                </div>
            )}
        </Card>
    );
};

export default ExpertiseTags;
