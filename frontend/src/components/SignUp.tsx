import React, { useState } from "react";
import { UserPlus, Lock, User, Mail, Eye, EyeOff, Phone, Briefcase } from "lucide-react";
import { API } from "../api/config";

interface HostSignupProps {
  toggleToLogin: () => void;
}

const HostSignup: React.FC<HostSignupProps> = ({ toggleToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async() => {
    const { fullName, email, password, confirmPassword } = formData;
    
    if (!fullName || !email || !password || !confirmPassword) {
      alert("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    //send the data to the backend
    try{
        const response = await fetch(`${API.node}/api/auth/user/signup`,{
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
            },
            body : JSON.stringify({
                fullName,
                email,
                password,
            }),
        });

        const data = await response.json();
        if (!response.ok){
            alert(data.message || "Signup failed");
            return;
        }
        alert("Signup successful");
    }catch(error){
        console.error("Signup error:",error);
        alert("Please try again later.")
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 ">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <UserPlus className="text-blue-600" size={32} />
        </div>

        <h2 className="text-3xl font-bold">Create Host Account</h2>
        <p className="text-gray-600 mt-2">
          Sign up to start creating and hosting interactive quizzes.
        </p>
      </div>

      {/* Signup Form */}
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-gray-800 mb-2 block">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Email & Username Row */}
        <div className="">
          <div>
            <label className="text-sm font-medium text-gray-800 mb-2 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

         
        </div>

        

        {/* Password Row */}
        <div className="">
          <div>
            <label className="text-sm font-medium text-gray-800 mb-2 block">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
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
          <br/>
          <div>
            <label className="text-sm font-medium text-gray-800 mb-2 block">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold font-semibold rounded-xl shadow hover:shadow-md transition"
        >
          Create Account
        </button>

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={toggleToLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostSignup;