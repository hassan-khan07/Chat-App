import { useState } from "react";
import { Users, Plus, X } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";

const CreateGroupButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn btn-sm btn-outline"
      >
        <Users size={18} />
        <span className="hidden sm:block">New Group</span>
        <Plus size={16} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-base-100 shadow-xl rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <h2 className="text-lg font-semibold">Create New Group</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-sm btn-ghost"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <CreateGroupForm onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateGroupButton;
