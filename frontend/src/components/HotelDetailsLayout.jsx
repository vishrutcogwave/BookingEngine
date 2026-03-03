import React, { useCallback } from "react";
import Navbar from "./Navbar";
import SearchFilter from "./SearchFilter";
import HotelDetailsPage from "./pages/HotelDetailsPage";


const HotelDetailsLayout = () => {

  const handleSearchFilterChange = useCallback(({ checkIn, checkOut }) => {
    // Dispatch event instead of updating state here
    window.dispatchEvent(
      new CustomEvent("hotel-date-change", {
        detail: { checkIn, checkOut },
      })
    );
  }, []);

 return (
  <div className="min-h-screen bg-clarity-white">
    <Navbar />

    {/* Hero Section with Overlaying Search Filter */}
    <div className="relative">
      {/* Blue Background Strip */}
      <div className="bg-cogwave-blue h-20"></div>

      {/* Overlayed Search */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative -mt-12">
          <SearchFilter
            compact={true}
            onSearch={handleSearchFilterChange}
          />
        </div>
      </div>
    </div>

    {/* Hotel Content */}
    <HotelDetailsPage />
  </div>
);
};

export default HotelDetailsLayout;