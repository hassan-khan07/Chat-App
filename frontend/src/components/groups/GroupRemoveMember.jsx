import { useState } from "react";
import { X, Users } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import toast from "react-hot-toast";

const GroupRemoveMember = ({ group, onSuccess }) => {
  const { removeMemberFromGroup } = useGroupStore();
  const [isOpen, setIsOpen] = useState(true);

  const handleRemove = async (userId) => {
    try {
      await removeMemberFromGroup(group._id, userId);
      toast.success("Member removed successfully");
      if (onSuccess) onSuccess(); // refresh parent
      setIsOpen(false);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-red-600" />
            <h2 className="text-xl font-bold">Remove Members</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Members list */}
        <div className="p-6 overflow-y-auto max-h-96">
          {group.members
            .filter((m) => m.user._id !== group.createdBy) // cannot remove creator
            .map((m) => {
              // With the backend fix, m.user is now the populated user object.
              const user = m.user;
              return (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3 mb-2 transition-colors duration-200 border rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar?.url || "/default-avatar.png"}
                      alt={user.fullName}
                      className="object-cover w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user.fullName || "unknown user"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(user._id)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default GroupRemoveMember;
