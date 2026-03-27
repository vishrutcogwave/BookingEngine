// const API_BASE_URL = 'https://onlinebooking.cogwave.in';
// const API_BASE_URL = 'https://pousadabookingapi.cogwave.in'
// const API_BASE_URL = 'https://rainbowbookingapi.cogwave.in'

// const API_BASE_URL = 'https://mayansresortapi.cogwave.in';
const API_BASE_URL = 'https://kusumresortsbookingapi.cogwave.in';


/**
 * Fetch hotel ID
 * This endpoint might return hotel IDs based on search criteria
 */
export const getHotelId = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/bookingengine/gethotelid`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch hotel ID (${response.status}): ${errorText}`
      );
    }

    const hotelId = await response.json(); // This will be 50001
    console.log("Hotel ID:", hotelId);

    return hotelId;
  } catch (error) {
    console.error("Error fetching hotel ID:", error);
    throw error;
  }
};

export const getPrivacyPolicy = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookingengine/getpolicy`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch privacy policy (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    throw error;
  }
};
export const getTermsAndConditions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookingengine/getterms`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch terms and conditions (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    throw error;
  }
};

export const getRefundPolicy = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookingengine/getrefundpolicy`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch refund policy (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching refund policy:", error);
    throw error;
  }
};

export const getContactInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookingengine/getcontact`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch contact info (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contact info:", error);
    throw error;
  }
};

export const getTaxAmount = async (amount) => {
  console.log("ammount",amount);
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/bookingengine/gettaxamount?amount=${encodeURIComponent(amount)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch tax amount (${response.status}): ${errorText}`
      );
    }

    const taxData = await response.json();
    console.log("Tax Data:", taxData);

    return taxData;
  } catch (error) {
    console.error("Error fetching tax amount:", error);
    throw error;
  }
};



/**
 * Helper function to format date to MM/DD/YYYY format
 * @param {string|Date} dateString - Date string in YYYY-MM-DD format or Date object
 * @returns {string} Formatted date in MM/DD/YYYY format
 */
export const checkTheroomStatus = async (roomList) => {
  debugger
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/bookingengine/submitroomlist`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomList),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit room list");
    }

    const data = await response.json();
    console.log("Room Status Response:", data);

    return data;
  } catch (error) {
    console.error("Error submitting room list:", error);
  }
};
const formatDateForAPI = (dateString) => {
  if (!dateString) return null;

  try {
    const date = typeof dateString === 'string'
      ? new Date(dateString)
      : dateString;

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  } catch (error) {
    // console.error('❌ Error formatting date:', error);
    return null;
  }
};

/**
 * Fetch hotel data including rooms
 * @param {number} hotelId - Hotel ID (required)
 * @param {Object} searchParams - Search parameters with checkInDate and numNights
 * @returns {Promise<Object>} Hotel data with rooms
 */
// export const getHotelData = async (hotelId = 1, searchParams = {}) => {
//   try {
//     // Default dates if not provided
//     const checkInDate = searchParams.checkInDate || new Date().toISOString().split('T')[0];
//     const numNights = searchParams.numNights || 1;

//     // Calculate checkout date
//     const checkInDateObj = new Date(checkInDate);
//     const checkoutDateObj = new Date(checkInDateObj);
//     checkoutDateObj.setDate(checkoutDateObj.getDate() + numNights);

//     // Format dates to MM/DD/YYYY format
//     const checkindate = formatDateForAPI(checkInDate);
//     const checkoutdate = formatDateForAPI(checkoutDateObj);

//     // Build URL with query parameters
//     const url = new URL(`${API_BASE_URL}/gethoteldata`);
//     url.searchParams.append('HotelID', hotelId);
//     url.searchParams.append('checkindate', checkindate);
//     url.searchParams.append('checkoutdate', checkoutdate);

