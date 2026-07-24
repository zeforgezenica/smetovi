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

  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(`${href}/`);

  return (
      <div className="burger-menu open blur-background">
        <div className="menu-content">
          <nav className="links" aria-label={tr.nav.mobile_menu}>
            <a href="/" className={isActive("/") ? "active" : ""} aria-current={isActive("/") ? "page" : undefined}>{tr.nav.home}</a>
            <a href="/map" className={isActive("/map") ? "active" : ""} aria-current={isActive("/map") ? "page" : undefined}>{tr.nav.map}</a>
            <a href="/blog" className={isActive("/blog") ? "active" : ""} aria-current={isActive("/blog") ? "page" : undefined}>{tr.nav.news}</a>
            <a href="/organizations" className={isActive("/organizations") ? "active" : ""} aria-current={isActive("/organizations") ? "page" : undefined}>{tr.nav.organizations}</a>
            <a href="/events" className={isActive("/events") ? "active" : ""} aria-current={isActive("/events") ? "page" : undefined}>{tr.nav.events}</a>
            <a href="/contact" className={isActive("/contact") ? "active" : ""} aria-current={isActive("/contact") ? "page" : undefined}>{tr.nav.contact}</a>
            <a href="/Images" className={isActive("/Images") ? "active" : ""} aria-current={isActive("/Images") ? "page" : undefined}>{tr.nav.images}</a>
          </nav>
        </div>
      </div>
  );
};

export default BurgerMenu;
