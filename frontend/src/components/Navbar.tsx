import React from "react";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { speak } from "../services/speech/tts";

const Navbar: React.FC = () => {
  return (
    <div>
      {/* Header with subtle accent */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#3b82f6] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">QV</span>
                </div>
                <Link to = "/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-[#2563eb] bg-clip-text text-transparent">
                  QuizVision
                </h1>
                </Link>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200"></div>

              {/* Organization Logos */}
              <div className="flex items-center space-x-6">

                {/* SSN Logo */}
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/ssn-logo.png"
                    alt="SSN Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                {/* MeitY Logo */}
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/meity.png"
                    alt="MeitY Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </div>
            </div>

           <Link
            to="/auth"
            tabIndex={0}
            onFocus={() => speak("Host Login")}
            className="px-5 py-2.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] 
                        hover:from-[#1d4ed8] hover:to-[#2563eb] 
                        text-white font-medium rounded-lg shadow-sm 
                        flex items-center space-x-2 group"
            >
            <LogIn size={18} />
            <span className="text-sm">Host Login</span>
            </Link>

          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
