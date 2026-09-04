import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavBar } from './tubelight-navbar';
import { Home, LayoutTemplate, MessageSquare } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';

export function CenterNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Determine active tab based on current path
  let activeTab = "Templates";
  const params = new URLSearchParams(location.search);
  
  if (isCategoryOpen || params.get("tag")) {
    activeTab = "Categories";
  } else if (location.pathname === "/") {
    activeTab = "Home";
  } else if (location.pathname === "/templates") {
    activeTab = "Templates";
  } else if (location.pathname === "/contact") {
    activeTab = "Contact";
  }

  return (
    <div className="hidden md:flex items-center justify-center">
      <NavBar 
        activeTab={activeTab}
        onChange={(name) => {
          if (name === "Home") return navigate("/");
          else if (name === "Templates") return navigate("/templates");
          else if (name === "Contact") return navigate("/contact");
        }}
        items={[
          { name: "Home", label: "Home", url: "/", icon: Home },
          { name: "Templates", label: "Templates", url: "/templates", icon: LayoutTemplate },
          { name: "Contact", label: "Contact", url: "/contact", icon: MessageSquare }
        ]} 
      >
        <CategoryDropdown 
          isActive={activeTab === "Categories"} 
          isOpen={isCategoryOpen} 
          setIsOpen={setIsCategoryOpen} 
        />
      </NavBar>
    </div>
  );
}

