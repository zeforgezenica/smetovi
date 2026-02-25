import { atom } from "nanostores";
import { bs } from "./bs";
import { en } from "./en";

export type Lang = "bs" | "en";

export const translations = { bs, en };

export const langStore = atom<Lang>("bs");

export function getLang(): Lang {
    if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("lang") as Lang;
        if (saved === "bs" || saved === "en") return saved;
    }
    return "bs";
}

export function setLang(lang: Lang) {
    langStore.set(lang);
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("lang", lang);
    }
}

export function t(lang: Lang) {
    return translations[lang];
}