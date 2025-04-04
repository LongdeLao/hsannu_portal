"use client";
import { useRef, useState, useEffect, memo } from "react";
import DottedMap from "dotted-map";

// Pre-generate map data using a module-level variable (similar to static pre-rendering)
let preRenderedMapData = null;
let preRenderedPaths = {};

// Try to initialize the map data when the module loads
try {
  const map = new DottedMap({ 
    height: 80, // Lower resolution for better performance
    grid: "diagonal",
    dotSize: 0.5
  });
  
  // Generate for light mode (default)
  preRenderedMapData = map.getSVG({
    radius: 0.2,
    color: "#00000030",
    shape: "circle",
    backgroundColor: "transparent"
  });
  
  // Pre-compute common paths
  const projectPoint = (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };
  
  // Simplified curve function
  const createCurvedPath = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 40;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };
  
  // Pre-compute some common locations
  const commonLocations = {
    alaska: { lat: 64.2008, lng: -149.4937 },
    losAngeles: { lat: 34.0522, lng: -118.2437 },
    brazil: { lat: -15.7975, lng: -47.8919 },
    lisbon: { lat: 38.7223, lng: -9.1393 },
    london: { lat: 51.5074, lng: -0.1278 },
    newDelhi: { lat: 28.6139, lng: 77.209 },
    vladivostok: { lat: 43.1332, lng: 131.9113 },
    nairobi: { lat: -1.2921, lng: 36.8219 }
  };
  
  // Pre-generate paths
  Object.entries(commonLocations).forEach(([startKey, startLocation]) => {
    preRenderedPaths[startKey] = {};
    Object.entries(commonLocations).forEach(([endKey, endLocation]) => {
      if (startKey !== endKey) {
        const startPoint = projectPoint(startLocation.lat, startLocation.lng);
        const endPoint = projectPoint(endLocation.lat, endLocation.lng);
        preRenderedPaths[startKey][endKey] = {
          path: createCurvedPath(startPoint, endPoint),
          startX: startPoint.x,
          startY: startPoint.y,
          endX: endPoint.x,
          endY: endPoint.y
        };
      }
    });
  });
} catch (error) {
  console.error("Error pre-generating map data:", error);
}

// Memoize the component to prevent unnecessary re-renders
const WorldMap = memo(function WorldMap({
  dots = [],
  lineColor = "#0ea5e9"
}) {
  const svgRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  
  // Use pre-rendered data or generate on the fly
  const [svgMapData, setSvgMapData] = useState(preRenderedMapData || '');
  
  // Lazily compute path data only when needed
  const [pathsAndPoints, setPathsAndPoints] = useState([]);
  
  // Initialize the component
  useEffect(() => {
    // Generate map if not pre-rendered
    if (!svgMapData) {
      try {
        const map = new DottedMap({ 
          height: 80,
          grid: "diagonal",
          dotSize: 0.5
        });
        
        const svgMap = map.getSVG({
          radius: 0.2,
          color: "#00000030",
          shape: "circle",
          backgroundColor: "transparent"
        });
        
        setSvgMapData(svgMap);
      } catch (error) {
        console.error("Error generating map:", error);
      }
    }
    
    // Calculate paths on first render only
    if (pathsAndPoints.length === 0) {
      const computedPaths = dots.map((dot, i) => {
        // Check if we have a pre-computed path
        const startKey = Object.entries(preRenderedPaths).find(
          ([_, locations]) => 
            locations[Object.keys(locations)[0]] &&
            Math.abs(locations[Object.keys(locations)[0]].startX - 
              (dot.start.lng + 180) * (800 / 360)) < 1
        )?.[0];
        
        const endKey = startKey && Object.keys(preRenderedPaths[startKey]).find(
          (key) => 
            Math.abs(preRenderedPaths[startKey][key].endX - 
              (dot.end.lng + 180) * (800 / 360)) < 1
        );
        
        if (startKey && endKey && preRenderedPaths[startKey][endKey]) {
          // Use pre-computed path
          return {
            id: i,
            ...preRenderedPaths[startKey][endKey]
          };
        } else {
          // Calculate path on the fly
          const projectPoint = (lat, lng) => {
            const x = (lng + 180) * (800 / 360);
            const y = (90 - lat) * (400 / 180);
            return { x, y };
          };
          
          const createCurvedPath = (start, end) => {
            const midX = (start.x + end.x) / 2;
            const midY = Math.min(start.y, end.y) - 40;
            return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
          };
          
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const pathData = createCurvedPath(startPoint, endPoint);
          
          return {
            id: i,
            path: pathData,
            startX: startPoint.x,
            startY: startPoint.y,
            endX: endPoint.x,
            endY: endPoint.y
          };
        }
      });
      
      setPathsAndPoints(computedPaths);
    }
    
    // Mark component as ready for rendering
    requestAnimationFrame(() => {
      setIsReady(true);
    });
  }, [dots, svgMapData, pathsAndPoints.length]);

  // Render optimized SVG
  return (
    <div className="w-full aspect-[2/1] bg-white relative">
      {svgMapData ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMapData)}`}
            className="h-full w-full pointer-events-none select-none opacity-80"
            alt="world map"
            loading="eager"
          />
        </div>
      ) : (
        <div className="w-full h-full bg-white"></div>
      )}
      
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Only render paths when component is ready */}
        {isReady && pathsAndPoints.map(({ id, path }) => (
          <path
            key={`path-${id}`}
            d={path}
            fill="none"
            stroke="url(#path-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ 
              strokeDasharray: 500, 
              strokeDashoffset: 500,
              animation: `drawPath 1s ${id * 0.1}s forwards` 
            }}
          />
        ))}

        {/* Render points when component is ready */}
        {isReady && pathsAndPoints.map(({ id, startX, startY, endX, endY }) => (
          <g key={`points-${id}`}>
            {/* Start point - simplify animation */}
            <circle 
              cx={startX} 
              cy={startY} 
              r="3" 
              fill={lineColor}
              style={{ 
                animation: 'pulse 2s infinite' 
              }}
            />
            
            {/* End point - simplify animation */}
            <circle 
              cx={endX} 
              cy={endY} 
              r="3" 
              fill={lineColor}
              style={{ 
                animation: 'pulse 2s infinite' 
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* Add keyframes for animations - inline styles for better performance */}
      <style>
        {`
          @keyframes drawPath {
            to {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes pulse {
            0%, 100% { r: 2; opacity: 0.7; }
            50% { r: 4; opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
});

export default WorldMap;
