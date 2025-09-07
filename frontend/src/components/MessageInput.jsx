import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useGroupMessagesStore } from "../store/useGroupMessagesStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]); // Array of preview URLs
  const [selectedImages, setSelectedImages] = useState([]); // Array of File objects
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { activeGroup, sendGroupMessage } = useGroupMessagesStore();

  // console.log("MessageInput render, selectedUser:", selectedUser);

  console.log("SelectedGroup from useGroupMessagesStore:", activeGroup);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate all files are images
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      toast.error("Please select only image files");
      return;
    }

    // Limit to 5 files (same as backend maxCount)
    if (files.length > 5) {
      toast.error("You can only select up to 5 images at once");
      return;
    }

    // Store the actual File objects for multer
    setSelectedImages(files);

    // Create preview URLs for all files
    const previewPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve({
            url: reader.result,
            name: file.name,
            file: file,
          });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((previews) => {
      setImagePreviews(previews);
    });
  };

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = selectedImages.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setSelectedImages(newImages);

    // Clear file input if no images left
    if (newImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAllImages = () => {
    setImagePreviews([]);
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && selectedImages.length === 0) return;

    try {
      if (selectedUser)
        await sendMessage({
          text: text.trim(),
          images: selectedImages, // Send array of File objects
        });
      else if (activeGroup)
        await sendGroupMessage({
          text: text.trim(),
          images: selectedImages, // Send array of File objects for groups
        });
      else {
        toast.error("No user or group selected");
      }

      // Clear form
      setText("");
      setImagePreviews([]);
      setSelectedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="w-full p-4">
      {imagePreviews.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">
              {imagePreviews.length} image{imagePreviews.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <button
              onClick={removeAllImages}
              className="text-xs text-red-400 hover:text-red-300"
              type="button"
            >
              Remove All
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="object-cover w-20 h-20 border rounded-lg border-zinc-700"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                  flex items-center justify-center"
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="w-full rounded-lg input input-bordered input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${
                       imagePreviews.length > 0
                         ? "text-emerald-500"
                         : "text-zinc-400"
                     }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && selectedImages.length === 0}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;