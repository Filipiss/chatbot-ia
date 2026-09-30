import React, { useState, useEffect, useRef } from 'react';
import {
    type ChatSession, type ChatMessage, type Integration,
    sendMessageStream, clearChatMessages
} from '../../../api';
import { ChatBubble } from '../../molecules/chatBubble/ChatBubble';
import {
    Sparkles, Download, Trash2, RotateCcw, X, Paperclip,
    ChevronDown, ArrowUp, ArrowUpRight, Lightbulb, FileText, Code2, Cpu,
    Settings, Check, ShieldCheck, Zap
} from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../atoms/button/Button';
import { AiOrchestratorHero } from '../../atoms/aiOrchestratorHero/AiOrchestratorHero';
import './ChatWindow.css';

interface ChatWindowProps {
    activeSession: ChatSession | null;
    integrations?: Integration[];
    onSelectActiveModel?: (id: number) => Promise<void>;
    onSendMessageSuccess: () => void;
    onDeleteSession?: (id: number) => void;
    onOpenIntegrations?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    activeSession,
    integrations = [],
    onSelectActiveModel,
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
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [selectedInfoProvider, setSelectedInfoProvider] = useState<'ozlo' | 'gemini' | 'openai' | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [activeSession?.messages, streamingMessage]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [inputText]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsModelDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!activeSession) {
        return (
            <div className="c-chat-window__empty">
                <div className="w-8 h-8 rounded-full border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Sparkles size={16} />
                </div>
                <h3 className="c-chat-window__empty-title">{t('no_chat_selected')}</h3>
                <p className="c-chat-window__empty-desc">{t('select_or_create_chat')}</p>
            </div>
        );
    }

    const activeIntegration = integrations.find((i) => i.is_active) || integrations[0] || {
        id: 1,
        name: 'Ozlo Orgânico',
        provider: 'ozlo',
        model_name: 'ozlo-organic-v1',
        is_active: true,
    };

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const formatted = `\n\n--- Conteúdo do arquivo anexado (${file.name}) ---\n${content}\n---\n`;
                setInputText((prev) => (prev ? prev + formatted : formatted));
                if (textareaRef.current) textareaRef.current.focus();
            }
        };
        reader.readAsText(file);
        e.target.value = '';
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

    const getProviderDotColor = (provider: string) => {
        if (provider === 'gemini') return 'bg-sky-400 shadow-sky-400/50';
        if (provider === 'openai') return 'bg-emerald-400 shadow-emerald-400/50';
        return 'bg-blue-400 shadow-blue-400/50';
    };

    return (
        <div className="c-chat-window">
            <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.md,.json,.js,.ts,.tsx,.py,.csv,.html,.css,.sql,.yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
            />

            <div className="c-chat-window__topbar">
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        className="c-chat-window__model-pill"
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        title={t('select_model_tooltip')}
                    >
                        <span className={`c-chat-window__model-dot ${getProviderDotColor(activeIntegration.provider)}`} />
                        <span className="c-chat-window__model-name">
                            {activeIntegration.name || activeIntegration.model_name}
                        </span>
                        <ChevronDown size={13} className={`text-zinc-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isModelDropdownOpen && (
                        <div className="c-chat-window__dropdown">
                            <div className="c-chat-window__dropdown-header">
                                <span>{t('available_models')}</span>
                                <span className="text-[9px] text-sky-400">{t('click_to_activate')}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-1">
                                {integrations.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`c-chat-window__dropdown-item ${item.is_active ? 'is-active' : ''}`}
                                        onClick={async () => {
                                            if (onSelectActiveModel) {
                                                await onSelectActiveModel(item.id);
                                            }
                                            setIsModelDropdownOpen(false);
                                        }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${getProviderDotColor(item.provider)}`} />
                                            <div className="flex flex-col text-left">
                                                <span className="font-semibold text-xs text-white leading-none">{item.name}</span>
                                                <span className="text-[10px] text-zinc-400 mt-0.5">{item.model_name || item.provider}</span>
                                            </div>
                                        </div>
                                        {item.is_active ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                                <Check size={10} /> {t('active')}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">
                                                {t('activate')}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {onOpenIntegrations && (
                        <button
                            type="button"
                            onClick={onOpenIntegrations}
                            className="c-chat-window__top-btn"
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
                                className="c-chat-window__top-btn"
                                title={t('export_title')}
                            >
                                <Download size={12} />
                                <span>{t('export')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsClearModalOpen(true)}
                                className="c-chat-window__top-btn hover:!text-amber-400 hover:!border-amber-400/30"
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
                            className="c-chat-window__top-btn hover:!text-rose-400 hover:!border-rose-500/30"
                            title={t('delete_title')}
                        >
                            <Trash2 size={12} />
                            <span>{t('delete')}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="c-chat-window__feed">
                {!hasMessages ? (
                    <div className="c-chat-window__hero">
                        <AiOrchestratorHero />

                        <div className="c-chat-window__hero-text">
                            <h2 className="c-chat-window__headline">{t('hero_headline')}</h2>
                            <p className="c-chat-window__subheadline">{t('hero_subheadline')}</p>
                        </div>

                        <div className="c-chat-window__chips">
                            <button
                                type="button"
                                className="c-chat-window__chip group"
                                onClick={() => {
                                    setInputText(t('chip_brainstorm_prompt'));
                                    if (textareaRef.current) textareaRef.current.focus();
                                }}
                            >
                                <Lightbulb size={13} className="text-amber-400" />
                                <span>{t('chip_brainstorm')}</span>
                                <ArrowUpRight size={11} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </button>
                            <button
                                type="button"
                                className="c-chat-window__chip group"
                                onClick={() => {
                                    setInputText(t('chip_make_plan_prompt'));
                                    if (textareaRef.current) textareaRef.current.focus();
                                }}
                            >
                                <FileText size={13} className="text-sky-400" />
                                <span>{t('chip_make_plan')}</span>
                                <ArrowUpRight size={11} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </button>
                            <button
                                type="button"
                                className="c-chat-window__chip group"
                                onClick={() => {
                                    setInputText(t('chip_generate_code_prompt'));
                                    if (textareaRef.current) textareaRef.current.focus();
                                }}
                            >
                                <Code2 size={13} className="text-emerald-400" />
                                <span>{t('chip_generate_code')}</span>
                                <ArrowUpRight size={11} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="c-chat-window__messages">
                        {activeSession.messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}
                        {streamingMessage && <ChatBubble message={streamingMessage} />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="c-chat-window__bottom">
                <div className="c-chat-window__input-card">
                    <div className="c-chat-window__input-top">
                        <Sparkles size={16} className="text-sky-400 shrink-0 mt-1" />
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('ask_anything')}
                            disabled={isSending}
                            rows={1}
                            className="c-chat-window__textarea"
                        />
                    </div>

                    <div className="c-chat-window__input-bottom">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="c-chat-window__tool-btn"
                                title={t('attach_tooltip')}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip size={13} />
                                <span>{t('attach_btn')}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleSend()}
                                disabled={!inputText.trim() || isSending}
                                className="c-chat-window__send-btn"
                                title={t('send_tooltip')}
                            >
                                <ArrowUp size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {!hasMessages && (
                    <div className="c-chat-window__feature-grid">
                        <div
                            className="c-chat-window__feature-card group"
                            onClick={() => setSelectedInfoProvider('ozlo')}
                            title={t('card_ozlo_tooltip')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="c-chat-window__feature-icon">
                                    <Sparkles size={15} className="text-sky-400" />
                                </div>
                                <span className="c-chat-window__feature-badge">{t('card_ozlo_badge')}</span>
                            </div>
                            <h4 className="c-chat-window__feature-title">
                                <span>{t('card_ozlo_title')}</span>
                                <ArrowUpRight size={13} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </h4>
                            <p className="c-chat-window__feature-desc">{t('card_ozlo_desc')}</p>
                        </div>

                        <div
                            className="c-chat-window__feature-card group"
                            onClick={() => setSelectedInfoProvider('gemini')}
                            title={t('card_gemini_tooltip')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="c-chat-window__feature-icon">
                                    <FileText size={15} className="text-sky-400" />
                                </div>
                                <span className="c-chat-window__feature-badge">{t('card_gemini_badge')}</span>
                            </div>
                            <h4 className="c-chat-window__feature-title">
                                <span>{t('card_gemini_title')}</span>
                                <ArrowUpRight size={13} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </h4>
                            <p className="c-chat-window__feature-desc">{t('card_gemini_desc')}</p>
                        </div>

                        <div
                            className="c-chat-window__feature-card group"
                            onClick={() => setSelectedInfoProvider('openai')}
                            title={t('card_openai_tooltip')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="c-chat-window__feature-icon">
                                    <Code2 size={15} className="text-emerald-400" />
                                </div>
                                <span className="c-chat-window__feature-badge">{t('card_openai_badge')}</span>
                            </div>
                            <h4 className="c-chat-window__feature-title">
                                <span>{t('card_openai_title')}</span>
                                <ArrowUpRight size={13} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </h4>
                            <p className="c-chat-window__feature-desc">{t('card_openai_desc')}</p>
                        </div>
                    </div>
                )}
            </div>

            {selectedInfoProvider && (
                <div className="c-modal" onClick={() => setSelectedInfoProvider(null)}>
                    <div className="c-modal__dialog max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="c-modal__header">
                            <div className="flex items-center gap-2.5">
                                {selectedInfoProvider === 'ozlo' && (
                                    <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
                                        <Sparkles size={16} />
                                    </div>
                                )}
                                {selectedInfoProvider === 'gemini' && (
                                    <div className="w-8 h-8 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                                        <FileText size={16} />
                                    </div>
                                )}
                                {selectedInfoProvider === 'openai' && (
                                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Cpu size={16} />
                                    </div>
                                )}
                                <div>
                                    <h2 className="c-modal__title !text-sm">
                                        {selectedInfoProvider === 'ozlo'
                                            ? 'Ozlo Orgânico'
                                            : selectedInfoProvider === 'gemini'
                                            ? 'Google Gemini AI'
                                            : 'OpenAI & Groq Cloud'}
                                    </h2>
                                    <span className="text-[10px] text-zinc-500 font-medium">
                                        {selectedInfoProvider === 'ozlo'
                                            ? t('modal_ozlo_sub')
                                            : selectedInfoProvider === 'gemini'
                                            ? t('modal_gemini_sub')
                                            : t('modal_openai_sub')}
                                    </span>
                                </div>
                            </div>
                            <button className="c-modal__close-btn" onClick={() => setSelectedInfoProvider(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="c-modal__body gap-4 py-2">
                            <div className="flex flex-wrap gap-1.5">
                                {selectedInfoProvider === 'ozlo' && (
                                    <>
                                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-sky-300 text-[11px] font-semibold flex items-center gap-1">
                                            <ShieldCheck size={12} /> {t('badge_free')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                                            <Zap size={12} /> {t('badge_no_tokens')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-semibold">
                                            {t('badge_zero_keys')}
                                        </span>
                                    </>
                                )}
                                {selectedInfoProvider === 'gemini' && (
                                    <>
                                        <span className="px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-semibold flex items-center gap-1">
                                            <Zap size={12} /> {t('badge_1m_tokens')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold">
                                            {t('badge_multimodal')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                                            {t('badge_advanced_reasoning')}
                                        </span>
                                    </>
                                )}
                                {selectedInfoProvider === 'openai' && (
                                    <>
                                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                                            <Zap size={12} /> {t('badge_tokens_speed')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold">
                                            {t('badge_custom_endpoints')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-semibold">
                                            Llama 3 & GPT-4o
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="p-3.5 rounded-md bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed">
                                {selectedInfoProvider === 'ozlo' && (
                                    <p>{t('modal_ozlo_desc')}</p>
                                )}
                                {selectedInfoProvider === 'gemini' && (
                                    <p>{t('modal_gemini_desc')}</p>
                                )}
                                {selectedInfoProvider === 'openai' && (
                                    <p>{t('modal_openai_desc')}</p>
                                )}
                            </div>
                        </div>

                        <div className="c-modal__footer justify-between">
                            {onOpenIntegrations && selectedInfoProvider !== 'ozlo' ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setSelectedInfoProvider(null);
                                        onOpenIntegrations();
                                    }}
                                    className="!text-xs"
                                >
                                    <Settings size={12} className="mr-1 inline" />
                                    {t('configure_credentials')}
                                </Button>
                            ) : (
                                <div />
                            )}

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={async () => {
                                        const target = integrations.find((i) => i.provider === selectedInfoProvider);
                                        if (target && onSelectActiveModel) {
                                            await onSelectActiveModel(target.id);
                                        }
                                        setSelectedInfoProvider(null);
                                    }}
                                    className="!text-xs"
                                >
                                    <Check size={12} className="mr-1 inline" />
                                    {t('activate_this_model')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isClearModalOpen && (
                <div className="c-modal" onClick={() => setIsClearModalOpen(false)}>
                    <div className="c-modal__dialog border-amber-500/30" onClick={(e) => e.stopPropagation()}>
                        <div className="c-modal__header border-amber-500/20">
                            <div className="flex items-center gap-2 text-amber-400">
                                <RotateCcw size={16} />
                                <h2 className="c-modal__title text-amber-400">{t('clear_history_title')}</h2>
                            </div>
                            <button className="c-modal__close-btn" onClick={() => setIsClearModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="c-modal__body gap-3">
                            <p className="text-xs text-zinc-300">
                                {t('clear_history_question', { name: activeSession.name })}
                            </p>
                            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                                {t('clear_history_desc')}
                            </div>
                        </div>
                        <div className="c-modal__footer">
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

            {isDeleteModalOpen && onDeleteSession && (
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
                                {t('delete_question', { name: activeSession.name })}
                            </p>
                            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                                {t('delete_warning')}
                            </div>
                        </div>
                        <div className="c-modal__footer">
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
