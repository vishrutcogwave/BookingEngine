import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import { getRefundPolicy } from "../../services/api";

const RefundPolicyPage = () => {
  const [refundPolicy, setRefundPolicy] = useState(null);

  useEffect(() => {
    const fetchRefundPolicy = async () => {
      try {
        const data = await getRefundPolicy();
        setRefundPolicy(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRefundPolicy();
  }, []);

  if (!refundPolicy) return <p className="text-center mt-20">Loading...</p>;

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
            {refundPolicy.Header}
          </h1>

          {/* Display all particulars as a single paragraph */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {refundPolicy.Particulars}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;