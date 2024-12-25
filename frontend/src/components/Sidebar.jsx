import { useEffect, useState } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { users, getUsers, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineUsersOnly, setShowOnlineUsersOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineUsersOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside
      className={`h-full w-14 flex-col border-r border-base-300 transition-all duration-200 sm:w-16 lg:w-72 ${selectedUser ? "hidden sm:flex" : "flex"}`}
    >
      <div className="w-full border-b border-base-300 lg:p-5">
        <div className="flex items-center justify-center gap-2 py-5 lg:justify-normal">
          <Users className="size-6" />
          <span className="hidden font-medium lg:block">Contacts</span>
        </div>
        {/* Online filter */}
        <div className="mt-3 hidden items-center gap-2 lg:flex">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineUsersOnly}
              onChange={(e) => setShowOnlineUsersOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>
      <div className="scrollbar-hide w-full overflow-y-auto overflow-x-hidden py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user._id)}
            className={`flex w-full items-center gap-3 p-2 transition-colors hover:bg-base-300 sm:p-3 ${selectedUser && selectedUser._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic}
                alt={user.fullName}
                className="size-10 rounded-full object-cover lg:size-12"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 ring-2 ring-zinc-900"></span>
              )}
            </div>
            <div className="hidden min-w-0 text-left lg:block">
              <div className="truncate font-medium">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className="py-4 text-center text-zinc-500">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
