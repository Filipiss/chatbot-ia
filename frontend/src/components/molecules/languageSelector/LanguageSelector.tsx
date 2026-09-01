import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../../context/I18nContext';
import type { Language } from '../../../i18n/translations';
import { Globe, Check } from 'lucide-react';
import './LanguageSelector.css';

const LANGUAGES: { id: Language; label: string; flag: string; code: string }[] = [
    { id: 'pt', label: 'Português', flag: '🇧🇷', code: 'PT' },
    { id: 'en', label: 'English', flag: '🇺🇸', code: 'EN' },
    { id: 'es', label: 'Español', flag: '🇪🇸', code: 'ES' },
];

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage, t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="langContainer" ref={dropdownRef}>
            <button
                type="button"
                className="langTriggerBtn"
                onClick={() => setIsOpen(!isOpen)}
                title={t('language_select')}
                aria-label={t('language_select')}
            >
                <Globe size={13} className="text-zinc-400" />
                <span className="langBadge">{currentLang.flag} {currentLang.code}</span>
            </button>

            {isOpen && (
                <div className="langDropdownMenu animate-fade-in" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="langDropdownHeader">{t('language')}</div>
                    {LANGUAGES.map((l) => (
                        <button
                            key={l.id}
                            type="button"
                            className={`langOptionBtn ${language === l.id ? 'langOptionActive' : ''}`}
                            onClick={() => {
                                setLanguage(l.id);
                                setIsOpen(false);
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base">{l.flag}</span>
                                <span className="font-semibold">{l.label}</span>
                            </span>
                            {language === l.id && <Check size={13} className="text-violet-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
