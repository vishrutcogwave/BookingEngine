# Hotel360 - Hotel Booking System Integration

## 🎯 What Has Been Implemented

I've successfully integrated the hotel booking API into your application. Here's what's been set up:

### ✅ Completed Components

1. **API Service** (`src/services/api.js`)
   - Functions to fetch hotel data from the API
   - Data transformation to match your app's structure
   - Error handling and retry logic

2. **Listing Page** (`src/components/pages/ListingPage.jsx`)
   - Fetches hotels from the API on page load
   - Displays loading spinner while fetching
   - Shows error message with retry button if fetch fails
   - Renders hotel cards for each available hotel

3. **Hotel Details Page** (`src/components/pages/HotelDetailsPage.jsx`)
   - Fetches specific hotel details based on URL parameter
   - Displays hotel information, images, and amenities
   - Shows all available room types with their rate plans
   - Handles loading and error states

4. **Enhanced Room Card** (`src/components/RoomCardEnhanced.jsx`)
   - Displays multiple rate plans (Room Only, With Breakfast, etc.)
   - Shows cancellation policies
   - Handles availability and sold-out states
   - Displays pricing with currency

## 📋 API Endpoints Used

```
Base URL: https://onlinebooking.cogwave.in/api/bookingengine

1. GET /gethotelid - Get hotel IDs
2. GET /gethoteldata - Get hotel details and rooms
3. GET /api/image/uploaddata - Image URLs
```

## 🚀 How to Use

### 1. Start Your Development Server

```bash
cd frontend
npm install  # if you haven't already
npm run dev
```

### 2. Navigate to Pages

- **Home**: `http://localhost:5173/`
- **Hotel Listing**: `http://localhost:5173/search`
- **Hotel Details**: `http://localhost:5173/hotel/25739`

### 3. The Flow

```
User Journey:
Home Page → Search Hotels → Listing Page → Click Hotel → Details Page → Book Room
```

## 📊 Data Structure

### API Response Example

```json
{
  "Hotel": {
    "HotelId": 25739,
    "Name": "Sample Hotel Name",
    "HotelDetail": "Description...",
    "HotelAddress": "Address...",
    "Images": ["url1", "url2"],
    "Amenities": ["WiFi", "Breakfast"],
    "Policies": {
      "CheckinTime": "12:00",
      "CheckoutTime": "12:00"
    }
  },
  "RoomTypes": [
    {
      "RoomTypeId": "RT1",
      "RoomTypeName": "Business Premium",
      "RoomImages": ["url"],
      "RatePlans": [
        {
          "RatePlanId": "RP1",
          "RateName": "Standard Plan",
          "PricePerNight": 4500,
          "Currency": "INR"
        }
      ]
    }
  ]
}
```

## 🔧 Key Features Implemented

### 1. **Auto-Fetching Data**
- Pages automatically fetch data when loaded
- No manual intervention needed
- Search parameters can be passed between pages

### 2. **Loading States**
```jsx
{loading ? (
  <div>Loading...</div>
) : (
  <HotelCard hotel={hotel} />
)}
```

### 3. **Error Handling**
```jsx
{error ? (
  <div>
    <p>{error}</p>
    <button onClick={retry}>Retry</button>
  </div>
) : null}
```

### 4. **Room Type Display**
- Multiple rate plans per room
- Breakfast/meal plan options
- Dynamic pricing
- Availability status

## 📁 File Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── api.js                    # API integration
│   ├── components/
│   │   ├── pages/
│   │   │   ├── ListingPage.jsx      # Hotel listing
│   │   │   └── HotelDetailsPage.jsx # Hotel details
│   │   ├── HotelCard.jsx            # Hotel card component
│   │   ├── RoomCard.jsx             # Original room card
│   │   └── RoomCardEnhanced.jsx     # Enhanced with rate plans
│   └── examples/
│       └── apiExample.js            # Usage examples
└── API_USAGE_GUIDE.md              # Detailed API guide
```

## 🎨 UI Features

### Listing Page
- ✅ Hotel cards with images
- ✅ Star ratings
- ✅ Location information
- ✅ Price display
- ✅ Amenities badges
- ✅ Click to view details

### Details Page
- ✅ Hotel name and address
- ✅ Image gallery
- ✅ Amenities with icons
- ✅ Room types with images
- ✅ Multiple rate plans per room
- ✅ Cancellation policies
- ✅ Check-in/out times
- ✅ Booking summary sidebar

## 🔄 Data Flow

```
1. User lands on Listing Page
   ↓
