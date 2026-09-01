import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    highContrast: boolean;
    toggleHighContrast: () => void;
    reducedMotion: boolean;
    toggleReducedMotion: () => void;
    dyslexicFont: boolean;
    toggleDyslexicFont: () => void;
    resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize, setFontSizeState] = useState<FontSize>(() => {
        const saved = localStorage.getItem('app_font_size') as FontSize;
        return saved === 'large' || saved === 'xlarge' ? saved : 'normal';
    });

    const [highContrast, setHighContrastState] = useState<boolean>(() => {
        return localStorage.getItem('app_high_contrast') === 'true';
    });

    const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
        return localStorage.getItem('app_reduced_motion') === 'true';
    });

    const [dyslexicFont, setDyslexicFontState] = useState<boolean>(() => {
        return localStorage.getItem('app_dyslexic_font') === 'true';
    });

    const setFontSize = (size: FontSize) => {
        setFontSizeState(size);
        localStorage.setItem('app_font_size', size);
    };

    const toggleHighContrast = () => {
        const next = !highContrast;
        setHighContrastState(next);
        localStorage.setItem('app_high_contrast', String(next));
    };

    const toggleReducedMotion = () => {
        const next = !reducedMotion;
        setReducedMotionState(next);
        localStorage.setItem('app_reduced_motion', String(next));
    };

    const toggleDyslexicFont = () => {
        const next = !dyslexicFont;
        setDyslexicFontState(next);
        localStorage.setItem('app_dyslexic_font', String(next));
    };

    const resetAccessibility = () => {
        setFontSizeState('normal');
        setHighContrastState(false);
        setReducedMotionState(false);
        setDyslexicFontState(false);
        localStorage.removeItem('app_font_size');
        localStorage.removeItem('app_high_contrast');
        localStorage.removeItem('app_reduced_motion');
        localStorage.removeItem('app_dyslexic_font');
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-font-size', fontSize);
        document.documentElement.setAttribute('data-high-contrast', String(highContrast));
        document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion));
        document.documentElement.setAttribute('data-dyslexic-font', String(dyslexicFont));
    }, [fontSize, highContrast, reducedMotion, dyslexicFont]);

    return (
        <AccessibilityContext.Provider
            value={{
                fontSize,
                setFontSize,
                highContrast,
                toggleHighContrast,
                reducedMotion,
                toggleReducedMotion,
                dyslexicFont,
                toggleDyslexicFont,
                resetAccessibility,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
