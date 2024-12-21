import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="flex h-full w-20 flex-col border-r border-base-300 transition-all duration-200 lg:w-72">
      {/* Header */}
      <div className="w-full border-b border-base-300 p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="hidden font-medium lg:block">Contacts</span>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="w-full overflow-y-auto py-3">
        {skeletonContacts.map((_, index) => (
          <div key={index} className="flex w-full items-center gap-3 p-3">
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-full" />
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
