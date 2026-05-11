import './Button.css';
import { getIconLabel } from '../../../utils/iconHelper';

const Button = ({ variant = 'primary', size = 'medium', disabled = false, loading = false, className = '', onClick, children, type = 'button', fullWidth = false, icon, iconLabel }) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full-width' : '',
        loading ? 'btn-loading' : '',
        className,
    ].filter(Boolean).join(' ');

    const ariaLabel = iconLabel || getIconLabel(icon);

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading && <span className="btn-spinner"></span>}
            {icon && (
                <span
                    className="btn-icon"
                    role="img"
                    aria-label={ariaLabel}
                >
                    {icon}
                </span>
            )}
            <span className="btn-text">{children}</span>
        </button>
    );
};

export default Button;
