export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const processMessageText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const emojiRegex =
    /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}){1,2}$/u;

  if (emojiRegex.test(text)) {
    return `<span class="text-5xl" >${text}</span>`;
  }

  return text.replace(urlRegex, (url) => {
    return `
    <a href="${url}"  
    target="_blank"
    rel="noopener noreferrer"
    class="text-secondary-content underline">${url}</a>`;
  });
};

export const formatLastSeen = (date) => {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) {
    return "Last seen just now";
  } else if (diffMin < 60) {
    return `Last seen ${diffMin}min${diffMin === 1 ? "" : "s"} ago`;
  } else if (diffHr < 24) {
    return `Last seen ${diffHr}hour${diffHr === 1 ? "" : "s"} ago`;
  } else if (diffDay === 1) {
    return `Last seen yesterday at ${d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else {
    return `Last seen on ${d.toLocaleDateString()} at ${d.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    )}`;
  }
};
