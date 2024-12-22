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
  const handleRemoveImage = () => {};
  const handleSendMessage = async (e) => {};

  return (
    <div className="w-full p-4">
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
              className="absolute -top-1.5 flex size-5 items-center justify-center rounded-full bg-base-300"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {/* Message input bar */}
      <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="input input-sm input-bordered w-full rounded-lg sm:input-md"
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
            className={`btn btn-circle hidden sm:flex ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current.click()}
          >
            <Image className="size-6" />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-circle btn-sm"
          disabled={!text.trim() && !imagePreview}
        >
          <Send className="size-6 md:size-7" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
