import type { Lang } from "./index";

export function getLangFromCookie(lang: string | undefined): Lang {
    if (lang === "en" || lang === "bs") return lang;
    return "bs";
}