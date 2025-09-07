import { useState } from "react";
import { Users, MessageCircle } from "lucide-react";
import UsersList from "./UsersList";
import GroupsList from "./GroupsList";

const SidebarTabs = () => {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      component: UsersList
    },
    {
      id: "groups", 
      label: "Groups",
      icon: MessageCircle,
      component: GroupsList
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData.component;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex border-b border-base-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 p-3 transition-colors
                hover:bg-base-300
                ${
                  activeTab === tab.id
                    ? "bg-base-300 border-b-2 border-primary text-primary"
                    : "text-base-content/70"
                }
              `}
            >
              <Icon className="size-4" />
              <span className="hidden font-medium sm:block">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default SidebarTabs;
