import User from "../models/user.model.js";
import Messsage from "../models/message.model.js";

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
    const loggedInUserId = req.user_id;

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
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
