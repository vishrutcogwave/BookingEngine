import { useState, useEffect } from "react";
import { Wifi, Coffee, Droplets, Trash2, Plus, Check } from "lucide-react";
import ImageModal from "./imageModal";
const AMENITY_ICON_MAP = {
  wifi: Wifi,
  "free wifi": Wifi,
  "free wi-fi": Wifi,

  "air conditioning": Droplets,
  ac: Droplets,

  "tea & artisanal coffee set-up": Coffee,
  coffee: Coffee,

  "ro water": Droplets,
  "drinking water": Droplets,

  "mini-fridge stocked with essentials": Coffee,
  fridge: Coffee,

  "smart tv": Check,
};
const getAmenityIcon = (amenity) => {
  const key = amenity.toLowerCase();
  return Check; // fallback icon
};

const RoomCard = ({
  room,
  onSelectRoom,
  onRoomCountChange,
  onDeleteRoom,
  selectedRoomsFromParent = [],
}) => {
  console.log("roomssssssss", room);

  const [selectedRatePlan, setSelectedRatePlan] = useState(null); // 'only' or 'breakfast'
  const images = room.roomTypeData?.RoomImages || [room.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState(() => {
    // Initialize with rooms from parent if available
    return selectedRoomsFromParent.filter(
      (r) => r.roomData?.id === room.id || r.id?.toString().startsWith(room.id),
    );
  }); // Array of room objects
  const [roomIdOnly, setRoomIdOnly] = useState(null);
  const [roomIdBreakfast, setRoomIdBreakfast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to get price based on occupancy
  const getPriceForOccupancy = (ratePlan, adults, children) => {
    const totalOccupancy = adults + children;
    if (!ratePlan?.PriceDetails || ratePlan.PriceDetails.length === 0) {
      return {
        originalPrice: room.originalPrice || 0,
        offerPrice: room.price || 0,
      };
    }

    // Find the price detail matching the occupancy
    const priceDetail =
      ratePlan.PriceDetails.find((pd) => pd.RatePax === totalOccupancy) ||
      ratePlan.PriceDetails[ratePlan.PriceDetails.length - 1]; // Fallback to highest

    return {
      originalPrice: priceDetail?.PricePerNight || room.originalPrice || 0,
      offerPrice: priceDetail?.OfferPricePerNight || room.price || 0,
    };
  };

  // Sync with parent's selectedRooms whenever they change
  useEffect(() => {
    const roomsForThisCard = selectedRoomsFromParent.filter((r) => {
      // Check if room belongs to this card
      return (
        r.id?.toString().includes(`${room.id}-`) ||
        (r.roomData && r.roomData.id === room.id)
      );
    });

    setSelectedRooms(roomsForThisCard);

    // Determine selected rate plan from persisted rooms
    if (roomsForThisCard.length > 0) {
      const hasRoomOnly = roomsForThisCard.some((r) => !r.withBreakfast);
      const hasBreakfast = roomsForThisCard.some((r) => r.withBreakfast);

      if (hasRoomOnly && !hasBreakfast) {
        setSelectedRatePlan("only");
      } else if (hasBreakfast && !hasRoomOnly) {
        setSelectedRatePlan("breakfast");
      }
    } else {
      // Reset selectedRatePlan when no rooms are selected (e.g., after date change)
      setSelectedRatePlan(null);
      setRoomIdOnly(null);
      setRoomIdBreakfast(null);
    }
  }, [selectedRoomsFromParent, room.id]);
  // ===== IMAGE SLIDE HANDLERS (NEW) =====
  const handlePrevImage = (e) => {
    e.stopPropagation(); // prevent modal open
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation(); // prevent modal open
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const handleBookRoom = (withBreakfast = false) => {
    // Check if opposite variant is already selected
    const oppositeVariantExists = withBreakfast
      ? selectedRooms.some((r) => !r.withBreakfast)
      : selectedRooms.some((r) => r.withBreakfast);

    if (oppositeVariantExists) {
      alert(
        `You can only select one type of this room. Please remove the "${withBreakfast ? "Room Only" : "Room with Breakfast"}" variant first.`,
      );
      return;
    }

    // Check if we've reached the availability limit
    if (
      room.available !== undefined &&
      selectedRooms.length >= room.available
    ) {
      alert(`Only ${room.available} rooms available. Cannot add more.`);
      return;
    }

    const roomId = `${room.id}-${withBreakfast}-${Date.now()}`;
    const ratePlan = withBreakfast
      ? room.ratePlans?.find((rp) => rp.RateShortName === "Room with Breakfast")
      : room.ratePlans?.find((rp) => rp.RateShortName === "Room Only");

    const pricing = getPriceForOccupancy(
      ratePlan,
      room?.roomTypeData?.MaxOccupancy?.DefaultAdult,
      0,
    );

    const newRoom = {
      id: roomId,
      withBreakfast,
      adults: room?.roomTypeData?.MaxOccupancy?.DefaultAdult,
      children: 0,
      roomNumber: selectedRooms.length + 1,
      ratePlanId: ratePlan?.RatePlanId,
      rateShortName: ratePlan?.RateShortName,
    };

    setSelectedRooms([...selectedRooms, newRoom]);
    setSelectedRatePlan(withBreakfast ? "breakfast" : "only");

    if (withBreakfast) {
      setRoomIdBreakfast(roomId);
    } else {
      setRoomIdOnly(roomId);
    }

    onSelectRoom &&
      onSelectRoom(
        room,
        withBreakfast,
        room?.roomTypeData?.MaxOccupancy?.DefaultAdult,
        roomId,
        ratePlan,
        pricing.offerPrice,
        pricing.originalPrice,
      );
  };

  const handleAddMoreRooms = (withBreakfast) => {
    // Check if we've reached the availability limit
    if (
      room.available !== undefined &&
      selectedRooms.length >= room.available
    ) {
      alert(`Only ${room.available} rooms available. Cannot add more.`);
      return;
    }

    const roomId = `${room.id}-${withBreakfast}-${Date.now()}`;
    const ratePlan = withBreakfast
      ? room.ratePlans?.find((rp) => rp.RateShortName === "Room with Breakfast")
      : room.ratePlans?.find((rp) => rp.RateShortName === "Room Only");

    const defaultAdults = room?.roomTypeData?.MaxOccupancy?.DefaultAdult || 1;

    const pricing = getPriceForOccupancy(ratePlan, defaultAdults, 0);

    const newRoom = {
      id: roomId,
      withBreakfast,
      adults: room?.roomTypeData?.MaxOccupancy?.DefaultAdult,
      children: 0,
      roomNumber: selectedRooms.length + 1,
      ratePlanId: ratePlan?.RatePlanId,
      rateShortName: ratePlan?.RateShortName,
    };

    setSelectedRooms([...selectedRooms, newRoom]);
    onSelectRoom &&
      onSelectRoom(
        room,
        withBreakfast,
        room?.roomTypeData?.MaxOccupancy?.DefaultAdult,
        roomId,
        ratePlan,
        pricing.offerPrice,
        pricing.originalPrice,
      );
    onRoomCountChange &&
  onRoomCountChange(roomId, defaultAdults, 0, pricing.offerPrice);
  };

  // const handleAddChild = (roomId) => {
  //   setSelectedRooms((prev) => {
  //     const updated = prev.map((r) => {
  //       if (r.id === roomId && r.children < 1) {
  //         return { ...r, children: r.children + 1 };
  //       }
  //       return r;
  //     });
  //     const room = updated.find((r) => r.id === roomId);
  //     if (room) {
  //       onRoomCountChange &&
  //         onRoomCountChange(roomId, room.adults, room.children);
  //     }
  //     return updated;
  //   });
  // };

  // const handleIncrementCount = (roomId) => {
  //   setSelectedRooms((prev) => {
  //     const updated = prev.map((r) => {
  //       if (r.id === roomId) {
  //         // Get max children from room data
  //         const maxChildren = room?.roomTypeData?.MaxOccupancy?.Children || 1;
  //         // First priority: increment adults up to 2
  //         if (r.adults < room?.roomTypeData?.MaxOccupancy?.Adults) {
  //           return { ...r, adults: r.adults + 1 };
  //         }
  //         // Then allow adding children (up to maxChildren)
  //         else if (r.children < maxChildren) {
  //           return { ...r, children: r.children + 1 };
  //         }
  //       }
  //       return r;
  //     });
  //     const room_obj = updated.find((r) => r.id === roomId);
  //     if (room_obj) {
  //       onRoomCountChange &&
  //         onRoomCountChange(roomId, room_obj.adults, room_obj.children);
  //     }
  //     return updated;
  //   });
  // };

  // const handleDecrementCount = (roomId) => {
  //   setSelectedRooms((prev) => {
  //     const updated = prev.map((r) => {
  //       if (r.id === roomId) {
  //         // Remove in reverse order: child first, then adult (min 1)
  //         if (r.children > 0) {
  //           return { ...r, children: r.children - 1 };
  //         } else if (r.adults > 1) {
  //           return { ...r, adults: r.adults - 1 };
  //         }
  //       }
  //       return r;
  //     });
  //     const room = updated.find((r) => r.id === roomId);
  //     if (room) {
  //       onRoomCountChange &&
  //         onRoomCountChange(roomId, room.adults, room.children);
  //     }
  //     return updated;
  //   });
  // };

  const handleRemoveRoom = (roomId) => {
    const updatedRooms = selectedRooms.filter((r) => r.id !== roomId);
    setSelectedRooms(updatedRooms);

    // Check if there are any remaining rooms of either type
    const hasRoomOnly = updatedRooms.some((r) => !r.withBreakfast);
    const hasBreakfast = updatedRooms.some((r) => r.withBreakfast);

    // Reset roomId trackers if needed
    if (roomId === roomIdOnly && !hasRoomOnly) {
      setRoomIdOnly(null);
    }
    if (roomId === roomIdBreakfast && !hasBreakfast) {
      setRoomIdBreakfast(null);
    }

    // Reset selectedRatePlan if no rooms of that type remain
    if (selectedRatePlan === "only" && !hasRoomOnly) {
      setSelectedRatePlan(null);
    }
    if (selectedRatePlan === "breakfast" && !hasBreakfast) {
      setSelectedRatePlan(null);
    }

    onDeleteRoom && onDeleteRoom(roomId);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Room Image */}
        <div className="w-full md:w-32 shrink-0">
          <div
            className="relative w-full md:w-32 h-40 md:h-24 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src={images[currentImageIndex]}
              alt={room.name}
              className="w-full h-full object-cover"
            />

            {/* LEFT ARROW */}
            {images.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center transition"
              >
                ‹
              </button>
            )}

            {/* RIGHT ARROW */}
            {images.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center transition"
              >
                ›
              </button>
            )}

            {/* DOTS */}
            {images.length > 1 && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="flex-1">
          {/* Room Name */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
            {room.name}
          </h3>

          {/* Room Description */}
          {room.description && (
            <>
              <div className="border-t border-gray-200 mb-2 sm:mb-3"></div>
              <p className="text-xs text-gray-600 mb-2 sm:mb-3">
                {room.description}
              </p>
            </>
          )}

          {/* Room Only Section */}
          <div className="mb-2 sm:mb-3">
            {room.amenities?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                {room.amenities.map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity);

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 text-gray-600"
                    >
                      <Icon size={14} />
                      <span className="text-xs">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs font-medium text-gray-700 mb-2">Room Only</p>

            {/* Amenities Icons */}
            {/* Amenities Icons */}

            {/* Available Rooms Info */}
            {room.available !== undefined && (
              <p className="text-xs font-semibold text-red-600 mb-2">
                {Math.max(0, room.available - selectedRooms.length)} available
              </p>
            )}

            {/* Price and Booking Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const roomOnlyPlan = room.ratePlans?.find(
                    (rp) => rp.RateShortName === "Room Only",
                  );
                  const pricing = getPriceForOccupancy(
                    roomOnlyPlan,
                    room?.roomTypeData?.MaxOccupancy?.DefaultAdult,
                    0,
                  );
                  const hasDiscount =
                    pricing.originalPrice > pricing.offerPrice;
                  return (
                    <>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{pricing.originalPrice}
                        </span>
                      )}
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹{pricing.offerPrice}
                      </span>
                      <span className="text-xs text-gray-500">/ Night</span>
                      {hasDiscount && (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                          {Math.round(
                            ((pricing.originalPrice - pricing.offerPrice) /
                              pricing.originalPrice) *
                              100,
                          )}
                          % off
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => handleBookRoom(false)}
                disabled={
                  selectedRatePlan === "only" ||
                  selectedRooms.some((r) => r.withBreakfast) ||
                  (room.available !== undefined &&
                    selectedRooms.length >= room.available)
                }
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRatePlan === "only" ||
                  selectedRooms.some((r) => r.withBreakfast) ||
                  (room.available !== undefined &&
                    selectedRooms.length >= room.available)
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {room.available !== undefined &&
                selectedRooms.length >= room.available
                  ? "Sold Out"
                  : selectedRatePlan === "only"
                    ? "Added"
                    : "Book Room"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">(Exclusive of Taxes)</p>

            {/* Selected Rooms - Room Only */}
            {selectedRatePlan === "only" && selectedRooms.length > 0 && (
              <div className="space-y-2 sm:space-y-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                {selectedRooms
                  .filter((r) => !r.withBreakfast)
                  .map((selectedRoom) => {
                    const maxChildren =
                      room?.roomTypeData?.MaxOccupancy?.Children || 1;
                    return (
                      <div
                        key={selectedRoom.id}
                        className="bg-gray-50 p-2 sm:p-3 rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            Room {selectedRoom.roomNumber}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            {/* Left: Combined Counter */}
                            <div className="border border-gray-400 rounded-full px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRooms((prev) => {
                                    const updated = prev.map((r) => {
                                      if (
                                        r.id === selectedRoom.id &&
                                        r.adults > 1
                                      ) {
                                        const newAdults = r.adults - 1;
                                        const roomOnlyPlan =
                                          room.ratePlans?.find(
                                            (rp) =>
                                              rp.RateShortName === "Room Only",
                                          );
                                        const pricing = getPriceForOccupancy(
                                          roomOnlyPlan,
                                          newAdults,
                                          r.children,
                                        );
                                        onRoomCountChange &&
                                          onRoomCountChange(
                                            selectedRoom.id,
                                            newAdults,
                                            r.children,
                                            pricing.offerPrice,
                                          );
                                        return { ...r, adults: newAdults };
                                      }
                                      return r;
                                    });
                                    return updated;
                                  });
                                }}
                                disabled={selectedRoom.adults <= 1}
                                className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                  selectedRoom.adults <= 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                              >
                                −
                              </button>
                              <span className="text-sm font-semibold text-gray-900 px-2 text-center whitespace-nowrap">
                                {selectedRoom.adults}{" "}
                                {selectedRoom.adults === 1 ? "Adult" : "Adults"}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedRooms((prev) => {
                                    const updated = prev.map((r) => {
                                      if (
                                        r.id === selectedRoom.id &&
                                        r.adults <
                                          room?.roomTypeData?.MaxOccupancy
                                            ?.Adults
                                      ) {
                                        const newAdults = r.adults + 1;
                                        const roomOnlyPlan =
                                          room.ratePlans?.find(
                                            (rp) =>
                                              rp.RateShortName === "Room Only",
                                          );
                                        const pricing = getPriceForOccupancy(
                                          roomOnlyPlan,
                                          newAdults,
                                          r.children,
                                        );
                                        onRoomCountChange &&
                                          onRoomCountChange(
                                            selectedRoom.id,
                                            newAdults,
                                            r.children,
                                            pricing.offerPrice,
                                          );
                                        return { ...r, adults: newAdults };
                                      }
                                      return r;
                                    });
                                    return updated;
                                  });
                                }}
                                disabled={
                                  selectedRoom.adults >=
                                  (room?.roomTypeData?.MaxOccupancy?.Adults ||
                                    1)
                                }
                                className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                  selectedRoom.adults >=
                                  (room?.roomTypeData?.MaxOccupancy?.Adults ||
                                    1)
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                              >
                                +
                              </button>
                            </div>

                            {/* Right: Children Counter */}
                            <div className="border border-gray-400 rounded-full px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRooms((prev) => {
                                    const updated = prev.map((r) => {
                                      if (
                                        r.id === selectedRoom.id &&
                                        r.children > 0
                                      ) {
                                        const newChildren = r.children - 1;
                                        const roomOnlyPlan =
                                          room.ratePlans?.find(
                                            (rp) =>
                                              rp.RateShortName === "Room Only",
                                          );
                                        const pricing = getPriceForOccupancy(
                                          roomOnlyPlan,
                                          r.adults,
                                          newChildren,
                                        );
                                        onRoomCountChange &&
                                          onRoomCountChange(
                                            selectedRoom.id,
                                            r.adults,
                                            newChildren,
                                            pricing.offerPrice,
                                          );
                                        return { ...r, children: newChildren };
                                      }
                                      return r;
                                    });
                                    return updated;
                                  });
                                }}
                                disabled={selectedRoom.children <= 0}
                                className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                  selectedRoom.children <= 0
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                              >
                                −
                              </button>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 px-1 sm:px-2 text-center whitespace-nowrap">
                                {selectedRoom.children} Child
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedRooms((prev) => {
                                    const updated = prev.map((r) => {
                                      if (
                                        r.id === selectedRoom.id &&
                                        r.children < maxChildren
                                      ) {
                                        const newChildren = r.children + 1;
                                        const roomOnlyPlan =
                                          room.ratePlans?.find(
                                            (rp) =>
                                              rp.RateShortName === "Room Only",
                                          );
                                        const pricing = getPriceForOccupancy(
                                          roomOnlyPlan,
                                          r.adults,
                                          newChildren,
                                        );
                                        onRoomCountChange &&
                                          onRoomCountChange(
                                            selectedRoom.id,
                                            r.adults,
                                            newChildren,
                                            pricing.offerPrice,
                                          );
                                        return { ...r, children: newChildren };
                                      }
                                      return r;
                                    });
                                    return updated;
                                  });
                                }}
                                disabled={selectedRoom.children >= maxChildren}
                                className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                  selectedRoom.children >= maxChildren
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                              >
                                +
                              </button>
                            </div>

                            {/* Trash button */}
                            <button
                              onClick={() => handleRemoveRoom(selectedRoom.id)}
                              className="text-red-500 hover:text-red-600 transition-colors p-1"
                            >
                              <Trash2 size={18} />
                            </button>

                            {/* Plus button */}
                            <button
                              onClick={() => handleAddMoreRooms(false)}
                              disabled={
                                room.available !== undefined &&
                                selectedRooms.length >= room.available
                              }
                              className={`flex items-center justify-center w-8 h-8 rounded ${
                                room.available !== undefined &&
                                selectedRooms.length >= room.available
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-900 text-white hover:bg-gray-800"
                              }`}
                            >
                              <Plus size={16} />
                            </button>

                            {/* Price and Taxes */}
                            {(() => {
                              const roomOnlyPlan = room.ratePlans?.find(
                                (rp) => rp.RateShortName === "Room Only",
                              );
                              const pricing = getPriceForOccupancy(
                                roomOnlyPlan,
                                selectedRoom.adults,
                                selectedRoom.children,
                              );
                              return (
                                <>
                                  <span className="hidden sm:block text-sm font-bold text-gray-900 whitespace-nowrap">
                                    ₹{pricing.offerPrice.toLocaleString()}{" "}
                                    <span className="text-xs font-normal">
                                      + Taxes (per night)
                                    </span>
                                  </span>
                                </>
                              );
                            })()}
                          </div>

                          {/* Price and Taxes - Mobile Only */}
                          {(() => {
                            const roomOnlyPlan = room.ratePlans?.find(
                              (rp) => rp.RateShortName === "Room Only",
                            );
                            const pricing = getPriceForOccupancy(
                              roomOnlyPlan,
                              selectedRoom.adults,
                              selectedRoom.children,
                            );
                            return (
                              <span className="block sm:hidden text-sm font-bold text-gray-900 w-full">
                                ₹{pricing.offerPrice.toLocaleString()}{" "}
                                <span className="text-xs font-normal">
                                  + Taxes (per night)
                                </span>
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Room With Breakfast Section */}
          {room.ratePlans && room.ratePlans.length > 1 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Room With Breakfast
              </p>

              {/* Available Rooms Info */}
              {room.available !== undefined && (
                <p className="text-xs font-semibold text-red-600 mb-2">
                  {Math.max(0, room.available - selectedRooms.length)} available
                </p>
              )}

              {/* Price and Booking Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const breakfastPlan = room.ratePlans?.find(
                      (rp) => rp.RateShortName === "Room with Breakfast",
                    );
                    const pricing = getPriceForOccupancy(
                      breakfastPlan,
                      room?.roomTypeData?.MaxOccupancy?.DefaultAdult,
                      0,
                    );
                    const hasDiscount =
                      pricing.originalPrice > pricing.offerPrice;
                    return (
                      <>
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{pricing.originalPrice}
                          </span>
                        )}
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                          ₹{pricing.offerPrice}
                        </span>
                        <span className="text-xs text-gray-500">/ Night</span>
                        {hasDiscount && (
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                            {Math.round(
                              ((pricing.originalPrice - pricing.offerPrice) /
                                pricing.originalPrice) *
                                100,
                            )}
                            % off
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                <button
                  onClick={() => handleBookRoom(true)}
                  disabled={
                    selectedRatePlan === "breakfast" ||
                    selectedRooms.some((r) => !r.withBreakfast) ||
                    (room.available !== undefined &&
                      selectedRooms.length >= room.available)
                  }
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRatePlan === "breakfast" ||
                    selectedRooms.some((r) => !r.withBreakfast) ||
                    (room.available !== undefined &&
                      selectedRooms.length >= room.available)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {room.available !== undefined &&
                  selectedRooms.length >= room.available
                    ? "Sold Out"
                    : selectedRatePlan === "breakfast"
                      ? "Added"
                      : "Book Room"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">(Exclusive of Taxes)</p>

              {/* Selected Rooms - Room With Breakfast */}
              {selectedRatePlan === "breakfast" && selectedRooms.length > 0 && (
                <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                  {selectedRooms
                    .filter((r) => r.withBreakfast)
                    .map((selectedRoom) => {
                      const maxChildren =
                        room?.roomTypeData?.MaxOccupancy?.Children || 1;
                      return (
                        <div
                          key={selectedRoom.id}
                          className="bg-gray-50 p-2 sm:p-3 rounded-lg"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                            <span className="text-sm font-semibold text-gray-900">
                              Room {selectedRoom.roomNumber}
                            </span>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              {/* Left: Combined Counter */}
                              <div className="border border-gray-400 rounded-full px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedRooms((prev) => {
                                      const updated = prev.map((r) => {
                                        if (
                                          r.id === selectedRoom.id &&
                                          r.adults > 1
                                        ) {
                                          const newAdults = r.adults - 1;
                                          const breakfastPlan =
                                            room.ratePlans?.find(
                                              (rp) =>
                                                rp.RateShortName ===
                                                "Room with Breakfast",
                                            );
                                          const pricing = getPriceForOccupancy(
                                            breakfastPlan,
                                            newAdults,
                                            r.children,
                                          );
                                          onRoomCountChange &&
                                            onRoomCountChange(
                                              selectedRoom.id,
                                              newAdults,
                                              r.children,
                                              pricing.offerPrice,
                                            );
                                          return { ...r, adults: newAdults };
                                        }
                                        return r;
                                      });
                                      return updated;
                                    });
                                  }}
                                  disabled={selectedRoom.adults <= 1}
                                  className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                    selectedRoom.adults <= 1
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "text-gray-700 hover:text-gray-900"
                                  }`}
                                >
                                  −
                                </button>
                                <span className="text-sm font-semibold text-gray-900 px-2 text-center whitespace-nowrap">
                                  {selectedRoom.adults}{" "}
                                  {selectedRoom.adults === 1
                                    ? "Adult"
                                    : "Adults"}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedRooms((prev) => {
                                      const updated = prev.map((r) => {
                                        if (
                                          r.id === selectedRoom.id &&
                                          r.adults <
                                            room?.roomTypeData?.MaxOccupancy
                                              ?.Adults
                                        ) {
                                          const newAdults = r.adults + 1;
                                          const breakfastPlan =
                                            room.ratePlans?.find(
                                              (rp) =>
                                                rp.RateShortName ===
                                                "Room with Breakfast",
                                            );
                                          const pricing = getPriceForOccupancy(
                                            breakfastPlan,
                                            newAdults,
                                            r.children,
                                          );
                                          onRoomCountChange &&
                                            onRoomCountChange(
                                              selectedRoom.id,
                                              newAdults,
                                              r.children,
                                              pricing.offerPrice,
                                            );
                                          return { ...r, adults: newAdults };
                                        }
                                        return r;
                                      });
                                      return updated;
                                    });
                                  }}
                                  disabled={
                                    selectedRoom.adults >=
                                    (room?.roomTypeData?.MaxOccupancy?.Adults ||
                                      1)
                                  }
                                  className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                    selectedRoom.adults >=
                                    (room?.roomTypeData?.MaxOccupancy?.Adults ||
                                      1)
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "text-gray-700 hover:text-gray-900"
                                  }`}
                                >
                                  +
                                </button>
                              </div>

                              {/* Right: Children Counter */}
                              <div className="border border-gray-400 rounded-full px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedRooms((prev) => {
                                      const updated = prev.map((r) => {
                                        if (
                                          r.id === selectedRoom.id &&
                                          r.children > 0
                                        ) {
                                          const newChildren = r.children - 1;
                                          const breakfastPlan =
                                            room.ratePlans?.find(
                                              (rp) =>
                                                rp.RateShortName ===
                                                "Room with Breakfast",
                                            );
                                          const pricing = getPriceForOccupancy(
                                            breakfastPlan,
                                            r.adults,
                                            newChildren,
                                          );
                                          onRoomCountChange &&
                                            onRoomCountChange(
                                              selectedRoom.id,
                                              r.adults,
                                              newChildren,
                                              pricing.offerPrice,
                                            );
                                          return {
                                            ...r,
                                            children: newChildren,
                                          };
                                        }
                                        return r;
                                      });
                                      return updated;
                                    });
                                  }}
                                  disabled={selectedRoom.children <= 0}
                                  className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                    selectedRoom.children <= 0
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "text-gray-700 hover:text-gray-900"
                                  }`}
                                >
                                  −
                                </button>
                                <span className="text-xs sm:text-sm font-semibold text-gray-900 px-1 sm:px-2 text-center whitespace-nowrap">
                                  {selectedRoom.children} Child
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedRooms((prev) => {
                                      const updated = prev.map((r) => {
                                        if (
                                          r.id === selectedRoom.id &&
                                          r.children < maxChildren
                                        ) {
                                          const newChildren = r.children + 1;
                                          const breakfastPlan =
                                            room.ratePlans?.find(
                                              (rp) =>
                                                rp.RateShortName ===
                                                "Room with Breakfast",
                                            );
                                          const pricing = getPriceForOccupancy(
                                            breakfastPlan,
                                            r.adults,
                                            newChildren,
                                          );
                                          onRoomCountChange &&
                                            onRoomCountChange(
                                              selectedRoom.id,
                                              r.adults,
                                              newChildren,
                                              pricing.offerPrice,
                                            );
                                          return {
                                            ...r,
                                            children: newChildren,
                                          };
                                        }
                                        return r;
                                      });
                                      return updated;
                                    });
                                  }}
                                  disabled={
                                    selectedRoom.children >= maxChildren
                                  }
                                  className={`flex items-center justify-center font-bold text-sm sm:text-base ${
                                    selectedRoom.children >= maxChildren
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "text-gray-700 hover:text-gray-900"
                                  }`}
                                >
                                  +
                                </button>
                              </div>

                              {/* Trash button */}
                              <button
                                onClick={() =>
                                  handleRemoveRoom(selectedRoom.id)
                                }
                                className="text-red-500 hover:text-red-600 transition-colors p-1"
                              >
                                <Trash2 size={18} />
                              </button>

                              {/* Plus button */}
                              <button
                                onClick={() => handleAddMoreRooms(true)}
                                disabled={
                                  room.available !== undefined &&
                                  selectedRooms.length >= room.available
                                }
                                className={`flex items-center justify-center w-8 h-8 rounded ${
                                  room.available !== undefined &&
                                  selectedRooms.length >= room.available
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-gray-800"
                                }`}
                              >
                                <Plus size={16} />
                              </button>

                              {/* Price and Taxes */}
                              {(() => {
                                const breakfastPlan = room.ratePlans?.find(
                                  (rp) =>
                                    rp.RateShortName === "Room with Breakfast",
                                );
                                const pricing = getPriceForOccupancy(
                                  breakfastPlan,
                                  selectedRoom.adults,
                                  selectedRoom.children,
                                );
                                return (
                                  <>
                                    <span className="hidden sm:block text-sm font-bold text-gray-900 whitespace-nowrap">
                                      ₹{pricing.offerPrice.toLocaleString()}{" "}
                                      <span className="text-xs font-normal">
                                        + Taxes (per night)
                                      </span>
                                    </span>
                                  </>
                                );
                              })()}
                            </div>

                            {/* Price and Taxes - Mobile Only */}
                            {(() => {
                              const breakfastPlan = room.ratePlans?.find(
                                (rp) =>
                                  rp.RateShortName === "Room with Breakfast",
                              );
                              const pricing = getPriceForOccupancy(
                                breakfastPlan,
                                selectedRoom.adults,
                                selectedRoom.children,
                              );
                              return (
                                <span className="block sm:hidden text-sm font-bold text-gray-900 w-full">
                                  ₹{pricing.offerPrice.toLocaleString()}{" "}
                                  <span className="text-xs font-normal">
                                    + Taxes (per night)
                                  </span>
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        images={room.roomTypeData?.RoomImages || [room.image]}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialIndex={0}
      />
    </div>
  );
};

export default RoomCard;
