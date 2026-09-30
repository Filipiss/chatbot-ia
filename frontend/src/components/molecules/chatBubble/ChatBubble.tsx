import React, { useState } from 'react';
import type { ChatMessage } from '../../../api';
import { Cpu, Clock, Check, Copy } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import './ChatBubble.css';

interface ChatBubbleProps {
    message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const { t } = useI18n();
    const isUser = message.role === 'user';
    const [copiedBlockIdx, setCopiedBlockIdx] = useState<number | null>(null);

    const handleCopyCode = (code: string, idx: number) => {
        navigator.clipboard.writeText(code);
        setCopiedBlockIdx(idx);
        setTimeout(() => setCopiedBlockIdx(null), 2000);
    };

    const parseInlineFormatting = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-semibold text-zinc-100">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={idx} className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-violet-300">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    const renderMessageContent = (content: string) => {
        if (!content) return <p className="text-zinc-500">...</p>;

        const parts = content.split(/```/g);
        return parts.map((part, partIdx) => {
            const isCodeBlock = partIdx % 2 === 1;

            if (isCodeBlock) {
                const lines = part.split('\n');
                const language = lines[0].trim();
                const codeText = lines.slice(1).join('\n').trim();

                return (
                    <div key={partIdx} className="c-chat-bubble__code-card">
                        <div className="c-chat-bubble__code-header">
                            <span>{language || "code"}</span>
                            <button
                                onClick={() => handleCopyCode(codeText, partIdx)}
                                className="c-chat-bubble__code-copy"
                            >
                                {copiedBlockIdx === partIdx ? (
                                    <>
                                        <Check size={10} className="text-emerald-400" />
                                        <span className="text-emerald-400">{t('copied')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={10} />
                                        <span>{t('copy')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="c-chat-bubble__code-pre">
                            <code>{codeText}</code>
                        </pre>
                    </div>
                );
            } else {
                const lines = part.split('\n');
                return lines.map((line, lineIdx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={lineIdx} className="h-2" />;

                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return (
                            <ul key={lineIdx} className="list-disc pl-5 my-1.5 text-sm space-y-1">
                                <li className="text-zinc-300">
                                    {parseInlineFormatting(trimmed.substring(2))}
                                </li>
                            </ul>
                        );
                    }

                    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
                    if (numMatch) {
                        return (
                            <ol key={lineIdx} className="list-decimal pl-5 my-1.5 text-sm space-y-1">
                                <li className="text-zinc-300" value={parseInt(numMatch[1])}>
                                    {parseInlineFormatting(numMatch[2])}
                                </li>
                            </ol>
                        );
                    }

                    if (trimmed.startsWith('### ')) {
                        return (
                            <h4 key={lineIdx} className="text-sm font-bold text-zinc-200 mt-3 mb-1.5">
                                {parseInlineFormatting(trimmed.substring(4))}
                            </h4>
                        );
                    }
                    if (trimmed.startsWith('## ')) {
                        return (
                            <h3 key={lineIdx} className="text-base font-bold text-zinc-100 mt-4 mb-2">
                                {parseInlineFormatting(trimmed.substring(3))}
                            </h3>
                        );
                    }

                    return (
                        <p key={lineIdx} className="text-sm leading-relaxed my-1">
                            {parseInlineFormatting(line)}
                        </p>
                    );
                });
            }
        });
    };

    return (
        <div className={`c-chat-bubble ${isUser ? 'c-chat-bubble--user' : 'c-chat-bubble--assistant'}`}>
            <div className="c-chat-bubble__body">
                <div className={`c-chat-bubble__message ${isUser ? 'c-chat-bubble__message--user' : 'c-chat-bubble__message--assistant'}`}>
                    {renderMessageContent(message.content)}
                </div>

                {!isUser && (message.provider || message.latency) && (
                    <div className="c-chat-bubble__meta">
                        {message.provider && (
                            <span className="c-chat-bubble__meta-item">
                                <Cpu size={9} className="text-violet-400" />
                                {message.provider} {message.model_used ? `(${message.model_used})` : ''}
                            </span>
                        )}
                        {message.latency !== undefined && (
                            <span className="c-chat-bubble__meta-item">
                                <Clock size={9} className="text-purple-400" />
                                {message.latency}s
                            </span>
                        )}
                        {message.tokens_used !== undefined && (
                            <span className="c-chat-bubble__meta-tokens">{message.tokens_used} tks</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
