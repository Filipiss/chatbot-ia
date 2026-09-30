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

    return (
        <span className={`c-status-indicator c-status-indicator--${status}`}>
            <span className={`c-status-indicator__dot c-status-indicator__dot--${status}`} />
            <span className="c-status-indicator__label">{label}</span>
        </span>
    );
};
