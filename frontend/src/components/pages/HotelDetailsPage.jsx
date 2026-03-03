import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Heart,
  Share2,
  MapPin,
  Check,
  Calendar,
  Edit2,
  Trash2,
  Link,
  Copy,
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import SearchFilter from "../SearchFilter";
import RoomCard from "../RoomCard";
import BookingSummary from "../BookingSummary";
import { getHotelDetails } from "../../services/api";
import {
  getSelectedRooms,
  getCheckInDate,
  getCheckOutDate,
  getHotelId,
  saveSelectedRooms,
  saveCheckInDate,
  saveCheckOutDate,
  saveHotelId,
} from "../../utils/bookingStorage";
import { useToast } from "../../hooks/useToast";
import Footer from "../Footer";

const HotelDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { error, success } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareDropdownRef = useRef(null);
  // ===== ROOM HOLD SESSION =====

  // Load initial values from localStorage
  const [selectedRooms, setSelectedRooms] = useState([]);

  const [selectedRoomsApiparmas, setselectedRoomsApiparmas] = useState([]);

  useEffect(() => {
    console.log("selectedRooms", selectedRoomsApiparmas);
  }, [selectedRooms]);
  
  const [couponCode, setCouponCode] = useState("");
  const [roomTaxes, setRoomTaxes] = useState([]);
  const [checkInDate, setCheckInDate] = useState(
    new Date(),
  );
  const [checkOutDate, setCheckOutDate] = useState(() => {
  
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });

  // Clear selected rooms only when switching to a different hotel
  useLayoutEffect(() => {
    const savedHotelId = getHotelId();
    if (savedHotelId && savedHotelId !== id) {
      // Different hotel, clear old selections
      localStorage.removeItem("hotel360_selectedRooms");
      saveSelectedRooms([]);
      setSelectedRooms([]);
    }
    // Save current hotel ID
    saveHotelId(id);
  }, [id]);

  // Track previous dates to detect actual changes
  // const prevDatesRef = useRef({ checkInDate: null, checkOutDate: null });

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(event.target)
      ) {
        setShowShareDropdown(false);
      }
    };

    if (showShareDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShareDropdown]);

  const handleApplyCoupon = () => {
    if (!couponCode || couponCode.trim() === "") {
      error("Please enter a coupon code");
      return;
    }
    // TODO: Implement coupon validation logic here
    success("Coupon code applied successfully!");
  };

  const getShareableLink = () => {
    return `${window.location.origin}/hotel/${id}`;
  };

  const handleCopyLink = async () => {
    try {
      const link = getShareableLink();
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      error("Failed to copy link");
    }
  };

  const handleWhatsAppShare = () => {
    const link = getShareableLink();
    const hotelName = hotel?.Name || hotel?.name || "this hotel";
    const message = `Check out ${hotelName}! ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setShowShareDropdown(false);
  };
const formatDateToDDMMYYYY = (isoDate) => {
  const date = new Date(isoDate);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
useEffect(() => {
  if (!selectedRooms || selectedRooms.length === 0) {
    setselectedRoomsApiparmas([]);
    return;
  }

  const grouped = [];

  selectedRooms.forEach((room) => {
    const roomTypeId = room.id.split("-")[0];

    const existing = grouped.find((r) => r.id === roomTypeId);

    if (existing) {
      existing.roomCount += 1;
    } else {
      grouped.push({
        id: roomTypeId,
        name: room.roomData?.name || room.name,
        roomCount: 1,
        checkInDate: formatDateToDDMMYYYY(checkInDate),
        checkOutDate: formatDateToDDMMYYYY(checkOutDate),
      });
    }
  });

  setselectedRoomsApiparmas(grouped);
}, [selectedRooms, checkInDate, checkOutDate]);
// const handleSelectRoom = (
//   room,
//   withBreakfast = false,
//   adults = 1,   // ✅ receive adults correctly
//   roomId,
//   ratePlan,
//   offerPrice,
//   originalPrice,
// ) => {
//     const newRoom = {
//       id: roomId,
//       name: `${room.name}${withBreakfast ? " - With Breakfast" : " - Room Only"}`,
//       price: offerPrice || room.price,
//       pricePerNight: offerPrice || room.price,
//       originalPrice: originalPrice || room.originalPrice,
//       roomCount: roomCount,
//       adults: adults,
//       children: 0,
//       roomData: room,
//       withBreakfast: withBreakfast,
//       ratePlanId: ratePlan?.RatePlanId,
//       rateShortName: ratePlan?.RateShortName,
//       ratePlan: ratePlan,
//     };
//     const roomTypeId = roomId.split("-")[0]; // RT1
//     const apiparams = {
//       id: roomTypeId,
//       name: room.name,
//       roomCount: roomCount,
//       checkInDate:formatDateToDDMMYYYY(checkInDate),
//       checkOutDate:formatDateToDDMMYYYY(checkOutDate)
//     };

//     setSelectedRooms((prev) => {
//       const updated = [...prev, newRoom];
//       saveSelectedRooms(updated);
//       return updated;
//     });
//     setselectedRoomsApiparmas((prev) => {
//       const existingIndex = prev.findIndex((r) => r.id === roomTypeId);

//       let updated;

//       if (existingIndex !== -1) {
//         // RT1 already exists → increase count
//         updated = prev.map((r, index) =>
//           index === existingIndex
//             ? { ...r, roomCount: r.roomCount + roomCount }
//             : r,
//         );
//       } else {
//         // First time RT1
//         updated = [...prev, apiparams];
//       }

//       saveSelectedRooms(updated);
//       return updated;
//     });
  
//   };
const handleSelectRoom = (
  room,
  withBreakfast = false,
  adults = 1,
  roomId,
  ratePlan,
  offerPrice,
  originalPrice,
) => {
  const roomTypeId = roomId.split("-")[0];

const newRoom = {
  id: roomId,
  name: `${room.name}${withBreakfast ? " - With Breakfast" : " - Room Only"}`,
  price: offerPrice || room.price,
  pricePerNight: offerPrice || room.price,
  originalPrice: originalPrice || room.originalPrice,
  roomCount: 1,
  adults: adults,
  children: 0,
  roomData: room,
  withBreakfast,
  ratePlanId: ratePlan?.RatePlanId || "",
  rateShortName: ratePlan?.RateShortName || "",
};

  const apiparams = {
    id: roomTypeId,
    name: room.name,
    roomCount: 1,  // ✅ FIXED
    checkInDate: formatDateToDDMMYYYY(checkInDate),
    checkOutDate: formatDateToDDMMYYYY(checkOutDate),
  };

  setSelectedRooms((prev) => {
    const updated = [...prev, newRoom];
    saveSelectedRooms(updated);
    return updated;
  });

  setselectedRoomsApiparmas((prev) => {
    const existingIndex = prev.findIndex((r) => r.id === roomTypeId);

    if (existingIndex !== -1) {
      return prev.map((r, index) =>
        index === existingIndex
          ? { ...r, roomCount: r.roomCount + 1 }
          : r
      );
    } else {
      return [...prev, apiparams];
    }
  });
};
  const handleRoomCountChange = (roomId, adults, children, newPrice) => {
    setSelectedRooms((prev) => {
      const updated = prev.map((room) => {
        if (room.id === roomId) {
          // If new price is provided, update it, otherwise keep existing
          const updatedRoom = { ...room, adults, children };
          if (newPrice !== undefined) {
            updatedRoom.price = newPrice;
            updatedRoom.pricePerNight = newPrice;
          }
          return updatedRoom;
        }
        return room;
      });
      saveSelectedRooms(updated);
      return updated;
    });
  };

  // const handleRemoveRoom = (roomId) => {
  //   setSelectedRooms((prev) => {
  //     const updated = prev.filter((r) => r.id !== roomId);
  //     saveSelectedRooms(updated);
  //     return updated;
  //   });
  // };
  const handleRemoveRoom = (roomId) => {
  const roomTypeId = roomId.split("-")[0]; // RT1

  // 1️⃣ Remove from selectedRooms (UI rooms)
  setSelectedRooms((prev) => {
    const roomToRemove = prev.find((r) => r.id === roomId);
    if (!roomToRemove) return prev;

    const updated = prev.filter((r) => r.id !== roomId);
    saveSelectedRooms(updated);
    return updated;
  });

  // 2️⃣ Update selectedRoomsApiparmas (Grouped API params)
  setselectedRoomsApiparmas((prev) => {
    const existingIndex = prev.findIndex((r) => r.id === roomTypeId);

    if (existingIndex === -1) return prev;

    let updated = prev.map((r, index) => {
      if (index === existingIndex) {
        const newCount = r.roomCount - 1;

        // If count becomes 0 → remove this roomType completely
        if (newCount <= 0) return null;

        return { ...r, roomCount: newCount };
      }
      return r;
    }).filter(Boolean); // remove null

    saveSelectedRooms(updated);
    return updated;
  });
};
useEffect(() => {
  const handleDateChange = (event) => {
    const { checkIn, checkOut } = event.detail;

    setSelectedRooms([]);
    saveSelectedRooms([]);

    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  window.addEventListener("hotel-date-change", handleDateChange);

  return () =>
    window.removeEventListener("hotel-date-change", handleDateChange);
}, []);
  // Refs for each section
  const overviewRef = useRef(null);
  const amenitiesRef = useRef(null);
  const locationRef = useRef(null);
  const roomsRef = useRef(null);
  const reviewsRef = useRef(null);

  // Fetch hotel data on mount and when dates change
  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        setLoadingError(null);

        // Calculate number of nights from check-in and check-out dates
        const checkIn =
          checkInDate instanceof Date ? checkInDate : new Date(checkInDate);
        const checkOut =
          checkOutDate instanceof Date ? checkOutDate : new Date(checkOutDate);
        const numNights = Math.ceil(
          (checkOut - checkIn) / (1000 * 60 * 60 * 24),
        );

        // Format date as YYYY-MM-DD using LOCAL time (not UTC) to avoid timezone issues
        const formatLocalDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const searchParams = {
          checkInDate: formatLocalDate(checkIn),
          numNights: numNights,
          numGuests: location.state?.numGuests || 2,
        };

        // Only clear selected rooms if dates have actually changed (not on initial load)
        // const prevDates = prevDatesRef.current;
        // const datesChanged = prevDates.checkInDate !== null && (
        //   prevDates.checkInDate.getTime() !== checkIn.getTime() ||
        //   prevDates.checkOutDate.getTime() !== checkOut.getTime()
        // );

        // if (datesChanged) {
        //   // Dates changed, clear selections as room availability may be different
        //   setSelectedRooms([]);
        //   saveSelectedRooms([]);
        // }

        // Update previous dates
        // prevDatesRef.current = { checkInDate: checkIn, checkOutDate: checkOut };

        const data = await getHotelDetails(id, searchParams);
        console.log(data, "getHotelDetails");

        if (data) {
          setHotelData(data);
          saveHotelId(id);
        } else {
          setLoadingError("Hotel not found. Please check the hotel ID.");
        }
      } catch (err) {
        // console.error('❌ HotelDetailsPage: Error loading hotel details:', err);
        setLoadingError(err.message || "Failed to load hotel details.");
        saveHotelId(id);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [id, checkInDate, checkOutDate]);

  // Tax calculation function - same logic as CheckoutPage
  const calculateTax = (pricePerNight, quantity, nights) => {
    const totalAmount = pricePerNight * quantity * nights;
    // If room price per night is below 7000, apply 5% tax; otherwise apply 18% tax
    const taxRate = pricePerNight < 7000 ? 0.05 : 0.18;
    return Math.round(totalAmount * taxRate * 100) / 100;
  };

  // Calculate tax details for selected rooms locally
  useEffect(() => {
    const numNights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );
    const taxesPerRoom = [];

    // Calculate taxes for each selected room based on per-night price
    for (const room of selectedRooms) {
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

      if (roomCharge > 0) {
        taxesPerRoom.push({
          roomId: room.id,
          roomName: room.name,
          roomCharge: roomCharge,
          taxes: [
            {
              TaxName: "CGST",
              TaxPer: halfTaxPercentage,
              TaxValue: cgst,
            },
            {
              TaxName: "SGST",
              TaxPer: halfTaxPercentage,
              TaxValue: sgst,
            },
          ],
        });
      }
    }

    setRoomTaxes(taxesPerRoom);
  }, [selectedRooms, checkInDate, checkOutDate]);

  // Use fetched data or create fallback hotel
  const hotel = hotelData;
  console.log("hotelhotel", hotel);

  // Transform room types from API to match existing room card format
  // const rooms = hotel?.roomTypes?.map((roomType, index) => {
  //   const defaultRatePlan = roomType.RatePlans?.find(rp => rp.IsDefaultSelect) || roomType.RatePlans?.[0];
  //   const totalAvailable = roomType.Availability?.RoomsLeft || 0;

  //   return {
  //     id: roomType.RoomTypeId || `room-${index}`,
  //     name: roomType.RoomTypeName || 'Room',
  //     badge: totalAvailable > 0 && totalAvailable <= 3 ? `${totalAvailable} rooms left` : null,
  //     image: roomType.RoomImages?.[0] || hotel.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800',
  //     description: roomType.RoomTypeDescription || '',
  //     beds: `Max ${roomType.MaxOccupancy?.Adults || 2} Adults`,
  //     persons: `${roomType.MaxOccupancy?.Adults || 2} Adults, ${roomType.MaxOccupancy?.Children || 0} Children`,
  //   amenities: roomType.Amenities || [],
  //     rating: '5.0',
  //     available: totalAvailable, // Total available from API (e.g., 6 for all room types)
  //     isAvailable: roomType.Availability?.Available || false,
  //     price: defaultRatePlan?.PricePerNight || 0,
  //     originalPrice: defaultRatePlan?.PricePerNight ? defaultRatePlan.PricePerNight * 1.2 : 0,
  //     totalPrice: defaultRatePlan?.PricePerNight ? defaultRatePlan.PricePerNight * (hotel.search?.NumNights || 1) : 0,
  //     discount: false,
  //     ratePlans: roomType.RatePlans || [],
  //     roomTypeData: roomType // Keep original data for reference
  //   };
  // })
  const rooms = hotel?.roomTypes?.map((roomType, index) => {
    const defaultRatePlan =
      roomType.RatePlans?.find((rp) => rp.IsDefaultSelect) ||
      roomType.RatePlans?.[0];

    const totalAvailable = roomType.Availability?.RoomsLeft || 0;

    return {
      id: roomType.RoomTypeId || `room-${index}`,
      name: roomType.RoomTypeName || "Room",

      badge:
        totalAvailable > 0 && totalAvailable <= 3
          ? `${totalAvailable} rooms left`
          : null,

      image:
        roomType.RoomImages?.[0] ||
        hotel.images?.[0] ||
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800",

      description: roomType.RoomTypeDescription || "",

      beds: `Max ${roomType.MaxOccupancy?.Adults || 2} Adults`,

      persons: `${roomType.MaxOccupancy?.Adults || 2} Adults, ${
        roomType.MaxOccupancy?.Children || 0
      } Children`,

      // ✅ FIXED HERE
      amenities: roomType.Amenities || [],

      rating: hotel.score || "5.0",

      available: totalAvailable,
      isAvailable: roomType.Availability?.Available || false,

      price: defaultRatePlan?.PricePerNight || 0,
      originalPrice: defaultRatePlan?.PricePerNight
        ? defaultRatePlan.PricePerNight * 1.2
        : 0,

      totalPrice: defaultRatePlan?.PricePerNight
        ? defaultRatePlan.PricePerNight * (hotel.search?.NumNights || 1)
        : 0,

      discount: false,
      ratePlans: roomType.RatePlans || [],

      roomTypeData: roomType, // keep raw data
    };
  });
  const tabs = [{ id: "rooms", label: "Rooms", ref: roomsRef }];

  const scrollToSection = (tab) => {
    setActiveTab(tab.id);
    tab.ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-clarity-white">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cogwave-blue mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clarity-white">

      {/* Hero Section with Overlaying Search Filter */}


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 mt-6">
        {/* Hotel Not Found Notice */}

        {/* Hotel Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-verdana font-bold text-cogwave-blue mb-2 sm:mb-3">
              {hotel.name || hotel.Name || "Hotel Details"}
            </h1>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(hotel.rating || 4)].map((_, idx) => (
                <svg
                  key={idx}
                  className="w-5 h-5 fill-yellow-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              {hotel.address || hotel.HotelAddress || hotel.location}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-balance-gray rounded-full flex items-center justify-center hover:border-cogwave-blue transition-colors"
            >
              <Heart
                size={18}
                className={
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                }
              />
            </button>
            <div className="relative" ref={shareDropdownRef}>
              <button
                onClick={() => setShowShareDropdown(!showShareDropdown)}
                className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-balance-gray rounded-full flex items-center justify-center hover:border-cogwave-blue transition-colors"
              >
                <Share2 size={18} className="text-gray-600" />
              </button>

              {/* Share Dropdown */}
              {showShareDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      Share this hotel
                    </p>
                  </div>

                  {/* Copy Link Option */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      {linkCopied ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <Copy size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {linkCopied ? "Link Copied!" : "Copy Link"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Share link via any app
                      </p>
                    </div>
                  </button>

                  {/* WhatsApp Option */}
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        WhatsApp
                      </p>
                      <p className="text-xs text-gray-500">
                        Share via WhatsApp
                      </p>
                    </div>
                  </button>

                  {/* Link Preview */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">
                      Shareable Link:
                    </p>
                    <p className="text-xs text-gray-700 break-all font-mono bg-white px-2 py-1 rounded border border-gray-200">
                      {getShareableLink()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rooms Title - No Tabs */}
        <div className="mb-4 sm:mb-6 sticky top-16 bg-clarity-white z-40 pb-2 sm:pb-3">
          <h2 className="text-xl sm:text-2xl font-verdana font-semibold text-cogwave-blue">
            Rooms
          </h2>
        </div>

        {/* Content Sections - Only Rooms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Rooms Section */}
          <div ref={roomsRef} className="lg:col-span-2 scroll-mt-24">
            <div className="space-y-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onSelectRoom={handleSelectRoom}
                  onRoomCountChange={handleRoomCountChange}
                  onDeleteRoom={handleRemoveRoom}
                  selectedRoomsFromParent={selectedRooms}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary
            selectedRoomsApiparmas={selectedRoomsApiparmas}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              selectedRooms={selectedRooms}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              onRemoveRoom={handleRemoveRoom}
              hotel={hotel}
              numNights={Math.ceil(
                (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
              )}
              roomTaxes={roomTaxes}
              onApplyCoupon={handleApplyCoupon}
            />
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default HotelDetailsPage;
