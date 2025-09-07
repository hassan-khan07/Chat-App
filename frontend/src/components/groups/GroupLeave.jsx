import { useGroupStore } from "../../store/useGroupStore";
import toast from "react-hot-toast";
import { LogOut, ShieldAlert } from "lucide-react";

const GroupLeave = ({ groupId, onSuccess }) => {
  const { leaveGroup } = useGroupStore();

  const handleLeave = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(groupId);
        toast.success("You have left the group");
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error leaving group:", error);
        toast.error(error.response?.data?.message || "Failed to leave group");
      }
    }
  };

  return (
    <div className="p-6 bg-base-200 rounded-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-error/20 text-error rounded-full">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Leave Group</h3>
          <p className="text-sm text-base-content/70">
            This action is irreversible. You will need to be invited back.
          </p>
        </div>
      </div>

      <p className="mb-6 text-sm">
        Are you sure you want to permanently leave this group? You will lose
        access to all conversations and shared content.
      </p>

      <button
        onClick={handleLeave}
        className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition-colors duration-200 bg-error rounded-lg hover:bg-error/90"
      >
        <LogOut className="w-5 h-5" />
        <span>Yes, Leave Group</span>
      </button>
    </div>
  );
};

export default GroupLeave;