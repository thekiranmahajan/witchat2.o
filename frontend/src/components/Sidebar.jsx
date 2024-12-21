import { useEffect } from "react";
import useChatStore from "../store/useChatStore";
import SidebarSkeleton from "./Skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { users, getUsers, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const onlineUsers = [];

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (!isUsersLoading) return <SidebarSkeleton />;
  return <div>Sidebar</div>;
};

export default Sidebar;
