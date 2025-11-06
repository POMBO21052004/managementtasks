// EmployeeSideBar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function EmployeeSidebar({ user, collapsed }) {
  const location = useLocation();
  const [theme, setTheme] = useState("light");

  // Détecte le thème au montage et sur changement du DOM
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);

    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Menu spécifique pour les employés
  const menuSections = [
    {
      title: "Tableau de bord",
      items: [
        { label: "Dashboard", icon: "grid", path: "/employe/dashboard" },
      ]
    },
    {
      title: "Gestion des projets",     
      items: [
        { label: "Mes Projets", icon: "folder", path: "/employee/projects" },
      ]
    },
    {
      title: "Gestion des tâches",     
      items: [
        { label: "Mes Tâches", icon: "check-square", path: "/employee/tasks" },
      ]
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : "" }  ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`}>
      {/* Header avec logo et informations */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span>WS</span>
          </div>
          <div className="sidebar-logo-text">
            <h6 className="sidebar-logo-title">Task Manager</h6>
            <p className="sidebar-logo-subtitle">Espace Employé</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="sidebar-nav-section">
            <h6 className="sidebar-nav-section-title">{section.title}</h6>
            <ul className="list-unstyled mb-0">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="sidebar-nav-item">
                  <Link
                    to={item.path}
                    className={`sidebar-nav-link ${
                      location.pathname.startsWith(item.path) ? "active" : ""
                    }`}
                  >
                    <i 
                      data-feather={item.icon} 
                      className="sidebar-nav-icon"
                    />
                    <span className="sidebar-nav-text">{item.label}</span>
                    {item.badge && (
                      <span className="sidebar-nav-badge">{item.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}