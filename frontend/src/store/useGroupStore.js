// import { create } from "zustand";
// import toast from "react-hot-toast";
// import { axiosInstance } from "../lib/axios";
// No changes were made to the old code, it is just being commented out for reference.

import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useGroupMessagesStore } from "./useGroupMessagesStore";

// api call on every word
// debounce/throttle
// useRef to store timer id
// useCallback to memoize the function

export const useGroupStore = create((set, get) => ({
  groups: [], // ✅ keep groups in state
  selectedGroup: null, // ✅ store selected group
  isLoading: false, // ✅ single loading state (instead of many booleans)

  // ✅ helper to run async actions with loading + error handling
  runAsync: async (fn, successMsg) => {
    set({ isLoading: true });
    try {
      const res = await fn();
      if (successMsg) toast.success(successMsg);
      return res;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 📌 Sidebar groups
  getGroupsForSidebar: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/groups/sidebar");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isLoading: false });
    }
  },

  // 📌 Create group
  createGroup: async (groupData) => {
    const { runAsync, groups } = get();

    const formData = new FormData();
    formData.append("name", groupData.name);
    if (groupData.description)
      formData.append("description", groupData.description);
    if (groupData.groupImage)
      formData.append("groupImage", groupData.groupImage);

    const res = await runAsync(
      () => axiosInstance.post("/groups", formData),
      "Group created successfully"
    );

    set({ groups: [...groups, res.data.data] }); // ✅ update local state
    return res.data;
  },

  // 📌 Update details
  updateGroupDetails: async (groupId, groupData) => {
    const { runAsync, groups, selectedGroup } = get();

    const payload = {};
    if (groupData.name) payload.name = groupData.name;
    if (groupData.description !== undefined)
      payload.description = groupData.description;

    const res = await runAsync(
      () => axiosInstance.patch(`/groups/${groupId}`, payload),
      "Group updated successfully"
    );

    const updatedGroup = res.data.data;

    //  OLD CODE - PROBLEMATIC :
    // set({
    //   groups: groups.map((g) => (g._id === groupId ? res.data.data : g)),
    // });
    //
    // WHY COMMENTED:
    // - Only updates `groups` array (for sidebar)
    // - Does NOT update `selectedGroup` (for ChatHeader/GroupInfoPanel)
    // - ChatHeader shows old name/avatar until page refresh
    // - GroupInfoPanel shows stale data
    // - Creates inconsistency between sidebar (updated) vs header (outdated)

    //  NEW CODE - FIXED:
    set({
      groups: groups.map((g) => (g._id === groupId ? updatedGroup : g)),
      // KEY FIX: Also update selectedGroup if it's the same group being updated
      selectedGroup:
        selectedGroup?._id === groupId ? updatedGroup : selectedGroup,
    });
    //
    // WHY BETTER:
    // - Updates BOTH `groups` array AND `selectedGroup`
    // - Sidebar, ChatHeader, and GroupInfoPanel all show updated data instantly
    // - No refresh needed - all components re-render automatically
    // - Maintains data consistency across all UI components

    return res.data;
  },

  // 📌 Update avatar
  updateGroupAvatar: async (groupId, groupImage) => {
    const { runAsync, groups, selectedGroup } = get();

    const formData = new FormData();
    formData.append("groupImage", groupImage);

    const res = await runAsync(
      () => axiosInstance.patch(`/groups/${groupId}/avatar`, formData),
      "Group avatar updated successfully"
    );

    const updatedGroup = res.data.data;

    // ❌ OLD CODE - PROBLEMATIC (commented out):
    // set({
    //   groups: groups.map((g) => (g._id === groupId ? res.data.data : g)),
    // });
    //
    // WHY COMMENTED:
    // - Same issue as updateGroupDetails
    // - Sidebar shows new avatar immediately ✅
    // - ChatHeader still shows old avatar ❌
    // - User has to refresh to see new avatar in header
    // - Creates confusing UX where different parts of UI show different data

    // ✅ NEW CODE - FIXED:
    set({
      groups: groups.map((g) => (g._id === groupId ? updatedGroup : g)),
      // 🔑 KEY FIX: Sync selectedGroup avatar too
      selectedGroup:
        selectedGroup?._id === groupId ? updatedGroup : selectedGroup,
    });
    //
    // WHY BETTER:
    // - Avatar updates everywhere instantly (sidebar + header + info panel)
    // - No manual refresh needed
    // - Consistent user experience across all components
    // - Single source of truth maintained

    return res.data;
  },

  // 📌 Delete group
  deleteGroup: async (groupId) => {
    const { runAsync, groups } = get();

    await runAsync(
      () => axiosInstance.delete(`/groups/${groupId}`),
      "Group deleted successfully"
    );

    set({ groups: groups.filter((g) => g._id !== groupId) });
  },

  // 📌 Add member
  addMemberToGroup: async (groupId, memberData) => {
    const { runAsync, groups, selectedGroup } = get();
    // OLD CODE - PROBLEMATIC
    // const { runAsync } = get();
    // const res = await runAsync(
    //   () => axiosInstance.post(`/groups/${groupId}/addMember`, memberData),
    //   "Member added successfully"
    // );
    // return res.data;
    //
    // WHY COMMENTED:
    // - The old code did not update the local state after a member was added.
    // - This caused a bug where a former admin who rejoined a group would appear as an admin
    //   in the UI until the page was refreshed, because the frontend was using stale data.
    //
    // NEW CODE - FIXED:
    const res = await runAsync(
      () => axiosInstance.post(`/groups/${groupId}/addMember`, memberData),
      "Member added successfully"
    );
    const updatedGroup = res.data.data;
    set({
      groups: groups.map((g) => (g._id === groupId ? updatedGroup : g)),
      selectedGroup:
        selectedGroup?._id === groupId ? updatedGroup : selectedGroup,
    });
    return res.data;
  },

  // 📌 Remove member
  removeMemberFromGroup: async (groupId, userId) => {
    const { runAsync } = get();
    await runAsync(
      () => axiosInstance.delete(`/groups/${groupId}/removeMember/${userId}`),
      "Member removed successfully"
    );
  },

  // 📌 Leave group
  leaveGroup: async (groupId) => {
    // OLD CODE - PROBLEMATIC
    // const { runAsync, groups } = get();
    // await runAsync(
    //   () => axiosInstance.post(`/groups/${groupId}/leave`),
    //   "Left group successfully"
    // );
    // set({ groups: groups.filter((g) => g._id !== groupId) });
    //
    // WHY COMMENTED:
    // - The old code only removed the group from the `groups` list.
    // - It did not clear the `selectedGroup` or `activeGroup`, which caused the UI to show stale data
    //   if the user was viewing the group they just left.
    //
    // NEW CODE - FIXED:
    const { runAsync, groups, selectedGroup } = get();
    await runAsync(
      () => axiosInstance.post(`/groups/${groupId}/leave`),
      "Left group successfully"
    );
    set({
      groups: groups.filter((g) => g._id !== groupId),
      selectedGroup: selectedGroup?._id === groupId ? null : selectedGroup,
    });
    if (useGroupMessagesStore.getState().activeGroup?._id === groupId) {
      useGroupMessagesStore.getState().setActiveGroup(null);
    }
  },

  changeRole: async (groupId, userId, newRole) => {
    const { runAsync, selectedGroup, groups } = get();

    const res = await runAsync(
      () =>
        axiosInstance.patch(`/groups/${groupId}/members/${userId}/role`, {
          newRole: newRole.toLowerCase(),
        }),
      "Member role updated successfully"
    );

    const updatedGroup = res.data.data;

    // Update both groups array and selectedGroup to keep UI in sync
    set({
      groups: groups.map((g) => (g._id === groupId ? updatedGroup : g)),
      selectedGroup:
        selectedGroup?._id === groupId ? updatedGroup : selectedGroup,
    });

    return res.data;
  },

  // 📌 Selection
  setSelectedGroup: (group) => set({ selectedGroup: group }),
}));
