import React, { useState } from "react";
import { LogIn, Lock, User, Eye, EyeOff, Mail } from "lucide-react";

interface HostLoginProps {
  toggleToSignup: () => void;
}

const HostLogin: React.FC<HostLoginProps> = ({ toggleToSignup }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }
    alert(`Logging in as ${username}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <LogIn className="text-blue-600" size={32} />
        </div>

        <h2 className="text-3xl font-bold">Host Login</h2>
        <p className="text-gray-600 mt-2">
          Login to create and host quizzes securely.
        </p>
      </div>

      {/* Login Form */}
      <div className="space-y-6">
        {/* Username/Email */}
        <div>
          <label className="text-sm font-medium text-gray-800 mb-2 block">
            Username / Email
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-800 mb-2 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Remember me</span>
          </label>
          <button
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => alert("Forgot Password clicked")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow hover:shadow-md transition"
        >
          Login to Dashboard
        </button>

        {/* Signup Link */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={toggleToSignup}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostLogin;