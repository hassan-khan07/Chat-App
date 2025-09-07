import { useState } from "react";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/userAuthStore";
import { Users, X } from "lucide-react";

const ChangeRole = ({ group, onClose }) => {
  const { changeRole } = useGroupStore();
  const { authUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(null); // track per-user process

  const isCurrentUserAdmin = group.members.some(
    (m) => m.user._id === authUser._id && m.role === "admin"
  );

const handleChangeRole = async (member) => {
  if (!isCurrentUserAdmin) {
    alert("Only admins can change member roles.");
    return;
  }

  // Check: prevent last admin from demoting themselves
  const adminsCount = group.members.filter((m) => m.role === "admin").length;
  if (
    member.user._id === authUser._id &&
    member.role === "admin" &&
    adminsCount === 1
  ) {
    alert("You are the last admin. You cannot demote yourself.");
    return;
  }

  const newRole = member.role === "admin" ? "member" : "admin";

  // 🔍 Debug log before sending
  console.log("Attempting role change:", {
    groupId: group._id,
    targetUserId: member.user._id,
    currentRole: member.role,
    newRole,
  });

  setIsProcessing(member.user._id);

  try {
    const res = await changeRole(group._id, member.user._id, newRole);

    // 🔍 Debug log for response
    console.log("Role change response:", res);

    alert("Member role updated successfully");
  } catch (error) {
    // 🔍 Debug log for error
    console.error("Error changing role:", error.response?.data || error);

    alert(error.response?.data?.message || "Failed to change member role");
  } finally {
    setIsProcessing(null);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-600" />
            <h2 className="text-xl font-bold">Manage Roles</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Members List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {group.members.map((m) => {
            const adminsCount = group.members.filter(
              (mem) => mem.role === "admin"
            ).length;

            // Disable button if current user is the last admin
            const disableLastAdmin =
              m.user._id === authUser._id &&
              m.role === "admin" &&
              adminsCount === 1;

            return (
              <div
                key={m._id}
                className="flex items-center justify-between p-3 mb-2 transition-colors duration-200 border rounded-lg hover:bg-gray-50"
              >
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={m.user.avatar?.url || "/default-avatar.png"}
                    alt={m.user.fullName}
                    className="object-cover w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {m.user.fullName || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {m.role.charAt(0).toLowerCase() + m.role.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Role Action Button */}
                <button
                  onClick={() => handleChangeRole(m)}
                  disabled={isProcessing === m.user._id || disableLastAdmin}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                    m.role === "admin"
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  } ${
                    isProcessing === m.user._id || disableLastAdmin
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isProcessing === m.user._id
                    ? "Processing..."
                    : disableLastAdmin
                    ? "Locked"
                    : m.role === "admin"
                    ? "Remove Admin"
                    : "Make Admin"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChangeRole;
