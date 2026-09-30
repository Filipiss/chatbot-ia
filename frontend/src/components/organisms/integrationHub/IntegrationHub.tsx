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
        <div className="c-integration-hub">
            <div className="c-integration-hub__header">
                <div className="c-integration-hub__icon"><Workflow size={20} /></div>
                <div>
                    <h2 className="c-integration-hub__title">{t('integrations_hub_title')}</h2>
                    <p className="c-integration-hub__desc">{t('integrations_hub_desc')}</p>
                </div>
            </div>
            <div className="c-integration-hub__grid">
                {integrations.map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} onUpdate={onUpdateIntegration} />
                ))}
            </div>
        </div>
    );
};
