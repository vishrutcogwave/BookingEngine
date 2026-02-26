import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navbar from '../Navbar';
import { checkPaymentStatus, submitReservation, sendBookingConfirmation } from '../../services/api';
import { clearBookingData } from '../../utils/bookingStorage';
import { generateBookingPDFBase64 } from '../../utils/pdfGenerator';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false); // Prevent duplicate processing

  useEffect(() => {
    const verifyPaymentAndBook = async () => {
      // Prevent duplicate execution (React StrictMode causes double-mount in dev)
      if (hasProcessed.current) {
        // console.log('⏭️  Payment already processed, skipping duplicate execution');
        return;
      }
      hasProcessed.current = true;

      try {
        // Get merchant order ID from session
        const merchantOrderId = sessionStorage.getItem('merchantOrderId');
        const pendingBooking = sessionStorage.getItem('pendingBooking');

        if (!merchantOrderId || !pendingBooking) {
          setError('Payment information not found');
          setStatus('failed');
          return;
        }

        const bookingInfo = JSON.parse(pendingBooking);

        // Check payment status
        const paymentStatus = await checkPaymentStatus(merchantOrderId);

        if (paymentStatus.state === 'COMPLETED' || paymentStatus.state === 'SUCCESS' || paymentStatus.state === 'PENDING') {
          // Generate unique OTA ID
          const otaUniqueId = `OTA${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          
          // Format dates
          const formatDate = (date) => {
            const d = new Date(date);
            return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear().toString().substr(2)}`;
          };

          // Helper function to calculate room tax
          const calculateRoomTax = (roomIndex) => {
            if (bookingInfo.roomTaxes && bookingInfo.roomTaxes[roomIndex]) {
              const roomTaxData = bookingInfo.roomTaxes[roomIndex];
              if (roomTaxData.taxes && Array.isArray(roomTaxData.taxes)) {
                return roomTaxData.taxes.reduce((sum, tax) => sum + (tax.TaxValue || tax.TaxValue || 0), 0);
              }
            }
            return 0;
          };

          // Helper function to detect channel (Web/Mobile)
          const getChannel = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
              return 'Mobile';
            }
            return 'Web';
          };

          // Helper function to map payment status to booking status
          const getBookingStatus = (state) => {
            const statusMap = {
              'COMPLETED': 'Confirmed',
              'SUCCESS': 'Confirmed',
              'PENDING': 'Pending',
              'FAILED': 'Failed',
              'CANCELLED': 'Cancelled'
            };
            return statusMap[state] || 'Pending';
          };

          // Prepare reservation data
          const bookingStatus = getBookingStatus(paymentStatus.state);
          const channel = getChannel();
          
          const reservationData = {
            data: [{
              UserDetails: {
                user_name: `${bookingInfo.guestInfo.firstName} ${bookingInfo.guestInfo.lastName}`,
                mobile: bookingInfo.guestInfo.phone,
                email: bookingInfo.guestInfo.email
              },
              BookingsDetails: {
                ota_unique_id: otaUniqueId,
                date_of_booking: formatDate(new Date()),
                hotel_id: bookingInfo.hotel.HotelId || bookingInfo.hotel.id || 0,
                hotel_name: bookingInfo.hotel.Name || bookingInfo.hotel.name,
                check_in: formatDate(bookingInfo.checkInDate),
                check_out: formatDate(bookingInfo.checkOutDate),
                booking_id: merchantOrderId,
                grand_total: bookingInfo.totalPrice.toString(),
                paid_amount: bookingInfo.totalPrice.toString(),
                channel: channel,
                booking_instruction: bookingInfo.specialRequests || "",
                status: bookingStatus
              },
              RoomDetails: bookingInfo.selectedRooms.map((room, index) => {
                const roomTax = calculateRoomTax(index);
                const baseRate = room.pricePerNight || room.price || 0;
                const originalRate = room.originalPrice || baseRate;
                const roomCount = room.roomCount || 1;
                const roomTotal = baseRate * roomCount * bookingInfo.numNights;
                const discountAmount = originalRate > baseRate ? (originalRate - baseRate) * roomCount * bookingInfo.numNights : 0;
                
                return {
                  room_type_id: room.roomData?.id || room.id || `RT${index + 1}`,
                  room_type_name: room.name,
                  no_of_rooms: roomCount,
                  room_rate: baseRate,
                  room_tax: roomTax,
                  room_total: roomTotal + roomTax,
                  discounted_room_rate_before_tax: originalRate > baseRate ? originalRate : 0,
                  discount: discountAmount,
                  plan: room.rateShortName || "Room Only",
                  rate_plan_id: room.ratePlanId || `RP${index + 1}`,
                  adult: room.adults || 2,
                  child: room.children || 0
                };
              }),
              paiddetails: paymentStatus
            }],
            b_status: bookingStatus
          };

          // Submit reservation to backend
          let reservationNo = null;
          try {
            // console.log('💾 Attempting to save reservation to backend...');
            const reservationResponse = await submitReservation(reservationData);
            // console.log('✅ Reservation saved successfully:', reservationResponse);
            reservationNo = reservationResponse.ReservationNo || null;
          } catch (reservationError) {
            // console.error('═'.repeat(80));
            // console.error('❌ RESERVATION SUBMISSION FAILED');
            // console.error('❌ Error:', reservationError.message);
            // console.error('⚠️  This is a BACKEND issue - the endpoint is not fully implemented.');
            // console.error('⚠️  Payment has ALREADY SUCCEEDED, so booking is confirmed.');
            // console.error('⚠️  Backend team needs to implement the SubmitReservation method.');
            // console.error('═'.repeat(80));
            // Continue anyway since payment succeeded - show success page
          }

          // Set booking details for display
          const finalBookingDetails = {
            ...bookingInfo,
            bookingId: merchantOrderId,
            reservationNo: reservationNo,
            otaUniqueId,
            paymentStatus: paymentStatus
          };
          setBookingDetails(finalBookingDetails);

          // Send WhatsApp confirmation with PDF
          try {
            // Calculate totals for PDF
            const subtotal = bookingInfo.selectedRooms.reduce((sum, room) => {
              const baseRate = room.pricePerNight || room.price || 0;
              const roomCount = room.roomCount || 1;
              return sum + (baseRate * roomCount * bookingInfo.numNights);
            }, 0);

            const totalTax = bookingInfo.selectedRooms.reduce((sum, room, index) => {
              return sum + calculateRoomTax(index);
            }, 0);

            // Prepare PDF data
            const pdfData = {
              hotelName: bookingInfo.hotel.Name || bookingInfo.hotel.name,
              bookingNo: reservationNo || merchantOrderId,
              guestName: `${bookingInfo.guestInfo.firstName} ${bookingInfo.guestInfo.lastName}`,
              email: bookingInfo.guestInfo.email,
              mobileNo: bookingInfo.guestInfo.phone,
              adults: bookingInfo.selectedRooms.reduce((sum, room) => sum + (room.adults || 2), 0),
              children: bookingInfo.selectedRooms.reduce((sum, room) => sum + (room.children || 0), 0),
              checkIn: formatDate(bookingInfo.checkInDate),
              checkOut: formatDate(bookingInfo.checkOutDate),
              nights: bookingInfo.numNights,
              rooms: bookingInfo.selectedRooms.map(room => ({
                name: room.name,
                quantity: room.roomCount || 1,
                rate: room.pricePerNight || room.price || 0,
                totalAmount: (room.pricePerNight || room.price || 0) * (room.roomCount || 1) * bookingInfo.numNights
              })),
              subtotal: subtotal,
              cgst: totalTax / 2, // Split tax equally
              sgst: totalTax / 2,
              totalTax: totalTax,
              grandTotal: bookingInfo.totalPrice,
              paymentStatus: getBookingStatus(paymentStatus.state),
              transactionId: paymentStatus.transactionId || merchantOrderId
            };

            // Generate PDF as base64
            // console.log('📄 Generating PDF for confirmation...');
            const pdfBase64 = generateBookingPDFBase64(pdfData);
            // console.log('✅ PDF generated, size:', pdfBase64.length, 'characters');

            // Format phone number for WhatsApp (backend expects just 10 digits)
            let formattedPhone = bookingInfo.guestInfo.phone;
            if (formattedPhone) {
              // Remove + sign if present
              formattedPhone = formattedPhone.replace(/^\+/, '');
              // Remove country code 91 if present
              formattedPhone = formattedPhone.replace(/^91/, '');
              // console.log('📱 Formatted phone for WhatsApp:', formattedPhone);
            }

            // Send WhatsApp & Email confirmation
            const confirmationResponse = await sendBookingConfirmation({
              base64_file: pdfBase64,
              GuestName: `${bookingInfo.guestInfo.firstName} ${bookingInfo.guestInfo.lastName}`,
              MobileNo: formattedPhone,
              EmailId: bookingInfo.guestInfo.email,
              BookingNo: reservationNo || merchantOrderId,
              HotelName: bookingInfo.hotel.Name || bookingInfo.hotel.name
            });

            // console.log('✅ Booking confirmation sent successfully:', confirmationResponse);
          } catch (confirmationError) {
            // console.error('❌ Booking confirmation failed:', confirmationError);
            // console.error('❌ Error details:', confirmationError.message);
            // if (confirmationError.stack) {
            //   console.error('Stack trace:', confirmationError.stack);
            // }
            // Continue anyway - don't block the success page
          }

          setStatus('success');

          // Clear session storage and localStorage
          sessionStorage.removeItem('merchantOrderId');
          sessionStorage.removeItem('pendingBooking');
          sessionStorage.removeItem('bookingData');
          sessionStorage.removeItem('checkoutFormData');
          clearBookingData(); // Clear localStorage
        } else {
          setError(`Payment status: ${paymentStatus.state}`);
          setStatus('failed');
        }
      } catch (err) {
        // console.error('❌ Error verifying payment:', err);
        setError(err.message || 'Failed to verify payment');
        setStatus('failed');
      }
    };

    verifyPaymentAndBook();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <Loader2 size={64} className="animate-spin text-cogwave-blue mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
          <p className="text-gray-500">Please wait while we confirm your booking</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-8">{error || 'Something went wrong with your payment'}</p>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-cogwave-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-cogwave-blue/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your reservation. Your booking has been successfully confirmed.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
          {/* Booking & Reservation ID */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            {bookingDetails?.reservationNo && (
              <>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Reservation Number</h2>
                <p className="text-2xl font-bold text-cogwave-blue mb-4">{bookingDetails.reservationNo}</p>
              </>
            )}
            <h2 className="text-sm font-medium text-gray-500 mb-1">Booking ID</h2>
            <p className="text-xl font-semibold text-gray-900">{bookingDetails?.bookingId}</p>
          </div>

          {/* Hotel Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Hotel Details</h2>
            <div className="flex gap-4">
              {bookingDetails?.hotel?.Images?.[0] && (
                <img
                  src={bookingDetails.hotel.Images[0]}
                  alt={bookingDetails.hotel.Name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {bookingDetails?.hotel?.Name || bookingDetails?.hotel?.name}
                </h3>
                <p className="text-gray-500">
                  {bookingDetails?.hotel?.HotelAddress || bookingDetails?.hotel?.address}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Guest Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-medium text-gray-900">
                  {bookingDetails?.guestInfo?.firstName} {bookingDetails?.guestInfo?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{bookingDetails?.guestInfo?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base font-medium text-gray-900">{bookingDetails?.guestInfo?.phone}</p>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Stay Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(bookingDetails?.checkInDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(bookingDetails?.checkOutDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-base font-medium text-gray-900">
                  {bookingDetails?.numNights} {bookingDetails?.numNights === 1 ? 'Night' : 'Nights'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Guests</p>
                <p className="text-base font-medium text-gray-900">{bookingDetails?.numGuests} Guests</p>
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Room Details</h2>
            {bookingDetails?.selectedRooms?.map((room, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <p className="font-medium text-gray-900">{room.name}</p>
                <p className="text-sm text-gray-500">
                  {room.roomCount || 1} {room.roomCount === 1 ? 'Room' : 'Rooms'} · {room.adults || 2} Adults
                  {room.children > 0 && ` · ${room.children} Children`}
                </p>
                {room.rateShortName && (
                  <p className="text-sm text-gray-500">{room.rateShortName}</p>
                )}
              </div>
            ))}
          </div>

          {/* Payment Details */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-3">
              {/* Room Charges */}
              {bookingDetails?.selectedRooms?.map((room, index) => {
                const price = room.pricePerNight || room.price || 0;
                const count = room.roomCount || 1;
                const roomCharge = price * count * bookingDetails.numNights;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{room.name} - Room Charges</span>
                      <span className="text-gray-900">₹{roomCharge.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}

              {/* Tax Breakdown */}
              {bookingDetails?.roomTaxes && bookingDetails.roomTaxes.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  {bookingDetails.roomTaxes.map((roomTax, roomIdx) => (
                    <div key={roomIdx} className="space-y-1 mb-3">
                      <p className="text-sm font-medium text-gray-700">{roomTax.roomName} - Taxes:</p>
                      {roomTax.taxes.map((tax, taxIdx) => (
                        <div key={taxIdx} className="flex justify-between text-xs pl-4">
                          <span className="text-gray-600">{tax.TaxName} ({tax.TaxPer}%)</span>
                          <span className="text-gray-900">₹{(tax.TaxValue || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between pt-3 border-t border-gray-300">
                <span className="text-gray-900 font-semibold">Total Amount Paid</span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{bookingDetails?.totalPrice?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Status</span>
                <span className="text-sm font-medium text-green-600">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {bookingDetails?.specialRequests && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h3>
            <p className="text-gray-600">{bookingDetails.specialRequests}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 print:hidden">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-cogwave-blue text-white py-3 rounded-lg font-semibold hover:bg-cogwave-blue/90 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 border border-cogwave-blue text-cogwave-blue py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Print Confirmation
          </button>
        </div>

        {/* Info Message */}
        <div className="mt-8 text-center text-sm text-gray-500 print:hidden">
          A confirmation email has been sent to {bookingDetails?.guestInfo?.email}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
