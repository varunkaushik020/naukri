import './Card.css';

const Card = ({ children, className = '', hoverable = false, onClick, variant = 'default', ...props }) => {
    const cardClasses = [
        'card',
        `card-${variant}`,
        hoverable ? 'card-hoverable' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={cardClasses}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