//     const response = await fetch(url.toString(), {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//       },
//       cache: 'no-store',
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Failed to fetch hotel data: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     // console.error('❌ Error fetching hotel data:', error);
//     throw error;
//   }
// };
export const getHotelData = async (hotelId, searchParams = {}) => {
  try {
    const checkInDate =
      searchParams.checkInDate || new Date();

    const numNights = searchParams.numNights || 1;

    const checkoutDate = new Date(checkInDate);
    checkoutDate.setDate(checkoutDate.getDate() + numNights);

    const checkindate = formatDateForAPI(checkInDate);
    const checkoutdate = formatDateForAPI(checkoutDate);

    const url = new URL(
      `${API_BASE_URL}/api/bookingengine/gethoteldata`
    );

    url.searchParams.append("HotelID", hotelId);
    url.searchParams.append("checkindate", checkindate);
    url.searchParams.append("checkoutdate", checkoutdate);

    console.log("API URL:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch hotel data (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    throw error;
  }
};
/**
 * Get hotel image URL
 * @param {string} imageId - Image identifier
 * @returns {string} Full image URL
 */
export const getImageUrl = (imageId) => {
  if (!imageId) return '';
  // If it's already a full URL, return it
  if (imageId.startsWith('http')) return imageId;
  // Otherwise construct the URL
  return `https://onlinebooking.cogwave.in/api/image/uploaddata/${imageId}`;
};

/**
 * Transform API hotel data to match our app's format
 * @param {Object} apiData - Raw API response
 * @returns {Object} Transformed hotel data
 */
export const transformHotelData = (apiData) => {
  if (!apiData) {
    // console.warn('⚠️ transformHotelData - No data provided');
    return null;
  }

  // Check if data has Hotel property
  if (!apiData.Hotel) {
    // console.warn('⚠️ transformHotelData - No Hotel property in data');
    return null;
  }

  const { Hotel, RoomTypes, Search, BookingPolicy } = apiData;

  // Check if hotel data is valid (not null/0)
  if (!Hotel.Name || Hotel.HotelId === 0) {
    // console.warn('⚠️ transformHotelData - Hotel data is empty (HotelId=0 or Name=null)');
    // console.warn('💡 This hotel ID may not exist in the database. Try a different hotel ID.');
    return null;
  }

  return {
    id: Hotel.HotelId,
    name: Hotel.Name,
    Name: Hotel.Name, // Add both for compatibility
    description: Hotel.HotelDetail,
    address: Hotel.HotelAddress,
    location: Hotel.HotelLocation,
    contact: Hotel.HotelContact,
    images: Hotel.Images || [],
    amenities: Hotel.Amenities || [],
    policies: Hotel.Policies || {},
    roomTypes: RoomTypes || [],
    search: Search || {},
    bookingPolicy: BookingPolicy || {},
    // For listing page compatibility
    rating: 'Excellent',
    score: '5.0',
    reviews: '1,240 reviews',
    distance: 'City Centre',
    beachDistance: '',
    features: Hotel.Amenities?.slice(0, 4) || [],
    image: Hotel.Images?.[0] || '',
  };
};

/**
 * Get available hotels (for listing page)
 * In a real scenario, this would fetch multiple hotels
 * For now, it returns the hotel data as an array
 */
export const getAvailableHotels = async (searchParams = {}) => {
  try {
    // Use hotel ID 1 as default, or get from searchParams if provided
    const hotelId = searchParams.hotelId || 1;
    const hotelData = await getHotelData(hotelId, searchParams);
    const transformedData = transformHotelData(hotelData);

    // Return as an array for the listing page
    const result = transformedData ? [transformedData] : [];
    return result;
  } catch (error) {
    // console.error('❌ Error fetching available hotels:', error);
    return [];
  }
};

/**
 * Get single hotel details by ID
 * @param {number} hotelId - Hotel ID
 * @param {Object} searchParams - Search parameters
 */
export const getHotelDetails = async (hotelId, searchParams = {}) => {
  try {
    // Ensure hotelId is a number
    const numericHotelId = parseInt(hotelId) || 1;
    const hotelData = await getHotelData(numericHotelId, searchParams);
    return transformHotelData(hotelData);
  } catch (error) {
    // console.error('Error fetching hotel details:', error);
    throw error;
  }
};

/**
 * Create PhonePe Payment
 * @param {number} amount - Total amount in INR (will be converted to paise)
 * @param {string} redirectUrl - URL to redirect after payment
 * @returns {Promise<Object>} Payment response with orderId and redirectUrl
 */
export const createPhonePePayment = async (amount, redirectUrl) => {
  try {
    // Convert rupees to paise (multiply by 100) as PhonePe expects amount in paise
    const amountInPaise = Math.round(amount * 100);
    const url = new URL(`${API_BASE_URL}/api/bookingengine/PGCreatePayment`);
    url.searchParams.append('Amount', amountInPaise);
    url.searchParams.append('RedirectURL', redirectUrl);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('❌ Payment Error:', errorText);
      throw new Error(`Payment creation failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('❌ Error creating payment:', error);
    throw error;
  }
};

/**
 * Check PhonePe Payment Status
 * @param {string} merchantOrderId - Merchant Order ID from payment creation
 * @returns {Promise<Object>} Payment status details
 */
export const checkPaymentStatus = async (merchantOrderId) => {
  try {
    const url = new URL(`${API_BASE_URL}/api/bookingengine/PGPaymentStatus`);
    url.searchParams.append('MerchantorderID', merchantOrderId);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Payment status check failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('❌ Error checking payment status:', error);
    throw error;
  }
};

/**
 * Get Tax Amount Breakdown
 * @param {number} amount - Amount in rupees to calculate tax on
 * @returns {Promise<Array>} Array of tax objects with TaxName, TaxPer, and TaxValue
 */


/**
 * Submit Reservation Data
 * @param {Object} reservationData - Complete reservation details
 * @returns {Promise<Object>} Reservation confirmation
 */
export const submitReservation = async (reservationData) => {
  try {
    const url = `${API_BASE_URL}/api/bookingengine/submitreservationdata`;

    // console.log('📤 SUBMITTING RESERVATION DATA');
    // console.log('═'.repeat(80));
    // console.log('URL:', url);
    // console.log('Request Payload (Copy this for backend team):');
    // console.log(JSON.stringify(reservationData, null, 2));
    // console.log('═'.repeat(80));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    // console.log('📥 RESERVATION API RESPONSE');
    // console.log('Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
        // console.error('❌ Reservation API Error (Parsed):');
        // console.error('   Message:', errorDetails.Message);
        // console.error('   Exception:', errorDetails.ExceptionMessage);
        // console.error('   Type:', errorDetails.ExceptionType);
      } catch {
        // console.error('❌ Reservation API Error (Raw):', errorText);
      }
      // console.error('═'.repeat(80));
      // console.error('⚠️  BACKEND ISSUE: The reservation endpoint is not fully implemented yet.');
      // console.error('⚠️  Status:', response.status);
      // console.error('⚠️  Payment succeeded, but reservation data could not be saved to backend.');
      // console.error('═'.repeat(80));
      throw new Error(`Reservation submission failed: ${response.status}`);
    }

    const data = await response.json();
    // console.log('✅ Reservation submitted successfully:', data);
    return data;
  } catch (error) {
    // console.error('❌ Error submitting reservation:', error);
    throw error;
  }
};

/**
 * PhonePe Payment API (Old - Deprecated)
 * Initiates a PhonePe payment and returns the payment key/token
 * @param {string} username - API username
 * @param {string} password - API password
 * @returns {Promise<string>} Payment key/token for QR generation
 */
export const initiatePhonePePayment = async (username = 'varun', password = 'Varun@789') => {
  try {
    const url = new URL(`${API_BASE_URL}/api/PhonePe`);
    url.searchParams.append('username', username);
    url.searchParams.append('password', password);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('❌ PhonePe Error:', errorText);
      throw new Error(`PhonePe payment initiation failed: ${response.status}`);
    }

    const paymentKey = await response.json();
    return paymentKey;
  } catch (error) {
    // console.error('❌ Error initiating PhonePe payment:', error);
    throw error;
  }
};

/**
 * PhonePe Webhook handler
 * This endpoint is called by PhonePe to notify payment status
 * @param {string} token - Authorization token
 * @param {Object} paymentData - Payment status data from PhonePe
 * @returns {Promise<Object>} Webhook response
 */
export const phonePeWebhook = async (token, paymentData = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/phonepe/webhook`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      // console.error('❌ Webhook Error: Status', response.status);
      throw new Error(`Webhook call failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // console.error('❌ Error in webhook:', error);
    throw error;
  }
};

/**
 * Send WhatsApp and Email booking confirmation with PDF
 * @param {Object} confirmationData - Confirmation message data
 * @param {string} confirmationData.base64_file - Base64 encoded PDF
 * @param {string} confirmationData.GuestName - Guest name
 * @param {string} confirmationData.MobileNo - Guest mobile number
 * @param {string} confirmationData.EmailId - Guest email address
 * @param {string} confirmationData.BookingNo - Booking number
 * @param {string} confirmationData.HotelName - Hotel name
 * @returns {Promise<Object>} API response
 */
export const sendBookingConfirmation = async (confirmationData) => {
  debugger
  try {
    // console.log('═'.repeat(80));
    // console.log('📤 SENDING BOOKING CONFIRMATION (WhatsApp & Email)');
    // console.log('═'.repeat(80));
    // console.log('Endpoint:', `${API_BASE_URL}/sendwhatsupmessage`);
    // console.log('Guest Info:');
    // console.log('   📱 Mobile:', confirmationData.MobileNo);
    // console.log('   📧 Email:', confirmationData.EmailId);
    // console.log('   👤 Name:', confirmationData.GuestName);
    // console.log('Booking Info:');
    // console.log('   🔢 Booking No:', confirmationData.BookingNo);
    // console.log('   🏨 Hotel:', confirmationData.HotelName);
    // console.log('   📄 PDF Size:', confirmationData.base64_file.length, 'characters');

    const payload = {
      base64_file: confirmationData.base64_file,
      GuestName: confirmationData.GuestName,
      MobileNo: confirmationData.MobileNo,
      EmailId: confirmationData.EmailId,
      BookingNo: confirmationData.BookingNo,
      HotelName: confirmationData.HotelName,
    };

    // console.log('📋 Full Payload (for backend team):');
    // console.log(JSON.stringify({
    //   ...payload,
    //   base64_file: `[${payload.base64_file.length} chars PDF]`
    // }, null, 2));
    // console.log('═'.repeat(80));

    const response = await fetch(`${API_BASE_URL}/api/bookingengine/sendwhatsupmessage`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // console.log('📥 API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('═'.repeat(80));
      // console.error('❌ CONFIRMATION API ERROR');
      // console.error('Status:', response.status);
      // console.error('Error Response:', errorText);
      // console.error('═'.repeat(80));

      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
        // console.error('Parsed Error:', errorDetails);
      } catch (e) {
        // console.error('Raw Error (could not parse JSON):', errorText);
      }

      throw new Error(`Confirmation sending failed: ${response.status}`);
    }

    const result = await response.json();
    // console.log('═'.repeat(80));
    // console.log('✅ CONFIRMATION SENT SUCCESSFULLY');
    // console.log('Response:', result);

    // Check response for delivery status
    // if (result.whatsapp_status) {
    //   console.log('📱 WhatsApp Status:', result.whatsapp_status);
    // }
    // if (result.email_status) {
    //   console.log('📧 Email Status:', result.email_status);
    // }
    // if (result.message_wamid) {
    //   console.log('✅ WhatsApp Message ID:', result.message_wamid);
    // }
    // if (result.email_sent !== undefined) {
    //   console.log(result.email_sent ? '✅ Email Sent' : '❌ Email Failed');
    // }

    // console.log('═'.repeat(80));
    return result;
  } catch (error) {
    // console.error('═'.repeat(80));
    // console.error('❌ ERROR SENDING CONFIRMATION');
    // console.error('Error:', error.message);
    // console.error('Full Error:', error);
    // console.error('═'.repeat(80));
    throw error;
  }
};
