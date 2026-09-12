import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotModal from './ChatbotModal';

const FloatingChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { pathname } = useLocation();

  // Hide visually on assistant page instead of returning null, 
  // so that ChatbotModal doesn't unmount and interrupt async operations like createSession.
  const isHidden = pathname === '/assistant';

  useEffect(() => {
    if (pathname === '/assistant') {
      setIsChatOpen(false);
    }
  }, [pathname]);

  return (
    <div style={{ display: isHidden ? 'none' : 'block' }}>
      {!isChatOpen && (
        <div 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center cursor-pointer z-[9999] transition-all duration-300 shadow-xl text-primary group"
        >
          <svg 
            color="inherit" 
            viewBox="0 0 32 32" 
            className="w-8 h-8"
          >
            {/* Solid White Bubble (always visible) */}
            <path fill="#FFFFFF" d="M12.63,26.46H8.83a6.61,6.61,0,0,1-6.65-6.07,89.05,89.05,0,0,1,0-11.2A6.5,6.5,0,0,1,8.23,3.25a121.62,121.62,0,0,1,15.51,0A6.51,6.51,0,0,1,29.8,9.19a77.53,77.53,0,0,1,0,11.2,6.61,6.61,0,0,1-6.66,6.07H19.48L12.63,31V26.46"></path>
            
            {/* Inner Cutout (visible normally, hidden on hover) */}
            <path fill="currentColor" className="transition-opacity duration-300 opacity-100 group-hover:opacity-0" d="M19.57,21.68h3.67a2.08,2.08,0,0,0,2.11-1.81,89.86,89.86,0,0,0,0-10.38,1.9,1.9,0,0,0-1.84-1.74,113.15,113.15,0,0,0-15,0A1.9,1.9,0,0,0,6.71,9.49a74.92,74.92,0,0,0-.06,10.38,2,2,0,0,0,2.1,1.81h3.81V26.5Z"></path>

            {/* Three Dots (hidden normally, visible on hover) */}
            <g fill="currentColor" className="transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              <circle cx="10" cy="14.5" r="1.8" className="group-hover:animate-chat-wave-1" />
              <circle cx="16" cy="14.5" r="1.8" className="group-hover:animate-chat-wave-2" />
              <circle cx="22" cy="14.5" r="1.8" className="group-hover:animate-chat-wave-3" />
            </g>
          </svg>
        </div>
      )}

      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default FloatingChatButton;
