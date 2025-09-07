import { X } from "lucide-react";
import { useAuthStore } from "../store/userAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const ChatHeader = ({ setShowGroupInfo }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  const isGroup = selectedGroup && !selectedUser;
  const currentChat = isGroup ? selectedGroup : selectedUser;

  const handleClose = () => {
    if (isGroup) {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => isGroup && setShowGroupInfo(true)} // ✅ open GroupInfo
      >
        <div className="avatar">
          <div className="relative rounded-full size-10">
            <img
              src={
                isGroup
                  ? currentChat.groupImage?.url || "/group-avatar.png"
                  : currentChat.profilePic ||
                    currentChat.avatar?.url ||
                    "/avatar.png"
              }
              alt={isGroup ? currentChat.name : currentChat.fullName}
            />
          </div>
        </div>
        <div>
          <h3 className="font-medium">
            {isGroup ? currentChat.name : currentChat.fullName}
          </h3>
          <p className="text-sm text-base-content/70">
            {isGroup
              ? `${currentChat.totalMembers} ${
                  currentChat.totalMembers === 1 ? "member" : "members"
                }`
              : onlineUsers.includes(currentChat._id)
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <button onClick={handleClose}>
        <X />
      </button>
    </div>
  );
};

export default ChatHeader;
