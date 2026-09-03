import React from 'react';
import type { Integration } from '../../../api';
import { IntegrationCard } from '../../molecules/integrationCard/IntegrationCard';
import { Workflow } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import './IntegrationHub.css';

interface IntegrationHubProps {
    integrations: Integration[];
    onUpdateIntegration: (id: number, data: Partial<Integration>) => Promise<void>;
}

export const IntegrationHub: React.FC<IntegrationHubProps> = ({ integrations, onUpdateIntegration }) => {
    const { t } = useI18n();

    return (
        <div className="hubWrapper">
            <div className="hubHeader">
                <div className="hubIcon"><Workflow size={20} /></div>
                <div>
                    <h2 className="hubTitle">{t('integrations_hub_title')}</h2>
                    <p className="hubDesc">{t('integrations_hub_desc')}</p>
                </div>
            </div>
            <div className="hubGrid">
                {integrations.map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} onUpdate={onUpdateIntegration} />
                ))}
            </div>
        </div>
    );
};
