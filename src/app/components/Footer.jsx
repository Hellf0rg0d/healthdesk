import React from "react";
import { ArrowUp } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ marginTop: '100px' }}>
      <div className="flex items-center justify-center gap-4 p-4 bg-white text-gray-700">
        <p>&copy; 2025 HealthDesk. All rights reserved.</p>
        <a
          href="#"
          className="p-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 transition-colors group"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} className="animate-bounce group-hover:animate-none" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;