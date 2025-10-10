import React, { useState, useEffect } from "react";
import "./BurgerMenu.css";

// Import the translation dictionaries
const ui = {
  sr: {
    'nav.map': 'Mapa',
    'nav.home': 'Home',
    'nav.blog': 'Blog', 
    'nav.organizations': 'Aktivnosti',
    'nav.events': 'Događaji',
    'nav.contact': 'Kontakt',
    'nav.pictures': 'Slike',
    'nav.about': 'O Nama',
    'nav.reviews': 'Recenzije',
  },
  en: {
    'nav.map': 'Map',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.organizations': 'Activities', 
    'nav.events': 'Events',
    'nav.contact': 'Contact',
    'nav.pictures': 'Pictures',
    'nav.about': 'About',
    'nav.reviews': 'Reviews',
  },
} as const;

interface Props {
  lang?: 'sr' | 'en';
}

const BurgerMenu: React.FC<Props> = ({ lang = 'sr' }) => {
  const [currentPath, setCurrentPath] = useState("");

  // Translation function
  const t = (key: keyof typeof ui['sr']) => {
    return ui[lang][key] || ui['sr'][key];
  };

  // Helper function to create language-aware URLs
  const createUrl = (path: string) => {
    if (lang === 'sr') {
      return path;
    }
    return `/en${path}`;
  };

  // Helper function to check if path is active (considering language prefix)
  const isActivePath = (path: string) => {
    const expectedPath = createUrl(path);
    return currentPath === expectedPath || 
           (path === '/' && (currentPath === '/' || currentPath === '/en/'));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
      
      const handleLocationChange = () => {
        setCurrentPath(window.location.pathname);
      };
      
      // Listen for navigation changes (including client-side routing)
      window.addEventListener("popstate", handleLocationChange);
      
      // Also listen for pushstate/replacestate (for SPAs)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        handleLocationChange();
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        handleLocationChange();
      };
      
      return () => {
        window.removeEventListener("popstate", handleLocationChange);
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
      };
    }
  }, []);

  return (
    <>
      <div className="burger-menu open blur-background">
        <div className="menu-content">
          <div className="links">
            <a 
              href={createUrl("/map")} 
              className={isActivePath("/map") ? "active" : ""}
            >
              {t('nav.map')}
            </a>
            <a 
              href={createUrl("/")} 
              className={isActivePath("/") ? "active" : ""}
            >
              {t('nav.home')}
            </a>
            <a 
              href={createUrl("/blog")} 
              className={isActivePath("/blog") ? "active" : ""}
            >
              {t('nav.blog')}
            </a>
            <a
              href={createUrl("/organizations")}
              className={isActivePath("/organizations") ? "active" : ""}
            >
              {t('nav.organizations')}
            </a>
            <a
              href={createUrl("/events")}
              className={isActivePath("/events") ? "active" : ""}
            >
              {t('nav.events')}
            </a>
            <a
              href={createUrl("/contact")}
              className={isActivePath("/contact") ? "active" : ""}
            >
              {t('nav.contact')}
            </a>
            <a
              href={createUrl("/Images")}
              className={isActivePath("/Images") ? "active" : ""}
            >
              {t('nav.pictures')}
            </a>
            <a
              href={createUrl("/about")}
              className={isActivePath("/about") ? "active" : ""}
            >
              {t('nav.about')}
            </a>

            {/* Language Switcher for Mobile */}
            <div className="language-switcher-mobile">
              <div className="lang-divider"></div>
              <a 
                href={lang === 'sr' ? '/en' + (currentPath === '/' ? '' : currentPath) : currentPath.replace('/en', '') || '/'}
                className={`lang-switch ${lang === 'sr' ? '' : 'active'}`}
              >
                {lang === 'sr' ? 'English' : 'Српски'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BurgerMenu;
