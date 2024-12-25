import User from "../models/user.model.js";
import Messsage from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getSocketIdFromUserId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chatPartnerId } = req.params;
    const loggedInUserId = req.user._id;

    const messages = await Messsage.find({
      $or: [
        {
          senderId: loggedInUserId,
          receiverId: chatPartnerId,
        },
        {
          senderId: chatPartnerId,
          receiverId: loggedInUserId,
        },
      ],
    }).populate("repliedMessage");
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, repliedMessage } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Messsage({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      repliedMessage,
    });

    await newMessage.populate("repliedMessage");
    await newMessage.save();

    const populatedMessage = await newMessage.populate("repliedMessage");

    const receiverSocketId = getSocketIdFromUserId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
