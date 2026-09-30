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
            <div className="c-floating-dock" role="region" aria-label="Controles de Acessibilidade e Tema">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="c-floating-dock__btn c-floating-dock__btn--theme"
                    title={isDark ? t('theme_light') : t('theme_dark')}
                    aria-label={isDark ? t('theme_light') : t('theme_dark')}
                >
                    {isDark ? (
                        <Sun size={17} className="text-amber-400 animate-spin-slow" />
                    ) : (
                        <Moon size={17} className="text-indigo-600" />
                    )}
                </button>

                <div className="c-floating-dock__divider" />

                <button
                    type="button"
                    onClick={handleCycleLanguage}
                    className="c-floating-dock__btn"
                    title={`${t('language_select')} (${langCode})`}
                    aria-label={`${t('language_select')} (${langCode})`}
                >
                    <span className="text-sm leading-none">{langFlag}</span>
                    <span className="font-mono text-[10px] font-bold text-sky-400 tracking-wider">{langCode}</span>
                </button>

                <div className="c-floating-dock__divider" />

                <button
                    type="button"
                    onClick={() => setIsA11yOpen(true)}
                    className="c-floating-dock__btn c-floating-dock__btn--a11y"
                    title={t('accessibility_panel_title')}
                    aria-label={t('accessibility_panel_title')}
                >
                    <Accessibility size={17} />
                </button>
            </div>

            <AccessibilityMenu
                isOpen={isA11yOpen}
                onClose={() => setIsA11yOpen(false)}
            />
        </>
    );
};
