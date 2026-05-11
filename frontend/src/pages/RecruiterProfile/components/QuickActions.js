import { Card, Button } from '../../../components/common';
import './QuickActions.css';

const QuickActions = () => {
    return (
        <Card className="quick-actions-card">
            <div className="section-header">
                <h2>âš¡ Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
                <Button variant="gradient" fullWidth icon="âž•">
                    Post New Job
                </Button>
                <Button variant="secondary" fullWidth icon="ðŸ“Š">
                    View Analytics
                </Button>
                <Button variant="secondary" fullWidth icon="ðŸ‘¥">
                    Review Applicants
                </Button>
                <Button variant="secondary" fullWidth icon="ðŸ“§">
                    Send Messages
                </Button>
            </div>
        </Card>
    );
};

export default QuickActions;
