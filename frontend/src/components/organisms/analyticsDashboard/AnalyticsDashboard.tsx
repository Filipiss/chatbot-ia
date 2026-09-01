import React from 'react';
import type { ChatSession } from '../../../api';
import { BarChart3, Database, MessageSquare, Timer, Zap } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import './AnalyticsDashboard.css';

interface AnalyticsDashboardProps {
    sessions: ChatSession[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sessions }) => {
    const { t } = useI18n();
    const totalConvs = sessions.length;
    let totalMsgs = 0, totalLatency = 0, latencyCount = 0, totalTokens = 0;
    const providerCounts: Record<string, number> = {};

    sessions.forEach((s) => {
        if (s.messages) {
            s.messages.forEach((m) => {
                if (m.role === 'assistant') {
                    totalMsgs += 1;
                    if (m.latency) { totalLatency += m.latency; latencyCount += 1; }
                    if (m.tokens_used) totalTokens += m.tokens_used;
                    if (m.provider) providerCounts[m.provider] = (providerCounts[m.provider] || 0) + 1;
                } else if (m.role === 'user') totalMsgs += 1;
            });
        }
    });

    const avgLatency = latencyCount > 0 ? (totalLatency / latencyCount).toFixed(2) : '0';

    const stats = [
        { key: 'Convs', icon: <MessageSquare size={17} />, label: t('stat_conversations'), value: totalConvs },
        { key: 'Msgs', icon: <Database size={17} />, label: t('stat_messages'), value: totalMsgs },
        { key: 'Latency', icon: <Timer size={17} />, label: t('stat_latency'), value: `${avgLatency}s` },
        { key: 'Tokens', icon: <Zap size={17} />, label: t('stat_tokens'), value: totalTokens },
    ] as const;

    return (
        <div className="dashWrapper">
            <div className="dashHeader">
                <div className="dashIcon"><BarChart3 size={18} /></div>
                <div>
                    <h2 className="dashTitle">{t('analytics_title')}</h2>
                    <p className="dashDesc">{t('analytics_desc')}</p>
                </div>
            </div>

            <div className="statsGrid">
                {stats.map(({ key, icon, label, value }) => (
                    <div key={key} className="statCard">
                        <div className={`statIconBase statIconBase${key}`}>{icon}</div>
                        <div>
                            <p className="statLabel">{label}</p>
                            <p className="statVal">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chartCard">
                <h3 className="chartTitle">{t('usage_by_provider')}</h3>
                {Object.keys(providerCounts).length === 0 ? (
                    <p className="chartEmpty">{t('no_analytics_data')}</p>
                ) : (
                    <div className="chartList">
                        {Object.entries(providerCounts).map(([provider, count]) => {
                            const percentage = ((count / (latencyCount || 1)) * 100).toFixed(0);
                            const barColor =
                                provider === 'gemini' ? 'bg-gradient-to-r from-blue-500 via-sky-400 to-sky-400'
                                    : provider === 'openai' ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                                        : 'bg-gradient-to-r from-violet-500 to-purple-400';

                            return (
                                <div key={provider} className="chartItem animate-slide-in">
                                    <div className="chartItemMeta">
                                        <span className="chartItemLabel">{provider}</span>
                                        <span className="chartItemVal">{count} {t('requests_suffix')} ({percentage}%)</span>
                                    </div>
                                    <div className="chartBarTrack">
                                        <div className={`chartBarFill ${barColor}`} style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
