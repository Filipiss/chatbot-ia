import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    ...props
}) => {
    const variantClass = variant === 'secondary' ? 'c-btn--secondary' : variant === 'danger' ? 'c-btn--danger' : 'c-btn--primary';
    return (
        <button
            className={`c-btn ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
