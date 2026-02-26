/**
 * Booking Storage Utility
 * Manages persistent storage of booking data (rooms, dates) across navigation
 */

const STORAGE_KEYS = {
  SELECTED_ROOMS: 'hotel360_selectedRooms',
  CHECK_IN_DATE: 'hotel360_checkInDate',
  CHECK_OUT_DATE: 'hotel360_checkOutDate',
  HOTEL_ID: 'hotel360_hotelId',
};

/**
 * Save selected rooms to localStorage
 * @param {Array} rooms - Array of selected room objects
 */
export const saveSelectedRooms = (rooms) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ROOMS, JSON.stringify(rooms));
  } catch (error) {
    // console.error('Error saving selected rooms to localStorage:', error);
  }
};

/**
 * Get selected rooms from localStorage
 * @returns {Array} Array of selected rooms or empty array if not found
 */
export const getSelectedRooms = () => {
  try {
    const rooms = localStorage.getItem(STORAGE_KEYS.SELECTED_ROOMS);
    return rooms ? JSON.parse(rooms) : [];
  } catch (error) {
    // console.error('Error reading selected rooms from localStorage:', error);
    return [];
  }
};

/**
 * Save check-in date to localStorage
 * @param {Date|string} date - Check-in date
 */
export const saveCheckInDate = (date) => {
  try {
    const dateString = date instanceof Date ? date.toISOString() : date;
    localStorage.setItem(STORAGE_KEYS.CHECK_IN_DATE, dateString);
  } catch (error) {
    // console.error('Error saving check-in date to localStorage:', error);
  }
};

/**
 * Get check-in date from localStorage
 * @returns {Date|null} Check-in date or null if not found
 */
export const getCheckInDate = () => {
  try {
    const date = localStorage.getItem(STORAGE_KEYS.CHECK_IN_DATE);
    return date ? new Date(date) : null;
  } catch (error) {
    // console.error('Error reading check-in date from localStorage:', error);
    return null;
  }
};

/**
 * Save check-out date to localStorage
 * @param {Date|string} date - Check-out date
 */
export const saveCheckOutDate = (date) => {
  try {
    const dateString = date instanceof Date ? date.toISOString() : date;
    localStorage.setItem(STORAGE_KEYS.CHECK_OUT_DATE, dateString);
  } catch (error) {
    // console.error('Error saving check-out date to localStorage:', error);
  }
};

/**
 * Get check-out date from localStorage
 * @returns {Date|null} Check-out date or null if not found
 */
export const getCheckOutDate = () => {
  try {
    const date = localStorage.getItem(STORAGE_KEYS.CHECK_OUT_DATE);
    return date ? new Date(date) : null;
  } catch (error) {
    // console.error('Error reading check-out date from localStorage:', error);
    return null;
  }
};

/**
 * Save hotel ID to localStorage
 * @param {string|number} hotelId - Hotel ID
 */
export const saveHotelId = (hotelId) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HOTEL_ID, hotelId.toString());
  } catch (error) {
    // console.error('Error saving hotel ID to localStorage:', error);
  }
};

/**
 * Get hotel ID from localStorage
 * @returns {string|null} Hotel ID or null if not found
 */
export const getHotelId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.HOTEL_ID);
  } catch (error) {
    // console.error('Error reading hotel ID from localStorage:', error);
    return null;
  }
};

/**
 * Save all booking data at once
 * @param {Object} bookingData - Object containing rooms, dates, and hotelId
 */
export const saveBookingData = (bookingData) => {
  try {
    const { selectedRooms, checkInDate, checkOutDate, hotelId } = bookingData;
    
    if (selectedRooms) saveSelectedRooms(selectedRooms);
    if (checkInDate) saveCheckInDate(checkInDate);
    if (checkOutDate) saveCheckOutDate(checkOutDate);
    if (hotelId) saveHotelId(hotelId);
  } catch (error) {
    // console.error('Error saving booking data to localStorage:', error);
  }
};

/**
 * Get all booking data from localStorage
 * @returns {Object} Object containing all booking data
 */
export const getBookingData = () => {
  return {
    selectedRooms: getSelectedRooms(),
    checkInDate: getCheckInDate(),
    checkOutDate: getCheckOutDate(),
    hotelId: getHotelId(),
  };
};

/**
 * Clear all booking data from localStorage
 * Used after successful payment/booking
 */
export const clearBookingData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    // console.error('Error clearing booking data from localStorage:', error);
  }
};

/**
 * Clear selected rooms only
 */
export const clearSelectedRooms = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ROOMS);
  } catch (error) {
    // console.error('Error clearing selected rooms from localStorage:', error);
  }
};
