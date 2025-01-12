import { useEffect, useRef, useState } from "react";
import useChatStore from "../store/useChatStore";
import { Image, LoaderPinwheel, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import TypingLoader from "./TypingLoader";

const MessageInput = () => {
  const {
    sendMessage,
    replyMessage,
    clearReplyMessage,
    selectedUser,
    users,
    isMessagesLoading,
    isImageUploading,
  } = useChatStore();
  const { socket, authUser } = useAuthStore();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [typingTimeout, setIsTypingTimeout] = useState(null);
  const fileInputRef = useRef();
  const inputRef = useRef(null);

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    if (!image) {
      toast.error("No image selected");
      return;
    }
    if (image.size > 30 * 1024 * 1024) {
      toast.error("File size exceeds 30MB");
      return;
    }
    if (!image.type.startsWith("image/")) {
      toast.error("File is not an image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(image);
  };
  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await sendMessage({ text: text.trim(), image: imagePreview });

      if (socket) {
        socket.emit("stop-typing", {
          typingUserId: authUser._id,
          receiverId: selectedUser._id,
        });
        setIsTyping(false);
        if (typingTimeout) clearTimeout(typingTimeout);
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      if (imagePreview) {
        toast.error("Image upload failed: " + error.message);
      } else {
        toast.error("Message send failed: " + error.message);
      }
      console.log("Error sending message:", error);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!selectedUser) return;

    if (socket && !isTyping) {
      setIsTyping(true);

      socket.emit("start-typing", {
        typingUserId: authUser._id,
        receiverId: selectedUser._id,
      });

      if (typingTimeout) clearTimeout(typingTimeout);

      const timeout = setTimeout(() => {
        socket.emit("stop-typing", {
          typingUserId: authUser._id,
          receiverId: selectedUser._id,
        });
        setIsTyping(false);
      }, 2000);

      setIsTypingTimeout(timeout);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target.result);
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  useEffect(() => {
    const handlePasteEvent = (e) => handlePaste(e);
    window.addEventListener("paste", handlePasteEvent);
    return () => window.removeEventListener("paste", handlePasteEvent);
  }, []);

  useEffect(() => {
    const selectedUserTyping = users.find(
      (user) => user._id === selectedUser?._id && user.isTyping,
    );
    setShowTypingIndicator(!!selectedUserTyping);
  }, [users, selectedUser]);

  return (
    <div className="sticky bottom-0 w-full bg-base-100/90 p-3 sm:p-4">
      <div
        className={`transition-opacity duration-300 ${showTypingIndicator && selectedUser && !isMessagesLoading ? "opacity-100" : "opacity-0"}`}
      >
        <TypingLoader />
      </div>

      {replyMessage && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1">
            <p className="text-sm text-base-content">
              Replying to: {replyMessage.text || "📷 Image"}
            </p>
          </div>
          <button
            type="button"
            onClick={clearReplyMessage}
            className="btn btn-circle btn-ghost"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
      {/* Image Preview over input field */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Image Preview"
              className="size-20 border-collapse rounded-lg border-zinc-700 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-base-300"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {/* Message input bar */}
      <form
        className="flex items-center gap-1 sm:gap-2"
        onSubmit={handleSendMessage}
      >
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            className="input input-md input-bordered w-full rounded-lg"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
            ref={inputRef}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`btn btn-circle btn-ghost relative flex items-center justify-center ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current.click()}
          >
            {isImageUploading ? (
              <LoaderPinwheel className="size-5 animate-spin text-emerald-500 sm:size-6" />
            ) : (
              <Image className="size-5 sm:size-6" />
            )}
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-circle btn-ghost"
          disabled={!text.trim() && !imagePreview}
        >
          <Send className="size-6 md:size-7" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
