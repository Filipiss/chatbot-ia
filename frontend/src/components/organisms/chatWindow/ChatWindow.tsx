import React, { useState, useEffect, useRef } from 'react';
import { type ChatSession, type ChatMessage, sendMessageStream, clearChatMessages } from '../../../api';
import { ChatBubble } from '../../molecules/chatBubble/ChatBubble';
import {
    Sparkles, Download, Trash2, RotateCcw, X, Paperclip,
    SlidersHorizontal, ChevronDown, Mic, ArrowUp, Image as ImageIcon,
    Lightbulb, FileText, Code2, Cpu, Settings
} from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../atoms/button/Button';
import './ChatWindow.css';

interface ChatWindowProps {
    activeSession: ChatSession | null;
    onSendMessageSuccess: () => void;
    onDeleteSession?: (id: number) => void;
    onOpenIntegrations?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    activeSession,
    onSendMessageSuccess,
    onDeleteSession,
    onOpenIntegrations,
}) => {
    const { t } = useI18n();
    const [inputText, setInputText] = useState('');
    const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [activeSession?.messages, streamingMessage]);

    // Auto-adjust textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [inputText]);

    if (!activeSession) {
        return (
            <div className="emptyState">
                <div className="zyriconOrbSmall" />
                <h3 className="emptyTitle">{t('no_chat_selected')}</h3>
                <p className="emptyDesc">{t('select_or_create_chat')}</p>
            </div>
        );
    }

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || isSending) return;
        const userText = inputText.trim();
        setInputText('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setIsSending(true);

        const tempUserMsg: ChatMessage = {
            id: Date.now(),
            session_id: activeSession.id,
            role: 'user',
            content: userText,
            created_at: new Date().toISOString(),
        };
        activeSession.messages.push(tempUserMsg);

        setStreamingMessage({
            id: Date.now() + 1,
            session_id: activeSession.id,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
        });

        try {
            await sendMessageStream(
                activeSession.id,
                userText,
                (chunk) => setStreamingMessage((prev) => {
                    if (prev) return { ...prev, content: prev.content + chunk };
                    return {
                        id: Date.now() + 1,
                        session_id: activeSession.id,
                        role: 'assistant',
                        content: chunk,
                        created_at: new Date().toISOString(),
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
                            id: Date.now() + 1,
                            session_id: activeSession.id,
                            role: 'assistant',
                            content: `\n[Error: ${err.message}]`,
                            created_at: new Date().toISOString(),
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
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

    const hasMessages = activeSession.messages.length > 0;

    return (
        <div className="zyriconWindow">
            {/* Top Bar Header */}
            <div className="zyriconTopBar">
                {/* Model Selector Dropdown Pill */}
                <div className="zyriconModelPill" title={t('active_model')}>
                    <span className="zyriconModelDot" />
                    <span className="zyriconModelName">Ozlo / Multi-LLM v4.0</span>
                    <ChevronDown size={13} className="text-zinc-400" />
                </div>

                {/* Right Action Pills */}
                <div className="flex items-center gap-2">
                    {onOpenIntegrations && (
                        <button
                            type="button"
                            onClick={onOpenIntegrations}
                            className="zyriconTopBtn"
                            title={t('tab_integrations')}
                        >
                            <Settings size={12} />
                            <span>{t('tab_integrations')}</span>
                        </button>
                    )}

                    {hasMessages && (
                        <>
                            <button
                                type="button"
                                onClick={handleExportChat}
                                className="zyriconTopBtn"
                                title={t('export_title')}
                            >
                                <Download size={12} />
                                <span>{t('export')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsClearModalOpen(true)}
                                className="zyriconTopBtn hover:!text-amber-400 hover:!border-amber-400/30"
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
                            className="zyriconTopBtn hover:!text-rose-400 hover:!border-rose-500/30"
                            title={t('delete_title')}
                        >
                            <Trash2 size={12} />
                            <span>{t('delete')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Area: Welcome Hero OR Chat Messages Feed */}
            <div className="zyriconFeedContainer">
                {!hasMessages ? (
                    <div className="zyriconHeroSection">
                        {/* 3D Glowing Cosmic Orb */}
                        <div className="zyriconOrbContainer">
                            <div className="zyriconOrbHalo" />
                            <div className="zyriconOrbCore" />
                            <div className="zyriconOrbHighlight" />
                        </div>

                        {/* Hero Headline */}
                        <h2 className="zyriconHeroHeadline">{t('hero_headline')}</h2>

                        {/* Suggestion Action Chips */}
                        <div className="zyriconChipsWrapper">
                            <button
                                type="button"
                                className="zyriconChip"
                                onClick={() => setInputText("Crie uma imagem de uma cidade futurista neon com IA")}
                            >
                                <span>{t('chip_create_image')}</span>
                                <ImageIcon size={13} className="text-zinc-400" />
                            </button>
                            <button
                                type="button"
                                className="zyriconChip"
                                onClick={() => setInputText("Faça um brainstorm de 5 ideias inovadoras para automação com IA")}
                            >
                                <span>{t('chip_brainstorm')}</span>
                                <Lightbulb size={13} className="text-amber-400" />
                            </button>
                            <button
                                type="button"
                                className="zyriconChip"
                                onClick={() => setInputText("Crie um plano detalhado para implementar um chatbot de atendimento")}
                            >
                                <span>{t('chip_make_plan')}</span>
                                <FileText size={13} className="text-sky-400" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="zyriconMessagesList">
                        {activeSession.messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}
                        {streamingMessage && <ChatBubble message={streamingMessage} />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Bottom Interactive Area: Zyricon Input Card & Bottom Feature Cards */}
            <div className="zyriconBottomArea">
                {/* Zyricon Input Card */}
                <div className="zyriconInputCard">
                    {/* Top Row: Sparkle Icon + Expandable Textarea */}
                    <div className="zyriconInputTopRow">
                        <Sparkles size={16} className="text-violet-400 shrink-0 mt-1" />
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('ask_anything')}
                            disabled={isSending}
                            rows={1}
                            className="zyriconTextarea"
                        />
                    </div>

                    {/* Bottom Toolbar: Attach / Settings / Options + Voice & Circular Send Button */}
                    <div className="zyriconInputBottomRow">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="zyriconToolBtn"
                                title={t('attach_btn')}
                                onClick={() => setInputText((prev) => prev + " [Arquivo] ")}
                            >
                                <Paperclip size={13} />
                                <span>{t('attach_btn')}</span>
                            </button>

                            {onOpenIntegrations && (
                                <button
                                    type="button"
                                    className="zyriconToolBtn"
                                    title={t('system_settings_btn')}
                                    onClick={onOpenIntegrations}
                                >
                                    <SlidersHorizontal size={13} />
                                    <span>{t('system_settings_btn')}</span>
                                </button>
                            )}

                            <button
                                type="button"
                                className="zyriconToolBtn"
                                title={t('options_btn')}
                                onClick={() => {
                                    if (onOpenIntegrations) onOpenIntegrations();
                                }}
                            >
                                <Cpu size={13} />
                                <span>{t('options_btn')}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="zyriconMicBtn"
                                title="Microfone"
                            >
                                <Mic size={15} />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSend()}
                                disabled={!inputText.trim() || isSending}
                                className="zyriconSendBtn"
                                title="Enviar"
                            >
                                <ArrowUp size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom 3 Feature Cards (Displayed on Hero / Welcome View) */}
                {!hasMessages && (
                    <div className="zyriconFeatureGrid">
                        {/* Card 1: Ozlo Orgânico */}
                        <div
                            className="zyriconFeatureCard group"
                            onClick={() => setInputText("Olá Ozlo, me explique como você funciona de maneira orgânica.")}
                        >
                            <div className="flex items-center justify-between">
                                <div className="zyriconFeatureIconBox">
                                    <ImageIcon size={15} className="text-violet-400" />
                                </div>
                                <span className="zyriconFeatureBadge">{t('card_ozlo_badge')}</span>
                            </div>
                            <h4 className="zyriconFeatureTitle">{t('card_ozlo_title')}</h4>
                            <p className="zyriconFeatureDesc">{t('card_ozlo_desc')}</p>
                        </div>

                        {/* Card 2: Google Gemini */}
                        <div
                            className="zyriconFeatureCard group"
                            onClick={() => setInputText("Analise as principais tendências de tecnologia para 2026 com o Gemini.")}
                        >
                            <div className="flex items-center justify-between">
                                <div className="zyriconFeatureIconBox">
                                    <FileText size={15} className="text-sky-400" />
                                </div>
                                <span className="zyriconFeatureBadge">{t('card_gemini_badge')}</span>
                            </div>
                            <h4 className="zyriconFeatureTitle">{t('card_gemini_title')}</h4>
                            <p className="zyriconFeatureDesc">{t('card_gemini_desc')}</p>
                        </div>

                        {/* Card 3: OpenAI & Groq */}
                        <div
                            className="zyriconFeatureCard group"
                            onClick={() => setInputText("Gere uma função assíncrona em TypeScript para processar requisições em paralelo.")}
                        >
                            <div className="flex items-center justify-between">
                                <div className="zyriconFeatureIconBox">
                                    <Code2 size={15} className="text-emerald-400" />
                                </div>
                                <span className="zyriconFeatureBadge">{t('card_openai_badge')}</span>
                            </div>
                            <h4 className="zyriconFeatureTitle">{t('card_openai_title')}</h4>
                            <p className="zyriconFeatureDesc">{t('card_openai_desc')}</p>
                        </div>
                    </div>
                )}
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

            {/* Modal de Exclusão de Conversa */}
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
