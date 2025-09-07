import { useEffect, useState } from "react";
import { X, Users } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import toast from "react-hot-toast";

const GroupAddMember = ({ group, onSuccess }) => {
  const { users, getUsers } = useChatStore();
  const { addMemberToGroup } = useGroupStore();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(true); // modal open by default

  useEffect(() => {
    getUsers();
  }, []);

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      // If user is already in the selected list → remove them
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      // If user is not in the list → add them
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to add.");
      return;
    }

    try {
      await addMemberToGroup(group._id, { userIds: selectedUsers }); // send array
      if (onSuccess) onSuccess(); // refresh parent
      setIsOpen(false); // close modal
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  if (!isOpen) return null; // close modal

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-600" />
            <h2 className="text-xl font-bold">Add Members</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* User List */}
        <div className="overflow-y-auto max-h-96">
          {users.map((user) => (
            <div
              key={user._id}
              className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                selectedUsers.includes(user._id) ? "bg-blue-100" : ""
              }`}
              onClick={() => toggleUserSelection(user._id)}
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar?.url || "/default-avatar.png"}
                  alt={user.fullName}
                  className="object-cover w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              {selectedUsers.includes(user._id) && (
                <div className="flex items-center justify-center w-6 h-6 text-white bg-blue-600 rounded-full shadow-lg">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 font-semibold bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Members
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupAddMember;
