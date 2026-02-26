# Checkout Page & Razorpay Integration Guide

## Overview
The checkout page has been created with full support for guest information collection and Razorpay payment integration. It matches the design in the reference image.

## What's Been Created

### 1. CheckoutPage Component (`src/components/pages/CheckoutPage.jsx`)
A complete checkout experience with:

#### Left Section (Guest Info & Payment)
- **Guest Information Form**
  - First Name
  - Last Name
  - Email
  - Phone Number with country code selector
  - "Add New Guest" button for multiple guests

- **Payment Methods**
  - UPI with QR code display
  - Credit Card
  - Debit Card
  - Net Banking
  - Razorpay Direct Button
  - All expandable/collapsible sections

- **Special Requests**
  - Optional textarea for guest special requests

- **Save & Proceed Button**
  - Validates form before proceeding
  - Triggers Razorpay payment flow

#### Right Section (Order Summary)
- Hotel image, name, and location
- Check-in and Check-out dates
- Rooms and guests information
- Selected room details
- Price breakdown:
  - Room charges (price × nights × quantity)
  - Service fee
  - Taxes
- Total price
- Modify button to go back and change selection

## How to Use

### 1. Navigate to Checkout
Click "Proceed to Pay" button in the booking summary on the hotel details page.

### 2. Fill Guest Information
Complete all required fields:
- First and last name (must match ID)
- Email address
- Phone number with country code

### 3. Select Payment Method
Choose from available payment methods. The page supports:
- **UPI**: For Indian customers with UPI apps (Google Pay, PhonePe, etc.)
- **Cards**: Credit and Debit cards (Visa, Mastercard)
- **Net Banking**: All major Indian banks
- **Razorpay**: Direct integration with multiple payment options

### 4. Add Special Requests (Optional)
Include any special requests for the hotel (room preferences, accessibility needs, etc.)

### 5. Proceed to Payment
Click "Save & Proceed" to:
- Validate all required information
- Open Razorpay payment modal
- Complete payment

## Razorpay Integration Setup

### Quick Start
1. **Create .env file** in `frontend/` directory:
```env
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxxxx
```

