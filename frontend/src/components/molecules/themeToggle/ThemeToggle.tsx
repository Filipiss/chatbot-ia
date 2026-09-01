import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useI18n();

    const isDark = theme === 'dark';
    const label = isDark ? t('theme_light') : t('theme_dark');

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`themeToggleBtn ${className}`}
            title={`${label} (${t('theme_toggle_desc')})`}
            aria-label={label}
        >
            <div className="themeToggleIconWrapper">
                {isDark ? (
                    <Sun size={14} className="themeIconSun animate-spin-slow" />
                ) : (
                    <Moon size={14} className="themeIconMoon" />
                )}
            </div>
            <span className="themeToggleText">{isDark ? t('theme_light') : t('theme_dark')}</span>
        </button>
    );
};
