import React, { useState, useEffect, memo } from 'react';
import { motion } from "framer-motion";
import WorldMap from './ui/world-map';

// Import university logos
import nusLogo from '../assets/uni_logos/nus-logo.png';
import berkeleyLogo from '../assets/uni_logos/UC-Berkeley-Symbol.png';
import uclLogo from '../assets/uni_logos/University_College_London_logo.png';
import cambridgeLogo from '../assets/uni_logos/University_of_Cambridge-Logo.png';
import imperialLogo from '../assets/uni_logos/Imperial_College_London_new_logo.png';
import hkuLogo from '../assets/uni_logos/University_of_Hong_Kong-Logo.png';
import oxfordLogo from '../assets/uni_logos/University_of_Oxford.png';
import hkustLogo from '../assets/uni_logos/Hong_Kong_University_of_Science_and_Technology-Logo.png';
import cornellLogo from '../assets/uni_logos/cornell-university-1-logo-png-transparent.png';
import uiucLogo from '../assets/uni_logos/University_of_Illinois_at_Urbana-Champaign_Wordmark.svg.png';
import uclaLogo from '../assets/uni_logos/University_of_California,_Los_Angeles_logo.png';
import nyuLogo from '../assets/uni_logos/New_York_University-Logo.png';

// Pre-defined map data that is computed once outside the component
const mapData = [
  {
    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
    end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  },
  {
    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
    end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
  },
  {
    start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
    end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
  },
  {
    start: { lat: 51.5074, lng: -0.1278 }, // London
    end: { lat: 28.6139, lng: 77.209 }, // New Delhi
  },
  {
    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
    end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
  },
  {
    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
    end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
  },
  {
    start: { lat: 31.2304, lng: 121.4737 }, // Shanghai
    end: { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
  },
  {
    start: { lat: 31.2304, lng: 121.4737 }, // Shanghai
    end: { lat: 1.3521, lng: 103.8198 }, // Singapore
  },
];

// Statistics for alumni network - define outside component
const stats = [
  { label: "Countries", value: "11" },
  { label: "Alumni", value: "2500+" },
  { label: "Universities", value: "42" },
  { label: "Success Rate", value: "94%" },
];

// Create a pre-rendered skeleton before component mounts
let AlumniSkeleton = null;
try {
  // This code runs only once when the module is loaded
  if (typeof document !== 'undefined') {
    AlumniSkeleton = document.createElement('div');
    AlumniSkeleton.className = 'flex flex-col min-h-screen mx-10';
    AlumniSkeleton.innerHTML = `
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div class="bg-white p-6">
          <h1 class="text-2xl font-bold mb-4 opacity-0">Alumni Network</h1>
          
          <div class="py-12 bg-white w-full mb-16">
            <div class="max-w-7xl mx-auto text-center">
              <h2 class="font-bold text-xl md:text-4xl text-black mb-8">
                Global Alumni Network
              </h2>
              
              <p class="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto pb-10">
                Our graduates are making an impact across the globe, 
                representing our school in prestigious universities worldwide.
              </p>
            </div>
            <div class="mt-8 h-96 bg-white"></div>
          </div>
          
          <div class="mt-8 mb-16">
            <h2 class="text-xl font-bold mb-10 text-center">Alumni Success Metrics</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              ${stats.map(stat => `
                <div class="bg-white p-6 text-center">
                  <p class="text-3xl font-bold">${stat.value}</p>
                  <p class="text-sm text-gray-500">${stat.label}</p>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="mt-16 mb-10">
            <h2 class="text-xl font-bold mb-10 text-center">Universities Our Alumni Attend</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-10 items-center">
              ${[...Array(12)].map(() => `
                <div class="flex justify-center items-center h-28 p-4 bg-gray-100/30">
                  <div class="w-full h-16 bg-gray-100"></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
} catch (error) {
  console.error('Error prerendering Alumni component:', error);
}

// Memoize the component to prevent unnecessary re-renders
const Alumni = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Skip initial animations if we can - just show the content
    let timeout = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, []);

  // Use CSS for initial transitions instead of JS animations for better performance
  return (
    <div className="flex flex-col min-h-screen mx-10">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white p-6">
          <h1 
            className={`text-2xl font-bold mb-6 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            Alumni Network
          </h1>
          
          {/* Map container - static rendering - NOW FIRST */}
          <div className={`py-12 bg-white w-full mb-16
            transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="font-bold text-xl md:text-4xl text-black mb-8">
                Global Alumni Network
              </h2>
              
              <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto pb-10">
                Our graduates are making an impact across the globe, 
                representing our school in prestigious universities worldwide.
              </p>
            </div>
            
            <div className="mt-8">
              <WorldMap dots={mapData} lineColor="#4caf50" />
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Join our global community of graduates
              </p>
            </div>
          </div>
          
          {/* Stats Section - Use CSS transitions - NOW AFTER WORLD MAP */}
          <div className="mt-8 mb-16">
            <h2 className="text-xl font-bold mb-10 text-center">Alumni Success Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`bg-white p-6 text-center 
                    transition-all duration-300 ease-out hover:-translate-y-1
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{
                    transitionDelay: `${300 + (index * 50)}ms`
                  }}
                >
                  <p className="text-3xl font-bold text-black">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* University Logos Section */}
          <div className="mt-16 mb-10">
            <h2 className="text-xl font-bold mb-10 text-center">Universities Our Alumni Attend</h2>
            <div className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-10 items-center
              transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '500ms' }}
            >
              {/* Logo items */}
              <div className="flex justify-center items-center h-28 p-4">
                <img src={oxfordLogo} alt="University of Oxford" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={cambridgeLogo} alt="University of Cambridge" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={imperialLogo} alt="Imperial College London" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={uclLogo} alt="University College London" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={nusLogo} alt="National University of Singapore" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={berkeleyLogo} alt="UC Berkeley" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={hkuLogo} alt="University of Hong Kong" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={hkustLogo} alt="Hong Kong University of Science and Technology" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={uclaLogo} alt="UCLA" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={cornellLogo} alt="Cornell University" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={nyuLogo} alt="New York University" className="max-h-full w-auto object-contain" />
              </div>
              <div className="flex justify-center items-center h-28 p-4">
                <img src={uiucLogo} alt="University of Illinois" className="max-h-full w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Alumni; 