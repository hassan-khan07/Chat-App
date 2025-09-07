import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/userAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { useGroupMessagesStore } from "../store/useGroupMessagesStore";

const UsersList = () => {
  const { users, selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { setSelectedGroup } = useGroupStore();
    const { setActiveGroup } = useGroupMessagesStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  return (
    <div className="flex flex-col h-full">
      {/* Online filter toggle */}
      <div className="items-center hidden gap-2 px-3 pb-3 lg:flex">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm">Show online only</span>
        </label>
        <span className="text-xs text-zinc-500">
          ({onlineUsers.length - 1} online)
        </span>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setSelectedGroup(null); // Clear selected group when selecting user
              setActiveGroup(null); // Clear selected group in group messages store too
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300 "
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.avatar?.url || "/avatar.png"}
                alt={user.name}
                className="object-cover rounded-full size-12"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 bg-green-500 rounded-full size-3 ring-2 ring-zinc-900" />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden min-w-0 text-left lg:block">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="py-4 text-center text-zinc-500">No online users</div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
