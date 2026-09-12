// client/src/utils/chatSync.js
const CHAT_SYNC_EVENT = 'chat-session-updated';

/**
 * Dispatch an event to notify other components (e.g. ChatbotModal, Assistant)
 * that the active chat session has changed.
 * @param {string|null} sessionId The new active session ID
 */
export const dispatchChatSync = (sessionId) => {
  const event = new CustomEvent(CHAT_SYNC_EVENT, { detail: { sessionId } });
  window.dispatchEvent(event);
};

/**
 * Subscribe to chat sync events.
 * @param {Function} callback Function to call with the new sessionId
 * @returns {Function} Cleanup function to remove the listener
 */
export const subscribeToChatSync = (callback) => {
  const handleSync = (event) => {
    callback(event.detail.sessionId);
  };
  
  window.addEventListener(CHAT_SYNC_EVENT, handleSync);
  return () => {
    window.removeEventListener(CHAT_SYNC_EVENT, handleSync);
  };
};
