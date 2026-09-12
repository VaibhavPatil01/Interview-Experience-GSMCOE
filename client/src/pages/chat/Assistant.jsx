import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Plus, PenSquare, Sparkles, Search, PanelLeft,
  ThumbsUp, ThumbsDown, Copy, RotateCw, MoreHorizontal, Edit2, Upload, Pin, PinOff, Trash2, MessageCircle, Square, ExternalLink, Share2, Check
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoginRequiredModal from '../../components/users/LoginRequiredModal.jsx';
import { useAppSelector } from '../../redux/store.js';
import { toast } from 'react-hot-toast';

// Import our new services and hooks
import { 
  fetchSessions, 
  createSession, 
  renameSession, 
  pinSession, 
  deleteSession, 
  fetchSessionMessages,
  submitFeedback
} from '../../services/chatServices';

import { useChatStream } from '../../hooks/useChatStream';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ChatHistoryModal from '../../components/chat/ChatHistoryModal';
import { assets } from '../../assets/assets';
import { subscribeToChatSync, dispatchChatSync, subscribeToMessagesSync, dispatchMessagesSync } from '../../utils/chatSync';
const AIAvatar = () => (
  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden">
    <img src={assets.chatRobotIcon} alt="AI Avatar" className="w-full h-full object-cover" />
  </div>
);

