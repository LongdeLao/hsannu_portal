import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  PencilIcon, 
  Pause, 
  X, 
  Loader2,
  BookOpen,
  Download,
  Copy,
  CheckCheck,
  User,
  Bot
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import study_assistant from '../assets/study_assistant.png';
import { AI_CONFIG, APP_NAME } from '../config';
import { formatText, sendMessageToAI, copyToClipboard as copyText } from '../lib/aiUtils';
import html2pdf from 'html2pdf.js';

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isCopied, setIsCopied] = useState(null);
  
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
      
      // Update the current streaming message to mark it as complete and add [Stopped] text
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const streamingMessageIndex = updatedMessages.findIndex(msg => msg.isStreaming);
        
        if (streamingMessageIndex !== -1) {
          updatedMessages[streamingMessageIndex] = {
            ...updatedMessages[streamingMessageIndex],
            text: updatedMessages[streamingMessageIndex].text + " [Stopped]",
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
      await sendMessageToAI(textToSend, messages, streamControllerRef, (newText) => {
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

  // Updated handleCopyToClipboard function to accept message ID
  const handleCopyToClipboard = (text, messageId) => {
    copyText(text, (isCopied) => {
      if (isCopied) {
        setIsCopied(messageId);
        setTimeout(() => setIsCopied(null), 2000);
      }
    });
  };

  // Export conversation as PDF
  const handleExportConversation = () => {
    if (messages.length === 0) return;
    
    // Create a temporary container for the conversation
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = 'Conversation with HSANNU AI Assistant';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '10px';
    container.appendChild(title);
    
    // Add timestamp
    const timestamp = document.createElement('p');
    timestamp.textContent = `Exported on ${new Date().toLocaleString()}`;
    timestamp.style.textAlign = 'center';
    timestamp.style.color = '#666';
    timestamp.style.marginBottom = '30px';
    container.appendChild(timestamp);
    
    // Add each message
    messages.forEach(msg => {
      const messageContainer = document.createElement('div');
      messageContainer.style.display = 'flex';
      messageContainer.style.marginBottom = '20px';
      messageContainer.style.alignItems = 'flex-start';
      
      // Avatar container
      const avatarContainer = document.createElement('div');
      avatarContainer.style.width = '40px';
      avatarContainer.style.height = '40px';
      avatarContainer.style.borderRadius = '50%';
      avatarContainer.style.backgroundColor = '#000';
      avatarContainer.style.display = 'flex';
      avatarContainer.style.alignItems = 'center';
      avatarContainer.style.justifyContent = 'center';
      avatarContainer.style.color = '#fff';
      avatarContainer.style.fontWeight = 'bold';
      avatarContainer.style.marginRight = msg.isUser ? '0' : '10px';
      avatarContainer.style.marginLeft = msg.isUser ? '10px' : '0';
      avatarContainer.style.flexShrink = '0';
      avatarContainer.textContent = msg.isUser ? 'You' : 'AI';
      
      // Message bubble
      const bubble = document.createElement('div');
      bubble.style.padding = '10px 15px';
      bubble.style.borderRadius = '12px';
      bubble.style.maxWidth = '80%';
      
      if (msg.isUser) {
        bubble.style.backgroundColor = '#000';
        bubble.style.color = '#fff';
        bubble.style.marginLeft = 'auto';
      } else {
        bubble.style.backgroundColor = '#f8f9fa';
        bubble.style.border = '1px solid #e9ecef';
      }
      
      // Message text
      const messageText = document.createElement('div');
      messageText.innerHTML = msg.isUser ? msg.text : formatHTMLFromAI(msg.text);
      bubble.appendChild(messageText);
      
      // Timestamp
      const time = document.createElement('div');
      time.textContent = new Date(msg.time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      time.style.fontSize = '12px';
      time.style.color = '#aaa';
      time.style.marginTop = '5px';
      time.style.textAlign = msg.isUser ? 'right' : 'left';
      bubble.appendChild(time);
      
      // Arrange the message layout based on sender
      if (msg.isUser) {
        messageContainer.appendChild(bubble);
        messageContainer.appendChild(avatarContainer);
        messageContainer.style.flexDirection = 'row-reverse';
      } else {
        messageContainer.appendChild(avatarContainer);
        messageContainer.appendChild(bubble);
      }
      
      container.appendChild(messageContainer);
    });
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.marginTop = '30px';
    footer.style.textAlign = 'center';
    footer.style.fontSize = '12px';
    footer.style.color = '#888';
    footer.style.borderTop = '1px solid #eee';
    footer.style.paddingTop = '10px';
    footer.textContent = `${APP_NAME} - Conversation exported via AI Assistant`;
    container.appendChild(footer);
    
    // Append container to document temporarily
    document.body.appendChild(container);
    
    // Generate PDF
    const options = {
      margin: 10,
      filename: `ai-conversation-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(container).set(options).save().then(() => {
      // Clean up - remove the container after PDF generation
      document.body.removeChild(container);
    });
  };
  
  // Helper function to prepare AI message content for PDF
  const formatHTMLFromAI = (text) => {
    // First handle bullet points with a more specific pattern to avoid interfering with bold text
    let formatted = text;
    
    // Handle bullet points that start with •
    formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');
    
    // Handle bullet points that start with * at beginning of line (not **) 
    // Use negative lookahead to ensure it's not part of a bold marker
    formatted = formatted.replace(/^\* (?!\*)(.+)$/gm, '<li>$1</li>');
    
    // Wrap adjacent list items in ul tags
    const listItemRegex = /<li>(.+?)<\/li>/g;
    let match;
    let listItems = [];
    
    while ((match = listItemRegex.exec(formatted)) !== null) {
      listItems.push({
        fullMatch: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Process list items in reverse order to avoid changing indexes
    if (listItems.length > 0) {
      // Find adjacent list items and group them
      let groups = [];
      let currentGroup = [listItems[0]];
      
      for (let i = 1; i < listItems.length; i++) {
        const prevItem = listItems[i-1];
        const currentItem = listItems[i];
        
        // Check if items are adjacent (allowing for some whitespace/newlines between)
        const textBetween = formatted.substring(prevItem.end, currentItem.start);
        if (textBetween.trim() === '' || textBetween.match(/^\s*[\n\r]+\s*$/)) {
          currentGroup.push(currentItem);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [currentItem];
        }
      }
      
      // Add the last group
      groups.push(currentGroup);
      
      // Process groups in reverse order to avoid changing indexes
      for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        if (group.length > 0) {
          const startPos = group[0].start;
          const endPos = group[group.length - 1].end;
          
          const listContent = formatted.substring(startPos, endPos);
          formatted = 
            formatted.substring(0, startPos) + 
            '<ul>' + listContent + '</ul>' + 
            formatted.substring(endPos);
        }
      }
    }
    
    // Now process other formatting
    formatted = formatted
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*([^\s*][^*]*?[^\s*])\*/g, '<em>$1</em>') // Italic (don't match single asterisks in the middle of words)
      .replace(/`([^`]+)`/g, '<code style="background-color:#f0f0f0;padding:2px 4px;border-radius:3px;font-family:monospace;">$1</code>') // Inline code
      .replace(/\n\n/g, '<br/><br/>') // Paragraphs
      .replace(/\n/g, '<br/>'); // Line breaks
    
    // Handle numbered lists
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/<li>(.+)<\/li>/g, function(match) {
      // Only wrap in ol tags if not already in a list
      if (match.indexOf('<ul>') === -1 && match.indexOf('<ol>') === -1) {
        return '<ol>' + match + '</ol>';
      }
      return match;
    });
    
    return formatted;
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
  
  // Render formatted text with bold sections, bullet points, code blocks, and LaTeX
  const FormattedText = ({ text }) => {
    const segments = formatText(text);
    
    // Function to render LaTeX safely
    const renderLatex = (latexText, isBlock) => {
      try {
        // Clean the LaTeX input
        let cleanLatex = latexText.trim();
        
        // Remove any leftover LaTeX delimiters that might have been included in the content
        if (cleanLatex.startsWith('$$') && cleanLatex.endsWith('$$')) {
          cleanLatex = cleanLatex.slice(2, -2);
        } else if (cleanLatex.startsWith('$') && cleanLatex.endsWith('$')) {
          cleanLatex = cleanLatex.slice(1, -1);
        }
        
        const html = katex.renderToString(cleanLatex, {
          throwOnError: false,
          displayMode: isBlock, // displayMode for block equations (centered, larger)
          strict: false,        // Don't throw errors on small issues
          output: 'html',       // Ensure we get HTML output
          trust: true,          // Trust the input for macros
          macros: {             // Common LaTeX macros
            "\\R": "\\mathbb{R}",
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}",
            "\\Q": "\\mathbb{Q}"
          }
        });
        return { __html: html };
      } catch (error) {
        console.error('LaTeX rendering error for input:', latexText, error);
        // Fallback to displaying the raw LaTeX with error message
        const delimiter = isBlock ? '$$' : '$';
        return { 
          __html: `<span class="text-red-500">${delimiter}${latexText}${delimiter}</span>` 
        };
      }
    };
    
    // Process the text to properly format code blocks with indentation and line breaks
    const processCodeBlock = (codeText, language) => {
      // Remove potential extra newlines at the beginning and end
      const trimmedCode = codeText.trim();
      
      // Create an array of lines from the code text
      const lines = trimmedCode.split('\n');
      
      // Find minimum indentation to remove from all lines
      let minIndent = Infinity;
      lines.forEach(line => {
        if (line.trim().length === 0) return; // Skip empty lines
        const indent = line.search(/\S/);
        if (indent !== -1 && indent < minIndent) {
          minIndent = indent;
        }
      });
      
      // Adjust for case where there's no indentation
      minIndent = minIndent === Infinity ? 0 : minIndent;
      
      // Remove common indentation from all lines
      const formattedLines = lines.map(line => {
        if (line.trim().length === 0) return line; // Keep empty lines as is
        return line.substring(minIndent);
      });
      
      return formattedLines.join('\n');
    };
    
    // Function to render a table from markdown-style table text
    const renderTable = (tableText) => {
      const rows = tableText.trim().split('\n');
      const hasHeader = rows.length > 1 && rows[1].includes('-');
      
      // Skip the separator row if present
      const dataRows = hasHeader ? [rows[0], ...rows.slice(2)] : rows;
      
      // Function to process cell content with markdown formatting
      const processCellContent = (cellText) => {
        // Process bold text
        const boldProcessed = cellText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Process italic text
        const italicProcessed = boldProcessed.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        
        // Process inline code
        const codeProcessed = italicProcessed.replace(/`([^`]+)`/g, 
          '<code style="background-color:#f0f0f0;padding:2px 4px;border-radius:3px;font-family:monospace;">$1</code>');
        
        // Return formatted cell content
        return <div dangerouslySetInnerHTML={{ __html: codeProcessed }} />;
      };
      
      return (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border-collapse my-4">
            <tbody>
              {dataRows.map((row, rowIndex) => {
                const cells = row.split('|').filter(cell => cell.trim() !== '');
                return (
                  <tr key={rowIndex} className={rowIndex === 0 && hasHeader ? 'bg-gray-100' : ''}>
                    {cells.map((cell, cellIndex) => {
                      const Element = rowIndex === 0 && hasHeader ? 'th' : 'td';
                      const trimmedCell = cell.trim();
                      
                      // Check if the cell contains any formatting
                      const hasFormatting = /(\*\*|\*|`)/.test(trimmedCell);
                      
                      return (
                        <Element 
                          key={cellIndex}
                          className="border border-gray-300 px-4 py-2 text-sm"
                        >
                          {hasFormatting ? processCellContent(trimmedCell) : trimmedCell}
                        </Element>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };
    
    return (
      <div className="prose prose-gray prose-pre:bg-gray-50 prose-pre:text-black text-base max-w-none whitespace-pre-wrap">
        {segments.map((segment, index) => {
          if (segment.isLatex) {
            // Render LaTeX expressions
            return (
              <div 
                key={segment.key}
                className={`my-4 ${segment.isLatexBlock ? 'text-center overflow-x-auto' : 'inline-block'}`}
                dangerouslySetInnerHTML={renderLatex(segment.text, segment.isLatexBlock)}
              />
            );
          } else if (segment.isCode) {
            // Render code blocks in pre/code tags with improved styling
            const processedCode = processCodeBlock(segment.text, segment.language);
            
            // Add syntax highlighting classes based on language
            const languageClass = segment.language ? `language-${segment.language}` : '';
            
            return (
              <div key={segment.key} className="w-full overflow-x-auto my-4 border border-gray-200 rounded-md">
                <pre className="bg-gray-100 p-3 text-sm font-mono w-max min-w-full overflow-visible">
                  <code className={languageClass}>
                    {processedCode}
                  </code>
                </pre>
              </div>
            );
          } else if (segment.isTable) {
            // Render tables
            return (
              <div key={segment.key} className="my-4 w-full">
                {renderTable(segment.text)}
              </div>
            );
          } else if (segment.isHorizontalRule) {
            // Render horizontal rules
            return (
              <hr key={segment.key} className="my-5 border-t border-gray-300 w-full" />
            );
          } else if (segment.isBlockquote) {
            // Render blockquotes
            return (
              <blockquote 
                key={segment.key} 
                className="pl-4 border-l-4 border-gray-300 text-gray-700 italic my-3"
              >
                <span className={segment.isBold ? "font-bold" : segment.isItalic ? "italic" : ""}>
                  {segment.text}
                </span>
              </blockquote>
            );
          } else if (segment.isInlineCode) {
            // Render inline code
            return (
              <code 
                key={segment.key}
                className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-sm border border-gray-200"
              >
                {segment.text}
              </code>
            );
          } else if (segment.isBullet || segment.isNumbered) {
            // Render bullet points and numbered list items with indentation
            const indentClass = segment.indentLevel ? `ml-${segment.indentLevel * 6}` : '';
            return (
              <div key={segment.key} className={`flex items-start pl-2 mb-3 ${indentClass}`}>
                <span className="mr-2 mt-0.5 flex-shrink-0 text-gray-700 w-5 text-right">
                  {segment.isNumbered ? `${segment.numberValue}.` : '•'}
                </span>
                <span 
                  className={
                    segment.isBold 
                      ? "font-bold" 
                      : segment.isItalic 
                        ? "italic" 
                        : ""
                  }
                >
                  {segment.text}
                </span>
              </div>
            );
          } else if (segment.isHeader) {
            // Render Markdown headers
            const headerSize = segment.headerLevel;
            let className;
            
            switch (headerSize) {
              case 1:
                className = "text-3xl font-bold mt-8 mb-4 border-b pb-2 border-gray-200";
                break;
              case 2:
                className = "text-2xl font-bold mt-6 mb-3";
                break;
              case 3:
                className = "text-xl font-bold mt-5 mb-2";
                break;
              case 4:
                className = "text-lg font-bold mt-4 mb-2";
                break;
              default:
                className = "text-base font-bold mt-3 mb-2";
            }
            
            return (
              <div key={segment.key} className={className}>
                {segment.text}
              </div>
            );
          } else {
            // Regular text with possible bold or italic formatting
            // Check if this is the start of a new line
            const isNewLine = index > 0 && 
              segments[index-1].text.endsWith('\n');
              
            let className = segment.isBold ? "font-bold" : segment.isItalic ? "italic" : "";
            
            if (isNewLine) {
              className += " block mt-3";
            }
            
            return (
              <span key={segment.key} className={className}>
                {segment.text}
              </span>
            );
          }
        })}
      </div>
    );
  };

  // Message bubble component
  const MessageBubble = ({ message, isCopied, handleCopy, onEdit }) => {
    const isUser = message.isUser;
    
    return (
      <div className={`flex items-start gap-3 mb-8 ${isUser ? 'justify-end' : 'justify-start'} relative group w-full`}>
        {/* AI Avatar - only show on left for AI messages */}
        {!isUser && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-black flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
        )}
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isUser ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
          <div 
            className={`relative rounded-xl px-5 py-3.5 w-full ${
              isUser 
                ? 'bg-black text-white' 
                : 'bg-white border border-gray-200 shadow-sm text-gray-800'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            ) : message.isStreaming && message.text === '' ? (
              <div className="flex items-center">
                <span className="thinking-animation">
                  Thinking<span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            ) : (
              <div className="relative min-w-0 w-full">
                <FormattedText text={message.text} />
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          {!message.isStreaming && (
            <span className={`text-xs mt-1.5 ${isUser ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        
        {/* User Avatar - only show on right for user messages */}
        {isUser && (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-black flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Action buttons */}
        {isUser ? (
          // Edit button for user messages
          <div className="absolute -left-12 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(message.id, message.text)}
              className="p-2 bg-white text-gray-600 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50"
              title="Edit message"
            >
              <PencilIcon size={16} />
            </button>
          </div>
        ) : (
          // Copy button for AI messages
          <div className="absolute -right-12 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => handleCopy(message.text, message.id)}
              className="p-2 bg-white text-gray-600 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <CheckCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white">
      {/* Header - simplified version */}
      <div className="bg-white px-4 py-3 flex items-center justify-end sticky top-0 z-20">
        {messages.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={handleExportConversation}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              title="Export conversation"
            >
              <Download size={18} />
            </button>
            <button
              onClick={clearChat}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              title="New chat"
            >
              <span className="flex items-center gap-1">
                <span className="text-sm font-medium">New Chat</span>
              </span>
            </button>
          </div>
        )}
      </div>

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
            <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto">
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
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex flex-col items-stretch">
                {messages.map((msg, index) => (
                  <div key={msg.id} ref={index === messages.length - 1 ? messagesEndRef : null} className="w-full">
                    {editingMessageId === msg.id ? (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEditedMessage}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            disabled={!editText.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <MessageBubble 
                        message={msg} 
                        isCopied={isCopied === msg.id}
                        handleCopy={handleCopyToClipboard}
                        onEdit={startEditingMessage}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Invisible div for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 relative">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading && !isStreaming}
              placeholder="Message HSANNU AI Assistant..."
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:outline-none resize-none h-14 transition duration-200 flex items-center"
              style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            />
            <button
              onClick={isStreaming ? stopStreaming : () => handleSendMessage()}
              disabled={(isLoading && !isStreaming) || (!isStreaming && message.trim() === '')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-1.5 rounded-full bg-black hover:bg-gray-800 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading && !isStreaming ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isStreaming ? (
                <div className="w-4 h-4 bg-white" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Add the thinking animation CSS */}
      <style jsx="true">{`
        .thinking-animation span {
          opacity: 0;
          animation: thinking 1.4s infinite;
          font-weight: bold;
        }
        
        .thinking-animation span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .thinking-animation span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .thinking-animation span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes thinking {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