2. useEffect triggers API call
   ↓
3. getAvailableHotels() fetches from API
   ↓
4. transformHotelData() converts API response
   ↓
5. setHotels() updates state
   ↓
6. HotelCards render with data
   ↓
7. User clicks hotel
   ↓
8. Navigate to /hotel/:id
   ↓
9. HotelDetailsPage fetches specific hotel
   ↓
10. Displays rooms with rate plans
```

## 🛠 Customization Options

### Modify Search Parameters

```javascript
// In ListingPage.jsx or HotelDetailsPage.jsx
const searchParams = {
  checkInDate: '2026-01-20',  // Change date
  numNights: 2,                // Change nights
  numGuests: 4                 // Change guests
};
```

### Add More Rate Plan Types

```javascript
// The API automatically provides all rate plans
// Just ensure your UI can handle them:
room.ratePlans.map(plan => (
  <option key={plan.RatePlanId}>
    {plan.RateName} - {plan.PricePerNight}
  </option>
))
```

## ⚠️ Important Notes

### CORS Issues
If you encounter CORS errors, you may need to add a proxy in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://onlinebooking.cogwave.in',
        changeOrigin: true,
      }
    }
  }
})
```

### API Parameters
The API accepts these query parameters:
- `checkInDate` - Format: YYYY-MM-DD
- `numNights` - Number (integer)
- `numGuests` - Number (integer)

### Image Loading
- All image URLs from the API are ready to use
- No additional processing needed
- Already HTTPS URLs

## 📱 Testing Checklist

- [ ] Navigate to `/search` page
- [ ] Verify hotels load
- [ ] Check images display correctly
- [ ] Click on a hotel card
- [ ] Verify hotel details page loads
- [ ] Check room types display
- [ ] Verify rate plans show correctly
- [ ] Test rate plan switching
- [ ] Check amenities icons
- [ ] Verify pricing displays

## 🐛 Troubleshooting

### Hotels Not Loading
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check network tab in DevTools
4. Ensure no ad-blockers interfering

### Images Not Showing
1. Check image URLs in console
2. Verify image URLs are accessible
3. Check for CORS issues
4. Ensure images array exists in response

### Prices Showing as 0
1. Verify RatePlans exist in API response
2. Check PricePerNight field
3. Ensure default rate plan is selected

## 📝 Next Steps (Optional)

1. **Add Search Functionality**
   - Date picker for check-in/out
   - Guest counter
   - Location search

2. **Implement Booking**
   - Room selection
   - Guest details form
   - Payment integration

3. **Add Filters**
   - Price range
   - Star rating
   - Amenities filter

4. **User Features**
   - Favorites/Wishlist
   - Booking history
   - User authentication

## 💡 Quick Start Example

```javascript
// Quick test in browser console
import { getHotelData } from './services/api';

const params = {
  checkInDate: '2026-01-20',
  numNights: 1,
  numGuests: 2
};

getHotelData(params).then(data => {
  console.log('Hotel:', data.Hotel.Name);
  console.log('Rooms:', data.RoomTypes.length);
});
```

## 📚 Additional Resources

- **API Guide**: See `API_USAGE_GUIDE.md`
- **Example Code**: See `src/examples/apiExample.js`
- **Enhanced Room Card**: See `src/components/RoomCardEnhanced.jsx`

## ✨ Summary

Your hotel booking system is now fully integrated with the API! The application:

1. ✅ Fetches hotels from the live API
2. ✅ Displays hotel listings with images
3. ✅ Shows detailed hotel information
4. ✅ Displays all room types and rate plans
5. ✅ Handles loading and error states
6. ✅ Navigates between pages smoothly

Just run `npm run dev` and navigate to `/search` to see it in action!
