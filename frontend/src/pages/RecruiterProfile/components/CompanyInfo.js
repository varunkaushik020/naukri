import { Card, Badge } from '../../../components/common';
import './CompanyInfo.css';

const CompanyInfo = ({ companyData }) => {
    if (!companyData) return null;

    return (
        <Card className="profile-section-card">
            <div className="section-header">
                <h2>ðŸ¢ Company Information</h2>
            </div>
            <div className="company-info-grid">
                <div className="company-info-item">
                    <label>Company Name</label>
                    <p>{companyData.name}</p>
                </div>
                <div className="company-info-item">
                    <label>Industry</label>
                    <p>{companyData.industry}</p>
                </div>
                <div className="company-info-item">
                    <label>Company Size</label>
                    <p>{companyData.size} employees</p>
                </div>
                <div className="company-info-item">
                    <label>Location</label>
                    <p>{companyData.location}</p>
                </div>
                <div className="company-info-item">
                    <label>Website</label>
                    <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="company-website-link">
                        {companyData.website}
                    </a>
                </div>
                <div className="company-info-item">
                    <label>Verification Status</label>
                    <Badge variant={companyData.isVerified ? 'success' : 'warning'}>
                        {companyData.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                </div>
            </div>
        </Card>
    );
};

export default CompanyInfo;
