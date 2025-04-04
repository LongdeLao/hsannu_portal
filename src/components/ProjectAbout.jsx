import React, { useEffect, useRef, useState } from "react";
import { Github, Linkedin, Instagram, Phone, Mail, MessageCircle } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";
import StackIcon from "tech-stack-icons";
import { Box } from "@mui/material";
import leadDevImg from '../assets/lead_dev.png';
import coDevImg from '../assets/marcus.png';
import supervisorImg from '../assets/supervisor.png';

const ProjectAbout = () => {
  // Complete version changelog data
  const changelog = [
    {
      version: '1.0.0',
      date: '2024-03-14',
      changes: [
        {
          title: 'Initial Release',
          description: 'First stable version of the HSANNU Connect',
          features: [
            'User authentication system',
            'Student and Staff dashboards',
            'Class management system',
            'Attendance tracking',
            'Event management',
            'Profile management'
          ]
        }
      ]
    },
    {
      version: '0.9.0',
      date: '2024-03-10',
      changes: [
        {
          title: 'Beta Release',
          description: 'Beta testing version with core features',
          features: [
            'Basic user interface',
            'Authentication system',
            'Dashboard layouts'
          ]
        }
      ]
    },
    {
      version: '0.5.0',
      date: '2024-02-15',
      changes: [
        {
          title: 'Development Milestone',
          description: 'Core functionality implementation',
          features: [
            'Database schema design',
            'API endpoints development',
            'Basic frontend components',
            'Authentication flow'
          ]
        }
      ]
    },
    {
      version: '0.2.0',
      date: '2024-01-20',
      changes: [
        {
          title: 'Project Setup',
          description: 'Initial project structure and planning',
          features: [
            'Project repository setup',
            'Technology stack selection',
            'Architecture planning',
            'Development environment setup'
          ]
        }
      ]
    }
  ];

  // Developer personal information
  const developerInfo = {
    name: "Longde Lao",
    role: "Lead Developer",
    email: "longdelao@outlook.de",
    phone: "+86 17843350818",
    github: "https://github.com/LongdeLao",
    linkedin: "https://www.linkedin.com/in/lao-longde-a65363285",
    instagram: "@longdelao",
    wechat: "longdelao"
  };

  // Co-developer information
  const coDeveloperInfo = {
    name: "Marcus Ma",
    role: "Co-Developer / Legals",
    email: "dev@marcusma.com"
  };

  // Supervisor information
  const supervisorInfo = {
    name: "Winston Gao",
    role: "Project Supervisor",
    email: "janesmith@example.com"
  };

  // Project technology stack
  const techStack = {
    frontend: ["reactjs", "tailwindcss","js"],
    backend: ["go","rust", "ubuntu", "postgresql"],
    tools: ["git", "docker","vitejs","neovim"]
  };

  // Current work information
  const currentWork = {
    feature: "User Authentication Enhancement",
    description: "Implementing multi-factor authentication and improving security protocols",
    deadline: "2024-05-15",
    progress: 65
  };

  return (
    <Box 
      className="flex flex-col min-h-screen mx-10"
      sx={{
        '& .MuiBox-root': {
          maxWidth: '100%'
        }
      }}
    >
      {/* Hero Section with Developer Info */}
      <Box className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <Box className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Developer Info Section */}
            <div className="p-6 md:col-span-1 w-full">
              <h2 className="text-2xl font-bold text-black mb-4">Project Team</h2>
              
              {/* Lead Developer */}
              <div className="mb-8">
                {/* Profile Image */}
                <div className="w-32 h-32 bg-black/5 rounded-full mb-4 mx-auto overflow-hidden">
                  <img 
                    src={leadDevImg} 
                    alt={developerInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-center mb-1">{developerInfo.name}</h3>
                <p className="text-center text-sm text-gray-600 mb-4">{developerInfo.role}</p>
                
                {/* Contact Information with Icons */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-black/70" />
                    <a href={`mailto:${developerInfo.email}`} className="text-sm hover:underline">{developerInfo.email}</a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-black/70" />
                    <a href={`tel:${developerInfo.phone}`} className="text-sm hover:underline">{developerInfo.phone}</a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MessageCircle size={18} className="text-black/70" />
                    <span className="text-sm">WeChat: {developerInfo.wechat}</span>
                  </div>
                </div>
                
                {/* Social Media Links */}
                <div className="mt-4 flex justify-center gap-4">
                  <a 
                    href={developerInfo.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={20} />
                  </a>
                  <a 
                    href={developerInfo.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                  <a 
                    href={`https://instagram.com/${developerInfo.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
              
              {/* Co-Developer and Supervisor side by side */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {/* Co-Developer */}
                <div className="flex flex-col items-center">
                  {/* Profile Image */}
                  <div className="w-20 h-20 bg-black/5 rounded-full mb-3 overflow-hidden">
                    <img 
                      src={coDevImg} 
                      alt={coDeveloperInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-base font-semibold text-center mb-1">{coDeveloperInfo.name}</h3>
                  <p className="text-center text-xs text-gray-600 mb-2">{coDeveloperInfo.role}</p>
                  
                  <div className="flex items-center gap-2 justify-center">
                    <Mail size={14} className="text-black/70" />
                    <a href={`mailto:${coDeveloperInfo.email}`} className="text-xs hover:underline">{coDeveloperInfo.email}</a>
                  </div>
                </div>
                
                {/* Supervisor */}
                <div className="flex flex-col items-center">
                  {/* Profile Image */}
                  <div className="w-20 h-20 bg-black/5 rounded-full mb-3 overflow-hidden">
                    <img 
                      src={supervisorImg} 
                      alt={supervisorInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-base font-semibold text-center mb-1">{supervisorInfo.name}</h3>
                  <p className="text-center text-xs text-gray-600 mb-2">{supervisorInfo.role}</p>
                  
                  <div className="flex items-center gap-2 justify-center">
                    <Mail size={14} className="text-black/70" />
                    <a href={`mailto:${supervisorInfo.email}`} className="text-xs hover:underline">{supervisorInfo.email}</a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Project Info Section */}
            <div className="p-6 md:col-span-2">
              <h2 className="text-2xl font-bold text-black mb-6">HSANNU Connect Project</h2>
              
              {/* Project Description */}
              <p className="text-black/70 mb-6">
                HSANNU Connect is a comprehensive school management system designed to streamline educational processes, 
                improve communication, and enhance the learning experience for students and staff.
              </p>
              
              {/* Technology Stack with Icons */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Technology Stack</h3>
                
                {/* Frontend and Backend side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Frontend */}
                  <div>
                    <h4 className="font-medium text-sm text-black/70 mb-2">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      {techStack.frontend.map((tech, index) => (
                        <div key={index} className="flex items-center bg-black/5 rounded-full px-2 py-1">
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                            <StackIcon name={tech} size={0.7} />
                          </div>
                          <span className="ml-1.5 text-xs text-gray-700 capitalize">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Backend */}
                  <div>
                    <h4 className="font-medium text-sm text-black/70 mb-2">Backend</h4>
                    <div className="flex flex-wrap gap-2">
                      {techStack.backend.map((tech, index) => (
                        <div key={index} className="flex items-center bg-black/5 rounded-full px-2 py-1">
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                            <StackIcon name={tech} size={0.7} />
                          </div>
                          <span className="ml-1.5 text-xs text-gray-700 capitalize">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tools */}
                <div>
                  <h4 className="font-medium text-sm text-black/70 mb-2">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {techStack.tools.map((tech, index) => (
                      <div key={index} className="flex items-center bg-black/5 rounded-full px-2 py-1">
                        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                          <StackIcon name={tech} size={0.7} />
                        </div>
                        <span className="ml-1.5 text-xs text-gray-700 capitalize">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Currently Working On Section */}
              <div className="mb-6 p-4 bg-black/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Currently Working On</h3>
                <div className="space-y-2">
                  <h4 className="font-medium">{currentWork.feature}</h4>
                  <p className="text-sm text-black/70">{currentWork.description}</p>
                  <div className="flex justify-between text-xs text-black/60 mt-1">
                    <span>Estimated Finish Date: {new Date(currentWork.deadline).toLocaleDateString()}</span>
                    <span>Progress: {currentWork.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-black h-2 rounded-full" 
                      style={{ width: `${currentWork.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Current Version */}
              <div className="p-4 bg-black/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Current Version</h3>
                  <span className="px-3 py-1 bg-black text-white text-xs rounded-full">v{changelog[0].version}</span>
                </div>
                <p className="text-black/70 text-sm">
                  {changelog[0].changes[0].description} ({new Date(changelog[0].date).toLocaleDateString()})
                </p>
              </div>
            </div>
          </div>
        </Box>
      </Box>
      
      {/* Version History Timeline */}
      <VersionTimeline data={changelog} />
    </Box>
  );
};

// Timeline component that displays version history
const VersionTimeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-white font-sans md:px-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-10">
        <h2 className="text-3xl font-bold mb-4 text-black max-w-4xl">
          Development Journey
        </h2>
        <p className="text-neutral-700 text-base max-w-2xl mb-12">
          Explore the evolution of HSANNU Connect from concept to launch. This timeline showcases 
          our development process, key milestones, and continuous improvements.
        </p>
      </div>
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 border border-neutral-300 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-black">
                v {item.version}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500">
                v{item.version}
              </h3>
              <div className="space-y-4">
                {item.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="bg-white p-6">
                    <div className="text-base font-medium text-neutral-600 mb-3">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="pl-4">
                      <h4 className="text-xl font-semibold mb-2 text-neutral-800">
                        {change.title}
                      </h4>
                      <p className="text-neutral-600 mb-4">
                        {change.description}
                      </p>
                      {change.features && (
                        <div className="space-y-2">
                          {change.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start">
                              <div className="flex-shrink-0 w-5 h-5 mt-1">
                                <svg className="w-5 h-5 text-black/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                              <span className="ml-2 text-neutral-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-black via-black to-black/50 from-[0%] via-[50%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectAbout; 