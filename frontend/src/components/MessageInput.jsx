import { useRef, useState } from "react";
import useChatStore from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const { sendMessage } = useChatStore();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    if (!image) {
      toast.error("No image selected");
      return;
    }
    if (image.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB");
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
      await sendMessage({ text: text.trim(), image: imagePreview });

      // Clearing input fields after sending message
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  return (
    <div className="sticky bottom-0 w-full bg-base-100/90 p-3 sm:p-4">
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
            onChange={(e) => setText(e.target.value)}
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
            className={`btn btn-circle btn-ghost flex ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current.click()}
          >
            <Image className="size-5 sm:size-6" />
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
