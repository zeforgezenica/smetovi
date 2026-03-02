import React, { useState, useEffect } from "react";
import "./BurgerMenu.css";
import { t, type Lang } from "../../i18n";

interface BurgerMenuProps {
  lang?: Lang;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ lang = "bs" }) => {
  const [currentPath, setCurrentPath] = useState("");
  const tr = t(lang);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
      const handleLocationChange = () => setCurrentPath(window.location.pathname);
      window.addEventListener("popstate", handleLocationChange);
      return () => window.removeEventListener("popstate", handleLocationChange);
    }
  }, []);

  return (
      <div className="burger-menu open blur-background">
        <div className="menu-content">
          <div className="links">
            <a href="/map" className={currentPath === "/map" ? "active" : ""}>{tr.nav.map}</a>
            <a href="/" className={currentPath === "/" ? "active" : ""}>{tr.nav.home}</a>
            <a href="/blog" className={currentPath === "/blog" ? "active" : ""}>{tr.nav.news}</a>
            <a href="/organizations" className={currentPath === "/organizations" ? "active" : ""}>{tr.nav.organizations}</a>
            <a href="/events" className={currentPath === "/events" ? "active" : ""}>{tr.nav.events}</a>
            <a href="/contact" className={currentPath === "/contact" ? "active" : ""}>{tr.nav.contact}</a>
          </div>
        </div>
      </div>
  );
};

export default BurgerMenu;