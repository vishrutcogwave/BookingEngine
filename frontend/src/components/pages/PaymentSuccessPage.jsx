import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navbar from '../Navbar';
import { submitReservation, sendBookingConfirmation } from '../../services/api';
import { clearBookingData } from '../../utils/bookingStorage';
import { generateBookingPDFBase64 } from '../../utils/pdfGenerator';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  useEffect(() => {
    const verifyPaymentAndBook = async () => {

      const urlParams = new URLSearchParams(window.location.search);
      const reason = urlParams.get('reason');

      // ✅ HANDLE ABORTED / CANCEL
      if (reason === 'aborted') {
        setError('Payment was cancelled by user');
        setStatus('failed');
        return;
      }

      if (hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        let merchantOrderId = sessionStorage.getItem('merchantOrderId');

        if (!merchantOrderId) {
          merchantOrderId = urlParams.get('orderId');
          if (merchantOrderId) {
            sessionStorage.setItem('merchantOrderId', merchantOrderId);
          }
        }

        const pendingBooking = sessionStorage.getItem('pendingBooking');

        if (!merchantOrderId || !pendingBooking) {
          setError('Payment information not found');
          setStatus('failed');
          return;
        }

        const bookingInfo = JSON.parse(pendingBooking);

        const paymentStatus = {
          state: 'SUCCESS',
          transactionId: merchantOrderId
        };

        const otaUniqueId = `OTA${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        const formatDateInner = (date) => {
          const d = new Date(date);
          return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
            .getDate()
            .toString()
            .padStart(2, '0')}/${d.getFullYear().toString().substr(2)}`;
        };

        const calculateRoomTax = (roomIndex) => {
          if (bookingInfo.roomTaxes && bookingInfo.roomTaxes[roomIndex]) {
            const roomTaxData = bookingInfo.roomTaxes[roomIndex];
            if (roomTaxData.taxes && Array.isArray(roomTaxData.taxes)) {
              return roomTaxData.taxes.reduce((sum, tax) => sum + (tax.TaxValue || 0), 0);
            }
          }
          return 0;
        };

        const getChannel = () => {
      
          return 'Web';
        };

        const bookingStatus = 'Confirmed';
        debugger
        const channel = getChannel();
console.log(bookingInfo);

        // const reservationData = {
        //   data: [{
        //     UserDetails: {
        //       user_name: `${bookingInfo.guestInfo.firstName} ${bookingInfo.guestInfo.lastName}`,
        //       mobile: bookingInfo.guestInfo.phone,
        //       email: bookingInfo.guestInfo.email,
        //     },
        //     BookingsDetails: {
        //       ota_unique_id: otaUniqueId,
        //       date_of_booking: formatDateInner(new Date()),
        //       hotel_id: bookingInfo.hotel.HotelId || bookingInfo.hotel.id || 0,
        //       hotel_name: bookingInfo.hotel.Name || bookingInfo.hotel.name,
        //       check_in: formatDateInner(bookingInfo.checkInDate),
        //       check_out: formatDateInner(bookingInfo.checkOutDate),
        //       booking_id: merchantOrderId,
        //       grand_total: bookingInfo.totalPrice.toString(),
        //       paid_amount: bookingInfo.totalPrice.toString(),
        //       channel: channel,
        //       booking_instruction: bookingInfo.specialRequests || '',
        //       status: bookingStatus,
        //     },
        //     RoomDetails: bookingInfo.selectedRooms.map((room, index) => {
        //       const roomTax = calculateRoomTax(index);
        //       const baseRate = room.pricePerNight || room.price || 0;
        //       const roomCount = room.roomCount || 1;
        //       const roomTotal = baseRate * roomCount * bookingInfo.numNights;

        //       return {
        //         room_type_id: room.roomData?.id || room.id || `RT${index + 1}`,
        //         room_type_name: room.name,
        //         no_of_rooms: roomCount,
        //         room_rate: baseRate,
        //         room_tax: roomTax,
        //         room_total: roomTotal + roomTax,
        //         plan: room.rateShortName || 'Room Only',
        //         adult: room.adults || 2,
        //         child: room.children || 0,
        //       };
        //     }),
        //     paiddetails: paymentStatus,
        //   }],
        //   b_status: bookingStatus,
        // };


        const reservationData = {
  data: [
    {
      UserDetails: {
        user_name: `${bookingInfo.guestInfo.firstName} ${bookingInfo.guestInfo.lastName}`,
        mobile: bookingInfo.guestInfo.phone,
        email: bookingInfo.guestInfo.email,
      },

      BookingsDetails: {
        ota_unique_id: otaUniqueId,
        date_of_booking: formatDateInner(new Date()),
        hotel_id: bookingInfo.hotel.HotelId || bookingInfo.hotel.id || 0,
        hotel_name: bookingInfo.hotel.Name || bookingInfo.hotel.name,
        check_in: formatDateInner(bookingInfo.checkInDate),
        check_out: formatDateInner(bookingInfo.checkOutDate),
        booking_id: merchantOrderId,
        grand_total: bookingInfo.totalPrice.toString(),
        paid_amount: bookingInfo.totalPrice.toString(),
        channel,
        booking_instruction: bookingInfo.specialRequests || "",
        status: bookingStatus,
      },

      RoomDetails: bookingInfo.selectedRooms.map((room, index) => {
        const roomTax = calculateRoomTax(index);

        const roomCount = room.roomCount || 1;
        const roomRate = (room.pricePerNight || room.price || 0) * roomCount * bookingInfo.numNights;
        const roomTotal = roomRate + roomTax;

        return {
          room_type_id: room.roomData?.id || room.id,
          room_type_name: room.name.replace(/\r?\n/g, " "),
          no_of_rooms: roomCount,

          totroom_rate: roomRate,
          totroom_tax: roomTax,
          totroom_total: roomTotal,

          discounted_room_rate_before_tax: roomRate,
          discount: 0,

          plan: room.rateShortName || "Room Only",
          rate_plan_id: room.ratePlanId || "",

          adult: room.adults || 0,
          child: room.children || 0,

          Price: [
            {
              staydate: bookingInfo.checkInDate,
              room_rate: roomRate,
              room_tax: roomTax,
              room_total: roomTotal,
            },
          ],
        };
      }),

      paiddetails: {
        orderId: merchantOrderId,
        state: paymentStatus?.state || bookingStatus,
        amount: bookingInfo.totalPrice,
        expireAt: paymentStatus?.expireAt || 0,

        metaInfo: {
          udf1: "",
          udf2: "",
          udf3: "",
          udf4: "",
          udf5: "",
        },

        paymentDetails: [
          {
            paymentMode: paymentStatus?.paymentMode || "ONLINE",
            transactionId:
              paymentStatus?.transactionId ||
              paymentStatus?.orderId ||
              merchantOrderId,
            timestamp: paymentStatus?.timestamp || Date.now(),
            amount: bookingInfo.totalPrice,
            state: paymentStatus?.state || bookingStatus,
          },
        ],
      },

   othercharges: bookingInfo.othercharges || [],
    },
  ],

  b_status: bookingStatus,
};
        let reservationNo = null;
        try {
          const reservationResponse = await submitReservation(reservationData);
          reservationNo = reservationResponse.ReservationNo || null;
        } catch {}

        setBookingDetails({
          ...bookingInfo,
          bookingId: merchantOrderId,
          reservationNo,
          otaUniqueId,
          paymentStatus,
        });

        try {
    const totalTax = bookingInfo.roomTaxes.reduce(
  (sum, room) =>
    sum +
    room.taxes.reduce(
      (taxSum, tax) => taxSum + Number(tax.TaxValue || 0),
      0
    ),
  0
);

const pdfData = {
  hotelName: bookingInfo.hotel.Name || bookingInfo.hotel.name,
  bookingNo: reservationNo || merchantOrderId,

  guestName: `${bookingInfo.guestInfo.firstName} ${bookingInfo.guestInfo.lastName}`,
  email: bookingInfo.guestInfo.email,
  mobileNo: bookingInfo.guestInfo.phone,

  adults: bookingInfo.numGuests,
  children: bookingInfo.selectedRooms.reduce(
    (sum, room) => sum + (room.children || 0),
    0
  ),

  checkIn: bookingInfo.checkInDate.split("T")[0],
  checkOut: bookingInfo.checkOutDate.split("T")[0],
  nights: bookingInfo.numNights,

  rooms: bookingInfo.selectedRooms.map((room, index) => {
    const roomTax = bookingInfo.roomTaxes[index]?.taxes?.reduce(
      (sum, tax) => sum + Number(tax.TaxValue || 0),
      0
    ) || 0;

    const roomRate =
      (room.pricePerNight || room.price || 0) *
      (room.roomCount || 1) *
      bookingInfo.numNights;

    return {
      roomName: room.roomData?.name || room.name,
      roomType: room.rateShortName || "Room Only",
      roomCount: room.roomCount || 1,

      adults: room.adults || 0,
      children: room.children || 0,

      roomRate,
      roomTax,
      roomTotal: roomRate + roomTax,
    };
  }),

  subtotal: bookingInfo.roomCharges,
  totalTax,

  otherCharges: bookingInfo.othercharges || [],

  grandTotal: bookingInfo.totalPrice,

  paymentStatus: "Completed",
  transactionId: merchantOrderId,
};

          const pdfBase64 = generateBookingPDFBase64(pdfData);

          await sendBookingConfirmation({
            base64_file: pdfBase64,
            GuestName: pdfData.guestName,
            MobileNo: pdfData.mobileNo,
            EmailId: pdfData.email,
            BookingNo: pdfData.bookingNo,
            HotelName: pdfData.hotelName,
          });
        } catch {}

        setStatus('success');

        sessionStorage.removeItem('merchantOrderId');
        sessionStorage.removeItem('pendingBooking');
        clearBookingData();

      } catch (err) {
        setError(err.message || 'Failed to verify payment');
        setStatus('failed');
      }
    };

    verifyPaymentAndBook();
  }, []);

  // 🔄 LOADING
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <Loader2 size={64} className="animate-spin text-cogwave-blue mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900">Verifying Payment...</h1>
        </div>
      </div>
    );
  }

  // ❌ FAILED
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-6">{error}</p>

          <button
            onClick={() => navigate('/')}
            className="bg-cogwave-blue text-white px-8 py-3 rounded-lg font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ SUCCESS (same style)
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your reservation. Your booking has been successfully confirmed.
        </p>
        <button
            onClick={() => navigate('/')}
            className="bg-cogwave-blue text-white px-8 py-3 rounded-lg font-semibold"
          >
            Go Home
          </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;