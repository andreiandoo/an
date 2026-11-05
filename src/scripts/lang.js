// The page language, read once from <html lang>. Scripts pick their strings with pick({ ro, en }).
export const lang = document.documentElement.lang === 'en' ? 'en' : 'ro';
export const locale = lang === 'en' ? 'en-US' : 'ro-RO';
export const pick = o => o[lang];
