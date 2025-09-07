// import { useState } from "react";
// import { useGroupStore } from "../../store/useGroupStore";

// const GroupUpdateDetailsForm = ({ onClose, group }) => {
//   const [groupName, setGroupName] = useState(group.name);
//   const [groupDesc, setGroupDesc] = useState(group.description || "");
//   const [groupPhoto, setGroupPhoto] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(group.groupImage?.url || null);
//   const { updateGroupDetails } = useGroupStore();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setGroupPhoto(file);
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       await updateGroupDetails(group._id, {
//         name: groupName,
//         description: groupDesc,
//         groupImage: groupPhoto,
//       });
//       onClose();
//     } catch (error) {
//       console.error("Error updating group:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="form-control">
//         <label className="label">
//           <span className="flex items-center gap-2 font-medium text-gray-700 label-text">
//             Group Name
//           </span>
//         </label>
//         <input
//           type="text"
//           placeholder="Enter group name..."
//           value={groupName}
//           onChange={(e) => setGroupName(e.target.value)}
//           required
//           className="w-full py-3 pl-4 pr-4 text-gray-800 placeholder-gray-400 transition-all duration-200 border-gray-200 rounded-lg input input-bordered focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
//         />
//       </div>

//       <div className="form-control">
//         <label className="label">
//           <span className="flex items-center gap-2 font-medium text-gray-700 label-text">
//             Description
//           </span>
//         </label>
//         <textarea
//           placeholder="Enter group description..."
//           value={groupDesc}
//           onChange={(e) => setGroupDesc(e.target.value)}
//           className="w-full h-24 py-3 pl-4 pr-4 text-gray-800 placeholder-gray-400 transition-all duration-200 border-gray-200 rounded-lg textarea textarea-bordered focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
//         ></textarea>
//       </div>

//       <div className="form-control">
//         <label className="label">
//           <span className="flex items-center gap-2 font-medium text-gray-700 label-text">
//             Group Photooo
//           </span>
//         </label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleFileChange}
//           className="w-full text-gray-800 file-input file-input-bordered file-input-primary"
//         />
//         {previewUrl && (
//           <img
//             src={previewUrl}
//             alt="Group Preview"
//             className="object-cover w-24 h-24 mt-4 rounded-full"
//           />
//         )}
//       </div>

//       <div className="flex justify-end gap-4">
//         <button
//           type="button"
//           onClick={onClose}
//           className="px-6 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
//           disabled={isLoading}
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className={`px-6 py-2 font-medium text-white rounded-lg ${
//             isLoading
//               ? "bg-purple-300 cursor-not-allowed"
//               : "bg-purple-500 hover:bg-purple-600"
//           }`}
//           disabled={isLoading}
//         >
//           {isLoading ? "Updating..." : "Update Group"}
//         </button>
//       </div>
//     </form>
//   );
// };
// export default GroupUpdateDetailsForm;
