import en from './locales/en';
import vi from './locales/vi';

const locales = { en, vi };

export function translate(language, key, values = {}) {
  return (locales[language]?.[key] || vi[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}
