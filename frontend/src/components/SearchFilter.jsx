import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  Search,
  ChevronDown,
  MapPin,
  Home,
} from "lucide-react";
import Calendar from "./Calendar";
import GuestSelector from "./GuestSelector";
import {
  getCheckInDate,
  getCheckOutDate,
  saveCheckInDate,
  saveCheckOutDate,
} from "../utils/bookingStorage";

const SearchFilter = ({ compact = false, onSearch = null }) => {
  // Initialize from localStorage if available
  const openCheckoutAfterCheckInRef = useRef(false);
  const [checkIn, setCheckIn] = useState(() => {

    return new Date();
  });
  const [checkOut, setCheckOut] = useState(() => {
   
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(1);
  const [city, setCity] = useState("");
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const roomRef = useRef(null);
  const guestRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (checkInRef.current && !checkInRef.current.contains(event.target)) {
        setShowCheckInCalendar(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(event.target)) {
        setShowCheckOutCalendar(false);
      }
      if (roomRef.current && !roomRef.current.contains(event.target)) {
        setShowRoomSelector(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setShowGuestSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: "short", day: "numeric", month: "short" };
    return date.toLocaleDateString("en-US", options);
  };


  const handleCheckInSelect = (date) => {
    setCheckIn(date);
    saveCheckInDate(date);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    setCheckOut(nextDay);
    saveCheckOutDate(nextDay);

    onSearch?.({
      checkIn: date,
      checkOut: nextDay,
      rooms,
      adults,
      children,
    });

    setShowCheckInCalendar(false);
    setShowCheckOutCalendar(true); // 🔥 simple & direct
  };
  const handleCheckOutSelect = (date) => {
    setCheckOut(date);
    saveCheckOutDate(date);

    // 🔥 notify parent immediately
    onSearch?.({
      checkIn,
      checkOut: date,
      rooms,
      adults,
      children,
    });

    setShowCheckOutCalendar(false);
  };
  const handleGuestUpdate = ({ adults, children }) => {
    setAdults(adults);
    setChildren(children);
  };

  const handleSearch = () => {
    saveCheckInDate(checkIn);
    saveCheckOutDate(checkOut);
    if (onSearch) {
      onSearch({ checkIn, checkOut, rooms, adults, children });
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-4 md:px-6 md:py-5">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
          {/* Check In */}
          <div className="relative md:flex-1" ref={checkInRef}>
            <label className="block text-sm text-gray-600 mb-2">Check In</label>
            <button
              onClick={() => {
                setShowCheckInCalendar(!showCheckInCalendar);
                setShowCheckOutCalendar(false);
                setShowRoomSelector(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white text-left hover:border-gray-300 transition-colors"
            >
              <span className="flex items-center gap-3 text-gray-900 font-medium">
                <CalendarIcon size={18} className="text-gray-600" />
                {formatDate(checkIn)}
              </span>
              <ChevronDown size={18} className="text-gray-400" />
            </button>
            {showCheckInCalendar && (
              <div
                className="absolute top-full mt-2 left-0 z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Calendar
                  selectedDate={checkIn}
                  onSelectDate={handleCheckInSelect}
                  minDate={new Date()}
                />
              </div>
            )}
          </div>

          {/* Check Out */}
          <div className="relative md:flex-1" ref={checkOutRef}>
            <label className="block text-sm text-gray-600 mb-2">
              Check Out
            </label>
            <button
              onClick={() => {
                setShowCheckOutCalendar(!showCheckOutCalendar);
                setShowCheckInCalendar(false);
                setShowRoomSelector(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white text-left hover:border-gray-300 transition-colors"
            >
              <span className="flex items-center gap-3 text-gray-900 font-medium">
                <CalendarIcon size={18} className="text-gray-600" />
                {formatDate(checkOut)}
              </span>
              <ChevronDown size={18} className="text-gray-400" />
            </button>
            {showCheckOutCalendar && (
              <div
                className="absolute top-full mt-2 left-0 z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Calendar
                  selectedDate={checkOut}
                  onSelectDate={handleCheckOutSelect}
                  minDate={(() => {
                    const tomorrow = new Date(checkIn);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow;
                  })()}
                />
              </div>
            )}
          </div>

          {/* Rooms */}
          {/* Commented out in compact layout if needed */}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full md:w-12 h-12 bg-[#2F2279] text-white rounded-xl hover:bg-[#241a63] transition-colors flex items-center justify-center shrink-0 md:shrink-0"
          >
            <Search size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative -mt-16 z-20 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* City Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-cogwave-blue mb-2">
              Enter City
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vivid-cyan"
                size={20}
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-balance-gray rounded-lg focus:outline-none focus:border-vivid-cyan transition-colors"
                placeholder="Enter city name"
              />
            </div>
          </div>

          {/* Check In */}
          <div className="relative" ref={checkInRef}>
            <label className="block text-sm font-medium text-cogwave-blue mb-2">
              Check In
            </label>
            <button
              onClick={() => {
                setShowCheckInCalendar(!showCheckInCalendar);
                setShowCheckOutCalendar(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 border-2 border-balance-gray rounded-lg hover:border-vivid-cyan transition-colors text-left"
            >
              <CalendarIcon className="text-vivid-cyan" size={20} />
              <span className="text-cogwave-blue font-medium">
                {formatDate(checkIn)}
              </span>
            </button>
            {showCheckInCalendar && (
              <div
                className="absolute top-full mt-2 left-0 z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Calendar
                  selectedDate={checkIn}
                  onSelectDate={handleCheckInSelect}
                  minDate={new Date()}
                />
              </div>
            )}
          </div>

          {/* Check Out */}
          <div className="relative" ref={checkOutRef}>
            <label className="block text-sm font-medium text-cogwave-blue mb-2">
              Check Out
            </label>
            <button
              onClick={() => {
                setShowCheckOutCalendar(!showCheckOutCalendar);
                setShowCheckInCalendar(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 border-2 border-balance-gray rounded-lg hover:border-vivid-cyan transition-colors text-left"
            >
              <CalendarIcon className="text-vivid-cyan" size={20} />
              <span className="text-cogwave-blue font-medium">
                {formatDate(checkOut)}
              </span>
            </button>
            {showCheckOutCalendar && (
              <div
                className="absolute top-full mt-2 left-0 z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Calendar
                  selectedDate={checkOut}
                  onSelectDate={handleCheckOutSelect}
                  minDate={(() => {
                    const tomorrow = new Date(checkIn);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow;
                  })()}
                />
              </div>
            )}
          </div>

          {/* Rooms */}
          {/*
<div className="relative" ref={roomRef}>
  <label className="block text-sm font-medium text-cogwave-blue mb-2">
    Rooms
  </label>
  <button
    onClick={() => setShowRoomSelector(!showRoomSelector)}
    className="w-full flex items-center gap-2 px-4 py-3 border-2 border-balance-gray rounded-lg hover:border-vivid-cyan transition-colors text-left"
  >
    <Home className="text-vivid-cyan" size={20} />
    <span className="text-cogwave-blue font-medium">
      {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
    </span>
  </button>
  {showRoomSelector && (
    <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-lg shadow-lg p-4 w-48">
      <div className="flex items-center justify-between">
        <span className="text-cogwave-blue font-medium">Rooms</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRooms(prev => Math.max(prev - 1, 1))}
            disabled={rooms <= 1}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
              ${rooms <= 1 
                ? 'border-balance-gray text-balance-gray cursor-not-allowed' 
                : 'border-vivid-cyan text-vivid-cyan hover:bg-vivid-cyan hover:text-white'
              }`}
          >
            -
          </button>
          <span className="font-semibold text-cogwave-blue w-6 text-center">{rooms}</span>
          <button
            onClick={() => setRooms(prev => Math.min(prev + 1, 10))}
            disabled={rooms >= 10}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
              ${rooms >= 10 
                ? 'border-balance-gray text-balance-gray cursor-not-allowed' 
                : 'border-vivid-cyan text-vivid-cyan hover:bg-vivid-cyan hover:text-white'
              }`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )}
</div>
*/}

          {/* Guests */}
          <div className="relative" ref={guestRef}>
            <label className="block text-sm font-medium text-cogwave-blue mb-2">
              Guests
            </label>
            <button
              onClick={() => setShowGuestSelector(!showGuestSelector)}
              className="w-full flex items-center gap-2 px-4 py-3 border-2 border-balance-gray rounded-lg hover:border-vivid-cyan transition-colors text-left"
            >
              <Users className="text-vivid-cyan" size={20} />
              <span className="text-cogwave-blue font-medium">
                {adults + children}
              </span>
            </button>
            {showGuestSelector && (
              <div className="absolute top-full mt-2 right-0 z-50">
                <GuestSelector
                  adults={adults}
                  children={children}
                  onUpdate={handleGuestUpdate}
                  onClose={() => setShowGuestSelector(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSearch}
            className="bg-vivid-cyan text-white px-12 py-1 rounded-full font-verdana font-semibold text-lg hover:bg-cogwave-blue transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Search size={10} />
            Search Hotels
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SearchFilter);
