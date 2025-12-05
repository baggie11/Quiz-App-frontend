import React from "react";

const Footer : React.FC = () => {
    return (
        <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Branding */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#3b82f6] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">QV</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  QuizVision • National Language Translation Mission
                </p>
                <p className="text-xs text-gray-600">
                  An initiative by the Government of India
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Accessibility Statement
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#2563eb] transition-colors">
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} National Language Translation Mission
              </p>
              <p className="text-xs text-gray-500 mt-1">
                WCAG AA+ Compliant • ISO 27001 Certified
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
}

export default Footer;