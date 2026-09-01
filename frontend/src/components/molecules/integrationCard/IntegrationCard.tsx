import React, { useState, useEffect } from 'react';
import { type Integration, testIntegration } from '../../../api';
import { FormField } from '../formField/FormField';
import { Input } from '../../atoms/input/Input';
import { Button } from '../../atoms/button/Button';
import { StatusIndicator } from '../../atoms/statusIndicator/StatusIndicator';
import { Play, Eye, EyeOff, Save } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import './IntegrationCard.css';

interface IntegrationCardProps {
    integration: Integration;
    onUpdate: (id: number, data: Partial<Integration>) => Promise<void>;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, onUpdate }) => {
    const { t } = useI18n();
    const [apiKey, setApiKey] = useState(integration.api_key || '');
    const [apiUrl, setApiUrl] = useState(integration.api_url || '');
    const [modelName, setModelName] = useState(integration.model_name || '');
    const [systemInstruction, setSystemInstruction] = useState(integration.system_instruction || '');
    const [showKey, setShowKey] = useState(false);
    const [testStatus, setTestStatus] = useState<'active' | 'inactive' | 'testing' | 'success' | 'error'>(
        integration.is_active ? 'active' : 'inactive'
    );
    const [testMsg, setTestMsg] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setApiKey(integration.api_key || '');
        setApiUrl(integration.api_url || '');
        setModelName(integration.model_name || '');
        setSystemInstruction(integration.system_instruction || '');
        setTestStatus(integration.is_active ? 'active' : 'inactive');
    }, [integration]);

    const handleSave = async () => {
        setSaving(true);
        setTestMsg('');
        try {
            await onUpdate(integration.id, { api_key: apiKey, api_url: apiUrl || undefined, model_name: modelName, system_instruction: systemInstruction });
            setTestMsg(t('settings_saved'));
            setTimeout(() => setTestMsg(''), 3000);
        } catch (e: any) {
            setTestMsg(`Erro: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            const nextActive = !integration.is_active;
            await onUpdate(integration.id, { is_active: nextActive });
            setTestStatus(nextActive ? 'active' : 'inactive');
        } catch (e) { console.error(e); }
    };

    const handleTestConnection = async () => {
        setTestStatus('testing');
        setTestMsg(t('test_start'));
        try {
            await onUpdate(integration.id, { api_key: apiKey, api_url: apiUrl || undefined, model_name: modelName, system_instruction: systemInstruction });
            const res = await testIntegration(integration.id);
            if (res.status === 'success') { setTestStatus('success'); setTestMsg(res.message); }
            else { setTestStatus('error'); setTestMsg(res.message); }
        } catch (e: any) {
            setTestStatus('error');
            setTestMsg(e.message || 'Erro de conexão.');
        }
    };

    const msgClass =
        testStatus === 'success' ? 'cardMessageSuccess' : testStatus === 'error' ? 'cardMessageError' : 'cardMessageInfo';

    return (
        <div className="card">
            <div className="cardHeader">
                <div>
                    <h3 className="cardTitle">{integration.name}</h3>
                    <p className="cardSubtitle">{t('provider')}: {integration.provider}</p>
                </div>
                <div className="cardHeaderActions">
                    <StatusIndicator status={integration.is_active ? 'active' : testStatus} />
                    <Button variant={integration.is_active ? 'danger' : 'primary'} onClick={handleToggleActive}>
                        {integration.is_active ? t('deactivate') : t('activate')}
                    </Button>
                </div>
            </div>

            <div className="cardBody">
                <FormField label={t('llm_model')}>
                    <Input value={modelName} onChange={(e) => setModelName(e.target.value)} />
                </FormField>

                {integration.provider === 'openai' && (
                    <FormField label={t('custom_endpoint_label')}>
                        <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.groq.com/openai/v1" />
                    </FormField>
                )}

                {integration.provider !== 'ozlo' && (
                    <FormField label={t('api_key_label')}>
                        <div className="cardKeyContainer">
                            <Input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={t('api_key_placeholder')} className="!pr-10" />
                            <button type="button" className="cardEyeBtn" onClick={() => setShowKey(!showKey)}>
                                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                        </div>
                    </FormField>
                )}

                <FormField label={t('instructions_label')}>
                    <textarea
                        className="cardTextarea"
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        placeholder={t('instructions_placeholder')}
                    />
                </FormField>
            </div>

            <div className="cardFooter">
                <Button variant="secondary" onClick={handleTestConnection} disabled={testStatus === 'testing'}>
                    <Play size={11} className="inline mr-1.5" /> {t('test')}
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    <Save size={11} className="inline mr-1.5" /> {saving ? t('saving') : t('save')}
                </Button>
            </div>

            {testMsg && (
                <div className={`cardMessage ${msgClass}`}>{testMsg}</div>
            )}
        </div>
    );
};
