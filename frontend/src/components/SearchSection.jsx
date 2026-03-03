import React from "react";
import SearchFilter from "./SearchFilter";


const SearchSection = React.memo(({ onSearch }) => {
  console.log("SearchSection rendered");

  return (
    <div className="relative">
      <div className="bg-cogwave-blue h-20"></div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="relative -mt-12">
          <SearchFilter compact={true} onSearch={onSearch} />
        </div>
      </div>
    </div>
  );
});

export default SearchSection;