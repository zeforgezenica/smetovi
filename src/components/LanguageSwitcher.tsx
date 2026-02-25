import React, { useState, useEffect } from "react";
import { getLang, setLang, type Lang } from "../i18n";

const LanguageSwitcher: React.FC = () => {
    const [lang, setLangState] = useState<Lang>("bs");

    useEffect(() => {
        setLangState(getLang());
    }, []);

    const toggle = () => {
        const next: Lang = lang === "bs" ? "en" : "bs";
        setLang(next);
        setLangState(next);
        document.cookie = `lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
        window.location.reload();
    };

    return (
        <button
            onClick={toggle}
            title="Switch language"
            style={{
                background: "none",
                border: "2px solid var(--pumpkin-orange)",
                borderRadius: "6px",
                cursor: "pointer",
                padding: "2px 8px",
                fontWeight: "bold",
                fontSize: "14px",
                color: "var(--pumpkin-orange)",
                lineHeight: "1.4",
                transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--pumpkin-orange)";
                (e.currentTarget as HTMLButtonElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--pumpkin-orange)";
            }}
        >
            {lang === "bs" ? "EN" : "BS"}
        </button>
    );
};

export default LanguageSwitcher;