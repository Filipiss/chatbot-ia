import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('app_lang') as Language;
        if (saved && (saved === 'pt' || saved === 'en' || saved === 'es')) return saved;
        return 'pt';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_lang', lang);
        document.documentElement.lang = lang;
    };

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
        const langDict = translations[language] || translations['pt'];
        let str: string = (langDict as any)[key] || (translations['pt'] as any)[key] || key;
        if (params) {
            Object.entries(params).forEach(([paramKey, paramVal]) => {
                str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
            });
        }
        return str;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
