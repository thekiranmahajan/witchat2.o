import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import AnimatedGridSection from "../components/AnimatedGridSection";
import { Loader2, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import InputField from "../components/InputField";

const LoginPage = () => {
  const { login, isLoggingIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };
  return (
    <div className="grid h-screen lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex flex-col items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="group flex flex-col items-center gap-2">
              <Logo />
              <h1 className="mt-2 text-2xl font-bold">Welcome back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">Don&apos;t have an account?</p>{" "}
            <Link to="/signup" className="link link-primary">
              Create account
            </Link>
          </div>

          {/* Right Side */}
        </div>
      </div>
      <AnimatedGridSection
        heading="Welcome back!"
        subHeading="Sign in to continue your conversations and catch up with your messages"
      />
    </div>
  );
};

export default LoginPage;
