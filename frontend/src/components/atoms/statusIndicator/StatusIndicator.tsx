import React from 'react';
import { useI18n } from '../../../context/I18nContext';
import './StatusIndicator.css';

interface StatusIndicatorProps {
    status: 'active' | 'inactive' | 'testing' | 'success' | 'error';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const { t } = useI18n();
    const isSuccessOrActive = status === 'active' || status === 'success';

    let label = t('disconnected');
    if (isSuccessOrActive) label = t('connected');
    else if (status === 'testing') label = t('testing');
    else if (status === 'error') label = t('failed');

    const statusCap = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span className={`container container${statusCap}`}>
            <span className={`dot dot${statusCap}`} />
            <span className="labelStyle">{label}</span>
        </span>
    );
};
