import { Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveBookingData } from "../utils/bookingStorage";
import { checkTheroomStatus, getTaxAmount } from "../services/api";
import { useEffect, useState } from "react";

const BookingSummary = ({
  checkInDate,
  checkOutDate,
  selectedRooms = [],
  couponCode,
  setCouponCode,
  onRemoveRoom,
  selectedRoomsApiparmas,
  hotel,
  variant = "default", // 'default' or 'checkout'
  serviceFee = 0,
  taxes = [],
  roomTaxes = [],
  numNights = 1,
  numGuests = 1,
  showModifyButton = false,
  hotelId = null,
  onApplyCoupon,
}) => {
  const navigate = useNavigate();
  const [roomTaxesApi, setRoomTaxesApi] = useState([]);
  // Tax calculation function

  // Calculate room charges based on API structure (no service fee or tax)
  const roomCharges = selectedRooms.reduce((sum, room) => {
    const price = Number(room.pricePerNight ?? room.price ?? 0);
    const count = Number(room.roomCount ?? 1);
    const nights = Number(numNights ?? 1);

    const calculated = price * count * nights;

    return sum + (isNaN(calculated) ? 0 : calculated);
  }, 0);
useEffect(() => {
  const fetchRoomTaxes = async () => {
    // 🟢 CLEAR taxes when no rooms selected
    if (!selectedRooms.length) {
      setRoomTaxesApi([]);
      return;
    }

    try {
      const results = await Promise.all(
        selectedRooms.map(async (room) => {
          const price = Number(room.pricePerNight ?? room.price ?? 0);
          const count = Number(room.roomCount ?? 1);
          const nights = Number(numNights ?? 1);

          const taxableAmount = price * count * nights;

          const taxResponse = await getTaxAmount(String(taxableAmount));

          return {
            roomId: room.id,
            taxes: taxResponse || [],
          };
        })
      );

      setRoomTaxesApi(results);
    } catch (error) {
      console.error("Tax API error:", error);
    }
  };

  fetchRoomTaxes();
}, [JSON.stringify(selectedRooms), numNights]);
  const totalTaxAmount = roomTaxesApi.reduce((sum, room) => {
  const roomTax = room.taxes.reduce(
    (taxSum, tax) => taxSum + Number(tax.TaxValue ?? tax.TaxVaue ?? 0),
    0
  );

  return sum + roomTax;
}, 0);

  // Total price - always includes taxes now (both checkout and hotel details page)
  const isCheckout = variant === "checkout";
  const totalPrice = selectedRooms.length
  ? roomCharges + totalTaxAmount
  : 0;

  // Calculate totals
  const totalRooms = selectedRooms.reduce(
    (sum, room) => sum + (room.roomCount || 1),
    0,
  );
  const totalAdults = selectedRooms.reduce(
    (sum, room) => sum + (room.adults || numGuests),
    0,
  );
  const totalChildren = selectedRooms.reduce(
    (sum, room) => sum + (room.children || 0),
    0,
  );

  const handleModify = () => {
    if (hotelId) {
      // Use window.location for full page navigation from checkout
      window.location.href = `/hotel/${hotelId}`;
    } else {
      navigate("/#rooms");
    }
  };

  // Format date helper (dd-mm-yy format)
  const formatDate = (date) => {
    if (!date) return "";
    let dateObj = date instanceof Date ? date : new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 sticky top-24">
      {/* Hotel Info - Only show in checkout mode when hotel is provided */}
      {isCheckout && hotel && (
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-5">
          <img
            src={hotel.Images?.[0] || hotel.image}
            alt={hotel.Name || hotel.name}
            className="w-20 sm:w-24 h-16 sm:h-20 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              {hotel.Name || hotel.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {hotel.HotelAddress || hotel.location}
            </p>
          </div>
        </div>
      )}

      {/* Check-in/Check-out Dates */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Check-in</span>
          </div>
          <p className="text-sm text-gray-900">{formatDate(checkInDate)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Check-out</span>
          </div>
          <p className="text-sm text-gray-900">{formatDate(checkOutDate)}</p>
        </div>
      </div>

      {/* Rooms and Guests */}
      {isCheckout && selectedRooms.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Rooms and Guests
          </p>
          <p className="text-sm text-gray-500">
            {totalRooms} {totalRooms === 1 ? "room" : "rooms"}, {totalAdults}{" "}
            {totalAdults === 1 ? "adult" : "adults"}
            {totalChildren > 0 &&
              `, ${totalChildren} ${totalChildren === 1 ? "child" : "children"}`}
          </p>
        </div>
      )}

      {/* Selected Rooms */}
      {selectedRooms.length > 0 && (
        <div
          className={`mb-4 ${isCheckout ? "pb-4 border-b border-gray-100" : ""}`}
        >
          {selectedRooms.map((room, index) => {
            const price = room.pricePerNight || room.price || 0;
            const count = room.roomCount || 1;
            const roomCharge = price * count * numNights;

            // Find taxes for this room from roomTaxes
            const roomTaxData = roomTaxesApi.find((rt) => rt.roomId === room.id);
            const roomTaxAmount = roomTaxData
              ? roomTaxData.taxes.reduce(
                  (sum, tax) => sum + (tax.TaxValue || 0),
                  0,
                )
              : 0;

            return (
              <div
                key={room.id || index}
                className={`py-3 ${index < selectedRooms.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {room.name}
                    </h4>
                    {/* Show rate plan name */}
                    {(room.rateShortName || room.withBreakfast) && (
                      <p className="text-xs text-gray-500">
                        {room.rateShortName ||
                          (room.withBreakfast
                            ? "Room with breakfast"
                            : "Room Only")}
                      </p>
                    )}
                  </div>
                </div>
                {!isCheckout && (
                  <>
                    <p className="text-xs text-gray-500">
                      {typeof room.rateShortName === "string"
                        ? room.rateShortName
                        : room.rateShortName?.RateShortName ||
                          (room.withBreakfast
                            ? "Room with breakfast"
                            : "Room Only")}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Room Charges
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{(price * count * numNights).toLocaleString()}
                      </span>
                    </div>
                    {/* Show per-room taxes on hotel details page */}
                {!isCheckout && roomTaxData?.taxes?.length > 0 && (
  <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
    {roomTaxData?.taxes?.map((tax, taxIdx) => (
      <div key={taxIdx} className="flex justify-between text-xs">
        <span className="text-gray-600">
          {tax.TaxName} ({Number(tax.TaxPer).toFixed(2)}%)
        </span>
        <span className="text-gray-900">
          ₹{Number(tax.TaxVaue ?? tax.TaxValue ?? 0).toLocaleString()}
        </span>
      </div>
    ))}
  </div>
)}
                  </>
                )}

                {/* Taxes shown in separate breakdown below, not here in checkout */}
              </div>
            );
          })}
        </div>
      )}

      {/* Price Details - Show in checkout mode */}
      {isCheckout && selectedRooms.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Price details:
          </p>
          <div className="space-y-2">
            {selectedRooms.map((room, index) => {
              const price = room.pricePerNight || room.price || 0;
              const count = room.roomCount || 1;
              return (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    ₹{price.toLocaleString()} x {numNights}{" "}
                    {numNights === 1 ? "night" : "nights"}
                  </span>
                  <span className="text-gray-900">
                    ₹{(price * count * numNights).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtotal */}
      {isCheckout && selectedRooms.length > 0 && (
        <div className="flex justify-between text-sm mb-3 pb-3 border-b border-gray-100">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">
            ₹{roomCharges.toLocaleString()}
          </span>
        </div>
      )}

      {/* Taxes Breakdown - Show CGST and SGST separately */}
      {isCheckout && selectedRooms.length > 0 && totalTaxAmount > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-100 space-y-1">
          {roomTaxesApi.map((roomTax) => {
            const room = selectedRooms.find((r) => r.id === roomTax.roomId);

            return (
              <div key={roomTax.roomId} className="text-sm">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span className="text-xs">{room?.name}</span>
                </div>

                {roomTax.taxes.map((tax, index) => (
                  <div
                    key={index}
                    className={`flex justify-between text-xs ml-2 ${
                      index < roomTax.taxes.length - 1 ? "mb-0.5" : ""
                    }`}
                  >
                    <span className="text-gray-600">
                      {tax.TaxName} ({Number(tax.TaxPer).toFixed(2)}%)
                    </span>
                    <span className="text-gray-900">
                      ₹
                      {Number(
                        tax.TaxValue ?? tax.TaxVaue ?? 0,
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Total */}
      <div
        className={`flex items-center justify-between ${isCheckout ? "pt-4 border-t border-gray-100" : "pb-4 border-b border-gray-200"} ${!isCheckout || showModifyButton ? "mb-4" : ""}`}
      >
        <span className="text-base font-semibold text-gray-900">Total INR</span>
       <span className="text-xl font-bold text-gray-900">
  {selectedRooms.length ? `₹${totalPrice.toLocaleString()}` : "₹0"}
</span>
      </div>

      {/* Coupon Code - Only in default mode */}
      {!isCheckout && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Have a Coupon Code?"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cogwave-blue"
            />
            <button
              onClick={onApplyCoupon}
              className="px-4 py-2 text-cogwave-blue font-semibold text-sm hover:bg-gray-50 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Proceed to Pay Button - Only in default mode */}
      {!isCheckout && (
        <button
          // onClick={() => {
          //   if (selectedRooms.length === 0) {
          //     alert('Please select at least one room');
          //     return;
          //   }
          //   // Store booking data in both sessionStorage and localStorage
          //   const bookingData = {
          //     hotel,
          //     selectedRooms,
          //     checkInDate: checkInDate instanceof Date ? checkInDate.toISOString() : checkInDate,
          //     checkOutDate: checkOutDate instanceof Date ? checkOutDate.toISOString() : checkOutDate,
          //     numNights,
          //     numGuests: totalAdults + totalChildren,
          //     totalPrice
          //   };
          //   sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

          //   // Also save to localStorage as backup
          //   saveBookingData({
          //     selectedRooms,
          //     checkInDate,
          //     checkOutDate,
          //   });

          //   navigate('/checkout');
          // }}
          onClick={async () => {
            if (selectedRooms.length === 0) {
              alert("Please select at least one room");
              return;
            }

            try {
              const response = await checkTheroomStatus(selectedRoomsApiparmas);

              if (!response || response.length === 0) {
                alert("Unable to verify room availability. Please try again.");
                return;
              }

              // Find unavailable rooms
              const unavailableRooms = response.filter((room) => !room.Status);

              if (unavailableRooms.length > 0) {
                const message = unavailableRooms
                  .map(
                    (room) =>
                      `${room.name} has only ${room.Available} room(s) available. Please reselect.`,
                  )
                  .join("\n");

                alert(message);
                return; // ❌ Stop navigation
              }

              // ✅ All rooms available → continue to checkout
              const bookingData = {
                hotel,
                selectedRooms,
                checkInDate:
                  checkInDate instanceof Date
                    ? checkInDate.toISOString()
                    : checkInDate,
                checkOutDate:
                  checkOutDate instanceof Date
                    ? checkOutDate.toISOString()
                    : checkOutDate,
                numNights,
                numGuests: totalAdults + totalChildren,
                totalPrice,
              };

              sessionStorage.setItem(
                "bookingData",
                JSON.stringify(bookingData),
              );

              saveBookingData({
                selectedRooms,
                checkInDate,
                checkOutDate,
              });

              navigate("/checkout");
            } catch (error) {
              console.error("Room status check failed:", error);
              alert("Something went wrong. Please try again.");
            }
          }}
          disabled={selectedRooms.length === 0}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            selectedRooms.length === 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-cogwave-blue text-white hover:bg-cogwave-blue/90"
          }`}
        >
          Proceed to Pay
        </button>
      )}

      {/* Modify Button - Only in checkout mode when showModifyButton is true */}
      {isCheckout && showModifyButton && (
        <button
          onClick={handleModify}
          className="w-full py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer mt-2"
        >
          Modify
        </button>
      )}
    </div>
  );
};

export default BookingSummary;
