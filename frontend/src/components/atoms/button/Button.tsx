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
    const variantClass = variant === 'secondary' ? 'buttonSecondary' : variant === 'danger' ? 'buttonDanger' : 'buttonPrimary';
    return (
        <button
            className={`buttonBase ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
