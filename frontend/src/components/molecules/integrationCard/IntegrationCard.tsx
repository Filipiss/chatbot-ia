import React, { useState, useEffect } from 'react';
import { type Integration, testIntegration } from '../../../api';
import { StatusIndicator } from '../../atoms/statusIndicator/StatusIndicator';
import { Play, Eye, EyeOff, Save, Lock, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import './IntegrationCard.css';

interface IntegrationCardProps {
    integration: Integration;
    onUpdate: (id: number, data: Partial<Integration>) => Promise<void>;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, onUpdate }) => {
    const { t } = useI18n();

    const [apiKey, setApiKey] = useState(integration.api_key || '');
    const [isDirtyKey, setIsDirtyKey] = useState(false);
    const [apiUrl, setApiUrl] = useState(integration.api_url || '');
    const [modelName, setModelName] = useState(integration.model_name || '');
    const [systemInstruction, setSystemInstruction] = useState(integration.system_instruction || '');
    const [showKey, setShowKey] = useState(false);
    const [testStatus, setTestStatus] = useState<'active' | 'inactive' | 'testing' | 'success' | 'error'>(
        integration.is_active ? 'active' : 'inactive'
    );
    const [testMsg, setTestMsg] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setApiKey(integration.api_key || '');
        setIsDirtyKey(false);
        setApiUrl(integration.api_url || '');
        setModelName(integration.model_name || '');
        setSystemInstruction(integration.system_instruction || '');
        setTestStatus(integration.is_active ? 'active' : 'inactive');
    }, [integration]);

    const buildPayload = (): Partial<Integration> => {
        const payload: Partial<Integration> = {
            api_url: apiUrl.trim() || undefined,
            model_name: modelName.trim(),
            system_instruction: systemInstruction.trim(),
        };
        // Envia api_key SOMENTE se o usuário digitou uma nova chave e não deixou a máscara
        if (isDirtyKey && apiKey.trim() && !apiKey.trim().startsWith('*') && !apiKey.trim().startsWith('•')) {
            payload.api_key = apiKey.trim();
        }
        return payload;
    };

    const handleSave = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSaving(true);
        setTestMsg('');
        setSaveSuccess(false);
        try {
            await onUpdate(integration.id, buildPayload());
            setIsDirtyKey(false);
            setSaveSuccess(true);
            setTestStatus('success');
            setTestMsg(t('settings_saved'));
            setTimeout(() => {
                setSaveSuccess(false);
                setTestMsg('');
            }, 3000);
        } catch (e: any) {
            console.error('Erro ao salvar integração:', e);
            setTestStatus('error');
            setTestMsg(`Erro ao salvar: ${e.message || 'Falha de comunicação'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        try {
            const nextActive = !integration.is_active;
            await onUpdate(integration.id, { is_active: nextActive });
            setTestStatus(nextActive ? 'active' : 'inactive');
        } catch (e) {
            console.error(e);
        }
    };

    const handleTestConnection = async () => {
        setTestStatus('testing');
        setTestMsg(t('test_start'));
        try {
            await onUpdate(integration.id, buildPayload());
            setIsDirtyKey(false);
            const res = await testIntegration(integration.id);
            if (res.status === 'success') {
                setTestStatus('success');
                setTestMsg(res.message);
            } else {
                setTestStatus('error');
                setTestMsg(res.message);
            }
        } catch (e: any) {
            setTestStatus('error');
            setTestMsg(e.message || 'Erro de conexão.');
        }
    };

    const providerIcon = () => {
        if (integration.provider === 'gemini') {
            return (
                <div className="providerBadgeIcon bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Sparkles size={16} />
                </div>
            );
        }
        if (integration.provider === 'openai') {
            return (
                <div className="providerBadgeIcon bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles size={16} />
                </div>
            );
        }
        return (
            <div className="providerBadgeIcon bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sparkles size={16} />
            </div>
        );
    };

    const msgClass =
        testStatus === 'success' ? 'cardMessageSuccess' : testStatus === 'error' ? 'cardMessageError' : 'cardMessageInfo';

    return (
        <div className={`zyriconProviderCard ${integration.is_active ? 'cardActiveGlow' : ''}`}>
            {/* Header */}
            <div className="cardHeader">
                <div className="flex items-center gap-3">
                    {providerIcon()}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="cardTitle">{integration.name}</h3>
                            <span className="providerTag">{integration.provider.toUpperCase()}</span>
                        </div>
                        <p className="cardSubtitle">
                            {integration.provider === 'ozlo'
                                ? t('card_sub_ozlo')
                                : integration.provider === 'gemini'
                                ? t('card_sub_gemini')
                                : t('card_sub_openai')}
                        </p>
                    </div>
                </div>

                <div className="cardHeaderActions">
                    <StatusIndicator status={integration.is_active ? 'active' : testStatus} />
                    <button
                        type="button"
                        onClick={handleToggleActive}
                        className={`zyriconToggleBtn ${integration.is_active ? 'zyriconToggleActive' : 'zyriconToggleInactive'}`}
                    >
                        {integration.is_active ? t('deactivate') : t('activate')}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="cardBody">
                {/* Model Name */}
                <div className="fieldRow">
                    <label className="fieldLabel">{t('llm_model')}</label>
                    <input
                        type="text"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="zyriconFieldInput"
                        placeholder="Ex: gemini-1.5-flash, gpt-4o, llama-3.3-70b-versatile..."
                    />
                </div>

                {/* Custom API URL (for OpenAI / Groq) */}
                {integration.provider === 'openai' && (
                    <div className="fieldRow">
                        <label className="fieldLabel">{t('custom_endpoint_label')}</label>
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="https://api.groq.com/openai/v1"
                            className="zyriconFieldInput"
                        />
                    </div>
                )}

                {/* API Key (Secure & Masked) */}
                {integration.provider !== 'ozlo' ? (
                    <div className="fieldRow">
                        <div className="flex items-center justify-between">
                            <label className="fieldLabel flex items-center gap-1.5">
                                <Lock size={11} className="text-zinc-500" />
                                {t('api_key_label')}
                            </label>
                            {integration.has_api_key ? (
                                <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                                    <ShieldCheck size={11} />
                                    {t('key_encrypted_notice')}
                                </span>
                            ) : (
                                <span className="text-[10px] text-zinc-500 font-mono font-medium flex items-center gap-1">
                                    <Lock size={11} />
                                    {t('key_missing_notice')}
                                </span>
                            )}
                        </div>

                        <div className="cardKeyContainer">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setIsDirtyKey(true);
                                }}
                                placeholder={t('api_key_placeholder')}
                                className="zyriconFieldInput !pr-10 font-mono text-xs"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="cardEyeBtn"
                                onClick={() => setShowKey(!showKey)}
                                title={showKey ? t('hide_key') : t('show_key')}
                            >
                                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 pt-0.5">
                            <Lock size={10} className="text-emerald-500 shrink-0" />
                            <span>{t('key_encrypted_subnotice')}</span>
                        </p>
                    </div>
                ) : (
                    <div className="ozloNotice">
                        <Sparkles size={14} className="text-violet-400 shrink-0" />
                        <span>{t('ozlo_resident_notice')}</span>
                    </div>
                )}

                {/* System Prompt / Base Instructions */}
                <div className="fieldRow">
                    <label className="fieldLabel">{t('instructions_label')}</label>
                    <textarea
                        className="zyriconTextareaField"
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        placeholder={t('instructions_placeholder')}
                        rows={2}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="cardFooter">
                {testMsg && (
                    <div className={`cardMessage ${msgClass} truncate max-w-xs md:max-w-md`}>
                        {testMsg}
                    </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testStatus === 'testing'}
                        className="zyriconActionBtn"
                    >
                        <Play size={11} className="text-violet-400" />
                        <span>{t('test')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className={`zyriconPrimaryActionBtn ${saveSuccess ? 'zyriconPrimaryActionBtnSuccess' : ''}`}
                        title={t('save_tooltip')}
                    >
                        {saving ? (
                            <Save size={12} className="animate-spin text-white" />
                        ) : saveSuccess ? (
                            <Check size={13} className="text-white" />
                        ) : (
                            <Save size={12} className="text-white" />
                        )}
                        <span>{saving ? t('saving') : saveSuccess ? t('saved') : t('save')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