const Assistant = () => {
  const isLoggedIn = useAppSelector((state) => state.userState.isLoggedIn);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [activeChatId, setActiveChatId] = useState(() => {
    const stored = localStorage.getItem('sharedActiveChatId');
    return (stored === 'null' || !stored) ? 'new' : stored;
  });

  useEffect(() => {
    localStorage.setItem('sharedActiveChatId', activeChatId);
    dispatchChatSync(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    return subscribeToChatSync((newSessionId) => {
      if (activeChatId !== (newSessionId || 'new')) {
        setActiveChatId(newSessionId || 'new');
        if (isLoggedIn) {
          loadSessions(); // Reload sessions to get newly created/named chats in sidebar
        }
      }
    });
  }, [activeChatId, isLoggedIn]);
  const [inputValue, setInputValue] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Real State for Sessions and Messages
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  // Hooks
  const { isGenerating, streamText, streamError, startStream, stopStream } = useChatStream();
  const messagesEndRef = useRef(null);

  const queryClient = useQueryClient();

  // Handle Authentication State Changes
  useEffect(() => {
    const initUserData = async () => {
      if (isLoggedIn) {
        // Load all sessions from server
        try {
          const data = await fetchSessions();
          const sessionsArray = Array.isArray(data) ? data : (data.sessions || []);
          setChatHistory(sessionsArray.map(s => ({
            id: s._id,
            label: s.title,
            isPinned: s?.metadata?.isPinned || false
          })));
        } catch (error) {
          console.error("Failed to load sessions", error);
        }
      } else {
        // Unauthenticated cleanup
        setChatHistory([]);
        setCurrentMessages([]);
        setActiveChatId('new');
        localStorage.removeItem('sharedActiveChatId');
      }
    };

    initUserData();
  }, [isLoggedIn]);

  // Listen for new sessions created in ChatbotModal
  useEffect(() => {
    const cleanup = subscribeToChatSync(() => {
      if (isLoggedIn) {
        // Reload sidebar when a new session is created elsewhere
        const loadSessions = async () => {
          try {
            const data = await fetchSessions();
            const sessionsArray = Array.isArray(data) ? data : (data.sessions || []);
            setChatHistory(sessionsArray.map(s => ({
              id: s._id,
              label: s.title,
              isPinned: s?.metadata?.isPinned || false
            })));
          } catch (error) {
            console.error("Failed to load sessions after sync", error);
          }
        };
        loadSessions();
      }
    });
    return cleanup;
  }, [isLoggedIn]);

  const skipNextFetch = useRef(false);

  // Switch Chat Load Messages
  useEffect(() => {
    if (activeChatId === 'new') {
      setCurrentMessages([]);
      return;
    }
    
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    
    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await fetchSessionMessages(activeChatId);
        const messagesArray = Array.isArray(data) ? data : (data.messages || []);
        setCurrentMessages(messagesArray.reverse().map(m => ({
          id: m._id,
          sender: m.role,
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: m.citations || [],
          feedback: m.feedback
        })));
      } catch (error) {
        console.error("Failed to load messages", error);
        if (error.response && error.response.status === 404) {
          // Session doesn't exist anymore, reset UI to prevent broken state
          setActiveChatId('new');
          localStorage.setItem('sharedActiveChatId', 'new');
        }
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    loadMessages();

    // Listen for background message updates (e.g. from ChatbotModal completing a stream)
    const cleanup = subscribeToMessagesSync((sessionId) => {
      if (sessionId === activeChatId) {
        loadMessages();
      }
    });

    return cleanup;
  }, [activeChatId]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, streamText]);

  // Click outside dropdown handler
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // UI Handlers
  const handleCopy = (msgId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => {
      setCopiedMsgId(null);
    }, 2000);
  };

  const handleTogglePin = async (e, id) => {
    e.stopPropagation();
    const chat = chatHistory.find(c => c.id === id);
    if (!chat) return;

    // Optimistic UI update
    setChatHistory(prev => prev.map(c => 
      c.id === id ? { ...c, isPinned: !c.isPinned } : c
    ));

    try {
      await pinSession(id, !chat.isPinned);
    } catch (error) {
      // Revert on failure
      setChatHistory(prev => prev.map(c => 
        c.id === id ? { ...c, isPinned: chat.isPinned } : c
      ));
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      setChatHistory(prev => prev.filter(c => c.id !== id));
      if (activeChatId === id) setActiveChatId('new');
    } catch (error) {
      console.error("Failed to delete session", error);
    }
  };

  const handleRenameSession = async (id, newTitle) => {
    try {
      await renameSession(id, newTitle);
      setChatHistory(prev => prev.map(c => 
        c.id === id ? { ...c, label: newTitle } : c
      ));
    } catch (error) {
      console.error("Failed to rename session", error);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setRedirectUrl(window.location.pathname);
      setIsLoginModalOpen(true);
      return;
    }

    if (isGenerating) return;

    if (!inputValue.trim()) {
      toast('Feature not available');
      return;
    }

    const userPrompt = inputValue.trim();
    setInputValue(''); // Clear input instantly

    let targetSessionId = activeChatId;

    try {
      // 1. Optimistically add user message to UI
      const userMsg = {
        id: Date.now().toString(),
        sender: 'user',
        text: userPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCurrentMessages(prev => [...prev, userMsg]);

      // 2. If it's a new chat, create session first
      if (targetSessionId === 'new') {
        setIsCreatingSession(true);
        const newSession = await createSession(userPrompt);
        setIsCreatingSession(false);
        targetSessionId = newSession._id;
        
        // Add to sidebar
        setChatHistory([{ id: targetSessionId, label: newSession.title, isPinned: false }, ...chatHistory]);
        
        skipNextFetch.current = true;
        setActiveChatId(targetSessionId);
      }

      // 3. Start Stream
      await startStream(targetSessionId, userPrompt, 'gemini-flash-latest', (finalMessage) => {
        // Stream completed successfully, add final assistant message to UI
        setCurrentMessages(prev => [...prev, {
          id: finalMessage._id,
          sender: finalMessage.role,
          text: finalMessage.content,
          timestamp: new Date(finalMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: finalMessage.citations || [],
          feedback: finalMessage.feedback
        }]);
        dispatchMessagesSync(targetSessionId);
      });

    } catch (error) {
      console.error("Chat generation error", error);
      toast.error("Failed to send message. Please try again.");
      setCurrentMessages(prev => prev.filter(msg => msg.id !== userMsg.id)); // Remove optimistic message
      setIsCreatingSession(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const pinnedChats = chatHistory.filter(c => c.isPinned);
  const recentChats = chatHistory.filter(c => !c.isPinned);

  const renderInputBar = () => (
    <div className="w-full max-w-[760px] relative">
      <div className="flex items-center bg-gray-100 dark:bg-[#2f2f2f] rounded-[24px] p-2 pr-2 border border-transparent dark:border-gray-700/30">
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors flex-shrink-0">
          <Sparkles className="w-5 h-5" strokeWidth={2} />
        </button>
        <input 
          type="text" 
          placeholder="Ask anything"
          className="flex-1 bg-transparent border-none outline-none text-base px-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-w-0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating || isCreatingSession}
        />
        <div className="flex items-center gap-3 flex-shrink-0 pr-1">
          <div className="relative flex items-center justify-center">
            <button 
              onClick={() => toast('Feature not available')}
              className="peer cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full mt-3 z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 dark:bg-white dark:text-gray-900">
              Dictate
              <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gray-900 dark:bg-white" />
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            {isGenerating || isCreatingSession ? (
              // Stop Generation Button
              <button onClick={stopStream} className="peer cursor-pointer flex items-center justify-center">
                <div className="w-[42px] h-[42px] bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm">
                  <Square className="w-5 h-5 fill-current" />
                </div>
              </button>
            ) : (
              // Normal Submit Button
              <button onClick={handleSubmit} className="peer cursor-pointer flex items-center justify-center">
                <div className="w-[42px] h-[42px] bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                  {inputValue.trim() ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <polyline points="5 11 12 4 19 11"></polyline>
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 8.5v4"/>
                      <path d="M8.5 4.5v12"/>
                      <path d="M12.5 6.5v8"/>
                      <path d="M16.5 8.5v4"/>
                    </svg>
                  )}
                </div>
              </button>
            )}
            
            <div className="pointer-events-none absolute left-1/2 top-full mt-3 z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 dark:bg-white dark:text-gray-900">
              {isGenerating || isCreatingSession ? "Stop Generation" : (inputValue.trim() ? "Send Message" : "Start Voice")}
              <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gray-900 dark:bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const currentChat = chatHistory.find(c => c.id === activeChatId);
  const isCurrentChatPinned = currentChat?.isPinned || false;

  return (
    <>
    {isLoginModalOpen && (
      <LoginRequiredModal redirectUrl={window.location.pathname} closeModalCallback={() => setIsLoginModalOpen(false)} />
    )}
    <div className="flex h-[calc(100vh-72px)] w-full bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Collapsed Sidebar (Desktop Only) */}
      {!isSidebarOpen && (
        <div className="hidden md:flex flex-col items-center py-3 w-[68px] bg-gray-50 dark:bg-[#171717] h-full shrink-0 border-r border-transparent dark:border-white/5">
          <div className="flex flex-col items-center gap-1 w-full px-2">
            
            <div className="relative flex items-center justify-center w-full mb-4">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="peer p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer w-full flex justify-center"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex items-center justify-center w-full">
              <button 
                onClick={() => setActiveChatId('new')}
                className="peer p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer w-full flex justify-center"
              >
                <PenSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-gray-50 dark:bg-[#171717] flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden shrink-0
        ${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
      `}>
        <div className="p-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors">
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setActiveChatId('new')}
            className={`cursor-pointer flex items-center gap-3 w-full p-2 rounded-lg transition-colors text-[15px] font-medium
              ${activeChatId === 'new' ? 'bg-gray-200 dark:bg-[#2f2f2f]' : 'hover:bg-gray-200 dark:hover:bg-[#2f2f2f]'}
            `}
          >
            <PenSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span>New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {pinnedChats.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">Pinned</h3>
              <div className="space-y-1">
                {pinnedChats.map(chat => (
                  <RecentItem 
                    key={chat.id}
                    label={chat.label} 
                    isActive={activeChatId === chat.id} 
                    onClick={() => setActiveChatId(chat.id)}
                    isPinned={chat.isPinned}
                    onTogglePin={(e) => handleTogglePin(e, chat.id)}
                    isDropdownOpen={openDropdownId === chat.id}
                    onToggleDropdown={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === chat.id ? null : chat.id);
                    }}
                    onDelete={() => handleDeleteSession(chat.id)}
                    onRename={(newTitle) => handleRenameSession(chat.id, newTitle)}
                  />
                ))}
              </div>
            </div>
          )}

          {recentChats.length > 0 && (
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">Recents</h3>
              <div className="space-y-1">
                {recentChats.map(chat => (
                  <RecentItem 
                    key={chat.id}
                    label={chat.label} 
                    isActive={activeChatId === chat.id} 
                    onClick={() => setActiveChatId(chat.id)}
                    isPinned={chat.isPinned}
                    onTogglePin={(e) => handleTogglePin(e, chat.id)}
                    isDropdownOpen={openDropdownId === chat.id}
                    onToggleDropdown={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === chat.id ? null : chat.id);
                    }}
                    onDelete={() => handleDeleteSession(chat.id)}
                    onRename={(newTitle) => handleRenameSession(chat.id, newTitle)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-white dark:bg-[#212121]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            {activeChatId !== 'new' && (
              <div className="relative">
                <button 
                  className="cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors text-gray-700 dark:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(openDropdownId === 'header' ? null : 'header');
                  }}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {openDropdownId === 'header' && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-[160px] bg-white dark:bg-[#2f2f2f] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] rounded-xl border border-gray-100 dark:border-gray-700 z-[100] py-1.5 flex flex-col cursor-default font-normal" 
                    onClick={e => e.stopPropagation()}
                  >
                    <button 
                      className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors text-left w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                      }}
                    >
                      <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Share
                    </button>
                    <button 
                      className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors text-left w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(null);
                      }}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Rename
                    </button>
                    <button 
                      className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors text-left w-full"
                      onClick={(e) => {
                        handleTogglePin(e, activeChatId);
                        setOpenDropdownId(null);
                      }}
                    >
                      {isCurrentChatPinned ? (
                        <UnpinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Pin className="w-4 h-4 text-gray-500 dark:text-gray-400 rotate-45" strokeWidth={2} />
                      )}
                      {isCurrentChatPinned ? 'Unpin chat' : 'Pin chat'}
                    </button>
                    <div className="h-px w-full bg-gray-100 dark:bg-gray-700/50 my-1.5" />
                    <button 
                      onClick={() => handleDeleteSession(activeChatId)}
                      className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left w-full"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Body & Input Area */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto w-full relative">
          {activeChatId === 'new' && currentMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-[760px]">
              <h1 className="text-[32px] font-semibold mb-8 text-gray-800 dark:text-[#d1d5db]">Where should we begin?</h1>
              {renderInputBar()}
            </div>
          ) : (
            <div className="flex-1 w-full max-w-[760px] p-4 flex flex-col gap-6 pb-6">
              {isLoadingMessages ? (
                <div className="flex justify-center my-8 text-gray-400">Loading messages...</div>
              ) : (
                <>
                  {currentMessages.map((msg, index) => (
                    <div key={msg.id} className="flex flex-col">
                      {(index === 0 || msg.timestamp !== currentMessages[index-1].timestamp) && (
                        <div className="text-center text-xs text-gray-400 dark:text-gray-500 my-4 font-medium">
                          {msg.timestamp}
                        </div>
                      )}

                      {msg.sender === 'user' ? (
                        <div className="flex flex-col items-end group mt-2">
                          <div className="bg-primary text-white px-5 py-2.5 rounded-2xl max-w-[80%] leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg cursor-pointer"
                            >
                              {copiedMsgId === msg.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 w-full mt-2 group">
                          <AIAvatar />
                          <div className="flex flex-col items-start w-full min-w-0">
                            <div className="text-gray-900 dark:text-gray-100 pr-4 py-2 max-w-[100%] leading-relaxed markdown-body w-full">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.text.replace(/\s*\[Source[^\]]*\]/gi, '')}
                            </ReactMarkdown>
                          </div>

                          {/* Render Citation Cards */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 mb-2">
                              {msg.citations.map((cite, i) => (
                                <a 
                                  key={i} 
                                  href={cite.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center gap-2 bg-gray-100 dark:bg-[#2f2f2f] hover:bg-gray-200 dark:hover:bg-[#3f3f3f] px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>{cite.company} • {cite.role}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-2 text-gray-400">
                            <button className={`p-1.5 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors cursor-pointer ${msg.feedback === 'like' ? 'text-primary' : ''}`}><ThumbsUp className="w-4 h-4" /></button>
                            <button className={`p-1.5 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors cursor-pointer ${msg.feedback === 'dislike' ? 'text-red-500' : ''}`}><ThumbsDown className="w-4 h-4" /></button>
                            <button 
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="p-1.5 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors cursor-pointer"
                            >
                              {copiedMsgId === msg.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming Active Message */}
                  {(isGenerating || isCreatingSession) && (
                    <div className="flex items-start gap-3 w-full mt-2">
                       <AIAvatar />
                       <div className="flex flex-col items-start w-full min-w-0">
                         <div className="text-gray-900 dark:text-gray-100 pr-4 py-2 max-w-[100%] leading-relaxed markdown-body w-full">
                            {streamText ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {streamText.replace(/\s*\[Source[^\]]*\]/gi, '')}
                            </ReactMarkdown>
                          ) : (
                            <div className="flex items-center gap-1.5 h-6 px-1">
                              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                       </div>
                     </div>
                   </div>
                  )}

                  {streamError && (
                    <div className="text-red-500 mt-2 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      Error: {streamError}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="w-full flex flex-col items-center p-4 bg-gradient-to-t from-white via-white dark:from-[#212121] dark:via-[#212121] to-transparent pt-0 shrink-0">
          {(activeChatId !== 'new' || currentMessages.length > 0) && renderInputBar()}
          <div className="text-center text-[11px] text-gray-500 mt-2 font-medium">
            AI can make mistakes. Check important info.
          </div>
        </div>

      </div>
    </div>

    <ChatHistoryModal 
      isOpen={isHistoryModalOpen} 
      onClose={() => setIsHistoryModalOpen(false)} 
      activeSessionId={activeChatId === 'new' ? null : activeChatId}
      onSessionSelect={(id) => setActiveChatId(id)}
    />
    </>
  );
};

const UnpinIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.75191 6.73289L11.1969 8.17793C11.2355 8.1273 11.2723 8.07415 11.3071 8.01845L14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C15.8462 12.6481 15.793 12.6848 15.7424 12.7234L17.1874 14.1684L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79852L17.1218 1.87023Z" fill="currentColor"/>
    <path d="M3.56525 8.85242C3.6015 8.26612 3.84962 7.68582 4.32883 7.27422L5.77735 8.72274C5.75784 8.72967 5.73835 8.7368 5.71886 8.74414C5.64516 8.7719 5.61855 8.80285 5.60548 8.82181C5.58877 8.84604 5.56651 8.8937 5.56144 8.97583C5.55046 9.15333 5.62872 9.40686 5.82846 9.6066L14.3137 18.0919C14.5135 18.2916 14.767 18.3699 14.9445 18.3589C15.0266 18.3538 15.0743 18.3316 15.0985 18.3149C15.1175 18.3018 15.1484 18.2752 15.1762 18.2015C15.1835 18.182 15.1907 18.1625 15.1976 18.143L16.6461 19.5915C16.2345 20.0707 15.6542 20.3188 15.0679 20.3551C14.2853 20.4035 13.4808 20.0874 12.8995 19.5061L9.36397 15.9705L2.68394 22.6506C2.29342 23.0411 1.66025 23.0411 1.26973 22.6506C0.879206 22.26 0.879206 21.6269 1.26973 21.2363L7.94975 14.5563L4.41425 11.0208C3.83293 10.4395 3.51687 9.63502 3.56525 8.85242Z" fill="currentColor"/>
    <path d="M2.00789 2.00786C1.61736 2.39838 1.61736 3.03155 2.00789 3.42207L20.5862 22.0004C20.9767 22.3909 21.6099 22.3909 22.0004 22.0004C22.391 21.6099 22.391 20.9767 22.0004 20.5862L3.4221 2.00786C3.03158 1.61733 2.39841 1.61733 2.00789 2.00786Z" fill="currentColor"/>
  </svg>
);

const RecentItem = ({ label, isActive, onClick, isPinned, onTogglePin, isDropdownOpen, onToggleDropdown, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(label);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Optionally place cursor at end
      inputRef.current.selectionStart = inputRef.current.selectionEnd = inputRef.current.value.length;
    }
  }, [isEditing]);

  const handleRenameSubmit = () => {
    setIsEditing(false);
    const newTitle = editTitle.trim();
    if (newTitle !== '' && newTitle !== label) {
      if (onRename) onRename(newTitle);
    } else {
      setEditTitle(label);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(label);
    }
  };

  return (
    <div 
      onClick={!isEditing ? onClick : undefined}
      className={`group relative flex items-center w-full px-2.5 py-2 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-200 text-left
        ${isActive ? 'bg-gray-200 dark:bg-[#2f2f2f]' : 'hover:bg-gray-200 dark:hover:bg-[#2f2f2f]'}
        ${isDropdownOpen ? 'overflow-visible' : 'overflow-hidden'}
        ${!isEditing ? 'cursor-pointer' : ''}
      `}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-white dark:bg-[#3f3f3f] text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded border border-primary outline-none text-sm -ml-1.5"
        />
      ) : (
        <span className="truncate block w-full pr-8 group-hover:pr-12 transition-all">{label}</span>
      )}
      {!isEditing && (
        <div className={`absolute right-2 flex items-center gap-1.5 transition-opacity ${isDropdownOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div 
            className="p-0.5 hover:text-gray-900 dark:hover:text-gray-100 text-gray-400 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onTogglePin(e); }}
          >
            {isPinned ? (
              <UnpinIcon className="w-4 h-4" />
            ) : (
              <Pin className="w-4 h-4 rotate-45" />
            )}
          </div>
        <div className="relative">
          <div 
            className="p-0.5 hover:text-gray-900 dark:hover:text-gray-100 text-gray-400 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onToggleDropdown(e); }}
          >
            <MoreHorizontal className="w-[18px] h-[18px]" />
          </div>

          {isDropdownOpen && (
            <div 
              className="absolute right-0 top-full mt-1 w-[160px] bg-white dark:bg-[#2f2f2f] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] rounded-xl border border-gray-100 dark:border-gray-700 z-[100] py-1.5 flex flex-col cursor-default font-normal" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors text-left w-full"
                onClick={(e) => { e.stopPropagation(); onToggleDropdown(e); }}
              >
                <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Share
              </button>
              <button 
                className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors text-left w-full"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onToggleDropdown(e); 
                  setEditTitle(label);
                  setIsEditing(true);
                }}
              >
                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Rename
              </button>
              <button 
                className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors text-left w-full"
                onClick={(e) => { e.stopPropagation(); onTogglePin(e); onToggleDropdown(e); }}
              >
                {isPinned ? (
                  <UnpinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Pin className="w-4 h-4 text-gray-500 dark:text-gray-400 rotate-45" strokeWidth={2} />
                )}
                {isPinned ? 'Unpin chat' : 'Pin chat'}
              </button>
              <div className="h-px w-full bg-gray-100 dark:bg-gray-700/50 my-1.5" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  onToggleDropdown(e);
                }}
                className="cursor-pointer flex items-center gap-3 px-3 py-1.5 text-[14px] text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left w-full"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Assistant;
