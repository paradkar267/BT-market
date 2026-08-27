import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavBar } from './tubelight-navbar';
import { Home, LayoutTemplate } from 'lucide-react';
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
  }

  return (
    <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 mt-2">
      <NavBar 
        activeTab={activeTab}
        onChange={(name) => {
          if (name === "HOME") return navigate("/");
          else if (name === "TEMPLATES") return navigate("/templates");
          else if (name === "UI KITS") return navigate("/ui-kits");
        }}
        items={[
          { name: "HOME", url: "/", icon: Home },
          { name: "TEMPLATES", url: "/templates", icon: LayoutTemplate }
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
