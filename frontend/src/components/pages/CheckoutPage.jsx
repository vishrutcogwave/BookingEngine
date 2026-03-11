import { useState, useEffect ,useMemo} from 'react';
import { ChevronDown, Mail, X } from 'lucide-react';
import Navbar from '../Navbar';
import BookingSummary from '../BookingSummary';
import { createPhonePePayment, getTaxAmount } from '../../services/api';
import { getSelectedRooms, getCheckInDate, getCheckOutDate } from '../../utils/bookingStorage';
import { useToast } from '../../hooks/useToast';

const CheckoutPage = () => {
  const { error, success } = useToast();
  
  // Load saved guest info from sessionStorage (from modify or pending booking)
  const loadSavedGuestInfo = () => {
    // First check if there's a pending booking (from failed payment)
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (pendingBooking) {
      try {
        const booking = JSON.parse(pendingBooking);
        return {
          guestInfo: booking.guestInfo || null,
          additionalGuests: booking.additionalGuests || [],
          specialRequests: booking.specialRequests || ''
        };
      } catch (e) {
        // console.error('Error parsing pending booking:', e);
      }
    }
    
    // Otherwise check for saved checkout form data
    const savedFormData = sessionStorage.getItem('checkoutFormData');
    if (savedFormData) {
      try {
        return JSON.parse(savedFormData);
      } catch (e) {
        // console.error('Error parsing saved form data:', e);
      }
    }
    
    return null;
  };
  
  const savedData = loadSavedGuestInfo();
  
  const [guestInfo, setGuestInfo] = useState(savedData?.guestInfo || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91',
  });

  const [additionalGuests, setAdditionalGuests] = useState(savedData?.additionalGuests || []);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [specialRequests, setSpecialRequests] = useState(savedData?.specialRequests || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [roomTaxes, setRoomTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  const countryCodes = [
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+1', name: 'USA', flag: '🇺🇸' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  ];

  // Get booking data from sessionStorage or localStorage
  const getBookingData = () => {
    const stored = sessionStorage.getItem('bookingData');
    if (stored) {
      return JSON.parse(stored);
    }

    // Use localStorage data
    const savedRooms = getSelectedRooms();
    const savedCheckInDate = getCheckInDate();
    const savedCheckOutDate = getCheckOutDate();

    if (savedRooms && savedRooms.length > 0 && savedCheckInDate && savedCheckOutDate) {
      // Calculate num nights
      const numNights = Math.ceil((new Date(savedCheckOutDate) - new Date(savedCheckInDate)) / (1000 * 60 * 60 * 24));
      
      // Calculate total price from rooms
      const totalPrice = savedRooms.reduce((sum, room) => {
        const price = room.pricePerNight || room.price || 0;
        const count = room.roomCount || 1;
        return sum + (price * count * numNights);
      }, 0);

      return {
        hotel: {
          HotelId: savedRooms[0]?.hotelId || null,
          Name: "",
          HotelDetail: "",
          HotelAddress: "",
          Images: []
        },
        selectedRooms: savedRooms,
        checkInDate: savedCheckInDate.toISOString(),
        checkOutDate: savedCheckOutDate.toISOString(),
        numNights,
        numGuests: savedRooms.reduce((sum, room) => sum + (room.adults || 1), 0),
        totalPrice
      };
    }

    // No data available
    return {
      hotel: {
        HotelId: null,
        Name: "",
        HotelDetail: "",
        HotelAddress: "",
        Images: []
      },
      selectedRooms: [],
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      numNights: 1,
      numGuests: 1,
      totalPrice: 0
    };
  };

 const bookingData = useMemo(() => getBookingData(), []);
  const hotel = bookingData.hotel;
const selectedRooms = bookingData.selectedRooms || [];
  const checkInDate = new Date(bookingData.checkInDate);
  const checkOutDate = new Date(bookingData.checkOutDate);
  const numNights = bookingData.numNights;
  const numGuests = bookingData.numGuests;
  
  // Get hotel ID from hotel object or from saved hotel ID in localStorage
  const hotelId = hotel?.HotelId || hotel?.id || (typeof window !== 'undefined' && localStorage.getItem('hotelId'));
  
  // Tax calculation function
  const calculateTax = (pricePerNight, quantity, nights) => {
    const totalAmount = pricePerNight * quantity * nights;
    // If room price is below 7000, apply 5% tax; otherwise apply 18% tax
    const taxRate = pricePerNight < 7000 ? 0.05 : 0.18;
    return Math.round(totalAmount * taxRate * 100) / 100; // Round to 2 decimals
  };

  // Calculate room charges and taxes per room
  const roomChargesWithTax = selectedRooms.map(room => {
    const price = room.pricePerNight || room.price || 0;
    const count = room.roomCount || 1;
    const roomCharge = price * count * numNights;
    const tax = calculateTax(price, count, numNights);
    return {
      roomId: room.id,
      roomName: room.name,
      roomCharge,
      tax,
      total: roomCharge + tax
    };
  });

  // Calculate room charges (without tax)
  const roomCharges = roomChargesWithTax.reduce((sum, room) => sum + room.roomCharge, 0);

  // Calculate total tax amount
  const totalTaxAmount = roomChargesWithTax.reduce((sum, room) => sum + room.tax, 0);
  
  // Total price including taxes
  const totalPrice = roomCharges + totalTaxAmount;

  // Set room taxes locally based on calculation (no API call needed)
  useEffect(() => {
    const taxesPerRoom = selectedRooms.map(room => {
      const price = room.pricePerNight || room.price || 0;
      const count = room.roomCount || 1;
      const roomCharge = price * count * numNights;
      const tax = calculateTax(price, count, numNights);
      
      // Determine tax rate and split into CGST/SGST
      const taxRate = price < 7000 ? 0.05 : 0.18;
      const taxPercentage = taxRate * 100;
      const halfTaxPercentage = taxPercentage / 2;
      const cgst = tax / 2;
      const sgst = tax / 2;
      
      return {
        roomId: room.id,
        roomName: room.name,
        roomCharge: roomCharge,
        taxes: [
          {
            TaxName: 'CGST',
            TaxPer: halfTaxPercentage,
            TaxValue: cgst
          },
          {
            TaxName: 'SGST',
            TaxPer: halfTaxPercentage,
            TaxValue: sgst
          }
        ]
      };
    });

    setRoomTaxes(taxesPerRoom);
    setLoading(false);
  }, [selectedRooms, numNights]);

  // Save guest info to sessionStorage whenever it changes
  useEffect(() => {
    const formData = {
      guestInfo,
      additionalGuests,
      specialRequests
    };
    sessionStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [guestInfo, additionalGuests, specialRequests]);

  // Show notification if data was restored
  useEffect(() => {
    if (savedData && savedData.guestInfo && savedData.guestInfo.firstName) {
      success('Your guest information has been restored!');
    }
  }, []); // Run only once on mount

  const handleGuestChange = (field, value) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRemoveGuest = (id) => {
    setAdditionalGuests(prev => prev.filter(guest => guest.id !== id));
  };

  const handleAdditionalGuestChange = (id, field, value) => {
    setAdditionalGuests(prev => prev.map(guest => 
      guest.id === id ? { ...guest, [field]: value } : guest
    ));
    // Clear validation error for this field when user starts typing
    const guestIndex = additionalGuests.findIndex(g => g.id === id);
    const errorKey = `guest${guestIndex}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const selectCountryCode = (code) => {
    setGuestInfo(prev => ({ ...prev, countryCode: code }));
    setShowCountryDropdown(false);
  };

  const getCountryFlag = (code) => {
    const country = countryCodes.find(c => c.code === code);
    return country ? country.flag : '🇮🇳';
  };

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateGuestInfo = () => {
    const errors = {};

    // Validate first name
    if (!guestInfo.firstName || guestInfo.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    // Validate last name
    if (!guestInfo.lastName || guestInfo.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }

    // Validate email
    if (!guestInfo.email || guestInfo.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!validateEmail(guestInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate phone
    if (!guestInfo.phone || guestInfo.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(guestInfo.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Validate additional guests
    additionalGuests.forEach((guest, index) => {
      if (!guest.firstName || guest.firstName.trim() === '') {
        errors[`guest${index}_firstName`] = `Guest ${index + 2} first name is required`;
      }
      if (!guest.lastName || guest.lastName.trim() === '') {
        errors[`guest${index}_lastName`] = `Guest ${index + 2} last name is required`;
      }
      if (!guest.phone || guest.phone.trim() === '') {
        errors[`guest${index}_phone`] = `Guest ${index + 2} phone number is required`;
      } else if (!validatePhone(guest.phone)) {
        errors[`guest${index}_phone`] = `Guest ${index + 2} phone number must be 10 digits`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Pay Now - PhonePe Payment Integration
  const handlePayNow = async () => {
    debugger
    // Validate all form fields
    if (!validateGuestInfo()) {
      error('Please fix all validation errors before proceeding to payment.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Store booking and guest info for success page
      const bookingInfo = {
        guestInfo,
        additionalGuests,
        specialRequests,
        selectedRooms,
        hotel,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        roomCharges,
        roomTaxes,
        totalPrice,
        numNights,
        numGuests
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingInfo));

      // Create payment - totalPrice includes taxes
      const successUrl = `${window.location.origin}/payment-success`;
      console.log("sssssssss",`${window.location.origin}/payment-success`); 
      
      const paymentResponse = await createPhonePePayment(totalPrice, successUrl);

      if (!paymentResponse.redirectUrl) {
        throw new Error('No redirect URL received from payment gateway');
      }

      // Store merchant order ID for status check
      sessionStorage.setItem('merchantOrderId', paymentResponse.merchantOrderId);

      // Note: PhonePe sandbox might have CSP issues. If payment page doesn't load properly,
      // it's a known issue with their sandbox environment.
      
      // Redirect to PhonePe payment page
      window.location.href = paymentResponse.redirectUrl;
    } catch (error) {
      // console.error('Payment initiation failed:', error);
      setIsProcessingPayment(false);
      error('Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
          
          {/* Left Column - Guest Info */}
          <div className="lg:col-span-4">
            {/* Guest Information */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Guest Info</h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                Guest names must match the valid ID which will be used at check-in.
              </p>

              {/* Guest 1 Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-semibold text-gray-900">Guest 1</span>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={guestInfo.firstName}
                    onChange={(e) => handleGuestChange('firstName', e.target.value)}
                    placeholder="Emmily"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-xs sm:text-sm ${
                      validationErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cogwave-blue'
                    }`}
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={guestInfo.lastName}
                    onChange={(e) => handleGuestChange('lastName', e.target.value)}
                    placeholder="Morgan"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-xs sm:text-sm ${
                      validationErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cogwave-blue'
                    }`}
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) => handleGuestChange('email', e.target.value)}
                      placeholder="em***an@gmail.com"
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-xs sm:text-sm ${
                        validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cogwave-blue'
                      }`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm">{getCountryFlag(guestInfo.countryCode)}</span>
                        <span className="text-sm font-medium">{guestInfo.countryCode}</span>
                        <ChevronDown size={14} className="text-gray-400" />
                      </button>
                      
                      {/* Country Code Dropdown */}
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => selectCountryCode(country.code)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                            >
                              <span className="text-sm">{country.flag}</span>
                              <span className="text-sm">{country.name}</span>
                              <span className="text-sm text-gray-500 ml-auto">{country.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => handleGuestChange('phone', e.target.value)}
                      placeholder="9876543210"
                      className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-sm ${
                        validationErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cogwave-blue'
                      }`}
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Guests */}
            {additionalGuests.map((guest, index) => (
              <div key={guest.id} className="mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-900">Guest {index + 2}</span>
                  <button
                    onClick={() => handleRemoveGuest(guest.id)}
                    type="button"
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={guest.firstName}
                      onChange={(e) => handleAdditionalGuestChange(guest.id, 'firstName', e.target.value)}
                      placeholder="First Name"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-sm ${
                        validationErrors[`guest${index}_firstName`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cogwave-blue'
                      }`}
                    />
                    {validationErrors[`guest${index}_firstName`] && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors[`guest${index}_firstName`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={guest.lastName}
                      onChange={(e) => handleAdditionalGuestChange(guest.id, 'lastName', e.target.value)}
                      placeholder="Last Name"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-sm ${
                        validationErrors[`guest${index}_lastName`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cogwave-blue'
                      }`}
                    />
                    {validationErrors[`guest${index}_lastName`] && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors[`guest${index}_lastName`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                        <span className="text-sm">{getCountryFlag(guest.countryCode)}</span>
                        <span className="text-sm font-medium">{guest.countryCode}</span>
                      </div>
                      <input
                        type="tel"
                        value={guest.phone}
                        onChange={(e) => handleAdditionalGuestChange(guest.id, 'phone', e.target.value)}
                        placeholder="9876543210"
                        className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 text-sm ${
                          validationErrors[`guest${index}_phone`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-cogwave-blue'
                        }`}
                      />
                    </div>
                    {validationErrors[`guest${index}_phone`] && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors[`guest${index}_phone`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Special Requests */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-0">
                Special Requests <span className="text-xs sm:text-sm font-normal text-gray-500">(optional)</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-3 sm:mb-4">
                The property will do its best, but cannot guarantee to fulfill all requests
              </p>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Let the property know if there's anything they can assist you with."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cogwave-blue resize-none text-xs sm:text-sm text-gray-500"
                rows="4"
              />
            </div>

            {/* Save & Proceed Button */}
            <button
              onClick={handlePayNow}
              className="w-full bg-cogwave-blue text-white py-3 sm:py-3.5 rounded-lg font-semibold text-sm hover:bg-cogwave-blue/90 transition-colors"
            >
              Save & Proceed
            </button>
          </div>

          {/* Middle Column - Payment */}
          <div className="lg:col-span-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Make Payment</h2>
            
            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessingPayment}
              className={`w-full py-3.5 rounded-lg font-semibold text-base transition-colors ${
                isProcessingPayment 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-amber-600 hover:bg-amber-700'
              } text-white`}
            >
              {isProcessingPayment ? 'Processing...' : 'PAY NOW'}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              You will be redirected to a secure payment gateway
            </p>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-4">
            <BookingSummary
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              selectedRooms={selectedRooms}
              variant="checkout"
              numNights={numNights}
              numGuests={numGuests}
              hotel={hotel}
              showModifyButton={true}
              roomTaxes={roomTaxes}
              hotelId={hotelId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