2. **Get your test key** from [Razorpay Dashboard](https://dashboard.razorpay.com)

3. **Test with provided test credentials** (see Testing section below)

### How It Works
1. User fills form and clicks "Save & Proceed"
2. Razorpay script loads dynamically
3. Payment modal opens with user's prefilled information
4. User selects payment method and completes payment
5. Payment verification happens on backend
6. Booking is confirmed

### Environment Configuration

#### Frontend (.env file)
```env
# Required - Your Razorpay Public Key (starts with rzp_)
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxxxx

# Optional - API endpoints
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENV=development
```

#### Backend (.env file - for payment verification)
```env
# Your Razorpay Secret Key (keep this secure!)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx

# Database and other config
DATABASE_URL=...
PORT=5000
```

## Testing

### Sandbox Credentials
Razorpay provides test environment for free. Use these test card details:

**Test UPI:**
- Use any UPI app with test mode enabled
- Razorpay automatically succeeds test transactions

**Test Credit Card:**
```
Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
OTP: 123456 (when prompted)
```

**Test Debit Card:**
```
Number: 5105 1051 0510 5100
Expiry: Any future date
CVV: Any 3 digits
```

**Test Netbanking:**
- Select any bank from the list
- No additional credentials needed
- Automatically completes in test mode

### Testing Steps
1. Navigate to checkout page
2. Fill in test guest information
3. Click "Pay with Razorpay"
4. In modal, select test payment method
5. Use test credentials above
6. Payment should complete successfully
7. Check console for payment details

## Component Architecture

### State Management
The CheckoutPage maintains:
- `guestInfo`: Guest name, email, phone
- `specialRequests`: Optional special requests
- `paymentMethod`: Currently selected payment method
- `expandedPayment`: Which payment method section is open

### Props Flow
```
HotelDetailsPage
  ↓
BookingSummary (with "Proceed to Pay" button)
  ↓
CheckoutPage (receives data via sessionStorage/context)
  ↓
Razorpay Integration
```

### Data Passed to Razorpay
```javascript
{
  key: 'YOUR_RAZORPAY_KEY',
  amount: totalPrice * 100,  // in paise
  currency: 'INR',
  name: 'Hotel Arts Barcelona',
  description: '1 room(s) for 5 nights',
  prefill: {
    name: 'Guest Name',
    email: 'guest@email.com',
    contact: 'phone_number'
  }
}
```

## Backend Integration (Next Steps)

You'll need to implement these endpoints:

### 1. Create Order Endpoint
```
POST /api/payments/create-order
Body: { amount, currency, receipt }
Returns: { id, amount, status }
```

### 2. Verify Payment Endpoint
```
POST /api/payments/verify
Body: { orderId, paymentId, signature }
Returns: { verified: boolean }
```

### 3. Create Booking Endpoint
```
POST /api/bookings
Body: { guestInfo, selectedRooms, paymentId, checkInDate, checkOutDate }
Returns: { bookingId, confirmationNumber }
```

See RAZORPAY_SETUP.md for detailed backend implementation examples.

## Customization

### Colors
- Primary (Buttons): `cogwave-blue` (#2F2279)
- Borders: `gray-200`, `gray-300`
- Text: `gray-900`, `gray-600`

Change these in the component's Tailwind classes.

### Adding More Payment Methods
To add more payment options, add new sections in the payment area:
```jsx
<div className="border border-gray-200 rounded-lg overflow-hidden">
  <button onClick={() => setExpandedPayment('method-name')}>
    Method Name
  </button>
  {expandedPayment === 'method-name' && (
    <div className="p-4 border-t border-gray-200">
      {/* Payment form */}
    </div>
  )}
</div>
```

### Modifying Guest Fields
Update the `guestInfo` state structure and add corresponding input fields as needed.

## Common Issues & Solutions

### Issue: "Razorpay is not defined"
**Solution:** Ensure the script tag is loaded. The component loads it dynamically, so check:
1. Network tab in DevTools
2. `window.Razorpay` should exist after modal opens
3. Check for script load errors

### Issue: Payment modal doesn't open
**Solution:** Verify:
1. `VITE_RAZORPAY_KEY` is set in .env
2. Form validation passed (all fields filled)
3. Browser console for errors
4. Check that amount > 0

### Issue: "Amount must be in paise"
**Solution:** Already handled in code (`Math.round(totalPrice * 100)`), but if customizing, remember:
- 1 INR = 100 Paise
- Always multiply by 100 before sending to Razorpay

## Security Notes

### Frontend
- ✅ Razorpay Key ID is safe to expose (it's public)
- ❌ Never put Secret Key in frontend code
- ✅ Validate all form data client-side
- ✅ Validate again server-side

### Backend
- ❌ Never log or expose RAZORPAY_KEY_SECRET
- ✅ Always verify payment signature on backend
- ✅ Create booking only after verification
- ✅ Use HTTPS in production

## Production Checklist

- [ ] Get live Razorpay keys (from dashboard)
- [ ] Update `.env` with live key
- [ ] Implement backend verification endpoints
- [ ] Test with real payments
- [ ] Set up error handling
- [ ] Configure email confirmations
- [ ] Set up booking confirmation page
- [ ] Enable HTTPS
- [ ] Add payment retry logic
- [ ] Set up customer support system

## Links & Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Payment Gateway Integration](https://razorpay.com/docs/payments/dashboard/generate-api-key/)
- [Razorpay JavaScript SDK](https://razorpay.com/docs/payments/payments-js/)
- [Test Card Numbers](https://razorpay.com/docs/payments/payments-with-razorpay/test-cards/)

## File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── CheckoutPage.jsx (NEW)
│   │   │   └── HotelDetailsPage.jsx
│   │   └── BookingSummary.jsx (UPDATED)
│   └── App.jsx (UPDATED - added route)
├── .env (CREATE THIS)
├── .env.example (NEW)
└── RAZORPAY_SETUP.md (NEW)
```

## Next Steps

1. **Set up .env file** with your Razorpay test key
2. **Test the checkout flow** end-to-end
3. **Implement backend endpoints** for payment verification
4. **Create booking confirmation page**
5. **Add email notifications**
6. **Go live with production keys**

---

**Questions?** Check RAZORPAY_SETUP.md for detailed backend setup instructions.
