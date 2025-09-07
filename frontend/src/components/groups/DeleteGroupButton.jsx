import { useGroupStore } from "../../store/useGroupStore";
import toast from "react-hot-toast";
import { Trash2, ShieldAlert } from "lucide-react";

const DeleteGroupButton = ({ groupId, onSuccess }) => {
  const { deleteGroup } = useGroupStore();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await deleteGroup(groupId);
        toast.success("Group deleted successfully");
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error deleting group:", error);
        toast.error(error.response?.data?.message || "Failed to delete group");
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
          <h3 className="text-xl font-bold">Delete Group</h3>
          <p className="text-sm text-base-content/70">
            This action is irreversible and will delete all group data.
          </p>
        </div>
      </div>

      <p className="mb-6 text-sm">
        Are you sure you want to permanently delete this group? All
        conversations, members, and shared content will be lost forever.
      </p>

      <button
        onClick={handleDelete}
        className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition-colors duration-200 bg-error rounded-lg hover:bg-error/90"
      >
        <Trash2 className="w-5 h-5" />
        <span>Yes, Delete Group</span>
      </button>
    </div>
  );
};

export default DeleteGroupButton;