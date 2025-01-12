import { useRef, useEffect } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import { X } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, deleteMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const headerRef = useRef(null);

  const handleDeleteMessages = async () => {
    if (window.confirm("Are you sure you want to delete all messages?")) {
      await deleteMessages(selectedUser._id);
    }
  };

  const handleTripleClick = () => {
    handleDeleteMessages();
  };

  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    let clickCount = 0;
    const handleClick = () => {
      clickCount++;
      if (clickCount === 3) {
        handleTripleClick();
        clickCount = 0;
      }
      setTimeout(() => {
        clickCount = 0;
      }, 500);
    };

    headerElement.addEventListener("click", handleClick);

    return () => {
      headerElement.removeEventListener("click", handleClick);
    };
  }, [headerRef]);

  return (
    <div
      ref={headerRef}
      className="sticky inset-x-0 top-0 z-20 border-b border-base-300 bg-base-100/50 p-2.5 px-3 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="relative size-10 rounded-full">
              <img src={selectedUser.profilePic} alt={selectedUser.fullName} />
            </div>
            <span
              className={`${onlineUsers.includes(selectedUser._id) ? "bg-success" : "bg-error"} absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-zinc-900`}
            ></span>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-xs text-base-content/70 sm:text-sm">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <button onClick={() => setSelectedUser(null)} className="mr-2">
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
