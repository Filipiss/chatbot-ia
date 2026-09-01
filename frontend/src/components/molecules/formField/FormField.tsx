import React from 'react';
import './FormField.css';

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
    <div className="formFieldWrapper">
        <label className="formFieldLabel">{label}</label>
        {children}
    </div>
);
