import Navbar from "../Navbar";

const RefundPolicyPage = () => {
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
            Refund Policy
          </h1>

          <p className="text-gray-700 leading-relaxed mb-6">
            Thank you for choosing our services. Please read our refund policy carefully before making any purchase.
          </p>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            No Refund Policy
          </h2>

          <p className="text-gray-700 leading-relaxed">
            All our services are non-refundable. Once a booking or payment has been made, it cannot be canceled, refunded, or transferred under any circumstances.
          </p>

          <p className="text-gray-700 leading-relaxed mt-4">
            By purchasing or booking through our platform, you acknowledge and agree to this refund policy.
          </p>

          <h2 className="text-xl font-semibold text-[#123a63] mt-8 mb-3">
            Contact Us
          </h2>

          <div className="text-gray-700 space-y-1">
            <p className="font-semibold">POUSADA GETAWAYS</p>
            <p>📞 +91 88558 14503</p>
            <p>📞 +91 88558 17503</p>
            <p>📧 info@pousadagetaways.com</p>
            <p>📧 bookings@pousadagetaways.com</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;