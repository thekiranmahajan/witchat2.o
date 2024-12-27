import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { Loader2, Lock, Mail, User } from "lucide-react";
import InputField from "../components/InputField";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import AnimatedGridSection from "../components/AnimatedGridSection";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const { signup, isSigningUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Email is invalid");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    signup(formData);
  };
  return (
    <div className="grid h-screen lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex flex-col items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="group flex flex-col items-center gap-2">
              <Logo />
              <h1 className="mt-2 text-2xl font-bold">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              type="text"
              fieldName="fullName"
              placeholder="Kiran Mahajan"
              label="Full Name"
              icon={User}
              formData={formData}
              setFormData={setFormData}
            />
            <InputField
              type="text"
              fieldName="email"
              placeholder="kiran@example.com"
              label="Email"
              icon={Mail}
              formData={formData}
              setFormData={setFormData}
            />
            <InputField
              type={showPassword ? "text" : "password"}
              fieldName="password"
              placeholder="••••••••"
              label="Password"
              icon={Lock}
              formData={formData}
              setFormData={setFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">Already have an account?</p>{" "}
            <Link to="/login" className="link link-primary">
              Sign In
            </Link>
          </div>

          {/* Right Side */}
        </div>
      </div>
      <AnimatedGridSection
        heading="Join our community"
        subHeading="Connect with friends, share moments, and stay touch with your loved ones"
      />
    </div>
  );
};

export default SignUpPage;
