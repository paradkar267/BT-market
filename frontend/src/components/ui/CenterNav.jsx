import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavBar } from './tubelight-navbar';
import { Home, LayoutTemplate, MessageCircle } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';

export function CenterNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Determine active tab based on current path
  let activeTab = "TEMPLATES";
  const params = new URLSearchParams(location.search);
  
  if (isCategoryOpen || params.get("tag")) {
    activeTab = "CATEGORIES";
  } else if (location.pathname === "/") {
    activeTab = "HOME";
  } else if (location.pathname === "/ui-kits") {
    activeTab = "UI KITS";
  } else if (location.pathname === "/templates") {
    activeTab = "TEMPLATES";
  } else if (location.pathname === "/contact") {
    activeTab = "CONTACT";
  }

  return (
    <div className="hidden md:flex items-center justify-center">
      <NavBar 
        activeTab={activeTab}
        onChange={(name) => {
          if (name === "HOME") return navigate("/");
          else if (name === "TEMPLATES") return navigate("/templates");
          else if (name === "UI KITS") return navigate("/ui-kits");
          else if (name === "CONTACT") return navigate("/contact");
        }}
        items={[
          { name: "HOME", url: "/", icon: Home },
          { name: "TEMPLATES", url: "/templates", icon: LayoutTemplate },
          { name: "CONTACT", url: "/contact", icon: MessageCircle }
        ]} 
      >
        <CategoryDropdown 
          isActive={activeTab === "CATEGORIES"} 
          isOpen={isCategoryOpen} 
          setIsOpen={setIsCategoryOpen} 
        />
      </NavBar>
    </div>
  );
}
