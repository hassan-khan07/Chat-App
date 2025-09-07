import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupMessagesStore } from "../store/useGroupMessagesStore";

const GroupsList = () => {
  const { groups, selectedGroup, setSelectedGroup, isLoading } =
    useGroupStore();
  const { setSelectedUser } = useChatStore();
  const { setActiveGroup } = useGroupMessagesStore();
// console.log("GroupsList render, selectedGroup:", selectedGroup);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => {
              setSelectedGroup(group);
              setActiveGroup(group); // Set in group messages store too
              setSelectedUser(null); // Clear selected user when selecting group
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedGroup?._id === group._id
                  ? "bg-base-300 ring-1 ring-base-300 "
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={group.groupImage?.url || "/group-avatar.png"}
                alt={group.name}
                className="object-cover rounded-full size-12"
              />
              {/* Group indicator - you can customize this */}
              <span className="absolute bottom-0 right-0 bg-blue-500 rounded-full size-3 ring-2 ring-zinc-900" />
            </div>

            {/* Group info - only visible on larger screens */}
            <div className="hidden min-w-0 text-left lg:block">
              <div className="font-medium truncate">{group.name}</div>
              <div className="text-sm text-zinc-400">
                {group.totalMembers}{" "}
                {group.totalMembers === 1 ? "member" : "members"}
              </div>
            </div>
          </button>
        ))}

        {groups.length === 0 && (
          <div className="py-4 text-center text-zinc-500">
            <div className="mb-2">No groups yet</div>
            <div className="text-xs text-zinc-600">
              Create or join a group to start chatting
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsList;
