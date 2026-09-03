import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { AccessibilityMenu } from '../accessibilityMenu/AccessibilityMenu';
import { Sun, Moon, Accessibility } from 'lucide-react';
import './FloatingControls.css';

export const FloatingControls: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useI18n();
    const [isA11yOpen, setIsA11yOpen] = useState(false);

    const isDark = theme === 'dark';
    const langFlag = language === 'en' ? '🇺🇸' : language === 'es' ? '🇪🇸' : '🇧🇷';
    const langCode = language === 'en' ? 'EN' : language === 'es' ? 'ES' : 'PT';

    const handleCycleLanguage = () => {
        const nextLang = language === 'pt' ? 'en' : language === 'en' ? 'es' : 'pt';
        setLanguage(nextLang);
    };

    return (
        <>
            <div className="floatingDock" role="region" aria-label="Controles de Acessibilidade e Tema">
                {/* Theme Toggle Button */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="floatingBtn themeBtn"
                    title={isDark ? t('theme_light') : t('theme_dark')}
                    aria-label={isDark ? t('theme_light') : t('theme_dark')}
                >
                    {isDark ? (
                        <Sun size={17} className="text-amber-400 animate-spin-slow" />
                    ) : (
                        <Moon size={17} className="text-indigo-600" />
                    )}
                </button>

                <div className="floatingDivider" />

                {/* Direct Language Switcher Button (1 Clique) */}
                <button
                    type="button"
                    onClick={handleCycleLanguage}
                    className="floatingBtn langBtn"
                    title={`${t('language_select')} (${langCode})`}
                    aria-label={`${t('language_select')} (${langCode})`}
                >
                    <span className="text-sm leading-none">{langFlag}</span>
                    <span className="font-mono text-[10px] font-bold text-sky-400 tracking-wider">{langCode}</span>
                </button>

                <div className="floatingDivider" />

                {/* Accessibility Button (Ícone Clássico de Acessibilidade) */}
                <button
                    type="button"
                    onClick={() => setIsA11yOpen(true)}
                    className="floatingBtn a11yBtn"
                    title={t('accessibility')}
                    aria-label={t('accessibility')}
                >
                    <Accessibility size={17} className="text-sky-400 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Accessibility & Language Modal */}
            <AccessibilityMenu isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} />
        </>
    );
};
