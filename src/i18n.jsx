import { createContext, useContext, useMemo, useState } from 'react';
import en from './locales/en';
import vi from './locales/vi';
const locales = { en, vi };
const I18nContext = createContext(null);
export function translate(language, key, values = {}) { return (locales[language]?.[key] || vi[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? ''); }
export function I18nProvider({ children }) { const [language, setLanguageState] = useState(() => sessionStorage.getItem('assessment_language') || 'vi'); const setLanguage = (next) => { sessionStorage.setItem('assessment_language', next); setLanguageState(next); document.documentElement.lang = next; }; const value = useMemo(() => ({ language, setLanguage, t: (key, values) => translate(language, key, values) }), [language]); return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>; }
export const useI18n = () => useContext(I18nContext);
