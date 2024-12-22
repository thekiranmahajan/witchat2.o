import { useEffect } from "react";
import useChatStore from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const ChatSelectedWindow = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } =
    useChatStore();

  useEffect(() => {
    getMessages(selectedUser._id);
  }, [getMessages, selectedUser._id]);

  return (
    <div className="flex-1 flex-col overflow-auto">
      <ChatHeader />
      {isMessagesLoading ? <MessageSkeleton /> : ""}
      <MessageInput />
    </div>
  );
};

export default ChatSelectedWindow;
