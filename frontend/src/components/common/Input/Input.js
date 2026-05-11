import './Input.css';
import { getIconLabel } from '../../../utils/iconHelper';

const Input = ({ type = 'text', label, placeholder, value, onChange, error = false, errorMessage, disabled = false, className = '', icon, required = false, iconLabel, ...props }) => {
    const inputClasses = [
        'input-wrapper',
        error ? 'input-error' : '',
        disabled ? 'input-disabled' : '',
        className,
    ].filter(Boolean).join(' ');

    const ariaLabel = iconLabel || getIconLabel(icon);

    return (
        <div className={inputClasses}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <div className="input-field-wrapper">
                {icon && (
                    <span
                        className="input-icon"
                        role="img"
                        aria-label={ariaLabel}
                    >
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    className={`input-field ${icon ? 'input-with-icon' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    {...props}
                />
            </div>
            {error && errorMessage && (
                <span className="input-error-message">{errorMessage}</span>
            )}
        </div>
    );
};

export default Input;
