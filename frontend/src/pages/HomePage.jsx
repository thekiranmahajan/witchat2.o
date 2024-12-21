import useChatStore from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatSelectedWindow from "../components/ChatSelectedWindow";
import NoChatSelectedWindow from "../components/NoChatSelectedWindow";

const HomePage = () => {
  const { selectedUser } = useChatStore();
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
