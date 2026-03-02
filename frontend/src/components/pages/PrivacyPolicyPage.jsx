import Navbar from "../Navbar";

const PrivacyPolicyPage = () => {
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
            Privacy Policy
          </h1>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Your privacy is very important to us. This Privacy Policy explains
            how we collect, use, and protect your personal information when you
            shop with us.
          </p>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            1. Information We Collect
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Your name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Shipping and billing address</li>
            <li>Payment details (processed securely via third-party gateways)</li>
            <li>Order history and preferences</li>
            <li>Communication or feedback</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            2. How We Use Your Information
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Process and deliver your orders</li>
            <li>Provide customer support</li>
            <li>Send order updates and promotional offers (with consent)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            3. Sharing Your Information
          </h2>

          <p className="text-gray-700 leading-relaxed">
            We do not sell or rent your personal information. Information may
            only be shared with trusted service providers such as delivery
            partners and payment processors or government authorities when
            required by law.
          </p>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            4. Data Security
          </h2>

          <p className="text-gray-700 leading-relaxed">
            We take reasonable steps to protect your personal data. Payments are
            securely handled by trusted payment gateways and not stored on our
            servers.
          </p>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            5. Cookies
          </h2>

          <p className="text-gray-700 leading-relaxed">
            Our website uses cookies to improve browsing experience and
            remember your preferences.
          </p>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            6. Your Rights
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Access or update your personal information</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#123a63] mt-6 mb-3">
            7. Contact Us
          </h2>

          <div className="mt-3 text-gray-700">
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

export default PrivacyPolicyPage;