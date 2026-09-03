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
import { StudioClock } from '../../atoms/studioClock/StudioClock';
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

    // Auto-adjust textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [inputText]);

    // Close dropdown on click outside
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
            <div className="emptyState">
                <div className="zyriconOrbSmall" />
                <h3 className="emptyTitle">{t('no_chat_selected')}</h3>
                <p className="emptyDesc">{t('select_or_create_chat')}</p>
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

    // Real working file attachment upload
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
        <div className="zyriconWindow">
            {/* Hidden File Input for Real Attachments */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.md,.json,.js,.ts,.tsx,.py,.csv,.html,.css,.sql,.yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Top Bar Header */}
            <div className="zyriconTopBar">
                {/* Active Model Selector Dropdown Pill */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        className="zyriconModelPill"
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        title={t('select_model_tooltip')}
                    >
                        <span className={`zyriconModelDot ${getProviderDotColor(activeIntegration.provider)}`} />
                        <span className="zyriconModelName">
                            {activeIntegration.name || activeIntegration.model_name}
                        </span>
                        <ChevronDown size={13} className={`text-zinc-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Model Dropdown Menu */}
                    {isModelDropdownOpen && (
                        <div className="zyriconDropdownMenu animate-fade-in">
                            <div className="zyriconDropdownHeader">
                                <span>{t('available_models')}</span>
                                <span className="text-[9px] text-sky-400">{t('click_to_activate')}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-1">
                                {integrations.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`zyriconDropdownItem ${item.is_active ? 'zyriconDropdownItemActive' : ''}`}
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

                {/* Live Studio Clock Oficial (AGENTS.md) */}
                <StudioClock />

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
                        {/* Architectural Multi-Model AI Orchestrator Emblem */}
                        <AiOrchestratorHero />

                        {/* Hero Headline & Subtitle */}
                        <div className="zyriconHeroTextWrapper">
                            <h2 className="zyriconHeroHeadline">{t('hero_headline')}</h2>
                            <p className="zyriconHeroSubheadline">{t('hero_subheadline')}</p>
                        </div>

                        {/* Suggestion Action Chips */}
                        <div className="zyriconChipsWrapper">
                            <button
                                type="button"
                                className="zyriconChip group"
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
                                className="zyriconChip group"
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
                                className="zyriconChip group"
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
                    <div className="zyriconMessagesList">
                        {activeSession.messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}
                        {streamingMessage && <ChatBubble message={streamingMessage} />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Bottom Interactive Area: Clean Zyricon Input Card & 3 Bottom Feature Cards */}
            <div className="zyriconBottomArea">
                {/* Zyricon Input Card */}
                <div className="zyriconInputCard">
                    {/* Top Row: Sparkle Icon + Expandable Textarea */}
                    <div className="zyriconInputTopRow">
                        <Sparkles size={16} className="text-sky-400 shrink-0 mt-1" />
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

                    {/* Bottom Toolbar: Attach Button (Left) & Circular Send Button (Right) */}
                    <div className="zyriconInputBottomRow">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="zyriconToolBtn"
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
                                className="zyriconSendBtn"
                                title={t('send_tooltip')}
                            >
                                <ArrowUp size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom 3 Feature Cards (Open Explanatory Modal on Click) */}
                {!hasMessages && (
                    <div className="zyriconFeatureGrid">
                        {/* Card 1: Ozlo Orgânico */}
                        <div
                            className="zyriconFeatureCard group"
                            onClick={() => setSelectedInfoProvider('ozlo')}
                            title={t('card_ozlo_tooltip')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="zyriconFeatureIconBox">
                                    <Sparkles size={15} className="text-sky-400" />
                                </div>
                                <span className="zyriconFeatureBadge">{t('card_ozlo_badge')}</span>
                            </div>
                            <h4 className="zyriconFeatureTitle">
                                <span>{t('card_ozlo_title')}</span>
                                <ArrowUpRight size={13} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </h4>
                            <p className="zyriconFeatureDesc">{t('card_ozlo_desc')}</p>
                        </div>

                        {/* Card 2: Google Gemini */}
                        <div
                            className="zyriconFeatureCard group"
                            onClick={() => setSelectedInfoProvider('gemini')}
                            title={t('card_gemini_tooltip')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="zyriconFeatureIconBox">
                                    <FileText size={15} className="text-sky-400" />
                                </div>
                                <span className="zyriconFeatureBadge">{t('card_gemini_badge')}</span>
                            </div>
                            <h4 className="zyriconFeatureTitle">
                                <span>{t('card_gemini_title')}</span>
                                <ArrowUpRight size={13} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </h4>
                            <p className="zyriconFeatureDesc">{t('card_gemini_desc')}</p>
                        </div>

                        {/* Card 3: OpenAI & Groq */}
                        <div
                            className="zyriconFeatureCard group"
                            onClick={() => setSelectedInfoProvider('openai')}
                            title={t('card_openai_tooltip')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="zyriconFeatureIconBox">
                                    <Code2 size={15} className="text-emerald-400" />
                                </div>
                                <span className="zyriconFeatureBadge">{t('card_openai_badge')}</span>
                            </div>
                            <h4 className="zyriconFeatureTitle">
                                <span>{t('card_openai_title')}</span>
                                <ArrowUpRight size={13} className="kinetic-arrow text-zinc-500 group-hover:text-blue-400" />
                            </h4>
                            <p className="zyriconFeatureDesc">{t('card_openai_desc')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Explicativo dos Provedores / Modelos */}
            {selectedInfoProvider && (
                <div className="modalOverlay" onClick={() => setSelectedInfoProvider(null)}>
                    <div className="modalContent max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <div className="flex items-center gap-2.5">
                                {selectedInfoProvider === 'ozlo' && (
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
                                        <Sparkles size={16} />
                                    </div>
                                )}
                                {selectedInfoProvider === 'gemini' && (
                                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                                        <FileText size={16} />
                                    </div>
                                )}
                                {selectedInfoProvider === 'openai' && (
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Cpu size={16} />
                                    </div>
                                )}
                                <div>
                                    <h2 className="modalTitle !text-sm">
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
                            <button className="modalCloseBtn" onClick={() => setSelectedInfoProvider(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="modalBody gap-4 py-2">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5">
                                {selectedInfoProvider === 'ozlo' && (
                                    <>
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sky-300 text-[11px] font-semibold flex items-center gap-1">
                                            <ShieldCheck size={12} /> {t('badge_free')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                                            <Zap size={12} /> {t('badge_no_tokens')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-semibold">
                                            {t('badge_zero_keys')}
                                        </span>
                                    </>
                                )}
                                {selectedInfoProvider === 'gemini' && (
                                    <>
                                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-semibold flex items-center gap-1">
                                            <Zap size={12} /> {t('badge_1m_tokens')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold">
                                            {t('badge_multimodal')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                                            {t('badge_advanced_reasoning')}
                                        </span>
                                    </>
                                )}
                                {selectedInfoProvider === 'openai' && (
                                    <>
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                                            <Zap size={12} /> {t('badge_tokens_speed')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold">
                                            {t('badge_custom_endpoints')}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-semibold">
                                            Llama 3 & GPT-4o
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed">
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

                        <div className="modalFooter justify-between">
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
