# Hotel360 API Integration Guide

## Overview
This guide explains how to use the hotel booking APIs in your application.

## API Endpoints

### 1. Get Hotel ID
```
GET https://onlinebooking.cogwave.in/api/bookingengine/gethotelid
```

### 2. Get Hotel Data (Main Endpoint)
```
GET https://onlinebooking.cogwave.in/api/bookingengine/gethoteldata
```

**Query Parameters:**
- `checkInDate` - Check-in date (format: YYYY-MM-DD)
- `numNights` - Number of nights
- `numGuests` - Number of guests

**Example:**
```
https://onlinebooking.cogwave.in/api/bookingengine/gethoteldata?checkInDate=2026-01-20&numNights=1&numGuests=2
```

### 3. Image Upload/Fetch
```
GET https://onlinebooking.cogwave.in/api/image/uploaddata
```

## Implementation in Code

### Using the API Service

The project includes a pre-configured API service at `src/services/api.js`. Here's how to use it:

#### 1. Import the service
```javascript
import { getHotelData, getAvailableHotels, getHotelDetails } from '../services/api';
```

#### 2. Fetch Hotel List (for Listing Page)
```javascript
const searchParams = {
  checkInDate: '2026-01-20',
  numNights: 1,
  numGuests: 2
};

const hotels = await getAvailableHotels(searchParams);
```

#### 3. Fetch Single Hotel Details
```javascript
const hotelId = 25739;
const hotelDetails = await getHotelDetails(hotelId, searchParams);
```

## Response Structure

The API returns a comprehensive object with the following structure:

### Hotel Information
```json
{
  "Hotel": {
    "HotelId": 25739,
    "Name": "Sample Hotel Name",
    "HotelDetail": "Hotel description...",
    "HotelAddress": "Full address",
    "HotelLocation": "Map URL",
    "HotelContact": {
      "MobileNo": "+917066669066",
      "EmailId": "support@mmrhotels.com"
    },
    "Images": ["url1", "url2", ...],
    "Amenities": ["WiFi", "Breakfast", ...],
    "Policies": {
      "Cancellation": "Flexible",
      "CheckinTime": "12:00",
      "CheckoutTime": "12:00"
    }
  }
}
```

### Room Types
```json
{
  "RoomTypes": [
    {
      "RoomTypeId": "RT1",
      "RoomTypeName": "Business Premium",
      "RoomTypeDescription": "Description...",
      "RoomImages": ["url1", "url2"],
      "MaxOccupancy": {
        "Adults": 2,
        "Children": 1,
        "Infants": 1
      },
      "Amenities": ["TV", "Mini Bar", "Safe"],
      "Availability": {
        "Available": false,
        "RoomsLeft": 3
      },
      "RatePlans": [
        {
          "RatePlanId": "RP1",
          "RateName": "Standard Plan",
          "RateShortName": "Room Only",
          "CancellationPolicy": "Policy text...",
          "PricePerNight": 4500,
          "AvailableRoom": 2,
          "RequiredRoom": 1,
          "Currency": "INR",
          "IsDefaultSelect": true
        }
      ]
    }
  ]
}
```

## How It Works in the Application

### 1. Listing Page (`ListingPage.jsx`)
- Fetches available hotels on component mount
- Displays loading state while fetching
- Shows error message if fetch fails
- Renders hotel cards for each hotel

### 2. Hotel Details Page (`HotelDetailsPage.jsx`)
- Fetches detailed hotel information based on hotel ID from URL
- Transforms room types and rate plans for display
- Shows hotel amenities, policies, and room availability
- Allows room selection and booking

### 3. Navigation Flow
```
Home Page → Search → Listing Page → Click Hotel → Details Page
```

## Testing the Integration

1. **Start the development server:**
```bash
cd frontend
npm run dev
```

2. **Navigate to the listing page:**
```
http://localhost:5173/search
```

3. **The page will automatically:**
   - Fetch hotel data from the API
   - Display available hotels
   - Allow clicking to view details

## Error Handling

The application includes comprehensive error handling:

- **Network errors**: Shows retry button
- **Empty results**: Displays "No hotels found" message
- **Loading states**: Shows spinner during data fetch

## Data Transformation

The `transformHotelData()` function in `api.js` converts API response to match the application's data structure:

```javascript
{
  id: Hotel.HotelId,
  name: Hotel.Name,
  description: Hotel.HotelDetail,
  address: Hotel.HotelAddress,
  images: Hotel.Images,
  amenities: Hotel.Amenities,
  policies: Hotel.Policies,
  roomTypes: RoomTypes,
  // ... additional fields
}
```

## Important Notes

1. **CORS**: If you encounter CORS errors, you may need to configure a proxy in `vite.config.js`
2. **Authentication**: Check if the API requires any authentication headers
3. **Rate Limiting**: Be aware of any API rate limits
4. **Image URLs**: All images from the API are already full URLs and can be used directly

## Troubleshooting

### Issue: Hotels not loading
- Check browser console for errors
- Verify API endpoint is accessible
- Check network tab for failed requests

### Issue: Images not displaying
- Verify image URLs in API response
- Check if URLs are accessible
- Ensure no CORS issues with image domains

### Issue: Room prices showing as 0
- Verify RatePlans exist in API response
- Check IsDefaultSelect flag on rate plans
- Ensure PricePerNight is populated

## Next Steps

- Add search filters to refine results
- Implement date/guest selection
- Add booking functionality
- Implement user authentication
- Add payment integration
