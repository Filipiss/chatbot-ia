import React from 'react';
import { useAccessibility, type FontSize } from '../../../context/AccessibilityContext';
import { useI18n } from '../../../context/I18nContext';
import type { Language } from '../../../i18n/translations';
import { X, RotateCcw, Type, Contrast, ZapOff, BookOpen, Check, Globe, Accessibility } from 'lucide-react';
import { Button } from '../../atoms/button/Button';
import './AccessibilityMenu.css';

const LANGUAGES: { id: Language; label: string; flag: string; code: string }[] = [
    { id: 'pt', label: 'Português', flag: '🇧🇷', code: 'PT' },
    { id: 'en', label: 'English', flag: '🇺🇸', code: 'EN' },
    { id: 'es', label: 'Español', flag: '🇪🇸', code: 'ES' },
];

interface AccessibilityMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ isOpen, onClose }) => {
    const {
        fontSize, setFontSize,
        highContrast, toggleHighContrast,
        reducedMotion, toggleReducedMotion,
        dyslexicFont, toggleDyslexicFont,
        resetAccessibility,
    } = useAccessibility();

    const { language, setLanguage, t } = useI18n();

    const fontOptions: { id: FontSize; label: string }[] = [
        { id: 'normal', label: t('font_normal') },
        { id: 'large', label: t('font_large') },
        { id: 'xlarge', label: t('font_xlarge') },
    ];

    if (!isOpen) return null;

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalContent a11yModalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <div className="flex items-center gap-2.5 text-violet-400">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                            <Accessibility size={15} className="text-sky-400" />
                        </div>
                        <h2 className="modalTitle">{t('accessibility_panel_title')}</h2>
                    </div>
                    <button
                        type="button"
                        className="modalCloseBtn"
                        onClick={onClose}
                        aria-label={t('close')}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="a11yBody">
                    {/* Language Selector Section */}
                    <div className="a11ySection">
                        <div className="a11ySectionHeader">
                            <Globe size={14} className="text-sky-400" />
                            <span className="a11ySectionTitle">{t('language')}</span>
                        </div>
                        <div className="a11yGrid3">
                            {LANGUAGES.map((l) => (
                                <button
                                    key={l.id}
                                    type="button"
                                    onClick={() => setLanguage(l.id)}
                                    className={`a11yPillBtn ${language === l.id ? 'a11yPillBtnActive' : ''}`}
                                >
                                    <span className="flex items-center gap-1.5 truncate">
                                        <span className="text-sm">{l.flag}</span>
                                        <span>{l.label}</span>
                                    </span>
                                    {language === l.id && <Check size={12} className="shrink-0 text-violet-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Size Section */}
                    <div className="a11ySection">
                        <div className="a11ySectionHeader">
                            <Type size={14} className="text-violet-400" />
                            <span className="a11ySectionTitle">{t('font_size')}</span>
                        </div>
                        <div className="a11yGrid3">
                            {fontOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setFontSize(opt.id)}
                                    className={`a11yPillBtn ${fontSize === opt.id ? 'a11yPillBtnActive' : ''}`}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {fontSize === opt.id && <Check size={12} className="shrink-0 text-violet-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* High Contrast */}
                    <div className="a11yRow">
                        <div className="a11yRowInfo">
                            <div className="flex items-center gap-2">
                                <Contrast size={14} className="text-amber-400" />
                                <span className="a11yRowTitle">{t('high_contrast')}</span>
                            </div>
                            <p className="a11yRowDesc">{t('high_contrast_desc')}</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleHighContrast}
                            className={`a11ySwitch ${highContrast ? 'a11ySwitchActive' : ''}`}
                            aria-checked={highContrast}
                            role="switch"
                        >
                            <span className="a11ySwitchHandle" />
                        </button>
                    </div>

                    {/* Reduced Motion */}
                    <div className="a11yRow">
                        <div className="a11yRowInfo">
                            <div className="flex items-center gap-2">
                                <ZapOff size={14} className="text-sky-400" />
                                <span className="a11yRowTitle">{t('reduced_motion')}</span>
                            </div>
                            <p className="a11yRowDesc">{t('reduced_motion_desc')}</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleReducedMotion}
                            className={`a11ySwitch ${reducedMotion ? 'a11ySwitchActive' : ''}`}
                            aria-checked={reducedMotion}
                            role="switch"
                        >
                            <span className="a11ySwitchHandle" />
                        </button>
                    </div>

                    {/* Dyslexic / Easy Reading */}
                    <div className="a11yRow">
                        <div className="a11yRowInfo">
                            <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-emerald-400" />
                                <span className="a11yRowTitle">{t('dyslexic_font')}</span>
                            </div>
                            <p className="a11yRowDesc">{t('dyslexic_font_desc')}</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleDyslexicFont}
                            className={`a11ySwitch ${dyslexicFont ? 'a11ySwitchActive' : ''}`}
                            aria-checked={dyslexicFont}
                            role="switch"
                        >
                            <span className="a11ySwitchHandle" />
                        </button>
                    </div>
                </div>

                <div className="modalFooter justify-between">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={resetAccessibility}
                        className="!text-[10px] !py-1.5 !px-3"
                    >
                        <RotateCcw size={11} className="mr-1 inline" />
                        {t('reset_accessibility')}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onClose}
                        className="!py-1.5 !px-4"
                    >
                        {t('close')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
