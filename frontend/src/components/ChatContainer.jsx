import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/userAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Debug logs before rendering
  // console.log("Auth user:", authUser);
  // console.log("Auth user ID:", authUser?._id, "Type:", typeof authUser?._id);
  // console.log("Messages:", messages);
  // console.log(
  //   "First message senderId:",
  //   messages[0]?.senderId,
  //   "Type:",
  //   typeof messages[0]?.senderId
  // );

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <ChatHeader />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message, index) => {
          // Convert both IDs to strings for proper comparison since MongoDB ObjectIds can be compared as strings
          const messageSenderIdStr = String(message.senderId);
          const authUserIdStr = String(authUser._id);
          const isCurrentUserMessage = messageSenderIdStr === authUserIdStr;

          // Debug logs for each message
          // console.log("Message senderId (string):", messageSenderIdStr);
          // console.log("Auth user ID (string):", authUserIdStr);
          // console.log("Are they equal?", isCurrentUserMessage);
          // console.log(
          //   "Will use class:",
          //   isCurrentUserMessage ? "chat-end" : "chat-start"
          // );
          // console.log(
          //   "Message image:",
          //   message.image,
          //   "Type:",
          //   typeof message.image,
          //   "IsArray:",
          //   Array.isArray(message.image)
          // );
          // console.log("---");

          return (
            <div
              key={message._id}
              className={`chat ${
                isCurrentUserMessage ? "chat-end" : "chat-start"
              }`}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="border rounded-full size-10">
                  <img
                    src={
                      isCurrentUserMessage
                        ? authUser.avatar?.url || "/avatar.png"
                        : selectedUser.avatar?.url ||
                          selectedUser.profilePic ||
                          "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="mb-1 chat-header">
                <time className="ml-1 text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="flex flex-col chat-bubble">
                {message.image && (
                  <div className="mb-2">
                    {Array.isArray(message.image) ? (
                      message.image.length === 1 ? (
                        // Single image from array - display at full size
                        <img
                          src={message.image[0]}
                          alt="Attachment"
                          className="sm:max-w-[200px] rounded-md"
                        />
                      ) : (
                        // Multiple images - display in a grid
                        <div className="grid grid-cols-2 gap-2 max-w-[300px]">
                          {message.image.map((imageUrl, imgIndex) => (
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
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md"
                      />
                    )}
                  </div>
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
