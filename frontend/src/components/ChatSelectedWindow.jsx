import { useEffect, useRef, useState, useCallback } from "react";
import useChatStore from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import useAuthStore from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatSelectedWindow = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setReplyMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const messageRefs = useRef({});

  const scrollToMessage = useCallback((messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [getMessages, selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-1 flex-col !scroll-smooth">
      <ChatHeader />
      {isMessagesLoading ? (
        <MessageSkeleton />
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden !scroll-smooth p-4 md:space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              ref={(el) => (messageRefs.current[message._id] = el)}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} ${highlightedMessageId === message._id ? "rounded-lg bg-base-300 transition-colors duration-500" : ""}`}
              onDoubleClick={() => setReplyMessage(message)}
            >
              <div className="avatar chat-image">
                <div className="size-7 rounded-full border md:size-10">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic
                        : selectedUser.profilePic
                    }
                    alt="Profile Picture"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="ml-1 text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div
                className={`chat-bubble flex flex-col break-words ${message.senderId === authUser._id ? "chat-bubble-secondary text-secondary-content" : "chat-bubble-primary text-primary-content"}`}
              >
                {message.repliedMessage && (
                  <div
                    onClick={() => scrollToMessage(message.repliedMessage._id)}
                    className="mb-2 cursor-pointer rounded border-l-4 border-info/80 bg-neutral p-2 transition-colors"
                  >
                    <p className="text-sm text-neutral-content/50">
                      {message.repliedMessage.text ||
                        (message.repliedMessage.image ? "📷 Image" : "Message")}
                    </p>
                  </div>
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="mb-2 max-w-52 rounded-md"
                  />
                )}
                {message.text && (
                  <p
                    className="flex flex-col whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{
                      __html: message.text.replace(
                        /(https?:\/\/[^\s]+)/g,
                        '<a href="$1" target="_blank" class="text-base-100 underline break-words">$1</a>',
                      ),
                    }}
                  ></p>
                )}
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      )}
      <MessageInput />
    </div>
  );
};

export default ChatSelectedWindow;
