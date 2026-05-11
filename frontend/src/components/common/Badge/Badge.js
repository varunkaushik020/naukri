import './Badge.css';

const Badge = ({ variant = 'default', size = 'medium', children, className = '' }) => {
    const badgeClasses = [
        'badge',
        `badge-${variant}`,
        `badge-${size}`,
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={badgeClasses}>
            {children}
        </span>
    );
};

export default Badge;
