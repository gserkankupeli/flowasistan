import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'tr' | 'en';

const STORAGE_KEY = 'flowasistan_lang';

function detectLang(): Lang {
    try {
        const fromUrl = new URLSearchParams(window.location.search).get('lang');
        if (fromUrl === 'tr' || fromUrl === 'en') return fromUrl;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'tr' || stored === 'en') return stored;
    } catch {
        // storage can be blocked; fall through to the browser language
    }
    return navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

// Kept outside React so non-component code (demo data layer) can read the active language.
let currentLang: Lang = detectLang();
export const getLang = () => currentLang;

interface LangContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    /** Inline translation: t('Türkçe metin', 'English text') */
    t: (tr: string, en: string) => string;
    /** BCP 47 locale for date/number formatting */
    locale: string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>(currentLang);

    const setLang = useCallback((next: Lang) => {
        currentLang = next;
        setLangState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const value = useMemo<LangContextType>(() => ({
        lang,
        setLang,
        t: (tr, en) => (lang === 'tr' ? tr : en),
        locale: lang === 'tr' ? 'tr-TR' : 'en-US',
    }), [lang, setLang]);

    return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => {
    const context = useContext(LangContext);
    if (context === undefined) {
        throw new Error('useLang must be used within a LanguageProvider');
    }
    return context;
};

export function LanguageToggle({ className = '' }: { className?: string }) {
    const { lang, setLang } = useLang();
    return (
        <div className={`inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5 text-xs font-bold ${className}`}>
            {(['tr', 'en'] as const).map(code => (
                <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`rounded-full px-2.5 py-1 uppercase transition-colors ${lang === code ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    {code}
                </button>
            ))}
        </div>
    );
}
