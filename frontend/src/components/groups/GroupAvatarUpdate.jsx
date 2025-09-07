import { useState, useRef } from "react";
import { Camera, Upload, X, Check, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import toast from "react-hot-toast";

const GroupAvatarUpdate = ({ group, onSuccess }) => {
  const { updateGroupAvatar, isLoading } = useGroupStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    if (!file) return { valid: false, error: "No file selected" };

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: "Please select a valid image file (JPEG, PNG, or WebP)" 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: "File size must be less than 5MB" 
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedImage(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      await updateGroupAvatar(group._id, selectedImage);
      
      // Clean up
      setSelectedImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      onSuccess?.();
      toast.success("Group avatar updated successfully!");
    } catch (error) {
      console.error("Failed to update group avatar:", error);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const currentAvatar = group?.groupImage?.url || "/group-avatar.png";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-base-content">
            Group Avatar
          </h3>
          <p className="text-sm text-base-content/70">
            Upload a new group avatar image
          </p>
        </div>
      </div>

      {/* Current Avatar Display */}
      <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-6 border border-base-300">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar Preview */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-base-300 bg-base-100 shadow-lg">
              <img
                src={previewUrl || currentAvatar}
                alt="Group Avatar"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            
            {/* Overlay for current image */}
            {!selectedImage && (
              <button
                onClick={triggerFileSelect}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            )}
          </div>

          {/* Upload Status */}
          {selectedImage ? (
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 text-success">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">New image selected</span>
              </div>
              <p className="text-xs text-base-content/70">
                {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-base-content/70">
                Current group avatar
              </p>
            </div>
          )}
        </div>

        {/* Drag & Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mt-6 border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer ${
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-base-300 hover:border-primary/50 hover:bg-base-100/50"
          }`}
          onClick={triggerFileSelect}
        >
          <div className="text-center space-y-3">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
              isDragOver ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
            }`}>
              {isDragOver ? (
                <Upload className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>
            
            <div>
              <p className="font-medium text-base-content">
                {isDragOver ? "Drop image here" : "Click to upload or drag & drop"}
              </p>
              <p className="text-sm text-base-content/70 mt-1">
                JPEG, PNG or WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* File Size Warning */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <div className="text-sm text-warning">
            <p className="font-medium">Image Requirements:</p>
            <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: JPEG, PNG, WebP</li>
              <li>Recommended: Square images (1:1 aspect ratio)</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        {selectedImage && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-base-300">
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isLoading ? "Uploading..." : "Update Avatar"}
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
        {!selectedImage && !isLoading && (
          <div className="flex items-center gap-2 text-success text-sm mt-6 pt-4 border-t border-base-300">
            <Check className="w-4 h-4" />
            Avatar is up to date
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupAvatarUpdate;
