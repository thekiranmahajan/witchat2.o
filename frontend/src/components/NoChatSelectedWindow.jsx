import Logo from "./Logo";

const NoChatSelectedWindow = () => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center bg-base-100/50 px-2 lg:p-16">
      <div className="max-w-md space-y-6 text-center">
        <div className="mb-4 flex justify-center gap-4">
          <div className="relative">
            <Logo className="size-16 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Welcome to WitChat 2.o</h2>
        <p className="text-base-content/60">
          Select a conversation from sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelectedWindow;
