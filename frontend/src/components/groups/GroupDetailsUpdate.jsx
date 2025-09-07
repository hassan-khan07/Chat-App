import { useState } from "react";
import { Edit3, Save, X, AlertCircle, Check } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import toast from "react-hot-toast";

const GroupDetailsUpdate = ({ group, onSuccess }) => {
  const { updateGroupDetails, isLoading } = useGroupStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: group?.name || "",
    description: group?.description || "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Group name must be less than 50 characters";
    }

    if (formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await updateGroupDetails(group._id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      
      setIsEditing(false);
      onSuccess?.();
      toast.success("Group details updated successfully!");
    } catch (error) {
      console.error("Failed to update group details:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: group?.name || "",
      description: group?.description || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-base-content">
              Group Details
            </h3>
            <p className="text-sm text-base-content/70">
              Update group name and description
            </p>
          </div>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-sm btn-outline btn-primary"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Form */}
      <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-6 border border-base-300">
        {/* Group Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-base-content mb-2">
            Group Name *
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter group name"
                className={`input input-bordered w-full focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                  errors.name ? "input-error" : ""
                }`}
                maxLength={50}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center text-xs">
                {errors.name ? (
                  <span className="text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </span>
                ) : (
                  <span className="text-base-content/50">
                    Minimum 3 characters
                  </span>
                )}
                <span className="text-base-content/50">
                  {formData.name.length}/50
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-base-100 rounded-lg border border-base-300">
              <p className="text-base-content font-medium">{group?.name}</p>
            </div>
          )}
        </div>

        {/* Group Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-base-content mb-2">
            Description
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter group description (optional)"
                className={`textarea textarea-bordered w-full h-24 focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none ${
                  errors.description ? "textarea-error" : ""
                }`}
                maxLength={200}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center text-xs">
                {errors.description ? (
                  <span className="text-error flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </span>
                ) : (
                  <span className="text-base-content/50">Optional</span>
                )}
                <span className="text-base-content/50">
                  {formData.description.length}/200
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-base-100 rounded-lg border border-base-300 min-h-[60px]">
              <p className="text-base-content">
                {group?.description || (
                  <span className="text-base-content/50 italic">
                    No description added
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t border-base-300">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="btn btn-outline btn-error"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        {/* Success Indicator */}
        {!isEditing && !isLoading && (
          <div className="flex items-center gap-2 text-success text-sm pt-4 border-t border-base-300">
            <Check className="w-4 h-4" />
            All details are up to date
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailsUpdate;
