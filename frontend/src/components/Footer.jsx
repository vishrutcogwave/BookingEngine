import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-cogwave-blue text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">

        <p className="text-sm">
          © {new Date().getFullYear()} Pousada Getaways. All rights reserved.
        </p>

        <div className="flex gap-6 mt-4 md:mt-0">
          <Link
            to="/privacy-policy"
            className="text-sm hover:underline"
          >
            Privacy Policy
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;