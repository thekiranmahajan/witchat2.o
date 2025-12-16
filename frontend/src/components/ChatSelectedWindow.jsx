import { useEffect, useRef, useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import useChatStore from "../store/useChatStore";
import { useVirtualizer } from "@tanstack/react-virtual";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import useAuthStore from "../store/useAuthStore";
import { formatMessageTime, processMessageText } from "../lib/utils";

const ChatSelectedWindow = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    isLoadingMore,
    hasMoreMessages,
    loadMoreMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setReplyMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const containerRef = useRef(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const prevMessagesRef = useRef([]);
  const messageRefs = useRef({});

  const virtualizer = useVirtualizer({
    count: Array.isArray(messages) ? messages.length : 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 84,
    overscan: 6,
  });

  const scrollToMessage = useCallback((messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 1000);
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
    let cancelled = false;
    const doLoad = async () => {
      if (!selectedUser) return;

      // preserve scroll position for reloads: capture current scrollTop
      const el = containerRef.current;
      const prevScrollTop = el ? el.scrollTop : null;

      await getMessages(selectedUser._id);

      // restore scrollTop if available so user doesn't get repositioned
      if (!cancelled && el && prevScrollTop != null) {
        requestAnimationFrame(() => {
          try {
            el.scrollTop = prevScrollTop;
          } catch {
            // ignore restore errors
          }
        });
      }
      subscribeToMessages();
    };

    doLoad();

    return () => {
      cancelled = true;
      unsubscribeFromMessages();
    };
  }, [getMessages, selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  // Do NOT auto-scroll on new messages or reloads. Only show the "New Messages" button
  // when a new message arrives and the user is not at the bottom.
  useEffect(() => {
    const prev = prevMessagesRef.current;
    const prevLast = prev && prev.length ? prev[prev.length - 1] : null;
    const last = messages && messages.length ? messages[messages.length - 1] : null;

    prevMessagesRef.current = messages;

    // If last message changed and user is not at bottom, prompt with scroll button.
    if (last && (!prevLast || last._id !== prevLast._id)) {
      if (!isAtBottom) {
        setShowScrollButton(true);
        setUnseenCount((c) => c + 1);
      }
    }
    // Do not auto-scroll in any case.
  }, [messages, isAtBottom]);

  return (
    <div className="flex flex-1 flex-col !scroll-smooth">
      <ChatHeader />
      {isMessagesLoading ? (
        <MessageSkeleton />
      ) : (
        <div
          ref={containerRef}
          onScroll={async (e) => {
            const el = e.target;
            // detect if user is at bottom (within 180px)
            const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
            const atBottom = distanceToBottom <= 180;
            setIsAtBottom(atBottom);
                if (atBottom) {
                  setShowScrollButton(false);
                  setUnseenCount(0);
                }

            // Only trigger load-more when user intentionally reaches very top (small threshold)
            const oldScrollTop = el.scrollTop;
            if (oldScrollTop <= 12 && hasMoreMessages && !isLoadingMore) {
              const prevScrollHeight = el.scrollHeight;
              await loadMoreMessages(selectedUser._id);
              // after messages prepended, restore scroll position so view doesn't jump
              requestAnimationFrame(() => {
                try {
                  // If user was exactly at top, keep them at top so they can continue scrolling
                  if (oldScrollTop <= 3) {
                    el.scrollTop = 0;
                  } else {
                    el.scrollTop = el.scrollHeight - prevScrollHeight + oldScrollTop;
                  }
                } catch {
                  // ignore
                }
              });
            }
          }}
          className="relative flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden !scroll-smooth p-4 md:space-y-4"
        >
          {/* Scroll-to-bottom floating button */}
          {(showScrollButton || unseenCount > 0) && (
            <button
              onClick={() => {
                scrollToBottom();
                setShowScrollButton(false);
                setUnseenCount(0);
              }}
              className="absolute right-4 bottom-24 z-10 btn btn-sm btn-primary flex items-center gap-2"
            >
              <MessageSquare className="size-4" />
              {unseenCount > 0 && (
                <span className="badge badge-secondary">{unseenCount}</span>
              )}
            </button>
          )}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-2">
              <div className="loading loading-dots" />
            </div>
          )}
          {Array.isArray(messages) && (
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const message = messages[virtualRow.index];
                if (!message) return null;
                    const {
                      _id,
                      createdAt,
                      senderId,
                      image = null,
                      text = "",
                      repliedMessage = null,
                      status = null,
                    } = message;

                return (
                  <div
                    key={_id}
                    ref={(el) => {
                      if (el) virtualizer.measureElement(el);
                      messageRefs.current[_id] = el;
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`chat ${senderId === authUser._id ? "chat-end" : "chat-start"} ${highlightedMessageId === _id ? "rounded-lg bg-base-300 transition-colors duration-500" : ""}`}
                  >
                        {/* Avatars removed to save bandwidth; alignment by chat-start / chat-end remains */}
                        <div className="chat-header mb-1">
                          <time className="ml-1 text-xs opacity-50">{formatMessageTime(createdAt)}</time>
                        </div>
                        <div
                          onDoubleClick={() => setReplyMessage(message)}
                          className={`chat-bubble flex flex-col break-words ${senderId === authUser._id ? "chat-bubble-secondary text-secondary-content" : "chat-bubble-primary text-primary-content"}`}
                        >
                          {repliedMessage && (
                            <div onClick={() => scrollToMessage(repliedMessage._id)} className="mb-2 cursor-pointer rounded border-l-4 border-info/80 bg-neutral p-2 transition-colors">
                              <p className="truncate text-sm text-neutral-content/50">{repliedMessage.text || (repliedMessage.image ? "📷 Image" : "Message")}</p>
                            </div>
                          )}
                          {image && <img src={image} alt="Attachment" className="mb-2 rounded-md max-w-[80%] sm:max-w-[60%]" />}
                          {text && <div dangerouslySetInnerHTML={{ __html: processMessageText(text) }} />}
                          {status === "sending" && <div className="mt-2 text-xs opacity-60">Sending…</div>}
                          {status === "failed" && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-error">
                              <span>Failed to send</span>
                              <button className="btn btn-ghost btn-xs" onClick={() => { const { resendMessage } = useChatStore.getState(); resendMessage(_id); }}>
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
          )}
          <div ref={messageEndRef} />
        </div>
      )}
      <MessageInput />
    </div>
  );
};

export default ChatSelectedWindow;
