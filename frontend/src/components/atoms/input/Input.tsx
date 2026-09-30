import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
    <input className={`c-input ${className}`} {...props} />
);
