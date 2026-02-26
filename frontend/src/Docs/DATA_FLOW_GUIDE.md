# Passing Data from Hotel Details to Checkout

## Current Issue
The checkout page currently has **mock data**. You need to pass actual selected rooms and hotel info from the HotelDetailsPage.

## Solution Options

### Option 1: Using SessionStorage (Recommended - Simple)

#### Step 1: Save data in BookingSummary or HotelDetailsPage
```jsx
// In BookingSummary.jsx or when clicking "Proceed to Pay"
const handleProceedToCheckout = () => {
  // Save booking data to sessionStorage
  sessionStorage.setItem('bookingData', JSON.stringify({
    hotel: {
      id: hotelId,
      name: hotelName,
      location: hotelLocation,
      image: hotelImage,
    },
    selectedRooms: selectedRooms,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    totalPrice: totalPrice,
  }));
  
  // Navigate to checkout
  navigate('/checkout');
};
```

#### Step 2: Retrieve data in CheckoutPage
```jsx
// At the top of CheckoutPage component
const CheckoutPage = () => {
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
      setBookingData(JSON.parse(savedData));
    }
  }, []);

  // Use bookingData instead of mock data
  if (!bookingData) {
    return <div>Loading...</div>;
  }

  const hotel = bookingData.hotel;
  const selectedRooms = bookingData.selectedRooms;
  // ... rest of component
};
```

### Option 2: Using React Context (More Scalable)

#### Step 1: Create BookingContext
```jsx
// src/context/BookingContext.jsx
import { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    hotel: null,
    selectedRooms: [],
    checkInDate: null,
    checkOutDate: null,
  });

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};
```

#### Step 2: Wrap App with Provider
```jsx
// In App.jsx
import { BookingProvider } from './context/BookingContext';

function App() {
  return (
    <BookingProvider>
      <Router>
        {/* routes */}
      </Router>
    </BookingProvider>
  );
}
```

#### Step 3: Use in components
```jsx
// In HotelDetailsPage or BookingSummary
const { setBookingData } = useContext(BookingContext);

const handleProceedToCheckout = () => {
  setBookingData({
    hotel: currentHotel,
    selectedRooms: selectedRooms,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
  });
  navigate('/checkout');
};

// In CheckoutPage
const { bookingData } = useContext(BookingContext);
const hotel = bookingData.hotel;
const selectedRooms = bookingData.selectedRooms;
```

### Option 3: Using URL Parameters (For sharable links)

```jsx
// In BookingSummary
const handleProceedToCheckout = () => {
  const bookingInfo = btoa(JSON.stringify({
    selectedRooms,
    hotelId,
  }));
  navigate(`/checkout?booking=${bookingInfo}`);
};

// In CheckoutPage
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const bookingInfo = JSON.parse(
  atob(searchParams.get('booking'))
);
```

## Complete Implementation Example

Here's how to update **BookingSummary.jsx** to pass real data:

```jsx
// src/components/BookingSummary.jsx
import { Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingSummary = ({ 
  hotel,  // Add hotel prop
  checkInDate, 
  checkOutDate, 
  selectedRooms, 
  couponCode, 
  setCouponCode, 
  onRemoveRoom 
}) => {
  const navigate = useNavigate();
  const totalPrice = selectedRooms.reduce(
    (sum, room) => sum + (room.price * (room.roomCount || 1)), 
    0
  );

  const handleProceedToCheckout = () => {
    // Save data
    sessionStorage.setItem('bookingData', JSON.stringify({
      hotel: {
        id: hotel?.id,
        name: hotel?.name,
        location: hotel?.location,
        image: hotel?.image,
      },
      selectedRooms: selectedRooms,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalPrice: totalPrice,
    }));
    
    // Navigate
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
      {/* ... existing JSX ... */}
      
      <button 
        onClick={handleProceedToCheckout}
        disabled={selectedRooms.length === 0}
        className="w-full bg-cogwave-blue text-white py-3 rounded-lg font-semibold hover:bg-cogwave-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Proceed to Pay
      </button>
    </div>
  );
};

export default BookingSummary;
```

