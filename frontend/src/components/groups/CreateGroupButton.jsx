import { useState } from "react";
import { Users, Plus, X } from "lucide-react";
import CreateGroupForm from "./CreateGroupForm";

const CreateGroupButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Enhanced Create Group Button */}
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="relative flex items-center gap-2 px-6 py-3 overflow-hidden font-semibold text-white transition-all duration-300 transform shadow-lg group bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 rounded-xl hover:shadow-xl hover:scale-105 min-w-fit"
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 transition-transform duration-500 ease-out transform translate-x-full bg-white/20 group-hover:translate-x-0"></div>
        
        {/* Button content */}
        <div className="relative flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white/20">
            <Users size={18} className="transition-transform duration-300 transform group-hover:rotate-12" />
          </div>
          <span className="hidden sm:block">Create Group</span>
          <Plus size={16} className="transition-transform duration-300 transform group-hover:rotate-90" />
        </div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 transition-all duration-200 transform scale-0 bg-white opacity-0 rounded-xl group-active:opacity-30 group-active:scale-100"></div>
      </button>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md mx-4 bg-white shadow-2xl rounded-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 text-white rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Create New Group</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Container */}
            <div className="p-6">
              <CreateGroupForm onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateGroupButton;
