import React, { useState, useEffect } from 'react';
import {
    fetchIntegrations, updateIntegration,
    fetchChats, createChat, deleteChat, fetchChatDetails, updateChatName,
    type Integration, type ChatSession,
} from '../../../api';
import { DashboardLayout } from '../../templates/dashboardLayout/DashboardLayout';
import { ChatWindow } from '../../organisms/chatWindow/ChatWindow';
import { IntegrationHub } from '../../organisms/integrationHub/IntegrationHub';
import { AnalyticsDashboard } from '../../organisms/analyticsDashboard/AnalyticsDashboard';
import { useI18n } from '../../../context/I18nContext';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'chat' | 'integrations' | 'analytics'>('chat');
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [ints, chats] = await Promise.all([fetchIntegrations(), fetchChats()]);
            setIntegrations(ints);
            setSessions(chats);
            if (chats.length > 0 && activeSessionId === null) setActiveSessionId(chats[0].id);
        } catch (e) {
            console.error('Erro ao carregar dados do dashboard:', e);
        } finally {
            setLoading(false);
        }
    };

    const loadActiveSessionDetails = async () => {
        if (activeSessionId === null) { setActiveSession(null); return; }
        try {
            setActiveSession(await fetchChatDetails(activeSessionId));
        } catch (e) {
            console.error('Erro ao carregar detalhes da sessão:', e);
        }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => { loadActiveSessionDetails(); }, [activeSessionId]);

    const handleUpdateIntegration = async (id: number, data: Partial<Integration>) => {
        try {
            await updateIntegration(id, data);
            setIntegrations(await fetchIntegrations());
        } catch (e) { console.error(e); throw e; }
    };

    const handleCreateSession = async (name: string) => {
        try {
            const next = await createChat(name);
            setSessions(await fetchChats());
            setActiveSessionId(next.id);
        } catch (e) { console.error(e); }
    };

    const handleUpdateSessionName = async (id: number, name: string) => {
        try {
            await updateChatName(id, name);
            setSessions(await fetchChats());
            if (activeSessionId === id) {
                await loadActiveSessionDetails();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteSession = async (id: number) => {
        try {
            await deleteChat(id);
            const updated = await fetchChats();
            setSessions(updated);
            if (activeSessionId === id) setActiveSessionId(updated.length > 0 ? updated[0].id : null);
        } catch (e) { console.error(e); }
    };

    const handleSendMessageSuccess = async () => {
        setSessions(await fetchChats());
        await loadActiveSessionDetails();
    };

    const handleSelectActiveModel = async (targetId: number) => {
        try {
            await Promise.all(
                integrations.map((item) => {
                    if (item.id === targetId && !item.is_active) {
                        return updateIntegration(item.id, { is_active: true });
                    }
                    if (item.id !== targetId && item.is_active) {
                        return updateIntegration(item.id, { is_active: false });
                    }
                    return Promise.resolve();
                })
            );
            setIntegrations(await fetchIntegrations());
        } catch (e) {
            console.error('Erro ao selecionar modelo ativo:', e);
        }
    };

    if (loading) {
        return (
            <div className="loadingWrapper">
                <div className="loadingSpinner" />
                <span className="loadingLabel">{t('loading_panel')}</span>
            </div>
        );
    }

    return (
        <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sessions={sessions}
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onUpdateSessionName={handleUpdateSessionName}
        >
            {activeTab === 'chat' && (
                <ChatWindow
                    activeSession={activeSession}
                    integrations={integrations}
                    onSelectActiveModel={handleSelectActiveModel}
                    onSendMessageSuccess={handleSendMessageSuccess}
                    onDeleteSession={handleDeleteSession}
                    onOpenIntegrations={() => setActiveTab('integrations')}
                />
            )}
            {activeTab === 'integrations' && (
                <IntegrationHub integrations={integrations} onUpdateIntegration={handleUpdateIntegration} />
            )}
            {activeTab === 'analytics' && (
                <AnalyticsDashboard sessions={sessions} />
            )}
        </DashboardLayout>
    );
};
