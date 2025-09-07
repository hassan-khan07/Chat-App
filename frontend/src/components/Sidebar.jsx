import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SidebarTabs from "./SidebarTabs";
import { MessageSquare } from "lucide-react";
import CreateGroupButton from "./groups/CreateGroupButton";

const Sidebar = () => {
  const { getUsers, isUsersLoading } = useChatStore();
  const { getGroupsForSidebar } = useGroupStore();

  useEffect(() => {
    getUsers();
    getGroupsForSidebar();
  }, [getUsers, getGroupsForSidebar]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="flex flex-col w-20 h-full transition-all duration-200 border-r lg:w-72 border-base-300">
      <div className="w-full p-5 border-b border-base-300">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-6" />
          <span className="hidden font-medium lg:block">Chat</span>
        </div>
        <CreateGroupButton />
      </div>

      <div className="flex-1 overflow-hidden">
        <SidebarTabs />
      </div>
    </aside>
  );
};
export default Sidebar;
