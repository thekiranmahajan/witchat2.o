import { useEffect } from "react";
import useChatStore from "../store/useChatStore";
import SidebarSkeleton from "./Skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { users, getUsers, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const onlineUsers = [];

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside className="flex h-full w-20 flex-col border-r border-base-300 transition-all duration-200 lg:w-72">
      <div className="w-full border-b border-base-300 p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="hidden font-medium lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter */}
        <div className="w-full overflow-y-auto py-3">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user._id)}
              className={`flex w-full items-center gap-3 p-3 transition-colors hover:bg-base-300 ${selectedUser && selectedUser._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "./profile-picture.svg"}
                  alt={user.fullName}
                  className="size-12 rounded-full object-cover"
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
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
