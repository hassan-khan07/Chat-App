import { useState } from "react";
import { useGroupStore } from "../../store/useGroupStore";
import { Upload, Users, FileText, Image, Sparkles } from "lucide-react";

const CreateGroupForm = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { createGroup } = useGroupStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // pass plain object, store will handle FormData
      await createGroup({
        name: groupName,
        description: groupDesc,
        groupImage: groupPhoto,
      });
      onClose(); // close modal after success
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Name Input */}
      <div className="form-control">
        <label className="label">
          <span className="flex items-center gap-2 font-medium text-gray-700 label-text">
            <Users size={16} className="text-purple-500" />
            Group Name
          </span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter a catchy group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            className="w-full py-3 pl-4 pr-4 text-gray-800 placeholder-gray-400 transition-all duration-200 border-gray-200 rounded-lg input input-bordered focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
          <div className="absolute inset-y-0 flex items-center pointer-events-none right-3">
            <Sparkles size={16} className="text-gray-300" />
          </div>
        </div>
      </div>

      {/* Group Description Input */}
      <div className="form-control">
        <label className="label">
          <span className="flex items-center gap-2 font-medium text-gray-700 label-text">
            <FileText size={16} className="text-blue-500" />
            Description
            <span className="text-sm text-gray-400">(optional)</span>
          </span>
        </label>
        <textarea
          placeholder="What's this group about? Add a brief description..."
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 transition-all duration-200 border-gray-200 rounded-lg resize-none textarea textarea-bordered focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Group Photo Upload */}
      <div className="form-control">
        <label className="label">
          <span className="flex items-center gap-2 font-medium text-gray-700 label-text">
            <Image size={16} className="text-cyan-500" />
            Group Photo
            <span className="text-sm text-gray-400">(optional)</span>
          </span>
        </label>

        {/* Custom file upload area */}
        <div className="relative">
          <input
            type="file"
            id="groupPhoto"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="groupPhoto"
            className="flex flex-col items-center justify-center w-full h-32 transition-colors duration-200 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 group"
          >
            {previewUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={previewUrl}
                  alt="Group preview"
                  className="object-cover w-full h-full rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 rounded-lg opacity-0 bg-black/40 group-hover:opacity-100">
                  <Upload size={24} className="text-white" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload
                  size={32}
                  className="mb-2 text-gray-400 transition-colors duration-200 group-hover:text-purple-500"
                />
                <p className="text-sm text-gray-500 group-hover:text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 font-medium text-gray-600 transition-all duration-200 rounded-lg btn btn-ghost hover:text-gray-800 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!groupName.trim() || isLoading}
          className="flex items-center gap-2 px-8 py-2 font-semibold text-white transition-all duration-200 transform border-none rounded-lg shadow-md btn bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
              Creating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Create Group
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
