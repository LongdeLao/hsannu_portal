import { AI_CONFIG, APP_NAME } from '../config';

/**
 * Format text by processing various Markdown-style formatting elements
 * including headers, lists, code blocks, LaTeX, and other formatting
 * @param {string} text - The text to format
 * @returns {Array} Array of formatted text segments
 */
export const formatText = (text) => {
  if (!text) return [];

  // First, fix any unmatched LaTeX delimiters to prevent parsing issues
  text = fixLatexDelimiters(text);

  // Split the text by different parts that need special rendering
  const segments = [];
  const lines = text.split('\n');
  
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
  let inTable = false;
  let tableRows = [];
  let inMultilineLatex = false;
  let latexContent = '';
  
  // Process each line
  lines.forEach((line, lineIndex) => {
    // Handle code blocks with triple backticks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        segments.push({
          text: codeContent,
          isCode: true,
          language: codeLanguage,
          isBold: false,
          isItalic: false,
          isBullet: false,
          isNumbered: false,
          isLatex: false,
          isLatexBlock: false,
          isHeader: false,
          isBlockquote: false,
          isHorizontalRule: false,
          isInlineCode: false,
          isTable: false,
          key: `code-${lineIndex}`
        });
        codeContent = '';
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
        // Extract language if specified
        const langMatch = line.trim().match(/^```(\w*)$/);
        codeLanguage = langMatch && langMatch[1] ? langMatch[1] : '';
      }
      return;
    }
    
    // If we're in a code block, add the line to the code content
    if (inCodeBlock) {
      codeContent += line + '\n';
      return;
    }
    
    // Handle multi-line LaTeX blocks
    // Check for standalone $$ lines that start or end a block
    if (line.trim() === '$$') {
      if (inMultilineLatex) {
        // End of LaTeX block
        segments.push({
          text: latexContent.trim(),
          isCode: false,
          isBold: false,
          isItalic: false,
          isBullet: false,
          isNumbered: false,
          isLatex: true,
          isLatexBlock: true,
          isHeader: false,
          isBlockquote: false,
          isHorizontalRule: false,
          isInlineCode: false,
          isTable: false,
          key: `latex-block-${lineIndex}`
        });
        latexContent = '';
        inMultilineLatex = false;
      } else {
        // Start of LaTeX block
        inMultilineLatex = true;
      }
      return;
    }
    
    // Add content to multi-line LaTeX block
    if (inMultilineLatex) {
      latexContent += line + '\n';
      return;
    }
    
    // Handle single-line LaTeX block (where $$ is at the beginning and end of the same line)
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
      const latexBlock = line.trim().slice(2, -2);
      segments.push({
        text: latexBlock,
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: true,
        isLatexBlock: true,
        isHeader: false,
        isBlockquote: false,
        isHorizontalRule: false,
        isInlineCode: false,
        isTable: false,
        key: `latex-block-${lineIndex}`
      });
      return;
    }
    
    // Handle LaTeX formula lines - lines that contain complex formulas like \frac{d}{dx}
    if (line.includes('\\frac') || line.includes('\\sum') || line.includes('\\int') || 
        line.includes('\\lim') || (line.includes('\\') && line.includes('{'))) {
      
      // Check if line is already enclosed in $$ (LaTeX block)
      const trimmedLine = line.trim();
      if (!(trimmedLine.startsWith('$$') && trimmedLine.endsWith('$$'))) {
        // Process this line as a block LaTeX formula
        segments.push({
          text: line.trim(),
          isCode: false,
          isBold: false,
          isItalic: false,
          isBullet: false,
          isNumbered: false,
          isLatex: true,
          isLatexBlock: true,
          isHeader: false,
          isBlockquote: false,
          isHorizontalRule: false,
          isInlineCode: false,
          isTable: false,
          key: `latex-formula-${lineIndex}`
        });
        return;
      }
    }
    
    // Handle table rows (starting/continuing tables)
    if (line.includes('|') && (line.trim().startsWith('|') || line.includes(' | '))) {
      // If this is a table header separator line (contains only |, -, and :)
      if (line.replace(/[\|\-\:\s]/g, '').length === 0 && line.includes('-')) {
        // This is a separator row, we're in a table
        inTable = true;
        tableRows.push(line);
        return;
      }
      
      if (inTable || tableRows.length === 0) {
        // Add to table rows
        tableRows.push(line);
        return;
      }
    } else if (inTable && tableRows.length > 0) {
      // We've exited the table, process it
      segments.push(processTable(tableRows, lineIndex - tableRows.length));
      tableRows = [];
      inTable = false;
    }
    
    // Skip if we're still collecting table rows
    if (inTable) return;
    
    // Check for horizontal rule (---, ***, or ___)
    if (/^(\*\*\*|---|___)\s*$/.test(line.trim())) {
      segments.push({
        text: '',
        isHorizontalRule: true,
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: false,
        isLatexBlock: false,
        isHeader: false,
        isBlockquote: false,
        isInlineCode: false,
        isTable: false,
        key: `hr-${lineIndex}`
      });
      return;
    }
    
    // Check for headers (# Heading)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      segments.push({
        text: headerMatch[2],
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: false,
        isLatexBlock: false,
        isHeader: true,
        headerLevel: headerMatch[1].length,
        isBlockquote: false,
        isHorizontalRule: false,
        isInlineCode: false,
        isTable: false,
        key: `header-${lineIndex}`
      });
      return;
    }
    
    // Check for blockquotes
    if (line.trim().startsWith('> ')) {
      const quoteContent = line.trim().substring(2);
      
      // Process inline formats within the blockquote
      const quoteSegments = processInlineFormats(quoteContent, `quote-${lineIndex}`);
      quoteSegments.forEach(segment => {
        segments.push({
          ...segment,
          isBlockquote: true
        });
      });
      return;
    }
    
    // Check for bullet points with either * or • character
    const bulletMatch = line.match(/^(\s*)([\*\•])\s+(.+)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      const bulletChar = bulletMatch[2]; // * or •
      const bulletContent = bulletMatch[3];
      
      // Process inline formats within the bullet content
      const bulletSegments = processInlineFormats(bulletContent, `bullet-${lineIndex}`);
      bulletSegments.forEach(segment => {
        segments.push({
          ...segment,
          isBullet: true,
          bulletChar: bulletChar,
          indentLevel: Math.floor(indent / 2)  // Calculate indent level
        });
      });
      return;
    }
    
    // Check for numbered list items
    const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const indent = numberedMatch[1].length;
      const number = numberedMatch[2];
      const itemContent = numberedMatch[3];
      
      // Process inline formats within the numbered item content
      const numberSegments = processInlineFormats(itemContent, `number-${lineIndex}`);
      numberSegments.forEach(segment => {
        segments.push({
          ...segment,
          isNumbered: true,
          numberValue: number,
          indentLevel: Math.floor(indent / 2)  // Calculate indent level
        });
      });
      return;
    }
    
    // For regular lines, check for inline formats (LaTeX, bold, etc.)
    const lineSegments = processInlineFormats(line, `line-${lineIndex}`);
    segments.push(...lineSegments);
  });
  
  // If we're still in a code block at the end, add the remaining content
  if (inCodeBlock && codeContent) {
    segments.push({
      text: codeContent,
      isCode: true,
      language: codeLanguage,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: `code-final`
    });
  }
  
  // If we're still in a multi-line LaTeX block at the end, add the remaining content
  if (inMultilineLatex && latexContent) {
    segments.push({
      text: latexContent.trim(),
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: true,
      isLatexBlock: true,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: `latex-final`
    });
  }
  
  // If we still have table rows at the end, add them
  if (tableRows.length > 0) {
    segments.push(processTable(tableRows, 'final'));
  }
  
  return segments;
};

/**
 * Process a table, including any formatting within cells
 * @param {Array} tableRows - Array of table row strings
 * @param {string|number} keyIndex - Index for key generation
 * @returns {Object} A segment representing the processed table
 */
function processTable(tableRows, keyIndex) {
  // First, check if there are any formatting markers in the table
  const tableText = tableRows.join('\n');
  const hasFormatting = /(\*\*|__|`|\$)/.test(tableText);
  
  // If there's no formatting, return a simple table segment
  if (!hasFormatting) {
    return {
      text: tableText,
      isTable: true,
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      tableData: tableRows,
      key: `table-${keyIndex}`
    };
  }
  
  // Process each row to extract the formatted content
  const processedRows = tableRows.map(row => {
    // Skip separator row
    if (row.replace(/[\|\-\:\s]/g, '').length === 0) {
      return { cells: [{ text: row, isRaw: true }] };
    }
    
    // Split into cells but preserve |
    const rawCells = row.split('|');
    
    // Process each cell
    const cells = [];
    for (let i = 0; i < rawCells.length; i++) {
      let cell = rawCells[i].trim();
      
      // Skip empty cells at start/end that result from leading/trailing |
      if (i === 0 && cell === '' && row.startsWith('|')) continue;
      if (i === rawCells.length - 1 && cell === '' && row.endsWith('|')) continue;
      
      // Process formatting in the cell content
      if (cell) {
        // Check for bold text
        const boldMatch = cell.match(/\*\*([^*]+)\*\*/);
        if (boldMatch) {
          cells.push({
            text: boldMatch[1],
            isBold: true
          });
        } 
        // Check for italic text
        else if (cell.match(/\*([^*]+)\*/)) {
          const italicMatch = cell.match(/\*([^*]+)\*/);
          cells.push({
            text: italicMatch[1],
            isItalic: true
          });
        }
        // Check for inline code
        else if (cell.match(/`([^`]+)`/)) {
          const codeMatch = cell.match(/`([^`]+)`/);
          cells.push({
            text: codeMatch[1],
            isInlineCode: true
          });
        }
        // Plain text cell
        else {
          cells.push({
            text: cell,
            isPlain: true
          });
        }
      } else {
        cells.push({
          text: '',
          isPlain: true
        });
      }
    }
    
    return { cells };
  });
  
  // Return the processed table
  return {
    text: tableText,
    isTable: true,
    isCode: false,
    isBold: false,
    isItalic: false,
    isBullet: false,
    isNumbered: false,
    isLatex: false,
    isLatexBlock: false,
    isHeader: false,
    isBlockquote: false,
    isHorizontalRule: false,
    isInlineCode: false,
    tableData: tableRows,
    processedTable: processedRows,
    hasFormattedCells: hasFormatting,
    key: `table-${keyIndex}`
  };
}

