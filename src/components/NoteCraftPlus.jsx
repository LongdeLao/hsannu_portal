import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Loader2,
  Download,
  FileText,
  X,
  Bot,
  Sparkles
} from 'lucide-react';
import note_craft from '../assets/note_craft.png';
import { createConfig, MODES, TONES } from '../lib/notecraftConfig';
import html2pdf from 'html2pdf.js';
import { sendMessageToAI } from '../lib/aiUtils';

const NoteCraftPlus = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0); // 0-100
  const [generationStatus, setGenerationStatus] = useState(''); // Status message
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedPDF, setGeneratedPDF] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [streamedContent, setStreamedContent] = useState('');
  const [selectedMode, setSelectedMode] = useState('CRAFT');
  const [selectedTone, setSelectedTone] = useState('TUTOR');
  
  // Conversation context state
  const [isGatheringContext, setIsGatheringContext] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [contextReady, setContextReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Refs
  const streamControllerRef = useRef(null);
  const htmlPreviewRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (messagesEndRef.current && conversation.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  
  // Progress simulation
  useEffect(() => {
    let intervalId;
    
    if (isLoading && generationProgress < 90) {
      intervalId = setInterval(() => {
        setGenerationProgress(prev => {
          // Slower at the end to simulate "thinking"
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 80 ? 1 : 0.5;
          return Math.min(prev + increment, 90);
        });
      }, 300);
      
      setGenerationStatus("Crafting your notes...");
    } else if (isPdfGenerating) {
      setGenerationProgress(95);
      setGenerationStatus("Creating PDF document...");
    } else if (!isLoading && !isPdfGenerating && generationProgress > 0) {
      setGenerationProgress(100);
      setGenerationStatus("Complete!");
      
      // Reset after showing "Complete"
      const timeoutId = setTimeout(() => {
        setGenerationProgress(0);
        setGenerationStatus('');
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, isPdfGenerating, generationProgress]);
  
  // Clean up controller on unmount
  useEffect(() => {
    return () => {
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }
    };
  }, []);

  // Example prompts for note generation
  const examplePrompts = [
    "Create a note on IB Economics HL Market Failure",
    "Create a note on IB Math Complex Numbers",
    "Generate study notes for AP Biology DNA Replication",
    "Create revision notes for IGCSE Chemistry Organic Chemistry"
  ];

  // Clear current generated content
  const clearContent = () => {
    // Abort any ongoing stream
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
    
    setIsLoading(false);
    setIsPdfGenerating(false);
    setGenerationProgress(0);
    setGenerationStatus('');
    setGeneratedPDF(null);
    setPdfUrl(null);
    setPdfName('');
    setHtmlContent('');
    setStreamedContent('');
    setConversation([]);
    setIsGatheringContext(false);
    setContextReady(false);
    setIsGenerating(false);
  };

  const startContextGathering = (promptText) => {
    // Clear any previous state
    clearContent();
    
    // Start the conversation with the user's initial request
    const initialMessage = {
      id: Date.now(),
      text: promptText,
      isUser: true,
      time: new Date()
    };
    
    setConversation([initialMessage]);
    setIsGatheringContext(true);
    
    // Generate the first AI response asking for more details
    handleContextMessage(promptText, [initialMessage]);
  };

  const handleContextMessage = async (message, existingConvo = null) => {
    if (message.trim() === '' || isLoading) return;
    
    setIsLoading(true);
    
    // Use existing conversation if provided (to avoid duplicate messages)
    const currentConvo = existingConvo || conversation;
    
    // If this is not the initial message and no existing convo was provided, add to conversation
    if (!existingConvo && currentConvo.length > 0 && !currentConvo.find(msg => msg.text === message && msg.isUser)) {
      const userMessage = {
        id: Date.now(),
        text: message,
        isUser: true,
        time: new Date()
      };
      
      setConversation(prev => [...prev, userMessage]);
      setPrompt('');
    }
    
    try {
      // Create a system prompt for context gathering
      const contextConfig = {
        ...createConfig(selectedMode, selectedTone),
        SYSTEM_PROMPT: `You are NoteCraft+, an AI assistant designed to gather context before generating academic notes.
        
        Your task is to ask specific questions to understand what kind of notes the user needs.
        Ask about:
        - Specific topic details, subtopics to focus on
        - Education level (high school, undergraduate, etc.)
        - Purpose of the notes (exam revision, general learning, etc.)
        - Any specific aspects they want emphasized
        
        Ask 1-2 questions at a time. Keep your responses conversational and brief.
        
        When you have gathered enough context to create comprehensive notes, begin your response with [#READY] followed by a brief summary of what you'll create.
        
        If you still need more information, begin your response with [#CONTEXT] followed by your questions.
        
        Example:
        [#CONTEXT] I see you want notes on Economics. Could you specify which economic theory you're focusing on? And is this for high school or university level?
        
        OR 
        
        [#READY] I'll create comprehensive notes on Microeconomic Theory for undergraduate level, focusing on market structures and elasticity concepts.`
      };
      
      let aiResponse = '';
      
      // Get a response from the AI
      await sendMessageToAI(
        message, 
        currentConvo.map(msg => ({ text: msg.text, isUser: msg.isUser })), 
        streamControllerRef, 
        (newText) => {
          aiResponse = newText;
        }, 
        contextConfig
      );
      
      // Check if response indicates context is complete
      if (aiResponse.includes('[#READY]')) {
        const readyMessage = aiResponse.replace('[#READY]', '').trim();
        
        // Add the AI's final context message
        const aiReadyMessage = {
          id: Date.now(),
          text: readyMessage,
          isUser: false,
          time: new Date(),
          isReady: true
        };
        
        setConversation(prev => [...prev, aiReadyMessage]);
        setContextReady(true);
        
        // Extract a name for the PDF
        const extractedName = extractNameFromConversation(currentConvo, message);
        setPdfName(extractedName);
        
        // Start generating after a brief delay
        setTimeout(() => {
          generateNotesFromContext();
        }, 1000);
      } else {
        // Still gathering context, add the AI's question
        const contextResponse = aiResponse.replace('[#CONTEXT]', '').trim();
        
        const aiContextMessage = {
          id: Date.now(),
          text: contextResponse,
          isUser: false,
          time: new Date()
        };
        
        setConversation(prev => [...prev, aiContextMessage]);
      }
    } catch (error) {
      console.error('Error in context gathering:', error);
      setErrorMessage('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractNameFromConversation = (convo, lastMessage = '') => {
    // First try to extract from initial request
    const initialMessage = convo.length > 0 ? convo[0].text : lastMessage;
    const nameMatch = initialMessage.match(/(?:create|generate)(?:\sa\snote|\sstudy\snotes|\srevision\snotes|\snotes)(?:\sfor|\son)\s(.*?)(?:$|\.|,)/i);
    
    if (nameMatch) {
      return nameMatch[1].trim();
    }
    
    // If initial extraction fails, look for topic names in the conversation
    const topicIndicators = ['about', 'on', 'for', 'regarding', 'focus on', 'topic is'];
    
    for (const msg of convo) {
      if (msg.isUser) {
        for (const indicator of topicIndicators) {
          const regex = new RegExp(`${indicator}\\s+(.*?)(?:$|\\.|,)`, 'i');
          const match = msg.text.match(regex);
          if (match) return match[1].trim();
        }
      }
    }
    
    // Also check if any AI messages with isReady flag have topic information
    const readyMessage = convo.find(msg => msg.isReady);
    if (readyMessage) {
      const topic = readyMessage.text.match(/(?:notes on|about|regarding)\s([^,.]+)/i);
      if (topic) return topic[1].trim();
    }
    
    // Fallback
    return 'Generated-Notes';
  };

  // Process HTML content and add appropriate page breaks
  const processHtmlContent = (content) => {
    // Replace [#NEW_PAGE] tags with proper page break divs
    let processedContent = content.replace(/\[#NEW_PAGE\]/g, '<div class="page-break"></div>');
    
    // Add MathJax configuration and scripts if they're not already there
    if (!processedContent.includes('<script id="MathJax-script"')) {
      const mathJaxConfig = `
        <script>
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
            processEscapes: true,
            processEnvironments: true
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            ignoreHtmlClass: 'tex2jax_ignore',
            processHtmlClass: 'tex2jax_process'
          },
          startup: {
            ready: () => {
              MathJax.startup.defaultReady();
            }
          }
        };
        </script>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      `;
      
      const pageBreakStyles = `
        <style>
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          @media print {
            body {
              font-size: 12pt;
              line-height: 1.5;
              padding: 0;
              margin: 0;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
              height: 0;
              display: block;
            }
            /* Ensure LaTeX elements render properly in PDF */
            .MathJax, .math-inline, .math-block {
              page-break-inside: avoid;
            }
          }
        </style>
      `;
      
      // Add scripts and styles to head
      if (processedContent.includes('</head>')) {
        processedContent = processedContent.replace('</head>', `${mathJaxConfig}${pageBreakStyles}</head>`);
      } else {
        // If no head tag, add one
        processedContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${pdfName}</title>
            ${mathJaxConfig}
            ${pageBreakStyles}
          </head>
          <body>
            ${processedContent}
          </body>
          </html>
        `;
      }
    }
    
    return processedContent;
  };

  const generateNotesFromContext = async () => {
    setIsLoading(true);
    setGenerationProgress(5);
    setIsGenerating(true);
    setStreamedContent('');
    
    // Add a generating message to the conversation
    const generatingMessage = {
      id: Date.now(),
      text: "I'm generating your notes now...",
      isUser: false,
      time: new Date(),
      isGenerating: true
    };
    
    setConversation(prev => [...prev, generatingMessage]);
    
    try {
      // Prepare the prompt based on conversation context
      const contextPrompt = prepareContextPrompt(conversation);
      
      // Create config with selected mode and tone
      const config = createConfig(selectedMode, selectedTone);
      
      // Extract a name for the PDF before generating content
      const extractedName = extractNameFromConversation(conversation);
      setPdfName(extractedName);
      
      // Send to AI and collect the HTML content with streaming
      await sendMessageToAI(
        contextPrompt, 
        [], 
        streamControllerRef, 
        (newText) => {
          // Stream content in real time
          setStreamedContent(newText);
        }, 
        config
      );
      
      // Process the content to handle page breaks and LaTeX
      const processedContent = processHtmlContent(streamedContent);
      
      // Set the HTML content
      setHtmlContent(processedContent);
      
      // Keep the conversation visible
      setIsGatheringContext(true);
      
      setIsLoading(false);
      
      // Generate PDF in the background
      await generatePDF(processedContent);
      
      // Add a success message with download option after PDF is generated
      const successMessage = {
        id: Date.now(),
        text: `Your notes on "${pdfName}" are ready! Click the download button to save as PDF.`,
        isUser: false,
        time: new Date(),
        isSuccess: true
      };
      
      setConversation(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Error generating notes:', error);
      setErrorMessage('Failed to generate notes. Please try again.');
      setIsLoading(false);
      setGenerationProgress(0);
      setGenerationStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  const prepareContextPrompt = (convo) => {
    // Format the conversation into a detailed prompt
    let contextSummary = "Based on our conversation, please generate notes with the following requirements:\n\n";
    
    // Extract key information from the conversation
    const topics = [];
    const level = [];
    const focus = [];
    const purpose = [];
    
    convo.forEach(msg => {
      const text = msg.text.toLowerCase();
      
      // Topic identification
      if (text.includes("topic") || text.includes("subject") || text.includes("about")) {
        topics.push(msg.text);
      }
      
      // Educational level
      if (text.includes("level") || text.includes("grade") || text.includes("university") || 
          text.includes("college") || text.includes("school")) {
        level.push(msg.text);
      }
      
      // Focus areas
      if (text.includes("focus") || text.includes("emphasize") || text.includes("highlight") ||
          text.includes("concentrate") || text.includes("specific")) {
        focus.push(msg.text);
      }
      
      // Purpose
      if (text.includes("purpose") || text.includes("reason") || text.includes("why") ||
          text.includes("goal") || text.includes("need") || text.includes("exam") ||
          text.includes("test")) {
        purpose.push(msg.text);
      }
    });
    
    // Build the prompt
    contextSummary += `Topic: ${topics.join(". ")}\n`;
    
    if (level.length > 0) {
      contextSummary += `Educational Level: ${level.join(". ")}\n`;
    }
    
    if (focus.length > 0) {
      contextSummary += `Focus Areas: ${focus.join(". ")}\n`;
    }
    
    if (purpose.length > 0) {
      contextSummary += `Purpose: ${purpose.join(". ")}\n`;
    }
    
    // Add page break instructions
    contextSummary += `\nIMPORTANT PAGE BREAK INSTRUCTIONS:
    - Use [#NEW_PAGE] tag to indicate where new pages should start in the PDF
    - Make sure each page contains a complete concept or related set of concepts
    - Each page should be appropriate for A4 format (approximately 600-800 words)
    - Insert page breaks before major section changes
    - Do not use <div class="page-break"></div>, use [#NEW_PAGE] instead\n\n`;
    
    // Add the full conversation for context
    contextSummary += "Full conversation for reference:\n";
    convo.forEach(msg => {
      contextSummary += `${msg.isUser ? "User" : "AI"}: ${msg.text}\n`;
    });
    
    return contextSummary;
  };

  const handleSendPrompt = (promptText) => {
    setPrompt(promptText);
    // Start context gathering with this prompt
    startContextGathering(promptText);
  };

  const handleGenerateNotes = async () => {
    if (prompt.trim() === '' || isLoading) return;
    
    if (isGatheringContext) {
      // If we're in context gathering mode, add to the conversation
      handleContextMessage(prompt);
    } else {
      // Otherwise start a new context gathering session
      startContextGathering(prompt);
    }
  };

  const generatePDF = async (content = null) => {
    try {
      setIsPdfGenerating(true);
      
      // Process content if not already processed
      const processedContent = content || processHtmlContent(htmlContent);
      
      // Create a container for the content
      const element = document.createElement('div');
      element.innerHTML = processedContent;
      document.body.appendChild(element);
      
      // Force MathJax to render
      if (window.MathJax) {
        try {
          // Add a small delay to allow MathJax to load if it hasn't yet
          await new Promise(resolve => setTimeout(resolve, 1000));
          await window.MathJax.typesetPromise([element]);
        } catch (err) {
          console.warn('Error typesetting math:', err);
        }
      }
      
      // Wait a bit more to ensure all rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const options = {
        margin: 10,
        filename: `${pdfName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      const pdf = await html2pdf()
        .from(element)
        .set(options)
        .outputPdf('blob');
      
      document.body.removeChild(element);
      
      // Create URL for the PDF
      const url = URL.createObjectURL(pdf);
      setPdfUrl(url);
      setGeneratedPDF(pdf);
      setIsPdfGenerating(false);
      
      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Failed to generate PDF. Please try again.');
      setIsPdfGenerating(false);
      throw error;
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateNotes();
    }
  };

  // Message component for conversation
  const Message = ({ message }) => {
    const isUser = message.isUser;
    
    return (
      <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isUser 
            ? 'bg-black text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        } ${message.isReady ? 'border-2 border-green-500' : ''}`}>
          {message.isReady && (
            <div className="flex items-center text-green-600 mb-1">
              <Sparkles className="h-4 w-4 mr-1" />
              <span className="text-xs font-bold">Ready to generate!</span>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          
          {/* Generation progress - shown only in the generating message */}
          {!isUser && message.isGenerating && isGenerating && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <span className="text-sm font-medium text-gray-800 mb-1 block">{generationStatus}</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                {generationProgress < 100 ? 'Please wait...' : 'Done!'}
              </span>
              
              {/* Streaming preview (very simple version) */}
              {streamedContent && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Preview (generating...)</div>
                  <div className="max-h-32 overflow-auto text-xs bg-white p-2 rounded border border-gray-200">
                    {/* Show just the first few lines of the content */}
                    {streamedContent.split('\n').slice(0, 10).join('\n')}
                    {streamedContent.split('\n').length > 10 && <div>...</div>}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Download button - shown in success message */}
          {!isUser && message.isSuccess && pdfUrl && (
            <div className="mt-3 pt-2 space-y-2">
              <a
                href={pdfUrl}
                download={`${pdfName}.pdf`}
                className="flex items-center justify-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                <span>Download PDF</span>
              </a>
              <button
                onClick={clearContent}
                className="flex items-center justify-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200 w-full mt-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Create New Notes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white">
      {/* Header with mode and tone selectors */}
      <div className="bg-white border-b border-gray-200 p-3 pt-5 flex flex-col">
        {/* Mode selector */}
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Mode:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(MODES).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedMode === mode
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={MODES[mode].description}
              >
                {MODES[mode].name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tone selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tone:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(TONES).map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedTone === tone
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={TONES[tone].description}
              >
                {TONES[tone].name}
              </button>
            ))}
          </div>
        </div>
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
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative">
        <div className="p-4 min-h-[calc(100vh-220px)] flex items-stretch">
          {/* Initial state - No content and not in context gathering mode */}
          {!isGatheringContext ? (
            <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-10">
              <img 
                src={note_craft} 
                alt="NoteCraft+" 
                className="w-72 h-72 object-contain mb-6 opacity-90" 
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Create academic notes with AI</h2>
              
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
            // Context gathering conversation view
            <div className="max-w-3xl mx-auto w-full flex flex-col">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-1">Gathering details</h3>
                <p className="text-sm text-gray-600">
                  Let's discuss your needs to create tailored notes. Answer the questions to help me understand what you need.
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 min-h-[400px]">
                {conversation.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={isGatheringContext 
                ? "Reply to the questions..." 
                : "Enter a topic to generate notes on..."}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:outline-none resize-none h-14 transition duration-200"
              style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
            />
            <button
              onClick={handleGenerateNotes}
              disabled={isLoading || prompt.trim() === ''}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-1.5 rounded-full bg-black hover:bg-gray-800 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCraftPlus; 