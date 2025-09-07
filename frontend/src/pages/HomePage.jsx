import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  // OLD CODE: const { selectedUser } = useChatStore();
  const hasSelection = selectedUser || selectedGroup;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center px-4 pt-20">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full overflow-hidden rounded-lg">
            <Sidebar />

            {/* OLD CODE: {!selectedUser ? <NoChatSelected /> : <ChatContainer />} */}
            {/* {!hasSelection ? <NoChatSelected /> : <ChatContainer />} */}
            {!hasSelection ? (
              <NoChatSelected />
            ) : selectedUser ? (
              <ChatContainer />
            ) : (
              <GroupChatContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