/**
 * Process inline formats like LaTeX expressions, bold/italic text, and inline code
 * @param {string} text - The text to process
 * @param {string} baseKey - Base key for identifying segments
 * @returns {Array} Array of formatted text segments
 */
function processInlineFormats(text, baseKey) {
  const segments = [];
  let remaining = text;
  let currentIndex = 0;
  
  // Regular expressions for each inline format
  // To avoid conflicts, we'll execute them in order of precedence
  const inlineFormats = [
    // Inline code (`...`) - check this first to prevent conflicts
    { regex: /`([^`]+)`/g, type: 'inline-code' },
    
    // LaTeX block ($$...$$) within a line - check before inline LaTeX
    { regex: /\$\$([^$]+)\$\$/g, type: 'latex-block' },
    
    // LaTeX inline ($...$) - Only process if configuration allows it
    ...(AI_CONFIG.SYSTEM_PROMPT.includes('NEVER use inline LaTeX') ? [] : [{ regex: /\$([^$]+)\$/g, type: 'latex' }]),
    
    // Bold (**...**) 
    { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
    
    // Italic (*...*) - avoid matching inside ** bold ** with lookahead/lookbehind
    { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, type: 'italic' }
  ];
  
  // Find all matches for each format
  const allMatches = [];
  inlineFormats.forEach(format => {
    const matches = [...remaining.matchAll(format.regex)];
    matches.forEach(match => {
      allMatches.push({
        type: format.type,
        match: match
      });
    });
  });
  
  // If no matches, return the original text
  if (allMatches.length === 0) {
    segments.push({
      text,
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: baseKey
    });
    return segments;
  }
  
  // Sort all matches by their position in the string
  allMatches.sort((a, b) => a.match.index - b.match.index);
  
  // Process the matches in order
  allMatches.forEach((item) => {
    const { type, match } = item;
    const { index: matchIndex, 0: fullMatch, 1: content } = match;
    
    // Add text before this match
    if (matchIndex > currentIndex) {
      segments.push({
        text: remaining.substring(currentIndex, matchIndex),
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: false,
        isLatexBlock: false,
        isHeader: false,
        isBlockquote: false,
        isHorizontalRule: false,
        isInlineCode: false,
        isTable: false,
        key: `${baseKey}-${currentIndex}`
      });
    }
    
    // Add the matched content with appropriate formatting
    segments.push({
      text: content,
      isCode: false,
      isBold: type === 'bold',
      isItalic: type === 'italic',
      isBullet: false,
      isNumbered: false,
      isLatex: type === 'latex',
      isLatexBlock: type === 'latex-block',
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: type === 'inline-code',
      isTable: false,
      key: `${baseKey}-${matchIndex}`
    });
    
    // Update the current index
    currentIndex = matchIndex + fullMatch.length;
  });
  
  // Add any remaining text
  if (currentIndex < remaining.length) {
    segments.push({
      text: remaining.substring(currentIndex),
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: `${baseKey}-${currentIndex}`
    });
  }
  
  return segments;
}

/**
 * Helper function to fix unmatched LaTeX delimiters in text
 * @param {string} text - The text to fix
 * @returns {string} Fixed text with proper LaTeX delimiters
 */
function fixLatexDelimiters(text) {
  if (!text) return text;
  
  let fixedText = text;
  
  // First, handle multi-line LaTeX blocks
  // Look for standalone $$ markers
  const lines = fixedText.split('\n');
  let openBlockCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '$$') {
      openBlockCount++;
    }
  }
  
  // If there's an odd number of $$ markers, add a closing one
  if (openBlockCount % 2 !== 0) {
    fixedText += '\n$$';
  }
  
  // Count inline delimiters
  // Don't count $$ as two $ signs for inline math
  let inlineText = fixedText.replace(/\$\$/g, 'XX'); // Temporarily replace $$ with XX
  const dollarCount = (inlineText.match(/\$/g) || []).length;
  
  // Fix unmatched inline LaTeX (if enabled)
  if (!AI_CONFIG.SYSTEM_PROMPT.includes('NEVER use inline LaTeX') && dollarCount % 2 !== 0) {
    // Add missing closing $ at the end
    fixedText += '$';
  }
  
  return fixedText;
}

/**
 * Send a message to the AI service and handle streaming responses
 * @param {string} userMessage - The message to send to the AI
 * @param {Array} messages - Previous conversation history
 * @param {Object} streamControllerRef - Reference to AbortController for handling stream
 * @param {Function} onUpdate - Callback for content updates
 * @param {Object} customConfig - Optional custom configuration to use instead of AI_CONFIG
 * @returns {Promise<string>} - The complete response
 */
export const sendMessageToAI = async (userMessage, messages, streamControllerRef, onUpdate, customConfig = null) => {
  console.log('Sending message to AI:', userMessage);
  
  try {
    // Create a new AbortController for this request
    streamControllerRef.current = new AbortController();
    const signal = streamControllerRef.current.signal;
    
    // Use custom config if provided, otherwise use default AI_CONFIG
    const config = customConfig || AI_CONFIG;
    
    // Use API key from config
    const apiKey = config.API_KEY;
    
    // Build conversation history for context
    const conversationHistory = [];
    
    // First add the system message from config
    conversationHistory.push({
      role: "system", 
      content: config.SYSTEM_PROMPT
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
      model: config.MODEL,
      messages: conversationHistory,
      temperature: config.TEMPERATURE,
      stream: true
    };
    
    console.log('API Request:', JSON.stringify(requestData, null, 2));
    
    const response = await fetch(config.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin || 'https://hsannu.com',
        'X-Title': APP_NAME
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
      let buffer = "";
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process each line in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // Keep the last (potentially incomplete) line in the buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const jsonStr = line.substring(6);
                if (jsonStr.trim() === '') continue;
                
                const data = JSON.parse(jsonStr);
                
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
        
        // Check if there's anything left in the buffer
        if (buffer.startsWith('data: ') && buffer !== 'data: [DONE]') {
          try {
            const jsonStr = buffer.substring(6);
            if (jsonStr.trim() !== '') {
              const data = JSON.parse(jsonStr);
              
              // Extract content
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
            }
          } catch (error) {
            // Just log the error and continue - this is just a final cleanup
            console.warn('Error parsing final chunk:', error);
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Stream was aborted');
        } else {
          console.error('Stream error:', error);
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

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @param {Function} setIsCopied - State setter for copy status
 */
export const copyToClipboard = (text, setIsCopied) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
};

/**
 * Export conversation as text file
 * @param {Array} messages - The conversation messages
 */
export const exportConversation = (messages) => {
  if (messages.length === 0) return;
  
  const conversationText = messages.map(msg => {
    const role = msg.isUser ? 'You' : 'AI Assistant';
    const timestamp = msg.time.toLocaleString();
    return `${role} (${timestamp}):\n${msg.text}\n\n`;
  }).join('');
  
  const blob = new Blob([conversationText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Parse Markdown text into structured segments
 * Alternative parser that follows the example interface more closely
 * @param {string} text - The Markdown text to parse
 * @returns {Array} Array of formatted text segments
 */
export const parseMarkdownText = (text) => {
  if (!text) return [];
  
  const segments = [];
  const lines = text.split('\n');
  
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeContent = '';
  
  let inTable = false;
  let tableBuffer = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Detect start/end of code blocks with triple backticks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Starting a code block
        inCodeBlock = true;
        // Extract language if available
        const match = line.trim().match(/^```(\w*)$/);
        codeLanguage = match && match[1] ? match[1] : '';
        codeContent = '';
      } else {
        // Ending a code block
        segments.push({
          text: codeContent,
          isCode: true,
          language: codeLanguage,
          isBold: false,
          isItalic: false,
          isBullet: false,
          isNumbered: false,
          isLatex: false,
          isLatexBlock: false,
          isHeader: false,
          isBlockquote: false,
          isHorizontalRule: false,
          isInlineCode: false,
          isTable: false,
          key: `code-${i}`
        });
        inCodeBlock = false;
        codeLanguage = '';
        codeContent = '';
      }
      continue; // Move to the next line
    }
    
    // If we are inside a code block, accumulate content
    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }
    
    // Detect potential tables (lines with pipes)
    if (line.includes('|')) {
      // If line looks like a table separator (e.g., |---|---|)
      if (line.replace(/[\|\-\:\s]/g, '').length === 0 && line.includes('-')) {
        // This is a table separator line
        inTable = true;
        tableBuffer.push(line);
        continue;
      }
      
      // Add to table if we're already in one or if this looks like a start of a table
      if (inTable || line.trim().startsWith('|') || line.includes(' | ')) {
        tableBuffer.push(line);
        continue;
      }
    } else if (inTable) {
      // We're exiting a table
      segments.push({
        text: tableBuffer.join('\n'),
        isTable: true,
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: false,
        isLatexBlock: false,
        isHeader: false,
        isBlockquote: false,
        isHorizontalRule: false,
        isInlineCode: false,
        key: `table-${i - tableBuffer.length}`
      });
      tableBuffer = [];
      inTable = false;
      // Continue processing the current line
    }
    
    // Skip if we're still gathering table rows
    if (inTable) continue;
    
    // Horizontal rule (---, ***, or ___)
    if (/^(\*\*\*|---|___)\s*$/.test(line.trim())) {
      segments.push({
        text: '',
        isHorizontalRule: true,
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: false,
        isLatexBlock: false,
        isHeader: false,
        isBlockquote: false,
        isInlineCode: false,
        isTable: false,
        key: `hr-${i}`
      });
      continue;
    }
    
    // Heading (e.g., #, ##, ###)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      segments.push({
        text: headingText,
        isHeader: true,
        headerLevel: level,
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: false,
        isLatexBlock: false,
        isBlockquote: false,
        isHorizontalRule: false,
        isInlineCode: false,
        isTable: false,
        key: `header-${i}`
      });
      continue;
    }
    
    // Blockquote
    if (line.trim().startsWith('>')) {
      const quoteText = line.replace(/^>\s?/, '');
      // Parse inline formats within the blockquote
      const quoteSegments = parseInlineFormats(quoteText, i);
      quoteSegments.forEach(seg => {
        segments.push({
          ...seg,
          isBlockquote: true
        });
      });
      continue;
    }
    
    // Bullet list (using either * or •)
    const bulletMatch = line.match(/^(\s*)([\*\•])\s+(.*)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      const bulletChar = bulletMatch[2];
      const bulletContent = bulletMatch[3];
      
      // Process inline formats
      const bulletSegments = parseInlineFormats(bulletContent, i);
      bulletSegments.forEach(seg => {
        segments.push({
          ...seg,
          isBullet: true,
          bulletChar: bulletChar,
          indentLevel: Math.floor(indent / 2)
        });
      });
      continue;
    }
    
    // Numbered list
    const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const indent = numberedMatch[1].length;
      const number = parseInt(numberedMatch[2], 10);
      const numberedContent = numberedMatch[3];
      
      // Process inline formats
      const numberedSegments = parseInlineFormats(numberedContent, i);
      numberedSegments.forEach(seg => {
        segments.push({
          ...seg,
          isNumbered: true,
          numberValue: number,
          indentLevel: Math.floor(indent / 2)
        });
      });
      continue;
    }
    
    // LaTeX block (double dollar on its own line)
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$')) {
      const latexBlock = line.trim().slice(2, -2);
      segments.push({
        text: latexBlock,
        isLatex: true,
        isLatexBlock: true,
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isHeader: false,
        isBlockquote: false,
        isHorizontalRule: false,
        isInlineCode: false,
        isTable: false,
        key: `latex-block-${i}`
      });
      continue;
    }
    
    // Regular line: parse inline formats (bold, italic, etc.)
    const inlineSegments = parseInlineFormats(line, i);
    segments.push(...inlineSegments);
  }
  
  // Handle unclosed elements at the end
  
  // If ended while still in a table
  if (inTable && tableBuffer.length > 0) {
    segments.push({
      text: tableBuffer.join('\n'),
      isTable: true,
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      key: 'table-final'
    });
  }
  
  // If code block was never closed
  if (inCodeBlock && codeContent) {
    segments.push({
      text: codeContent,
      isCode: true,
      language: codeLanguage,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: 'code-final'
    });
  }
  
  return segments;
};

