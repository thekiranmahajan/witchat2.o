const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4">
      {skeletonMessages.map((_, index) => (
        <div
          key={index}
          className={`chat ${index % 2 === 0 ? "chat-start" : "chat-end"}`}
        >
          <div className="avatar chat-image">
            <div className="size-10 rounded-full">
              <div className="skeleton size-full rounded-full" />
            </div>
          </div>
          <div className="chat-header mb-1">
            <div className="skeleton h-4 w-16" />
          </div>
          <div className="chat-bubble bg-transparent p-0">
            <div className="skeleton h-16 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
