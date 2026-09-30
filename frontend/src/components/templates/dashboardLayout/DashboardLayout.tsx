import React, { useState, useEffect } from 'react';
import type { ChatSession } from '../../../api';
import { Button } from '../../atoms/button/Button';
import { Input } from '../../atoms/input/Input';
import {
    MessageSquare, Settings, BarChart3, Plus, Trash2, Pencil, X,
    Folder, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { FloatingControls } from '../../molecules/floatingControls/FloatingControls';
import { RobotIntegrationLogo } from '../../atoms/robotIntegrationLogo/RobotIntegrationLogo';
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
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 1024;
        }
        return false;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createSessionName, setCreateSessionName] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
    const [editSessionName, setEditSessionName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingSession, setDeletingSession] = useState<{ id: number; name: string } | null>(null);

    const featureTabs = [
        { id: 'chat' as const, label: t('tab_chat'), icon: <MessageSquare size={14} /> },
        { id: 'integrations' as const, label: t('tab_integrations'), icon: <Settings size={14} /> },
        { id: 'analytics' as const, label: t('tab_analytics'), icon: <BarChart3 size={14} /> },
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
        <div className="o-layout">
            {!isCollapsed && (
                <div
                    className="c-sidebar__backdrop"
                    onClick={() => setIsCollapsed(true)}
                    aria-hidden="true"
                />
            )}

            <aside className={`c-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
                <div className="c-sidebar__brand">
                    <div className="c-sidebar__brand-left">
                        <div className="c-sidebar__brand-icon">
                            <RobotIntegrationLogo size={22} />
                        </div>
                        {!isCollapsed && (
                            <span className="c-sidebar__brand-title">{t('brand_title')}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="c-sidebar__toggle-btn"
                        title={t('collapse_sidebar')}
                        aria-label={t('collapse_sidebar')}
                    >
                        {isCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
                    </button>
                </div>

                <div className="c-sidebar__new-chat">
                    <button
                        type="button"
                        onClick={() => {
                            setCreateSessionName('');
                            setIsCreateModalOpen(true);
                        }}
                        className="c-sidebar__new-chat-btn"
                        title={t('new_chat')}
                    >
                        <div className="c-sidebar__new-chat-icon">
                            <Plus size={14} />
                        </div>
                        {!isCollapsed && <span>{t('new_chat')}</span>}
                    </button>
                </div>

                <div className="c-sidebar__group">
                    {!isCollapsed && <span className="c-sidebar__group-label">{t('features_section')}</span>}
                    <nav className="c-sidebar__nav">
                        {featureTabs.map(({ id, label, icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setActiveTab(id);
                                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                        setIsCollapsed(true);
                                    }
                                }}
                                className={`c-sidebar__nav-btn ${activeTab === id ? 'is-active' : ''}`}
                                title={label}
                            >
                                <span className="shrink-0">{icon}</span>
                                {!isCollapsed && <span className="truncate">{label}</span>}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="c-sidebar__group flex-1 overflow-hidden flex flex-col">
                    {!isCollapsed && (
                        <div className="flex items-center justify-between px-3 mb-1">
                            <span className="c-sidebar__group-label !mb-0">{t('workspaces_section')}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setCreateSessionName('');
                                    setIsCreateModalOpen(true);
                                }}
                                className="text-zinc-500 hover:text-white transition-colors p-0.5"
                                title={t('new_conversation')}
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    )}
                    <div className="c-sidebar__session-list">
                        {sessions.length === 0 ? (
                            !isCollapsed && <div className="c-sidebar__session-empty">{t('no_conversations')}</div>
                        ) : (
                            sessions.map((s) => (
                                <div
                                    key={s.id}
                                    className={`c-sidebar__session-item group ${activeSessionId === s.id && activeTab === 'chat' ? 'is-active' : ''}`}
                                    onClick={() => {
                                        setActiveSessionId(s.id);
                                        if (activeTab !== 'chat') setActiveTab('chat');
                                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                            setIsCollapsed(true);
                                        }
                                    }}
                                    title={s.name}
                                >
                                    <div className="c-sidebar__session-name flex-1 overflow-hidden">
                                        <Folder
                                            size={13}
                                            className={`shrink-0 ${activeSessionId === s.id && activeTab === 'chat' ? 'text-violet-400' : 'text-zinc-500'}`}
                                        />
                                        {!isCollapsed && <span className="truncate">{s.name}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="c-sidebar__session-actions">
                                            <button
                                                type="button"
                                                className="c-sidebar__session-edit-btn"
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
                                                className="c-sidebar__session-del-btn"
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
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="c-sidebar__footer">
                    {!isCollapsed ? (
                        <div className="c-sidebar__author-block">
                            <div className="c-sidebar__author-info">
                                <span className="c-sidebar__author-prefix">{t('author_prefix')}</span>
                                <span className="c-sidebar__author-name">Filipi Soares</span>
                                <span className="c-sidebar__author-role">Full-Stack Developer</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center text-zinc-500 font-mono text-[10px]" title={`${t('author_prefix')} Filipi Soares`}>
                            FS
                        </div>
                    )}
                </div>
            </aside>

            <main className="o-layout__main">
                {isCollapsed && (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        className="c-sidebar__mobile-trigger"
                        title={t('collapse_sidebar')}
                        aria-label={t('collapse_sidebar')}
                    >
                        <PanelLeft size={16} />
                    </button>
                )}
                {children}
            </main>

            <FloatingControls />

            {isCreateModalOpen && (
                <div className="c-modal" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="c-modal__dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="c-modal__header">
                            <h2 className="c-modal__title">{t('new_conversation')}</h2>
                            <button className="c-modal__close-btn" onClick={() => setIsCreateModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="c-modal__form">
                            <div className="c-modal__body">
                                <label className="c-modal__label">{t('conversation_name')}</label>
                                <Input
                                    value={createSessionName}
                                    onChange={(e) => setCreateSessionName(e.target.value)}
                                    placeholder={t('conversation_name_placeholder')}
                                    autoFocus
                                />
                            </div>
                            <div className="c-modal__footer">
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

            {isEditModalOpen && (
                <div className="c-modal" onClick={() => setIsEditModalOpen(false)}>
                    <div className="c-modal__dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="c-modal__header">
                            <h2 className="c-modal__title">{t('edit_conversation_title')}</h2>
                            <button className="c-modal__close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="c-modal__form">
                            <div className="c-modal__body">
                                <label className="c-modal__label">{t('conversation_name')}</label>
                                <Input
                                    value={editSessionName}
                                    onChange={(e) => setEditSessionName(e.target.value)}
                                    placeholder={t('conversation_name')}
                                    autoFocus
                                />
                            </div>
                            <div className="c-modal__footer">
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

            {isDeleteModalOpen && deletingSession && (
                <div className="c-modal" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="c-modal__dialog border-rose-500/30" onClick={(e) => e.stopPropagation()}>
                        <div className="c-modal__header border-rose-500/20">
                            <div className="flex items-center gap-2 text-rose-400">
                                <Trash2 size={16} />
                                <h2 className="c-modal__title text-rose-400">{t('delete_conversation')}</h2>
                            </div>
                            <button className="c-modal__close-btn" onClick={() => setIsDeleteModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="c-modal__body gap-3">
                            <p className="text-xs text-zinc-300">
                                {t('delete_question', { name: deletingSession.name })}
                            </p>
                            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                                {t('delete_warning')}
                            </div>
                        </div>
                        <div className="c-modal__footer">
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
