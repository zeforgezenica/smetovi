import { ui, defaultLang } from './ui';

export type UiType = typeof ui;
export type Language = keyof UiType;

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Language;
  return defaultLang;
}

export function useTranslations(lang: Language) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function useTranslatedPath(lang: Language) {
  return function translatePath(path: string, targetLang: string = lang) {
    // Handle root path
    if (path === '/') {
      return targetLang === defaultLang ? '/' : `/${targetLang}/`;
    }
    
    // Remove existing language prefix if present
    const pathWithoutLang = path.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    
    // Add new language prefix if not default
    return targetLang === defaultLang ? pathWithoutLang : `/${targetLang}${pathWithoutLang}`;
  }
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname;
  const [, lang] = pathname.split('/');
  
  if (lang in ui) {
    // Remove language prefix
    return pathname.replace(`/${lang}`, '') || '/';
  }
  
  return pathname;
}

// Helper for getting alternate language URLs
export function getAlternateLinks(currentUrl: URL): Array<{lang: string, url: string}> {
  const currentLang = getLangFromUrl(currentUrl);
  const translatePath = useTranslatedPath(currentLang);
  const currentRoute = getRouteFromUrl(currentUrl);
  
  return Object.keys(ui).map(lang => ({
    lang,
    url: translatePath(currentRoute, lang)
  }));
}
