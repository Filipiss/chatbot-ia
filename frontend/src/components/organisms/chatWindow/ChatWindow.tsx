import React, { useState, useEffect, useRef } from 'react';
import { type ChatSession, type ChatMessage, sendMessageStream, clearChatMessages } from '../../../api';
import { ChatBubble } from '../../molecules/chatBubble/ChatBubble';
import { Button } from '../../atoms/button/Button';
import { Send, Sparkles, Download, Trash2, RotateCcw, X } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import './ChatWindow.css';

interface ChatWindowProps {
    activeSession: ChatSession | null;
    onSendMessageSuccess: () => void;
    onDeleteSession?: (id: number) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ activeSession, onSendMessageSuccess, onDeleteSession }) => {
    const { t } = useI18n();
    const [inputText, setInputText] = useState('');
    const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [activeSession?.messages, streamingMessage]);

    if (!activeSession) {
        return (
            <div className="emptyState">
                <div className="emptyIcon">
                    <Sparkles size={26} className="animate-pulse" />
                </div>
                <h3 className="emptyTitle">{t('no_chat_selected')}</h3>
                <p className="emptyDesc">{t('select_or_create_chat')}</p>
            </div>
        );
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isSending) return;
        const userText = inputText;
        setInputText('');
        setIsSending(true);

        const tempUserMsg: ChatMessage = {
            id: Date.now(), session_id: activeSession.id, role: 'user',
            content: userText, created_at: new Date().toISOString(),
        };
        activeSession.messages.push(tempUserMsg);

        setStreamingMessage({
            id: Date.now() + 1, session_id: activeSession.id, role: 'assistant',
            content: '', created_at: new Date().toISOString(),
        });

        try {
            await sendMessageStream(
                activeSession.id, userText,
                (chunk) => setStreamingMessage((prev) => {
                    if (prev) return { ...prev, content: prev.content + chunk };
                    return {
                        id: Date.now() + 1, session_id: activeSession.id, role: 'assistant',
                        content: chunk, created_at: new Date().toISOString(),
                    };
                }),
                (doneData) => {
                    setStreamingMessage((prev) => prev ? { ...prev, ...doneData } : null);
                    setIsSending(false);
                    setStreamingMessage(null);
                    onSendMessageSuccess();
                },
                (err) => {
                    setStreamingMessage((prev) => {
                        if (prev) return { ...prev, content: prev.content + `\n[Error: ${err.message}]` };
                        return {
                            id: Date.now() + 1, session_id: activeSession.id, role: 'assistant',
                            content: `\n[Error: ${err.message}]`, created_at: new Date().toISOString(),
                        };
                    });
                    setIsSending(false);
                }
            );
        } catch (err: any) {
            console.error(err);
            setIsSending(false);
        }
    };

    const handleConfirmClearChat = async () => {
        if (!activeSession || isSending) return;
        setActionLoading(true);
        try {
            await clearChatMessages(activeSession.id);
            setIsClearModalOpen(false);
            onSendMessageSuccess();
        } catch (err) {
            console.error("Erro ao reiniciar chat:", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDeleteChat = async () => {
        if (!activeSession || !onDeleteSession) return;
        setActionLoading(true);
        try {
            await onDeleteSession(activeSession.id);
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error("Erro ao excluir chat:", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportChat = () => {
        if (!activeSession || activeSession.messages.length === 0) return;

        const header = `# Histórico de Conversa: ${activeSession.name}\nID da Sessão: #${activeSession.id}\nData: ${new Date().toLocaleDateString()}\n\n---\n\n`;
        const body = activeSession.messages.map(msg => {
            const role = msg.role === 'user' ? 'Usuário' : 'Ozlo Assistant';
            const meta = msg.provider ? ` [Provedor: ${msg.provider} | Latência: ${msg.latency}s | Tokens: ${msg.tokens_used}]` : '';
            return `### **${role}**${meta}\n\n${msg.content}\n\n---\n`;
        }).join('\n');

        const fullText = header + body;
        const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `chat-${activeSession.id}-${activeSession.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="windowOuter">
            <div className="windowContainer">
                <div className="windowHeader">
                    <div>
                        <h2 className="windowTitle">{activeSession.name}</h2>
                        <p className="windowSubtitle">{t('conversation_number', { id: activeSession.id })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeSession.messages.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleExportChat}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                                    title={t('export_title')}
                                >
                                    <Download size={12} />
                                    <span>{t('export')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsClearModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
                                    title={t('clear_title')}
                                >
                                    <RotateCcw size={12} />
                                    <span>{t('clear')}</span>
                                </button>
                            </>
                        )}
                        {onDeleteSession && (
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all cursor-pointer"
                                title={t('delete_title')}
                            >
                                <Trash2 size={12} />
                                <span>{t('delete')}</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="feedContainer">
                    <div className="feedInner">
                        <div className="welcomeWrapper">
                            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="welcomeSvg">
                                <circle cx="85" cy="75" r="60" fill="#a78bfa" fillOpacity="0.03" />
                                <path d="M 45,170 C 50,150, 60,140, 79,140 L 91,140 C 110,140, 120,150, 125,170" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="#07080e" fillOpacity="0.6" />
                                <rect x="77" y="118" width="16" height="24" rx="4" fill="#07080e" stroke="#38bdf8" strokeWidth="2.5" />
                                <line x1="77" y1="126" x2="93" y2="126" stroke="#38bdf8" strokeWidth="2" />
                                <line x1="77" y1="134" x2="93" y2="134" stroke="#38bdf8" strokeWidth="2" />
                                <path d="M 35,70 C 35,35, 135,35, 135,70 C 135,100, 110,122, 85,122 C 60,122, 35,100, 35,70 Z" fill="#07080e" stroke="#38bdf8" strokeWidth="3" />
                                <path d="M 35,70 C 35,35, 135,35, 135,70 C 135,100, 110,122, 85,122 C 60,122, 35,100, 35,70 Z" fill="#38bdf8" fillOpacity="0.08" />
                                <ellipse cx="65" cy="74" rx="15" ry="8" fill="#38bdf8" fillOpacity="0.2" transform="rotate(-18, 65, 74)" />
                                <ellipse cx="65" cy="74" rx="11" ry="5" fill="#38bdf8" transform="rotate(-18, 65, 74)" />
                                <ellipse cx="63" cy="72" rx="4" ry="2" fill="#ffffff" transform="rotate(-18, 63, 72)" />
                                <ellipse cx="105" cy="74" rx="15" ry="8" fill="#38bdf8" fillOpacity="0.2" transform="rotate(18, 105, 74)" />
                                <ellipse cx="105" cy="74" rx="11" ry="5" fill="#38bdf8" transform="rotate(18, 105, 74)" />
                                <ellipse cx="107" cy="72" rx="4" ry="2" fill="#ffffff" transform="rotate(18, 107, 72)" />
                                <line x1="85" y1="36" x2="85" y2="18" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="85" cy="18" r="5" fill="#a78bfa" className="animate-pulse" />
                                <circle cx="85" cy="18" r="2" fill="#ffffff" />
                                <path d="M 165,185 C 160,165, 155,155, 148,145" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                                <rect x="141" y="141" width="12" height="5" rx="1.5" fill="#38bdf8" transform="rotate(-10, 147, 143)" />
                                <path d="M 136,141 Q 128,135 131,123 L 157,125 Q 162,137 155,143 Z" fill="#07080e" stroke="#38bdf8" strokeWidth="2.5" fillOpacity="0.8" />
                                <path d="M 132,133 L 118,127 L 110,124" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="110" cy="124" r="1.5" fill="#ffffff" />
                                <path d="M 136,123 L 133,105 L 131,90" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="131" cy="90" r="1.5" fill="#ffffff" />
                                <path d="M 142,123 L 140,102 L 138,85" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="138" cy="85" r="1.5" fill="#ffffff" />
                                <path d="M 152,124 L 153,103 L 154,86" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="154" cy="86" r="1.5" fill="#ffffff" />
                                <path d="M 157,125 L 159,107 L 161,92" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="161" cy="92" r="1.5" fill="#ffffff" />
                                <circle cx="146" cy="74" r="5" fill="#a78bfa" fillOpacity="0.4" className="animate-pulse" />
                                <circle cx="146" cy="74" r="2" fill="#ffffff" />
                            </svg>
                            {activeSession.messages.length === 0 && (
                                <div className="welcomeContent animate-fade-in">
                                    <h3 className="welcomeTitle">{t('welcome_title')}</h3>
                                    <p className="welcomeDesc">{t('welcome_desc')}</p>
                                </div>
                            )}
                        </div>

                        {activeSession.messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
                        {streamingMessage && <ChatBubble message={streamingMessage} />}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="inputSection">
                    <div className="inputWrapper">
                        <div className="avatarBtn">
                            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="22" y="25" width="56" height="50" rx="18" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="3.5" />
                                <rect x="32" y="37" width="36" height="22" rx="8" fill="#07080e" />
                                <circle cx="43" cy="48" r="3.5" fill="#38bdf8" />
                                <circle cx="57" cy="48" r="3.5" fill="#38bdf8" />
                                <path d="M15 50 H22" stroke="#38bdf8" strokeWidth="3" />
                                <path d="M78 50 H85" stroke="#38bdf8" strokeWidth="3" />
                            </svg>
                        </div>
                        <form onSubmit={handleSend} className="formWrapper">
                            <div className="fieldContainer">
                                <input
                                    id="message-input-field"
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={t('send_placeholder')}
                                    disabled={isSending}
                                    className="textInput"
                                />
                                <Button type="submit" variant="primary" disabled={!inputText.trim() || isSending} className="submitBtn">
                                    <Send size={15} />
                                </Button>
                            </div>
                        </form>
                        <button
                            type="button"
                            onClick={() => setIsClearModalOpen(true)}
                            className="reloadBtn"
                            title={t('clear_history_title')}
                        >
                            <Sparkles size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Limpeza de Mensagens */}
            {isClearModalOpen && (
                <div className="modalOverlay" onClick={() => setIsClearModalOpen(false)}>
                    <div className="modalContent border-amber-500/30" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader border-amber-500/20">
                            <div className="flex items-center gap-2 text-amber-400">
                                <RotateCcw size={16} />
                                <h2 className="modalTitle text-amber-400">{t('clear_history_title')}</h2>
                            </div>
                            <button className="modalCloseBtn" onClick={() => setIsClearModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="modalBody gap-3">
                            <p className="text-xs text-zinc-300">
                                {t('clear_history_question', { name: activeSession.name })}
                            </p>
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                                {t('clear_history_desc')}
                            </div>
                        </div>
                        <div className="modalFooter">
                            <Button type="button" variant="secondary" onClick={() => setIsClearModalOpen(false)} disabled={actionLoading}>
                                {t('cancel')}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleConfirmClearChat}
                                disabled={actionLoading}
                                className="!bg-amber-500 hover:!bg-amber-600 !border-amber-400/30"
                            >
                                {actionLoading ? t('clearing') : t('confirm_and_clear')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Exclusão de Conversa (Direto da Janela) */}
            {isDeleteModalOpen && onDeleteSession && (
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
                                {t('delete_question', { name: activeSession.name })}
                            </p>
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                                {t('delete_warning')}
                            </div>
                        </div>
                        <div className="modalFooter">
                            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={actionLoading}>
                                {t('cancel')}
                            </Button>
                            <Button type="button" variant="danger" onClick={handleConfirmDeleteChat} disabled={actionLoading}>
                                {actionLoading ? t('deleting') : t('confirm_delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
