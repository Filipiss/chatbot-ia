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
        { key: 'convs', icon: <MessageSquare size={17} />, label: t('stat_conversations'), value: totalConvs },
        { key: 'msgs', icon: <Database size={17} />, label: t('stat_messages'), value: totalMsgs },
        { key: 'latency', icon: <Timer size={17} />, label: t('stat_latency'), value: `${avgLatency}s` },
        { key: 'tokens', icon: <Zap size={17} />, label: t('stat_tokens'), value: totalTokens },
    ] as const;

    return (
        <div className="c-analytics">
            <div className="c-analytics__header">
                <div className="c-analytics__icon"><BarChart3 size={18} /></div>
                <div>
                    <h2 className="c-analytics__title">{t('analytics_title')}</h2>
                    <p className="c-analytics__desc">{t('analytics_desc')}</p>
                </div>
            </div>

            <div className="c-analytics__stats-grid">
                {stats.map(({ key, icon, label, value }) => (
                    <div key={key} className="c-analytics__stat-card">
                        <div className={`c-analytics__stat-icon c-analytics__stat-icon--${key}`}>{icon}</div>
                        <div>
                            <p className="c-analytics__stat-label">{label}</p>
                            <p className="c-analytics__stat-val">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="c-analytics__chart-card">
                <h3 className="c-analytics__chart-title">{t('usage_by_provider')}</h3>
                {Object.keys(providerCounts).length === 0 ? (
                    <p className="c-analytics__chart-empty">{t('no_analytics_data')}</p>
                ) : (
                    <div className="c-analytics__chart-list">
                        {Object.entries(providerCounts).map(([provider, count]) => {
                            const percentage = ((count / (latencyCount || 1)) * 100).toFixed(0);
                            const barColor =
                                provider === 'gemini' ? 'bg-gradient-to-r from-blue-500 via-sky-400 to-sky-400'
                                    : provider === 'openai' ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                                        : 'bg-gradient-to-r from-violet-500 to-purple-400';

                            return (
                                <div key={provider} className="c-analytics__chart-item animate-slide-in">
                                    <div className="c-analytics__chart-item-meta">
                                        <span className="c-analytics__chart-item-label">{provider}</span>
                                        <span className="c-analytics__chart-item-val">{count} {t('requests_suffix')} ({percentage}%)</span>
                                    </div>
                                    <div className="c-analytics__chart-bar-track">
                                        <div className={`c-analytics__chart-bar-fill ${barColor}`} style={{ width: `${percentage}%` }} />
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
