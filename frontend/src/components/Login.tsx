import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Lock, User, Eye, EyeOff, Mail } from "lucide-react";

interface HostLoginProps {
  toggleToSignup: () => void;
}

const HostLogin: React.FC<HostLoginProps> = ({ toggleToSignup }) => {
  const [email,setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async() => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    //send login details to the backend
    try{
        const res = await fetch('http://localhost:3000/api/auth/user/login',{
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
            },
            body : JSON.stringify({email,password}),
        });

        if (!res.ok){
            const err = await res.json();
            throw new Error(err.message || "Login failed");
        }

        const data = await res.json(); // {token,user}

        localStorage.setItem("token",data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Login success");
        //navigate after login
        //navigate("/dashboard");
    }catch(err: any){
        console.log(err.message);
    }finally{
        console.log("loaded");
    }
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
            Email
          </label>
          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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