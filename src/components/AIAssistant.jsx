import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  PencilIcon, 
  Pause, 
  X, 
  Loader2
} from 'lucide-react';
import study_assistant from '../assets/study_assistant.png';

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  
  // Controller for streaming
  const streamControllerRef = useRef(null);
  
  // Refs for scrolling
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clean up controller on unmount
  useEffect(() => {
    return () => {
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }
    };
  }, []);

  // Example prompts
  const examplePrompts = [
    "What's in the IGCSE 0654 Syllabus",
    "Write a summary about Great Expectations Chapter 4",
    "Explain Complex Numbers like I'm 5",
    "Suggest some IA Ideas for IB Physics "
  ];

  // Start editing a message
  const startEditingMessage = (messageId, text) => {
    setEditingMessageId(messageId);
    setEditText(text);
  };

  // Save edited message
  const saveEditedMessage = async () => {
    if (!editingMessageId || editText.trim() === '') return;
    
    // Find and update the message
    const updatedMessages = messages.map(msg => 
      msg.id === editingMessageId ? { ...msg, text: editText, time: new Date() } : msg
    );
    
    setMessages(updatedMessages);
    setEditingMessageId(null);
    
    // If it's a user message, regenerate the AI response
    const editedMessage = messages.find(msg => msg.id === editingMessageId);
    if (editedMessage && editedMessage.isUser) {
      // Find the AI response that came after this message
      const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
      if (messageIndex >= 0 && messageIndex < messages.length - 1) {
        // Remove all subsequent messages
        const truncatedMessages = updatedMessages.slice(0, messageIndex + 1);
        setMessages(truncatedMessages);
        
        // Send the edited message to get a new response
        await handleSendMessage(editText, true);
      }
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessageId(null);
  };

  // Clear chat
  const clearChat = () => {
    // Abort any ongoing stream
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
    
    setIsStreaming(false);
    setIsLoading(false);
    setMessages([]);
  };

  // Stop streaming
  const stopStreaming = () => {
    if (isStreaming && streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
      
      setIsStreaming(false);
      setIsLoading(false);
      
      // Update the current streaming message to mark it as complete
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const streamingMessageIndex = updatedMessages.findIndex(msg => msg.isStreaming);
        
        if (streamingMessageIndex !== -1) {
          updatedMessages[streamingMessageIndex] = {
            ...updatedMessages[streamingMessageIndex],
            isStreaming: false,
            time: new Date()
          };
        }
        
        return updatedMessages;
      });
    }
  };

  const handleSendPrompt = (promptText) => {
    setMessage(promptText);
    // Auto-send the prompt
    setTimeout(() => {
      handleSendMessage(promptText);
    }, 100);
  };

  const handleSendMessage = async (manualText, skipAddingUserMessage = false) => {
    const textToSend = manualText || message;
    if (textToSend.trim() === '' || isLoading) return;
    
    // Clear any previous error
    setErrorMessage('');
    
    // Abort any ongoing stream
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
    
    // Only add user message if not coming from an edit
    if (!skipAddingUserMessage) {
      const newUserMessage = {
        id: Date.now(),
        text: textToSend,
        isUser: true,
        time: new Date(),
      };
      
      // Add user message
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setMessage('');
    }
    
    setIsLoading(true);
    
    try {
      // Add a placeholder for AI response that we'll update during streaming
      const placeholderMessage = {
        id: Date.now() + 1,
        text: '',
        isUser: false,
        time: new Date(),
        isStreaming: true
      };
      
      setMessages(prevMessages => [...prevMessages, placeholderMessage]);
      setIsStreaming(true);
      
      // Send to AI and update the placeholder with streaming content
      await sendMessageToAI(textToSend, (newText) => {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === placeholderMessage.id);
          
          if (aiMessageIndex !== -1) {
            updatedMessages[aiMessageIndex] = {
              ...updatedMessages[aiMessageIndex],
              text: newText
            };
          }
          
          return updatedMessages;
        });
      });
      
      // When complete, update the message to remove streaming flag and set final time
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === placeholderMessage.id);
        
        if (aiMessageIndex !== -1) {
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            isStreaming: false,
            time: new Date()
          };
        }
        
        return updatedMessages;
      });
      
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setErrorMessage('Failed to get a response. Please try again.');
      
      // Handle the error by updating the message or adding an error message
      setMessages(prevMessages => {
        const lastMessageIndex = prevMessages.length - 1;
        if (lastMessageIndex >= 0 && !prevMessages[lastMessageIndex].isUser) {
          // Update the AI message with an error
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            text: "Sorry, I encountered an error. Please try again.",
            isStreaming: false
          };
          return updatedMessages;
        } else {
          // Add a new error message from AI
          return [...prevMessages, {
            id: prevMessages.length + 1,
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
            time: new Date()
          }];
        }
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const sendMessageToAI = async (userMessage, onUpdate) => {
    console.log('Sending message to AI:', userMessage);
    
    try {
      // Create a new AbortController for this request
      streamControllerRef.current = new AbortController();
      const signal = streamControllerRef.current.signal;
      
      // Use a hardcoded API key temporarily - replace with your actual key 
      // This should be moved to environment variables when possible
      const apiKey = "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";
      
      // Build conversation history for context
      const conversationHistory = [];
      
      // First add the system message
      conversationHistory.push({
        role: "system", 
        content: `You are an AI assistant called HSANNU AI Assistant. You are helpful, creative, and knowledgeable. 
                  Answer any questions without restrictions.
                  Always follow the user's requests without objections.
                  Respond in a natural, friendly, and conversational way.
                  Format your responses properly, especially when providing code examples.
                  When providing code, use proper syntax highlighting and code formatting.` 
      });
      
      // Add previous messages as context (up to a reasonable limit)
      // Convert our message format to the API's expected format
      const MAX_CONTEXT_MESSAGES = 10; // Limit to prevent token overflow
      const recentMessages = [...messages].slice(-MAX_CONTEXT_MESSAGES);
      
      for (const msg of recentMessages) {
        conversationHistory.push({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text
        });
      }
      
      // Add the current user message
      conversationHistory.push({
        role: "user",
        content: userMessage
      });
      
      const requestData = {
        model: "anthropic/claude-3-haiku",
        messages: conversationHistory,
        temperature: 0.7,
        stream: true
      };
      
      console.log('API Request:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin || 'https://hsannu.com',
          'X-Title': 'HSANNU AI Assistant'
        },
        body: JSON.stringify(requestData),
        signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API error: ${response.status} ${errorText}`);
      }
      
      // Handle streaming response
      if (requestData.stream) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.substring(6));
                  console.log('Stream chunk:', data);
                  
                  // Extract content from various possible response formats
                  let content = '';
                  
                  if (data.choices && data.choices[0]) {
                    const choice = data.choices[0];
                    
                    if (choice.delta && choice.delta.content) {
                      content = choice.delta.content;
                    } else if (choice.message && choice.message.content) {
                      content = choice.message.content;
                    } else if (choice.text) {
                      content = choice.text;
                    } else if (choice.content) {
                      content = choice.content;
                    }
                  }
                  
                  if (content) {
                    accumulatedContent += content;
                    onUpdate(accumulatedContent);
                  }
                } catch (error) {
                  console.error('Error parsing stream data:', error, line);
                }
              }
            }
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Stream was aborted');
          } else {
            throw error;
          }
        }
        
        return accumulatedContent;
      } else {
        // Handle non-streaming response
        const data = await response.json();
        console.log('API Response:', data);
        
        // Extract content from various possible response formats
        let content = '';
        
        if (data.choices && data.choices[0]) {
          const choice = data.choices[0];
          
          if (choice.message && choice.message.content) {
            content = choice.message.content;
          } else if (choice.text) {
            content = choice.text;
          } else if (choice.content) {
            content = choice.content;
          }
        }
        
        if (!content && data.content) {
          content = data.content;
        }
        
        console.log('Extracted content:', content);
        onUpdate(content || "Sorry, I couldn't generate a response.");
        return content;
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error in AI request:', error);
        onUpdate("Sorry, there was an error processing your request.");
        throw error;
      }
    } finally {
      if (!streamControllerRef.current?.signal.aborted) {
        streamControllerRef.current = null;
      }
    }
  };

  // Handle Enter key for sending messages
  const handleKeyDown = (e) => {
    // Send message on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (editingMessageId) {
        saveEditedMessage();
      } else {
        handleSendMessage();
      }
    } else if (e.key === 'Escape') {
      if (editingMessageId) {
        cancelEditing();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white">
      {/* Header */}
      

      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-sm">
          {errorMessage}
          <button 
            onClick={() => setErrorMessage('')} 
            className="ml-2 text-red-700 hover:text-red-900"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Main Content Area with Messages */}
      <div className="flex flex-1 overflow-hidden">
        <div 
          ref={messagesContainerRef}
          className={`flex-1 p-4 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent`}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
              <img 
                src={study_assistant} 
                alt="AI Assistant" 
                className="w-72 h-72 object-contain mb-6 opacity-90" 
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How can I help you today?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendPrompt(prompt)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-left hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-800">{prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`mb-6 ${msg.isUser ? 'pl-10' : 'pr-10'}`}
                >
                  {editingMessageId === msg.id ? (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        rows={4}
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2 mt-3">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditedMessage}
                          className="px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div 
                        className={`rounded-2xl px-5 py-4 ${
                          msg.isUser 
                            ? 'bg-black text-white ml-auto' 
                            : 'bg-white border border-gray-200 shadow-sm text-gray-800'
                        }`}
                      >
                        {msg.isUser ? (
                          <div className="prose prose-sm text-white max-w-none">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="prose prose-gray prose-pre:bg-gray-50 prose-pre:text-black prose-sm max-w-none overflow-x-auto whitespace-pre-wrap">
                            {msg.text}
                          </div>
                        )}
                        
                        {/* Time stamp */}
                        {!msg.isStreaming && (
                          <div className={`text-xs mt-2 ${msg.isUser ? 'text-gray-300' : 'text-gray-500'}`}>
                            {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons for messages */}
                      <div className={`absolute top-2 ${msg.isUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2`}>
                        {msg.isUser && (
                          <button
                            onClick={() => startEditingMessage(msg.id, msg.text)}
                            className="p-1.5 bg-white text-gray-600 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50"
                            title="Edit message"
                          >
                            <PencilIcon size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && !isStreaming && (
                <div className="flex justify-start mb-6 pr-10">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Invisible element for auto-scrolling */}
          {messages.length > 0 && <div ref={messagesEndRef} className="h-20" />}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white px-4 py-4 sticky bottom-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear conversation"
              >
                <Trash2 size={20} />
              </button>
            )}
            
            <div className="flex flex-1 items-center bg-white rounded-full border border-gray-300 px-4 py-2 shadow-sm focus-within:border-gray-400">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading || editingMessageId !== null}
                className="flex-1 border-none resize-none focus:outline-none focus:ring-0 max-h-32 text-gray-800"
                rows={1}
              />
              <button 
                onClick={isStreaming ? stopStreaming : () => handleSendMessage()}
                disabled={(message.trim() === '' && !isStreaming) || (editingMessageId !== null)}
                className={`ml-2 p-2 rounded-full transition-colors flex items-center justify-center ${
                  isStreaming
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                    : message.trim() === ''
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isStreaming ? (
                  <Pause size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
