import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, MoreHorizontal, Maximize2, Plus, Smile, Mic, ArrowUp, Mail, Volume2, VolumeX, Zap, History, Search, Trash2, Sparkles, Square, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useChatStream } from '../../hooks/useChatStream';
import { useFingerprint } from '../../hooks/useFingerprint';
import { createSession, fetchSessionMessages } from '../../services/chatServices';
import ChatHistoryModal from './ChatHistoryModal';
import { assets } from '../../assets/assets';
import { useAppSelector } from '../../redux/store.js';
import { toast } from 'react-hot-toast';

const ChatbotModal = ({ isOpen, onClose }) => {
  const user = useAppSelector((state) => state.userState.user);
  const isAuthenticated = !!user;

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const stored = localStorage.getItem('sharedActiveChatId');
    return (stored === 'new' || !stored) ? null : stored;
  });
  const [inputValue, setInputValue] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const { isGenerating, streamText, streamError, startStream, startGuestStream, stopStream } = useChatStream();
  const { visitorId } = useFingerprint();
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // Handle Authentication State Changes (Logout/Login)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!isAuthenticated) {
        // Initial load as guest: restore chat
        const storedGuestHistory = localStorage.getItem('guestChatHistory');
        if (storedGuestHistory) {
          try {
            setMessages(JSON.parse(storedGuestHistory));
          } catch (e) {
            setMessages([]);
          }
        }
      }
      return;
    }

    // Actual transitions
    if (!isAuthenticated) {
      // Logged in -> Logged out
      setActiveSessionId(null);
      localStorage.removeItem('sharedActiveChatId');
      localStorage.removeItem('guestChatHistory');
      setMessages([]);
    } else {
      // Logged out -> Logged in
      localStorage.removeItem('guestChatHistory');
      setMessages([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeSessionId) {
        localStorage.setItem('sharedActiveChatId', activeSessionId);
      } else {
        localStorage.setItem('sharedActiveChatId', 'new');
      }
    }
  }, [activeSessionId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && messages.length > 0) {
      // Don't save if it's currently generating because streamText is temporary
      if (!isGenerating) {
        localStorage.setItem('guestChatHistory', JSON.stringify(messages));
      }
    }
  }, [messages, isAuthenticated, isGenerating]);

  useEffect(() => {
    const loadActiveSessionMessages = async () => {
      if (!activeSessionId || !isAuthenticated) return;
      try {
        const messagesData = await fetchSessionMessages(activeSessionId);
        const formattedMessages = (Array.isArray(messagesData) ? messagesData : messagesData.messages || [])
          .reverse()
          .map(msg => ({
            id: msg._id,
            sender: msg.role === 'user' ? 'user' : 'system',
            content: msg.content
          }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load active session messages', error);
        setActiveSessionId(null);
      }
    };
    
    if (activeSessionId && messages.length === 0 && isAuthenticated) {
      loadActiveSessionMessages();
    }
  }, [activeSessionId, isAuthenticated]);


  const handleNewChat = () => {
    if (isGenerating || isCreatingSession) {
      stopStream();
      setIsCreatingSession(false);
    }
    setActiveSessionId(null);
    setMessages([]);
    if (!isAuthenticated) {
      localStorage.removeItem('guestChatHistory');
    }
  };

  const handleSend = async (textToSend = inputValue) => {
    if (!textToSend.trim() || isGenerating || isCreatingSession) return;
    
    const userPrompt = textToSend.trim();
    const newUserMsg = {
      id: Date.now().toString(),
      sender: 'user',
      content: userPrompt
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    if (textToSend === inputValue) {
      setInputValue('');
    }

    if (!isAuthenticated) {
      // Guest Chat Flow
      try {
        await startGuestStream([...messages, newUserMsg], userPrompt, visitorId, 'gemini-3.5-flash', (finalMessage) => {
          setMessages(prev => [...prev, {
            id: finalMessage._id || Date.now().toString(),
            sender: finalMessage.role === 'user' ? 'user' : 'system',
            content: finalMessage.content
          }]);
        });
      } catch (error) {
        console.error("Guest chat generation error", error);
      }
      return;
    }

    // Authenticated Flow
    let targetSessionId = activeSessionId;

    try {
      if (!targetSessionId) {
        setIsCreatingSession(true);
        const newSession = await createSession(userPrompt);
        setIsCreatingSession(false);
        targetSessionId = newSession._id;
        setActiveSessionId(targetSessionId);
      }

      await startStream(targetSessionId, userPrompt, 'gemini-3.5-flash', (finalMessage) => {
        setMessages(prev => [...prev, {
          id: finalMessage._id,
          sender: finalMessage.role === 'user' ? 'user' : 'system',
          content: finalMessage.content
        }]);
      });
    } catch (error) {
      console.error("Chat generation error", error);
      setIsCreatingSession(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSessionSelect = async (sessionId) => {
    try {
      const messagesData = await fetchSessionMessages(sessionId);
      const formattedMessages = (Array.isArray(messagesData) ? messagesData : messagesData.messages || [])
        .reverse()
        .map(msg => ({
          id: msg._id,
          sender: msg.role === 'user' ? 'user' : 'system',
          content: msg.content
        }));
      setMessages(formattedMessages);
      setActiveSessionId(sessionId);
      setIsHistoryOpen(false);
    } catch (error) {
      console.error('Failed to load session messages', error);
    }
  };



  return (
    <>
      <style>
        {`
          .chat-scroll::-webkit-scrollbar {
            width: 14px;
          }
          .chat-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-scroll::-webkit-scrollbar-thumb {
            background-color: #a1a1aa;
            border-radius: 10px;
            border: 4px solid transparent;
            background-clip: padding-box;
          }
          .chat-scroll::-webkit-scrollbar-thumb:hover {
            background-color: #71717a;
          }

          /* Markdown Styles */
          .markdown-body {
            font-size: 14px;
            line-height: 1.6;
          }
          .markdown-body p {
            margin-bottom: 0.5em;
          }
          .markdown-body p:last-child {
            margin-bottom: 0;
          }
          .markdown-body strong {
            font-weight: 600;
            color: inherit;
          }
          .markdown-body ul {
            list-style-type: disc;
            padding-left: 1.5em;
            margin-bottom: 0.5em;
          }
          .markdown-body ol {
            list-style-type: decimal;
            padding-left: 1.5em;
            margin-bottom: 0.5em;
          }
          .markdown-body li {
            margin-bottom: 0.25em;
          }
          .markdown-body a {
            color: #2563eb;
            text-decoration: underline;
          }
          .markdown-body code {
            background-color: rgba(0,0,0,0.05);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.9em;
          }
          .markdown-body pre {
            background-color: #f4f4f5;
            padding: 1em;
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: 0.5em;
          }
          .markdown-body pre code {
            background-color: transparent;
            padding: 0;
          }
          .chat-scroll::-webkit-scrollbar-button:vertical:decrement {
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a1a1aa"><path d="M12 8l7 9H5z"/></svg>') no-repeat center center;
            background-size: 10px;
            height: 20px;
          }
          .chat-scroll::-webkit-scrollbar-button:vertical:increment {
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a1a1aa"><path d="M12 16l-7-9h14z"/></svg>') no-repeat center center;
            background-size: 10px;
            height: 20px;
          }
        `}
      </style>
      <div className={`fixed bottom-4 right-4 ${isExpanded ? 'w-[800px]' : 'w-[420px]'} max-w-[calc(100%-32px)] h-[calc(100vh-32px)] max-h-[900px] bg-[#f7f7f8] rounded-[24px] shadow-2xl flex flex-col z-[9999] overflow-hidden border border-gray-100 font-sans transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none'}`}>
      
      {/* Header Area */}
      <div className="relative pt-4 px-4 flex justify-between items-start z-10">
        
        {/* Expand Button */}
        <div className="relative flex">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="peer cursor-pointer w-8 h-8 rounded-full bg-gray-200/50 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-800">
              {isExpanded ? (
                <>
                  <polyline points="5 10 10 10 10 5" />
                  <polyline points="19 14 14 14 14 19" />
                </>
              ) : (
                <>
                  <polyline points="11 6 6 6 6 11" />
                  <polyline points="13 18 18 18 18 13" />
                </>
              )}
            </svg>
          </button>
          <div className="pointer-events-none absolute left-1/2 top-10 z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100">
            {isExpanded ? 'Collapse' : 'Expand'}
            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gray-900" />
          </div>
        </div>
        
        {/* Floating Header Pill */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-sm px-4 py-1.5 flex items-center gap-3">
          <div className="relative">
            <img src={assets.chatRobotIcon} alt="AI" className="w-7 h-7 object-cover rounded-full" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-gray-900 leading-tight">AI assistant</span>
            <span className="text-[11px] text-gray-500 leading-tight">Text Support</span>
          </div>
        </div>

        <div className="flex gap-2">
          {/* New Chat Button */}
          {isAuthenticated && (
            <div className="relative flex">
              <button 
                onClick={handleNewChat}
                disabled={isCreatingSession}
                className={`peer cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-colors text-gray-800 ${
                  isCreatingSession ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-gray-200/50 hover:bg-gray-200'
                }`}
              >
                <Plus className="w-[18px] h-[18px]" />
              </button>
              <div className="pointer-events-none absolute left-1/2 top-10 z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100">
                New Chat
                <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gray-900" />
              </div>
            </div>
          )}

          {/* History Button */}
          {isAuthenticated && (
            <div className="relative flex">
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="peer cursor-pointer w-8 h-8 rounded-full bg-gray-200/50 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-800"
              >
                <History className="w-[18px] h-[18px]" />
              </button>
              <div className="pointer-events-none absolute left-1/2 top-10 z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100">
                Past Conversations
                <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gray-900" />
              </div>
            </div>
          )}

          {/* Options Button */}
          <div className="relative flex">
            <button 
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={`peer cursor-pointer w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors ${isOptionsOpen ? 'bg-gray-200' : 'bg-gray-200/50'}`}
            >
              <svg viewBox="0 0 28 28" aria-hidden="true" className="w-5 h-5 text-gray-800" fill="currentColor">
                <path d="M7,16 C8.1045695,16 9,15.1045695 9,14 C9,12.8954305 8.1045695,12 7,12 C5.8954305,12 5,12.8954305 5,14 C5,15.1045695 5.8954305,16 7,16 Z M14,16 C15.1045695,16 16,15.1045695 16,14 C16,12.8954305 15.1045695,12 14,12 C12.8954305,12 12,12.8954305 12,14 C12,15.1045695 12.8954305,16 14,16 Z M21,16 C22.1045695,16 23,15.1045695 23,14 C23,12.8954305 22.1045695,12 21,12 C19.8954305,12 19,12.8954305 19,14 C19,15.1045695 19.8954305,16 21,16 Z"></path>
              </svg>
            </button>
            <div className={`pointer-events-none absolute left-1/2 top-10 z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 ${isOptionsOpen ? 'hidden' : 'peer-hover:translate-y-0 peer-hover:opacity-100'}`}>
              Options
              <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gray-900" />
            </div>

            {/* Options Dropdown Menu */}
            {isOptionsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOptionsOpen(false)}></div>
                <div className="absolute right-0 top-10 mt-1 w-[200px] bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50 flex flex-col">
                  <button 
                    onClick={() => toast('Feature not available')}
                    className="cursor-pointer flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-800 transition-colors w-full text-left text-[14px]"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Send transcript</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent closing dropdown if desired, but actually normal dropdowns close on click. Oh wait, toggles usually don't close the dropdown immediately, or maybe they do? Let's just let it toggle. We can prevent default if we want to keep it open.
                      setIsSoundOn(!isSoundOn);
                    }}
                    className="cursor-pointer flex items-center justify-between px-4 py-2 hover:bg-gray-50 text-gray-800 transition-colors w-full text-left text-[14px]"
                  >
                    <div className="flex items-center gap-3">
                      {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      <span>Sounds</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors duration-200 ${isSoundOn ? 'bg-[#238a59] justify-end' : 'bg-gray-300 justify-start'}`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Close Button */}
          <div className="relative flex">
            <button onClick={onClose} className="peer cursor-pointer w-8 h-8 rounded-full bg-gray-200/50 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <svg viewBox="0 0 28 28" aria-hidden="true" className="w-5 h-5 text-gray-800" fill="currentColor">
                <path d="M9.70710678,8.29289322 L14,12.585 L18.2928932,8.29289322 C18.6834175,7.90236893 19.3165825,7.90236893 19.7071068,8.29289322 C20.0976311,8.68341751 20.0976311,9.31658249 19.7071068,9.70710678 L15.415,14 L19.7071068,18.2928932 C20.0976311,18.6834175 20.0976311,19.3165825 19.7071068,19.7071068 C19.3165825,20.0976311 18.6834175,20.0976311 18.2928932,19.7071068 L14,15.415 L9.70710678,19.7071068 C9.31658249,20.0976311 8.68341751,20.0976311 8.29289322,19.7071068 C7.90236893,19.3165825 7.90236893,18.6834175 8.29289322,18.2928932 L12.585,14 L8.29289322,9.70710678 C7.90236893,9.31658249 7.90236893,8.68341751 8.29289322,8.29289322 C8.68341751,7.90236893 9.31658249,7.90236893 9.70710678,8.29289322 Z" fillRule="nonzero"></path>
              </svg>
            </button>
            <div className="pointer-events-none absolute right-0 top-10 z-50 translate-y-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100">
              Minimize Window
              <div className="absolute right-3 top-0 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-900" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-24 pb-4 flex flex-col gap-4 chat-scroll overscroll-contain">
        

        {messages.map((msg) => (
          msg.sender === 'user' ? (
            <div key={msg.id} className="flex flex-col items-end group mt-2">
              <div className="bg-primary text-white text-[14px] px-4 py-2.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex flex-col items-start mt-2">
              <div className="flex gap-3 w-full">
                <img src={assets.chatRobotIcon} alt="AI" className="w-6 h-6 rounded-full object-cover shrink-0" />
                <div className="text-[14px] text-gray-700 leading-relaxed max-w-[85%] markdown-body w-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content.replace(/\s*\[Source[^\]]*\]/gi, '')}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mt-1 ml-9 text-gray-400">
                <button className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                <button 
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        ))}

        {/* Streaming Active Message */}
        {(isGenerating || isCreatingSession) && (
          <div className="flex gap-3 mt-2">
            <img src={assets.chatRobotIcon} alt="AI" className="w-6 h-6 rounded-full object-cover shrink-0" />
            <div className="text-[14px] text-gray-700 leading-relaxed max-w-[85%] markdown-body w-full">
              {streamText ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamText.replace(/\s*\[Source[^\]]*\]/gi, '')}
                </ReactMarkdown>
              ) : (
                <div className="flex items-center gap-1.5 h-6 px-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {streamError && (
          <div className="text-red-500 mt-2 text-sm bg-red-50 p-3.5 rounded-xl border border-red-200 whitespace-pre-wrap leading-relaxed">
            {streamError.replace('Error: ', '')}
          </div>
        )}
        
        <div ref={messagesEndRef} />

        {/* Suggested Prompts */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-2.5 items-start mt-auto">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => handleSend('What are the top 5 most important skills one should have to crack Amazon?')}
                  className="cursor-pointer text-left bg-gray-200/60 hover:bg-gray-200 transition-colors rounded-[20px] px-4 py-2.5 text-[13.5px] text-gray-700 max-w-[90%]"
                >
                  What are the top 5 most important skills one should have to crack Amazon?
                </button>
                <button 
                  onClick={() => handleSend('What are some common interview questions for a software engineer?')}
                  className="cursor-pointer text-left bg-gray-200/60 hover:bg-gray-200 transition-colors rounded-[20px] px-4 py-2.5 text-[13.5px] text-gray-700 max-w-[90%]"
                >
                  What are some common interview questions for a software engineer?
                </button>
                <button 
                  onClick={() => handleSend('Can we do a mock interview for a frontend developer role?')}
                  className="cursor-pointer text-left bg-gray-200/60 hover:bg-gray-200 transition-colors rounded-[20px] px-4 py-2.5 text-[13.5px] text-gray-700 max-w-[90%]"
                >
                  Can we do a mock interview for a frontend developer role?
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleSend('What is Experio and how can it help me?')}
                  className="cursor-pointer text-left bg-gray-200/60 hover:bg-gray-200 transition-colors rounded-[20px] px-4 py-2.5 text-[13.5px] text-gray-700 max-w-[90%]"
                >
                  What is Experio and how can it help me?
                </button>
                <button 
                  onClick={() => handleSend('Is this platform completely free to use?')}
                  className="cursor-pointer text-left bg-gray-200/60 hover:bg-gray-200 transition-colors rounded-[20px] px-4 py-2.5 text-[13.5px] text-gray-700 max-w-[90%]"
                >
                  Is this platform completely free to use?
                </button>
                <button 
                  onClick={() => handleSend('What kind of AI features do you provide?')}
                  className="cursor-pointer text-left bg-gray-200/60 hover:bg-gray-200 transition-colors rounded-[20px] px-4 py-2.5 text-[13.5px] text-gray-700 max-w-[90%]"
                >
                  What kind of AI features do you provide?
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-2">
        <div className="bg-white rounded-full flex items-center gap-3 px-2 py-2 shadow-sm border border-gray-100">
          <button className="text-gray-400 pl-1 cursor-default">
            <Sparkles className="w-5 h-5" strokeWidth={2} />
          </button>
          <input 
            type="text" 
            placeholder="Write a message..." 
            className="flex-1 bg-transparent outline-none text-[14px] text-gray-800 placeholder-gray-400"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <Mic className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              if (isGenerating || isCreatingSession) {
                stopStream();
                setIsCreatingSession(false);
              } else {
                handleSend();
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors mr-0.5 ${
              (inputValue.trim() || isGenerating || isCreatingSession) ? 'bg-primary hover:bg-primary/90 cursor-pointer' : 'bg-gray-100 hover:bg-gray-200 cursor-default'
            }`}
          >
            {isGenerating || isCreatingSession ? (
              <Square className="w-3.5 h-3.5 fill-white text-white" />
            ) : (
              <ArrowUp className={`w-4 h-4 ${inputValue.trim() ? 'text-white' : 'text-gray-500'}`} />
            )}
          </button>
        </div>
      </div>
      
      {/* Footer Powered By */}
      <div className="py-2.5 flex justify-center items-center text-[12.5px] text-gray-500">
        <Zap className="w-3.5 h-3.5 text-primary mr-1" fill="currentColor" stroke="none" />
        <span>Powered by</span>
        <span className="font-bold text-gray-700 ml-0.5 tracking-tight">Experio</span>
      </div>
    </div>

    <ChatHistoryModal 
      isOpen={isHistoryOpen} 
      onClose={() => setIsHistoryOpen(false)} 
      activeSessionId={activeSessionId}
      onSessionSelect={handleSessionSelect}
    />
  </>
  );
};

export default ChatbotModal;
