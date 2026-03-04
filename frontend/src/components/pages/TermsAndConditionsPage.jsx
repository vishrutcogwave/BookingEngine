import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import { getTermsAndConditions } from "../../services/api";

const TermsAndConditionsPage = () => {
  const [terms, setTerms] = useState(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getTermsAndConditions();
        setTerms(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTerms();
  }, []);

  if (!terms) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Top Blue Section */}
      <div className="bg-[#123a63] h-20 w-full"></div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 pb-16">
        {/* White Card */}
        <div className="bg-white rounded-xl shadow-md p-10">
          <h1 className="text-3xl font-bold text-[#123a63] mb-6">
            {terms.Header}
          </h1>

          {/* Display all particulars as a single paragraph */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {terms.Particulars}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;