import Navbar from "../Navbar";
import { Phone, MapPin, Mail } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Blue Strip Like Other Pages */}
      <div className="bg-[#123a63] h-20 w-full"></div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 pb-16">

        {/* White Card Container */}
        <div className="bg-white rounded-xl shadow-md p-10 text-center">

          {/* Heading */}
          <h1 className="text-4xl font-serif text-[#123a63] mb-6">
            Plan Your Stay At Pousada
          </h1>

          {/* Description */}
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed mb-12">
            Interested in learning more about our hotel? We would love to show
            you the endless possibilities of our property. Please use the
            contact information or form below to let us know what you think and
            we will get back to you as soon as possible.
          </p>

          {/* 3 Column Section */}
          <div className="grid md:grid-cols-3 gap-10 mt-6">

            {/* CALL US */}
            <div className="flex flex-col items-center">
              <Phone size={40} className="text-[#b89b72] mb-4" />
              <h3 className="text-xl font-semibold text-[#123a63] mb-2">
                CALL US
              </h3>
              <p className="text-gray-700">+91 88558 14503</p>
              <p className="text-gray-700">+91 88558 17503</p>
            </div>

            {/* ADDRESS */}
            <div className="flex flex-col items-center">
              <MapPin size={40} className="text-[#b89b72] mb-4" />
              <h3 className="text-xl font-semibold text-[#123a63] mb-2">
                ADDRESS
              </h3>
              <p className="text-gray-700 text-center">
                Sterling apartment, Vasudeva dempo road,
                <br />
                St. Inez, Panjim, Goa 403001
              </p>
            </div>

            {/* EMAIL US */}
            <div className="flex flex-col items-center">
              <Mail size={40} className="text-[#b89b72] mb-4" />
              <h3 className="text-xl font-semibold text-[#123a63] mb-2">
                EMAIL US
              </h3>
              <p className="text-gray-700">info@pousadagetaways.com</p>
              <p className="text-gray-700">bookings@pousadagetaways.com</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;