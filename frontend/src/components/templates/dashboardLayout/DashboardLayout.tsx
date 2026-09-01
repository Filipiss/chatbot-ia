import React, { useState } from 'react';
import type { ChatSession } from '../../../api';
import { Button } from '../../atoms/button/Button';
import { Input } from '../../atoms/input/Input';
import { MessageSquare, Cpu, BarChart3, Plus, Trash2, Pencil, X } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { FloatingControls } from '../../molecules/floatingControls/FloatingControls';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    activeTab: 'chat' | 'integrations' | 'analytics';
    setActiveTab: (tab: 'chat' | 'integrations' | 'analytics') => void;
    sessions: ChatSession[];
    activeSessionId: number | null;
    setActiveSessionId: (id: number | null) => void;
    onCreateSession: (name: string) => void;
    onDeleteSession: (id: number) => void;
    onUpdateSessionName: (id: number, name: string) => void;
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    activeTab, setActiveTab,
    sessions, activeSessionId, setActiveSessionId,
    onCreateSession, onDeleteSession, onUpdateSessionName, children,
}) => {
    const { t } = useI18n();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createSessionName, setCreateSessionName] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
    const [editSessionName, setEditSessionName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingSession, setDeletingSession] = useState<{ id: number; name: string } | null>(null);

    const navTabs = [
        { id: 'chat' as const, label: t('tab_chat'), icon: <MessageSquare size={13} /> },
        { id: 'integrations' as const, label: t('tab_integrations'), icon: <Cpu size={13} /> },
        { id: 'analytics' as const, label: t('tab_analytics'), icon: <BarChart3 size={13} /> },
    ];

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = createSessionName.trim();
        onCreateSession(trimmed);
        setCreateSessionName('');
        setIsCreateModalOpen(false);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = editSessionName.trim();
        if (editingSessionId !== null) {
            onUpdateSessionName(editingSessionId, trimmed);
            setEditSessionName('');
            setEditingSessionId(null);
            setIsEditModalOpen(false);
        }
    };

    const handleConfirmDelete = () => {
        if (deletingSession) {
            onDeleteSession(deletingSession.id);
            setDeletingSession(null);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="layoutRoot">
            <aside className="sidebar">
                {/* Brand */}
                <div className="brandSection">
                    <div className="brandIcon">
                        <Cpu size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="brandTitle">{t('brand_title')}</h1>
                        <span className="brandSub">{t('brand_subtitle')}</span>
                    </div>
                </div>

                {/* Nav Tabs */}
                <nav className="navSection">
                    {navTabs.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`navBtnBase ${activeTab === id ? 'navBtnActive' : 'navBtnInactive'}`}
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Session List */}
                {activeTab === 'chat' && (
                    <div className="sessionsSection">
                        <div className="sessionsHeader">
                            <span className="sessionsLabel">{t('conversations')}</span>
                            <Button
                                variant="secondary"
                                className="sessionsNewBtn"
                                title={t('new_conversation')}
                                onClick={() => {
                                    setCreateSessionName('');
                                    setIsCreateModalOpen(true);
                                }}
                            >
                                <Plus size={13} />
                            </Button>
                        </div>
                        <div className="sessionList">
                            {sessions.length === 0 ? (
                                <div className="sessionEmpty">{t('no_conversations')}</div>
                            ) : (
                                sessions.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`sessionItemBase group ${activeSessionId === s.id ? 'sessionItemActive' : 'sessionItemInactive'}`}
                                        onClick={() => setActiveSessionId(s.id)}
                                    >
                                        <div className="sessionName flex-1 overflow-hidden">
                                            <MessageSquare
                                                size={12}
                                                className={`shrink-0 ${activeSessionId === s.id ? 'sessionIconActive' : 'sessionIconInactive'}`}
                                            />
                                            <span className="truncate">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                className="sessionEditBtn"
                                                title={t('edit_conversation')}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingSessionId(s.id);
                                                    setEditSessionName(s.name);
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            <button
                                                type="button"
                                                className="sessionDelBtn"
                                                title={t('delete_conversation')}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingSession({ id: s.id, name: s.name });
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </aside>

            <main className="mainArea">{children}</main>

            {/* Floating Dock: Bottom Right Corner */}
            <FloatingControls />

            {/* Modal de Criação de Conversa */}
            {isCreateModalOpen && (
                <div className="modalOverlay" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h2 className="modalTitle">{t('new_conversation')}</h2>
                            <button className="modalCloseBtn" onClick={() => setIsCreateModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="modalForm">
                            <div className="modalBody">
                                <label className="modalLabel">{t('conversation_name')}</label>
                                <Input
                                    value={createSessionName}
                                    onChange={(e) => setCreateSessionName(e.target.value)}
                                    placeholder={t('conversation_name_placeholder')}
                                    autoFocus
                                />
                            </div>
                            <div className="modalFooter">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" variant="primary">
                                    {t('create')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Conversa */}
            {isEditModalOpen && (
                <div className="modalOverlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h2 className="modalTitle">{t('edit_conversation_title')}</h2>
                            <button className="modalCloseBtn" onClick={() => setIsEditModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="modalForm">
                            <div className="modalBody">
                                <label className="modalLabel">{t('conversation_name')}</label>
                                <Input
                                    value={editSessionName}
                                    onChange={(e) => setEditSessionName(e.target.value)}
                                    placeholder={t('conversation_name')}
                                    autoFocus
                                />
                            </div>
                            <div className="modalFooter">
                                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" variant="primary">
                                    {t('save')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Exclusão de Conversa */}
            {isDeleteModalOpen && deletingSession && (
                <div className="modalOverlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modalContent border-rose-500/30" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader border-rose-500/20">
                            <div className="flex items-center gap-2 text-rose-400">
                                <Trash2 size={16} />
                                <h2 className="modalTitle text-rose-400">{t('delete_conversation')}</h2>
                            </div>
                            <button className="modalCloseBtn" onClick={() => setIsDeleteModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="modalBody gap-3">
                            <p className="text-xs text-zinc-300">
                                {t('delete_question', { name: deletingSession.name })}
                            </p>
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                                {t('delete_warning')}
                            </div>
                        </div>
                        <div className="modalFooter">
                            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                                {t('cancel')}
                            </Button>
                            <Button type="button" variant="danger" onClick={handleConfirmDelete}>
                                {t('confirm_delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
