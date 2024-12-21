import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isProfileUpdating, profileUpdate } = useAuthStore();
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);

  const handleProfileUpdate = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log(file);
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File is not an image");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedProfilePic(base64Image);
      await profileUpdate({ profilePic: base64Image });
    };
  };
  return (
    <div className="h-screen pt-20">
      <div className="mx-auto max-w-2xl p-4 py-8">
        <div className="space-y-8 rounded-xl bg-base-300 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Profile Picture  */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={
                  selectedProfilePic ||
                  authUser.profilePic ||
                  "./profile-picture.svg"
                }
                alt="Profile Picture"
                className="size-32 rounded-full border-4 object-cover"
              />
              <label
                htmlFor="profile-picture-upload"
                className={`absolute bottom-0 right-0 cursor-pointer rounded-full bg-base-content p-2 transition-all duration-200 hover:scale-105 ${isProfileUpdating ? "pointer-events-none animate-pulse" : ""}`}
              >
                <Camera className="size-5 text-base-200" />
                <input
                  type="file"
                  id="profile-picture-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileUpdate}
                  disabled={isProfileUpdating}
                />
              </label>
            </div>
            <p>
              {isProfileUpdating
                ? "Uploading.."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <User className="size-5" />
                Full Name
              </div>
              <p className="rounded-lg border bg-base-200 px-4 py-2.5">
                {authUser?.fullName}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="size-5" />
                Email
              </div>
              <p className="rounded-lg border bg-base-200 px-4 py-2.5">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 rounded-xl bg-base-300 p-6">
            <h2 className="mb-4 text-lg font-medium">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-zinc-700 pt-2">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
