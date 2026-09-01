import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { AccessibilityMenu } from '../accessibilityMenu/AccessibilityMenu';
import { Sun, Moon, SlidersHorizontal } from 'lucide-react';
import './FloatingControls.css';

export const FloatingControls: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, t } = useI18n();
    const [isA11yOpen, setIsA11yOpen] = useState(false);

    const isDark = theme === 'dark';
    const langFlag = language === 'en' ? '🇺🇸' : language === 'es' ? '🇪🇸' : '🇧🇷';

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

                {/* Accessibility & Language Button */}
                <button
                    type="button"
                    onClick={() => setIsA11yOpen(true)}
                    className="floatingBtn a11yBtn"
                    title={`${t('accessibility')} & ${t('language')}`}
                    aria-label={`${t('accessibility')} & ${t('language')}`}
                >
                    <SlidersHorizontal size={16} className="text-violet-400 group-hover:scale-110 transition-transform" />
                    <span className="floatingLangBadge">{langFlag}</span>
                </button>
            </div>

            {/* Accessibility & Language Modal */}
            <AccessibilityMenu isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} />
        </>
    );
};
