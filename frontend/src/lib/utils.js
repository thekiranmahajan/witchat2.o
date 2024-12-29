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
