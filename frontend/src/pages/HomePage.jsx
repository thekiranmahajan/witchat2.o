import useChatStore from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatSelectedWindow from "../components/ChatSelectedWindow";
import NoChatSelectedWindow from "../components/NoChatSelectedWindow";
import { useEffect } from "react";

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    if (selectedUser) {
      window.history.pushState({ selectedUser: true }, "Chat Selected");
    }

    const handleBackButton = (event) => {
      if (selectedUser) {
        event.preventDefault();
        setSelectedUser(null);
        window.history.pushState({}, "No Chat Selected");
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [selectedUser, setSelectedUser]);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="flex items-center justify-center px-4 pt-20">
        <div className="h-[calc(100vh-8rem)] w-full max-w-6xl rounded-lg bg-base-100 shadow-xl">
          <div className="flex h-full overflow-hidden rounded-lg">
            <Sidebar />

            {selectedUser ? <ChatSelectedWindow /> : <NoChatSelectedWindow />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
