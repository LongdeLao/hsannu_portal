import React, { useEffect, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Box } from '@mui/material';
import { API_URL } from '../config';

// Custom CSS to hide scrollbars
const hideScrollbarStyle = {
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  msOverflowStyle: 'none',
  scrollbarWidth: 'none'
};

function EventsView() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine user role from URL path
  const userRole = location.pathname.includes('/student/') ? 'student' : 'staff';
  
  // Log the current path and role for debugging
  console.log('Current path:', location.pathname);
  console.log('Detected role:', userRole);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      if (!response.ok) {
        console.error("Unexpected status code");
        return;
      }
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start, end });
  const firstDayWeekday = getDay(start) === 0 ? 6 : getDay(start) - 1;
  const totalCells = 42; // 6 weeks × 7 days

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const eventsForSelectedDay = events.filter(event => {
    try {
      const eventDate = parseISO(event.eventDate);
      return isSameDay(eventDate, currentDate);
    } catch (e) {
      return false;
    }
  });

  const resetToToday = () => setCurrentDate(new Date());
  const handlePreviousMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const formatEventTime = (event) => {
    if (event.isWholeDay) return 'All day';
    try {
      const startTime = parseISO(event.startTime);
      const endTime = parseISO(event.endTime);
      return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
    } catch (e) {
      return '';
    }
  };

  const handleAddEvent = () => {
    navigate(`/${userRole}/new-event`);
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
      <Box className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <Box className="bg-white p-6">
          {/* Title section consistent with other components */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Events</h1>
          </div>

          <div className="flex flex-col gap-8">
            {/* Calendar Section */}
            <div>
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                  <p className="text-gray-500">
                    {format(currentDate, 'EEEE, do MMMM')}
                  </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <button 
                    onClick={resetToToday}
                    className="px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <div className="flex space-x-1">
                    <button 
                      onClick={handlePreviousMonth}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white p-4">
                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the 1st */}
                  {Array.from({ length: firstDayWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-14" />
                  ))}

                  {/* Current month days */}
                  {daysInMonth.map(day => (
                    <div
                      key={day.toString()}
                      onClick={() => setCurrentDate(day)}
                      className="h-14 flex justify-center items-center"
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        text-lg font-medium
                        ${isSameDay(day, currentDate) 
                          ? 'bg-black text-white' 
                          : isSameDay(day, new Date())
                            ? 'border-2 border-black'
                            : 'hover:bg-gray-100'
                        }
                        transition-all duration-200 cursor-pointer
                      `}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}

                  {/* Fill remaining cells */}
                  {Array.from({ length: totalCells - firstDayWeekday - daysInMonth.length }).map((_, i) => (
                    <div key={`fill-${i}`} className="h-14" />
                  ))}
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Events for {format(currentDate, 'dd.MMMM yyyy')}
                  </h2>
                </div>
              </div>
              
              {eventsForSelectedDay.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No events scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventsForSelectedDay.map(event => (
                    <div
                      key={event.eventID}
                      onClick={() => navigate(`/${userRole}/event/${event.eventID}`)}
                      className="p-4 bg-white hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{event.title}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="mr-2">By {event.authorName}</span>
                            {event.address && event.address !== "All" && (
                              <div className="flex items-center">
                                <MapPinIcon className="w-3 h-3 mr-1" />
                                {event.address}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs bg-black text-white px-2 py-1 rounded-full flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatEventTime(event)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Event FAB - only visible for staff */}
          {userRole === 'staff' && (
            <button
              onClick={handleAddEvent}
              className="fixed bottom-10 right-10 bg-black hover:bg-gray-800 text-white p-4 rounded-full shadow-lg transition-all z-10"
              aria-label="Add new event"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default EventsView;