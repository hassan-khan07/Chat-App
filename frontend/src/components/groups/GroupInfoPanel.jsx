import { useState } from "react";
import {
  X,
  Users,
  Settings,
  Camera,
  Edit3,
  Crown,
  Shield,
  Plus,
  Trash2,
  LogOut,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/userAuthStore";
import GroupDetailsUpdate from "./GroupDetailsUpdate";
import GroupAvatarUpdate from "./GroupAvatarUpdate";
import GroupAddMember from "./GroupAddMember";
import GroupRemoveMember from "./GroupRemoveMember";
import DeleteGroupButton from "./DeleteGroupButton";
import GroupLeave from "./GroupLeave";
import ChangeRole from "./ChangeRole";

const GroupInfoPanel = ({ onClose }) => {
  const { selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");

  if (!selectedGroup) return null;

  const userMembership = selectedGroup.members?.find(
    (member) => (member.user?._id || member.user) === authUser?._id
  );
  const isAdmin = userMembership?.role === "admin";
  const isMember = !!userMembership;

  const creatorMember = selectedGroup.members?.find(
    (member) => (member.user?._id || member.user) === selectedGroup.createdBy
  );
  const creatorName =
    creatorMember?.user?.fullName ||
    creatorMember?.user?.name ||
    "Unknown Creator";

  const tabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "details", label: "Edit Info", icon: Edit3, adminOnly: true },
    { id: "avatar", label: "Change Avatar", icon: Camera, adminOnly: true },
    { id: "addmembers", label: "Add Members", icon: UserPlus, adminOnly: true },
    {
      id: "removemembers",
      label: "Remove Members",
      icon: UserMinus,
      adminOnly: true,
    },
    { id: "changerole", label: "Manage Roles", icon: Crown, adminOnly: true },
    { id: "leavegroup", label: "Leave Group", icon: LogOut, adminOnly: false },
    {
      id: "deletegroup",
      label: "Delete Group",
      icon: Trash2,
      adminOnly: true,
    },
  ];

  const availableTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "details":
        return <GroupDetailsUpdate group={selectedGroup} onSuccess={onClose} />;
      case "avatar":
        return <GroupAvatarUpdate group={selectedGroup} onSuccess={onClose} />;
      case "addmembers":
        return <GroupAddMember group={selectedGroup} onSuccess={onClose} />;
      case "removemembers":
        return <GroupRemoveMember group={selectedGroup} onSuccess={onClose} />;
      case "deletegroup":
        return <DeleteGroupButton groupId={selectedGroup._id} onSuccess={onClose} />;
      case "leavegroup":
        return <GroupLeave groupId={selectedGroup._id} onSuccess={onClose} />;
      case "changerole":
        return (
          <ChangeRole
            member={userMembership}
            group={selectedGroup}
            onClose={() => setActiveTab("overview")}
          />
        );
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="absolute top-0 right-0 z-50 h-full overflow-hidden shadow-2xl w-96 bg-base-100 animate-slideIn">
      <div className="flex flex-col h-full">
        <Header onClose={onClose} />
        <HorizontalTabNavigation
          tabs={availableTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="flex-1 overflow-y-auto p-6">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

const Header = ({ onClose }) => {
  const { selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const userMembership = selectedGroup.members?.find(
    (member) => (member.user?._id || member.user) === authUser?._id
  );
  const isAdmin = userMembership?.role === "admin";

  return (
    <div className="relative p-6 text-white bg-gradient-to-r from-primary to-secondary">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 overflow-hidden rounded-full border-4 border-white/30">
              <img
                src={selectedGroup.groupImage?.url || "/group-avatar.png"}
                alt={selectedGroup.name}
                className="object-cover w-full h-full"
              />
            </div>
            {isAdmin && (
              <div className="absolute flex items-center justify-center w-8 h-8 bg-yellow-400 border-2 border-white rounded-full -bottom-1 -right-1">
                <Crown className="w-4 h-4 text-black" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
            <p className="text-sm opacity-80">
              {selectedGroup.totalMembers} Members
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 transition-colors rounded-full hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      {selectedGroup.description && (
        <p className="mt-4 text-sm opacity-90">{selectedGroup.description}</p>
      )}
    </div>
  );
};

const HorizontalTabNavigation = ({ tabs, activeTab, setActiveTab }) => (
  <div className="border-b border-base-300 bg-base-200">
    <div className="flex overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
            activeTab === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-base-content/60 hover:text-base-content"
          }`}
        >
          <div className="flex items-center gap-2">
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const OverviewPanel = () => {
  const { selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const userMembership = selectedGroup.members?.find(
    (member) => (member.user?._id || member.user) === authUser?._id
  );
  const isAdmin = userMembership?.role === "admin";

  const creatorMember = selectedGroup.members?.find(
    (member) => (member.user?._id || member.user) === selectedGroup.createdBy
  );
  const creatorName =
    creatorMember?.user?.fullName ||
    creatorMember?.user?.name ||
    "Unknown Creator";

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-base-200">
        <h3 className="mb-3 text-lg font-semibold">Group Info</h3>
        <div className="space-y-2 text-sm">
          <InfoRow label="Created" value={new Date(selectedGroup.createdAt).toLocaleDateString()} />
          <InfoRow label="Created by" value={creatorName} />
          <InfoRow label="Your Role" value={isAdmin ? "Admin" : "Member"} />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-base-200">
        <h3 className="mb-3 text-lg font-semibold">
          Members ({selectedGroup.totalMembers})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {selectedGroup.members?.map((member) => (
            <MemberItem key={member.user?._id || member.user} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-base-content/70">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

const MemberItem = ({ member }) => {
  const role = member.role || "member";
  const user = member.user;

  if (!user) return null;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-base-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 overflow-hidden rounded-full">
          <img
            src={user.avatar?.url || "/default-avatar.png"}
            alt={user.fullName}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <p className="font-semibold">{user.fullName}</p>
          <p className="text-xs text-base-content/60">{user.username}</p>
        </div>
      </div>
      {role === "admin" ? (
        <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full">
          <Crown className="w-3 h-3" />
          Admin
        </span>
      ) : (
        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">
          <Shield className="w-3 h-3" />
          Member
        </span>
      )}
    </div>
  );
};

export default GroupInfoPanel;