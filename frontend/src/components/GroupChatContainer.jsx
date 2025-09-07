import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import GroupInfoPanel from "./groups/GroupInfoPanel";
import { useGroupMessagesStore } from "../store/useGroupMessagesStore";
import { useAuthStore } from "../store/userAuthStore";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    groupMessages,
    isGroupMessagesLoading,
    getGroupMessages,
    activeGroup,
    // Adding subscription functionality for real-time group message updates
    // This was missing in the old implementation
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupMessagesStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Updated useEffect: Added real-time subscription for group messages
  // Previously only fetched messages once, now subscribes for live updates
  // This ensures group members see new messages immediately without refresh
  // useEffect(() => {
  //   if (activeGroup) {
  //     getGroupMessages(activeGroup._id);
  //     subscribeToGroupMessages();
  //     return () => unsubscribeFromGroupMessages();
  //   }
  // }, [activeGroup, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (!activeGroup) return;

    const socket = useAuthStore.getState().socket;

    // 1. Fetch existing messages
    getGroupMessages(activeGroup._id);

    // 2. Join group room (VERY IMPORTANT for realtime to work)
    if (socket) {
      socket.emit("joinGroup", activeGroup._id);
    }

    // 3. Subscribe for new messages
    subscribeToGroupMessages();

    return () => {
      // Leave group when switching groups or unmounting
      if (socket) {
        socket.emit("leaveGroup", activeGroup._id);
      }
      unsubscribeFromGroupMessages();
    };
  }, [
    activeGroup,
    getGroupMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  ]);

  // Auto-scroll functionality remains the same - works well for group chats
  useEffect(() => {
    if (messageEndRef.current && groupMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (isGroupMessagesLoading) {
    return (
      <div className="relative flex flex-col flex-1 overflow-auto">
        <ChatHeader setShowGroupInfo={setShowGroupInfo} />
        <MessageSkeleton />
        <MessageInput />
        {showGroupInfo && (
          <GroupInfoPanel onClose={() => setShowGroupInfo(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-1 overflow-auto">
      <ChatHeader setShowGroupInfo={setShowGroupInfo} />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* OLD SIMPLE MESSAGE LAYOUT - COMMENTED OUT
        {groupMessages.map((message, index) => (
          <div
            key={message._id || `message-${index}`}
            className={`flex ${
              message.senderId === authUser?._id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                message.senderId === authUser?._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.text && (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="Message Attachment"
                  className="mt-2 rounded max-h-60"
                />
              )}
              <div className="mt-1 text-xs text-gray-600">
                {formatMessageTime(message.createdAt)}
              </div>
            </div>
          </div>
        ))}
        */}

        {/* NEW CHAT BUBBLE DESIGN FOR GROUP CHATS */}
        {/* Using DaisyUI chat component structure like ChatContainer but with group-specific colors */}
        {groupMessages.map((message, index) => {
          // FIXED: Handle populated senderId object vs direct ID comparison
          // When messages are fetched from DB, senderId is populated with user object
          // When messages come from real-time, senderId might be just the ID string
          // OLD COMPARISON - COMMENTED OUT (was causing messages to appear on wrong side after refresh):
          // const messageSenderIdStr = String(message.senderId);
          // const authUserIdStr = String(authUser._id);
          // const isCurrentUserMessage = messageSenderIdStr === authUserIdStr;

          // NEW COMPARISON - Fixed to handle both populated and non-populated senderId
          const messageSenderId = message.senderId._id || message.senderId; // Handle populated object
          const messageSenderIdStr = String(messageSenderId);
          const authUserIdStr = String(authUser._id);
          const isCurrentUserMessage = messageSenderIdStr === authUserIdStr;

          // Debug logging to verify the fix
          console.log(
            "Message sender ID:",
            messageSenderId,
            "(type:",
            typeof messageSenderId,
            ")"
          );
          console.log(
            "Auth user ID:",
            authUser._id,
            "(type:",
            typeof authUser._id,
            ")"
          );
          console.log("Is current user message:", isCurrentUserMessage);

          return (
            <div
              key={message._id}
              className={`chat ${
                isCurrentUserMessage ? "chat-end" : "chat-start"
              }`}
              ref={index === groupMessages.length - 1 ? messageEndRef : null}
            >
              {/* Avatar Section */}
              {/* Show avatar for all messages in group chat to identify senders */}
              <div className="chat-image avatar">
                <div className="border rounded-full size-10">
                  <img
                    src={
                      isCurrentUserMessage
                        ? authUser.avatar?.url || "/avatar.png"
                        : // FIXED: Handle both populated and non-populated senderId for avatar
                          message.senderId?.avatar?.url ||
                          message.senderAvatar ||
                          "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Message Header with Sender Name and Time */}
              {/* In group chats, we show sender name for identification */}
              <div className="mb-1 chat-header">
                {!isCurrentUserMessage && (
                  <span className="text-sm font-medium">
                    {/* FIXED: Handle both populated and non-populated senderId for name */}
                    {message.senderId?.fullName ||
                      message.senderName ||
                      "Unknown User"}
                  </span>
                )}
                <time className="ml-1 text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Message Bubble with Group Chat Specific Colors */}
              {/* Using different colors for group chat: purple for sender, teal for receiver */}
              {/* This differentiates group chats from private chats visually */}
              <div
                className={`flex flex-col chat-bubble ${
                  isCurrentUserMessage
                    ? "chat-bubble-secondary bg-purple-600 text-white" // Purple for sender in group chat
                    : "chat-bubble-primary bg-teal-600 text-white" // Teal for receiver in group chat
                }`}
              >
                {/* Multiple Image Support */}
                {/* Enhanced from old single image to support multiple images like ChatContainer */}
                {/* FIXED: Changed from message.image to message.images to match group message model */}
                {message.images && (
                  <div className="mb-2">
                    {Array.isArray(message.images) ? (
                      message.images.length === 1 ? (
                        // Single image from array - display at full size
                        <img
                          src={message.images[0]}
                          alt="Attachment"
                          className="sm:max-w-[200px] rounded-md"
                        />
                      ) : (
                        // Multiple images - display in a grid layout
                        // This was missing in the old implementation
                        <div className="grid grid-cols-2 gap-2 max-w-[300px]">
                          {message.images.map((imageUrl, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={imageUrl}
                              alt={`Attachment ${imgIndex + 1}`}
                              className="object-cover w-full rounded-md aspect-square"
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      // Single image as string - display normally
                      // This handles cases where backend might send single image as string
                      <img
                        src={message.images}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md"
                      />
                    )}
                  </div>
                )}
                {/* Message Text */}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput />
      {showGroupInfo && (
        <GroupInfoPanel onClose={() => setShowGroupInfo(false)} />
      )}
    </div>
  );
};

export default GroupChatContainer;
