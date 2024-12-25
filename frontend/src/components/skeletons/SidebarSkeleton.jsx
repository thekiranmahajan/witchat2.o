import { Users } from "lucide-react";
import useChatStore from "../../store/useChatStore";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);
  const { selectedUser } = useChatStore();

  return (
    <aside
      className={`h-full w-14 flex-col border-r border-base-300 transition-all duration-200 sm:w-16 lg:w-72 ${selectedUser ? "hidden sm:flex" : "flex"}`}
    >
      {/* Header */}
      <div className="w-full border-b border-base-300 lg:p-5">
        <div className="flex items-center justify-center gap-2 py-5 lg:justify-normal">
          <Users className="size-6" />
          <span className="hidden font-medium lg:block">Contacts</span>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="scrollbar-hide w-full overflow-y-auto overflow-x-hidden py-3">
        {skeletonContacts.map((_, index) => (
          <div
            key={index}
            className="flex w-full items-center gap-3 p-2  sm:p-3"
          >
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-10 rounded-full lg:size-12" />
            </div>

            <div className="hidden min-w-0 flex-1 text-left lg:block">
              <div className="skeleton mb-2 h-4 w-32" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
