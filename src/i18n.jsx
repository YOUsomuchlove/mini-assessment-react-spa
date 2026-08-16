import { useMemo, useState } from 'react';
import { I18nContext } from './i18n-context';
import { translate } from './i18n-utils';

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => sessionStorage.getItem('assessment_language') || 'vi');
  const setLanguage = (next) => {
    sessionStorage.setItem('assessment_language', next);
    setLanguageState(next);
    document.documentElement.lang = next;
  };
  const value = useMemo(() => ({ language, setLanguage, t: (key, values) => translate(language, key, values) }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
