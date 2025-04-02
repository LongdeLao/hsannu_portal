import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "../lib/utils";

// Timeline component that displays version history
const Timeline = ({ data }) => {
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
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-black max-w-4xl">
          Version History
        </h2>
        <p className="text-neutral-700 text-sm md:text-base max-w-sm">
          Track the evolution of HSANNU Connect!
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
                <div className="text-sm text-neutral-500">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                {item.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
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
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <span className="ml-2 text-neutral-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-gray-500 via-black-500 to-green-300 from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

const VersionLog = () => {
  const changelog = [
    {
      version: '1.0.0',
      date: '2024-03-14',
      changes: [
        {
          title: 'Initial Release',
          description: 'First stable version of the HSANNU Portal',
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
    },
    {
      version: '0.1.0',
      date: '2023-12-10',
      changes: [
        {
          title: 'Concept Development',
          description: 'Initial concept and requirements gathering',
          features: [
            'User requirements analysis',
            'Feature planning',
            'UI/UX wireframes',
            'System architecture design'
          ]
        }
      ]
    },
    {
      version: '0.0.0',
      date: '2023-08-12',
      changes: [
        {
          title: 'Initial Idea',
          description: 'The beginning of HSANNU Portal project',
          features: [
            'Project concept creation',
            'Initial brainstorming',
            'Problem statement definition',
            'Solution approach planning'
          ]
        }
      ]
    }
  ];

  return <Timeline data={changelog} />;
};

export default VersionLog; 