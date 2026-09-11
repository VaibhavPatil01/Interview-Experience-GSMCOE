import { useState, useRef, useCallback } from 'react';
import { BASE_API_URL } from '../services/serverConfig';
import getAuthToken from '../utils/getAuthToken.js';

export const useChatStream = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [streamError, setStreamError] = useState(null);
  const abortControllerRef = useRef(null);

  const startStream = useCallback(async (sessionId, prompt, model = 'gemini-3.5-flash', onComplete = null) => {
    setIsGenerating(true);
    setStreamText('');
    setStreamError(null);
    
    // Create new abort controller for this stream
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${BASE_API_URL}/api/chat/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': getAuthToken() || ''
        },
        body: JSON.stringify({ prompt, model }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Daily AI usage limit reached. Please try again tomorrow.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let finalMessage = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          // SSE sends 'data: {...}\n\n' chunks. We need to split and parse them.
          const lines = chunkString.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr);
                  
                  if (data.type === 'chunk') {
                    setStreamText(prev => prev + data.text);
                  } else if (data.type === 'done') {
                    finalMessage = data.message;
                  } else if (data.type === 'error') {
                    setStreamError(data.error);
                    break;
                  }
                } catch (e) {
                  console.error('Error parsing SSE chunk', e, dataStr);
                }
              }
            }
          }
        }
      }

      setIsGenerating(false);
      abortControllerRef.current = null;
      
      if (onComplete && finalMessage) {
        onComplete(finalMessage);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Stream error:', error);
        setStreamError(error.message);
      }
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, []);

  const startGuestStream = useCallback(async (history, prompt, visitorId, model = 'gemini-3.5-flash', onComplete = null) => {
    setIsGenerating(true);
    setStreamText('');
    setStreamError(null);
    
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${BASE_API_URL}/api/chat/sessions/guest/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-visitor-id': visitorId || ''
        },
        body: JSON.stringify({ prompt, model, history }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Daily AI usage limit reached. Please try again tomorrow.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let finalMessage = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr);
                  
                  if (data.type === 'chunk') {
                    setStreamText(prev => prev + data.text);
                  } else if (data.type === 'done') {
                    finalMessage = data.message;
                  } else if (data.type === 'error') {
                    setStreamError(data.error);
                    break;
                  }
                } catch (e) {
                  console.error('Error parsing SSE chunk', e, dataStr);
                }
              }
            }
          }
        }
      }

      setIsGenerating(false);
      abortControllerRef.current = null;
      
      if (onComplete && finalMessage) {
        onComplete(finalMessage);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Stream error:', error);
        setStreamError(error.message);
      }
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    streamText,
    streamError,
    startStream,
    startGuestStream,
    stopStream,
    setStreamText // Useful if we need to clear it manually
  };
};