/**
 * Parse inline formatting within a single line
 * @param {string} text - The text to parse for inline formats
 * @param {number} lineIndex - The current line index for key generation
 * @returns {Array} Array of formatted text segments
 */
function parseInlineFormats(text, lineIndex) {
  const baseKey = `line-${lineIndex}`;
  const segments = [];
  
  // If empty line, return a simple segment
  if (!text || text.trim() === '') {
    return [{
      text: text,
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: baseKey
    }];
  }
  
  // Patterns in order of precedence
  const patterns = [
    { type: 'inline-code', regex: /`([^`]+)`/g },
    { type: 'latex', regex: /\$([^$]+)\$/g },
    { type: 'bold', regex: /\*\*([^*]+)\*\*/g },
    { type: 'italic', regex: /(?<!\*)\*([^*]+)\*(?!\*)/g }
  ];
  
  // Find all matches for all patterns
  const allMatches = [];
  
  patterns.forEach(p => {
    const matches = [...text.matchAll(p.regex)];
    matches.forEach(m => {
      allMatches.push({
        type: p.type,
        match: m,
      });
    });
  });
  
  // If no formatting found, return text as is
  if (allMatches.length === 0) {
    return [{
      text: text,
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: baseKey
    }];
  }
  
  // Sort matches by position
  allMatches.sort((a, b) => a.match.index - b.match.index);
  
  let lastMatchEnd = 0;
  
  for (let i = 0; i < allMatches.length; i++) {
    const { type, match } = allMatches[i];
    const matchIndex = match.index;
    const fullMatch = match[0];
    const innerContent = match[1];
    
    // Add text before this match if any
    if (matchIndex > lastMatchEnd) {
      segments.push({
        text: text.slice(lastMatchEnd, matchIndex),
        isCode: false,
        isBold: false,
        isItalic: false,
        isBullet: false,
        isNumbered: false,
        isLatex: false,
        isLatexBlock: false,
        isHeader: false,
        isBlockquote: false,
        isHorizontalRule: false,
        isInlineCode: false,
        isTable: false,
        key: `${baseKey}-${lastMatchEnd}`
      });
    }
    
    // Create the segment for the matched content
    const segment = {
      text: innerContent,
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: `${baseKey}-${matchIndex}`
    };
    
    // Set format flag based on type
    switch (type) {
      case 'inline-code':
        segment.isInlineCode = true;
        break;
      case 'latex':
        segment.isLatex = true;
        break;
      case 'bold':
        segment.isBold = true;
        break;
      case 'italic':
        segment.isItalic = true;
        break;
    }
    
    segments.push(segment);
    lastMatchEnd = matchIndex + fullMatch.length;
  }
  
  // Add remaining text after last match
  if (lastMatchEnd < text.length) {
    segments.push({
      text: text.slice(lastMatchEnd),
      isCode: false,
      isBold: false,
      isItalic: false,
      isBullet: false,
      isNumbered: false,
      isLatex: false,
      isLatexBlock: false,
      isHeader: false,
      isBlockquote: false,
      isHorizontalRule: false,
      isInlineCode: false,
      isTable: false,
      key: `${baseKey}-${lastMatchEnd}`
    });
  }
  
  return segments;
} 