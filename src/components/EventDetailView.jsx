import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { API_URL } from '../config';

// Image Viewer Component
const ImageViewer = ({ images, onImageClick }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => {
        const imgSrc = image.url || `${API_URL}/api/${image.filePath}`;
        console.log(`Thumbnail image ${index} src:`, imgSrc);
        return (
          <div 
            key={index}
            className="aspect-square overflow-hidden rounded-xl shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(index)}
          >
            <img
              src={imgSrc}
              alt={`Event image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
};

// Image Overlay Component
const ImageOverlay = ({ images, activeIndex, onClose, onPrev, onNext }) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (activeIndex === null) return null;
  
  const fullImgSrc = images[currentIndex].url || `${API_URL}/api/${images[currentIndex].filePath}`;
  console.log('Full-size image src:', fullImgSrc);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <button 
            className="absolute left-4 bg-black bg-opacity-50 rounded-full p-2 text-white z-10"
            onClick={onPrev}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <img
            src={fullImgSrc}
            alt={`Full size event image ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          
          <button 
            className="absolute right-4 bg-black bg-opacity-50 rounded-full p-2 text-white z-10"
            onClick={onNext}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

function EventHeader({ onBack }) {
  return (
    <div className="mb-3">
      <button 
        onClick={onBack} 
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}

function EventDetailView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [images, setImages] = useState([]);
  
  // Extract user role from URL path
  const userRole = location.pathname.includes('/student/') ? 'student' : 'staff';

  useEffect(() => {
    // Fetch event details using the ID from the URL
    const fetchEvent = async () => {
      try {
        setLoading(true);
        
        // First try the production API endpoint
        const prodEndpoint = `${API_URL}/api/event/${id}`;
        console.log("Attempting to fetch from:", prodEndpoint);
        
        try {
          const response = await fetch(prodEndpoint);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched event data:", data);
            
            if (data && data.event) {
              // Transform the data to match our expected format
              const transformedEvent = {
                ...data.event,
                eventDate: new Date(data.event.eventDate),
                startTime: data.event.startTime ? parseISO(data.event.startTime) : null,
                endTime: data.event.endTime ? parseISO(data.event.endTime) : null,
                images: Array.isArray(data.event.images) ? data.event.images : []
              };
              setEvent(transformedEvent);

              // Process images
              if (transformedEvent.images && transformedEvent.images.length > 0) {
                const processedImages = transformedEvent.images.map(image => {
                  const imageUrl = `${API_URL}/api/${image.filePath}`;
                  console.log('Event image URL constructed:', imageUrl);
                  return {
                    ...image,
                    url: imageUrl
                  };
                });
                setImages(processedImages);
              }
              return;
            }
          }
          
          // If we get here, there was an issue with the response or data structure
          console.warn("Production API failed or returned invalid data, trying fallback...");
          throw new Error("Failed to fetch from production API");
          
        } catch (prodError) {
          console.error("Error with production endpoint:", prodError);
          
          // Try the local fallback
          const localEndpoint = `${API_URL}/api/event/${id}`;
          console.log("Attempting fallback to:", localEndpoint);
          
          const fallbackResponse = await fetch(localEndpoint);
          
          if (!fallbackResponse.ok) {
            throw new Error(`Failed to fetch event details (Status: ${fallbackResponse.status})`);
          }
          
          const fallbackData = await fallbackResponse.json();
          console.log("Fetched fallback event data:", fallbackData);
          
          if (fallbackData && fallbackData.event) {
            const transformedEvent = {
              ...fallbackData.event,
              eventDate: new Date(fallbackData.event.eventDate),
              startTime: fallbackData.event.startTime ? parseISO(fallbackData.event.startTime) : null,
              endTime: fallbackData.event.endTime ? parseISO(fallbackData.event.endTime) : null,
              images: Array.isArray(fallbackData.event.images) ? fallbackData.event.images : []
            };
            setEvent(transformedEvent);

            // Process images
            if (transformedEvent.images && transformedEvent.images.length > 0) {
              const processedImages = transformedEvent.images.map(image => {
                const imageUrl = `${API_URL}/api/${image.filePath}`;
                console.log('Event image URL (fallback):', imageUrl);
                return {
                  ...image,
                  url: imageUrl
                };
              });
              setImages(processedImages);
            }
          } else {
            throw new Error("Event data not found in response");
          }
        }
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError(`${err.message}. Please try again later or contact support if the issue persists.`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };

  const handleCloseOverlay = () => {
    setActiveImageIndex(null);
  };

  const handleBack = () => {
    navigate(`/${userRole}/events`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-start p-6">
        <div className="text-left">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold">Error Loading Event</h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate(`/${userRole}/events`)}
            className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // Format the date
  const formattedDate = format(event.eventDate, 'dd.MM.yy');

  // Determine the time information
  let timeInfo = "All Day";
  if (event.startTime && event.endTime) {
    timeInfo = `${format(event.startTime, 'h:mm a')} – ${format(event.endTime, 'h:mm a')}`;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-full">
        <div className="p-6">
          <EventHeader onBack={handleBack} />
          
          {/* Event Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {event.title}
          </h1>

          {/* Date and Time Section */}
          <div className="mb-6">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-gray-200 rounded-full">
              <span className="font-medium text-gray-800">{formattedDate}</span>
              <span className="text-gray-600">{timeInfo}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-800 leading-relaxed">
              {event.eventDescription}
            </p>
          </div>

          {/* Images Section */}
          {images && images.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Attached Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setActiveImageIndex(index)}
                  >
                    {console.log(`Grid view image ${index} src:`, image.url || `${API_URL}/api/${image.filePath}`)}
                    <img 
                      src={image.url || `${API_URL}/api/${image.filePath}`} 
                      alt={`Event image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mb-6 text-gray-500">
              No images available
            </p>
          )}

          {/* Address Section */}
          {event.address && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800">Address:</h3>
              <p className="text-gray-700">{event.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Overlay */}
      {activeImageIndex !== null && (
        <ImageOverlay 
          images={images}
          activeIndex={activeImageIndex}
          onClose={handleCloseOverlay}
          onPrev={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
          onNext={() => setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
        />
      )}
    </div>
  );
}

export default EventDetailView;
