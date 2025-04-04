import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, PhoneCall, HelpCircle } from 'lucide-react';
import { ChatContainer, ChatButton } from './SupportChat';
import faqVector from '../assets/faq_vector.png';
import contactUsVector from '../assets/contact_us_vector.png';
import { Box } from '@mui/material';

// FAQ Item component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 border-b border-gray-800/10 pb-5 last:border-0 transition-all duration-300">
      <button
        className="flex justify-between items-center w-full text-left transition-colors hover:text-black"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <div className={`p-2 rounded-full ${isOpen ? 'bg-black/10' : 'bg-gray-100'} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className={`h-5 w-5 ${isOpen ? 'text-black' : 'text-gray-500'}`} />
        </div>
      </button>
      <div className={`mt-3 text-gray-600 leading-relaxed transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <p className="py-2 pl-2 border-l-2 border-black/70">{answer}</p>
      </div>
    </div>
  );
};

function Support() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  
  const toggleChat = () => {
    if (chatMinimized) {
      setChatMinimized(false);
    } else {
      setChatOpen(!chatOpen);
    }
  };
  
  const minimizeChat = () => {
    setChatMinimized(true);
  };
  
  const closeChat = () => {
    setChatOpen(false);
    setChatMinimized(false);
  };

  const faqs = [
    {
      question: "How do I update my profile information?",
      answer: "You can update your profile information by clicking on your profile picture in the sidebar, then navigating to your profile page. There, you can edit your email address, change your password, and upload a new profile picture."
    },
    {
      question: "How do I create a new event?",
      answer: "To create a new event, navigate to the Events section from the sidebar. If you have staff permissions, you'll see a plus (+) button at the bottom-right corner of the screen. Click on it to access the new event form."
    },
    {
      question: "How can I view my classes?",
      answer: "You can view your classes by clicking on the 'Classes' option in the sidebar. This will show you all the classes you're enrolled in (for students) or teaching (for staff)."
    },
    {
      question: "I forgot my password. What should I do?",
      answer: "If you've forgotten your password, please contact your system administrator or IT support. They can help you reset your password securely."
    },
    {
      question: "How do I view the details of an event?",
      answer: "From the Events page, you can click on any event to view its full details, including description, location, time, and any attached images."
    },
    {
      question: "How can I see my attendance records?",
      answer: "Attendance records can be viewed in the Attendance section. Students can see their own attendance, while staff can view and manage attendance for their classes."
    },
    {
      question: "Who can I contact for technical support?",
      answer: "For technical support, please email support@hsannu.com or contact your IT department. Provide details about any issues you're experiencing for faster assistance."
    }
  ];

  // Split FAQs into two separate arrays for the two-column layout
  const leftColumnFaqs = faqs.slice(0, Math.ceil(faqs.length / 2));
  const rightColumnFaqs = faqs.slice(Math.ceil(faqs.length / 2));

  return (
    <Box 
      className="flex flex-col min-h-screen mx-10"
      sx={{
        '& .MuiBox-root': {
          maxWidth: '100%'
        }
      }}
    >
      <Box className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <Box className="bg-white p-6">
          {/* Hero Section with centered illustration */}
          <div className="text-center mb-16 max-w-5xl mx-auto pt-4">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-700">
              Support & FAQ
            </h1>
            <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
              Find answers to commonly asked questions about the HSANNU Portal. Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="flex justify-center mb-12">
              <img 
                src={faqVector} 
                alt="FAQ Illustration" 
                className="w-96 h-96 object-contain" 
              />
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mb-16">
            <div className="bg-white p-8 mb-8">
              <div className="flex items-center mb-8">
                <div className="p-3 rounded-full bg-black/5 mr-4">
                  <HelpCircle className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {/* Left Column */}
                <div>
                  {leftColumnFaqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
                
                {/* Right Column */}
                <div>
                  {rightColumnFaqs.map((faq, index) => (
                    <FAQItem key={index + leftColumnFaqs.length} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Support Section */}
          <div>
            <div className="bg-white overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
                  <p className="text-gray-600 mb-8">
                    Still have questions? Our support team is ready to assist you with any issues or questions you might have.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="p-3 rounded-full bg-black/5 mr-4">
                        <Mail className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Email Support</h3>
                        <p className="text-gray-600 mb-1">For general inquiries and support</p>
                        <a href="mailto:support@hsannu.com" className="text-black hover:underline font-medium">support@hsannu.com</a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-3 rounded-full bg-black/5 mr-4">
                        <PhoneCall className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Technical Support</h3>
                        <p className="text-gray-600 mb-1">For platform-related issues</p>
                        <a href="mailto:tech@hsannu.com" className="text-black hover:underline font-medium">tech@hsannu.com</a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden lg:flex items-center justify-center bg-gradient-to-r from-gray-50/80 to-white/30 p-8">
                  <img 
                    src={contactUsVector} 
                    alt="Contact Support" 
                    className="max-w-xs object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Button */}
          <ChatButton 
            isMinimized={chatMinimized} 
            onClick={toggleChat}
          />
          
          {/* Chat Container */}
          <ChatContainer 
            isOpen={chatOpen}
            isMinimized={chatMinimized}
            onClose={closeChat}
            onMinimize={minimizeChat}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Support; 