And update **CheckoutPage.jsx** to use the data:

```jsx
// src/components/pages/CheckoutPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { ChevronDown, Plus } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
  });

  // Load booking data on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
      setBookingData(JSON.parse(savedData));
    } else {
      // Redirect back if no booking data
      navigate('/');
    }
  }, [navigate]);

  // If no data, show loading
  if (!bookingData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Use real data from bookingData
  const hotel = bookingData.hotel;
  const selectedRooms = bookingData.selectedRooms;
  const checkInDate = new Date(bookingData.checkInDate);
  const checkOutDate = new Date(bookingData.checkOutDate);

  // Calculate price details from actual selected rooms
  const priceDetails = {
    roomCharges: selectedRooms.reduce(
      (sum, room) => sum + (room.price * (room.roomCount || 1)), 
      0
    ),
    serviceCharge: 4.20,
    taxes: 24.70,
  };

  const totalPrice = bookingData.totalPrice + priceDetails.serviceCharge + priceDetails.taxes;

  // Rest of component remains the same...
  // Just use the real data instead of mock data
};

export default CheckoutPage;
```

## Update HotelDetailsPage too

Pass hotel data to BookingSummary:

```jsx
// In HotelDetailsPage.jsx
<BookingSummary
  hotel={hotelData}  // Add this
  checkInDate={checkInDate}
  checkOutDate={checkOutDate}
  selectedRooms={selectedRooms}
  couponCode={couponCode}
  setCouponCode={setCouponCode}
  onRemoveRoom={handleRemoveRoom}
/>
```

## Testing the Data Flow

1. **Before clicking "Proceed to Pay":**
   - Verify selectedRooms array has correct data
   - Check hotel info is available
   - Confirm dates are set

2. **After clicking:**
   - Check browser DevTools > Application > Session Storage
   - Should see `bookingData` with your data
   - Page should not show "Loading"

3. **On Checkout page:**
   - Hotel name, image, location should match
   - Selected rooms should match what you selected
   - Dates should be correct
   - Total price should match

## Debugging Tips

### Check what's in sessionStorage
```javascript
// Run this in browser console
console.log(JSON.parse(sessionStorage.getItem('bookingData')))
```

### Check if data is being saved
Add console logs:
```jsx
const handleProceedToCheckout = () => {
  const data = {
    hotel: currentHotel,
    selectedRooms: selectedRooms,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
  };
  console.log('Saving booking data:', data);
  sessionStorage.setItem('bookingData', JSON.stringify(data));
  navigate('/checkout');
};
```

### Check if data is being loaded
Add in CheckoutPage:
```jsx
useEffect(() => {
  const savedData = sessionStorage.getItem('bookingData');
  console.log('Loaded booking data:', savedData);
  if (savedData) {
    setBookingData(JSON.parse(savedData));
  }
}, []);
```

## Important Notes

### Session Storage Behavior
- ✅ Persists across page navigation within same session
- ✅ Cleared when browser tab/window closes
- ❌ Not persisted on page refresh
- ❌ Not accessible across tabs

### For Production
Consider using:
- **LocalStorage** if you want persistence across sessions
- **Context API** for in-memory state
- **Database** to save incomplete bookings

### Security
- Don't store sensitive info in sessionStorage
- Verify data on backend before creating booking
- Hash/encrypt sensitive data if needed

## Summary

1. **SessionStorage Method** (Easiest)
   - Save in BookingSummary before navigate
   - Load in CheckoutPage useEffect
   - Works for typical flow

2. **Context Method** (Best Practice)
   - More scalable
   - Global state management
   - Better for complex apps

3. **URL Params** (Sharable)
   - Can share checkout link
   - Limited data size
   - Less secure

Choose the option that fits your architecture best!

---

**Questions?** Check the console logs and make sure data is being passed correctly.
