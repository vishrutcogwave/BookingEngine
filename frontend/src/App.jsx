import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HotelDetailsPage from "./components/pages/HotelDetailsPage";
import ApiTestPage from "./components/pages/ApiTestPage";
import CheckoutPage from "./components/pages/CheckoutPage";
import PaymentSuccessPage from "./components/pages/PaymentSuccessPage";
import HomeRedirect from "./components/pages/HomeRedirect";
import { ToastProvider } from "./components/context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import PrivacyPolicyPage from "./components/pages/PrivacyPolicyPage";
import RefundPolicyPage from "./components/pages/RefundPolicyPage";
import TermsAndConditionsPage from "./components/pages/TermsAndConditionsPage";
import Footer from "./components/Footer";
import ContactPage from "./components/pages/ContactPage";
import HotelDetailsLayout from "./components/HotelDetailsLayout";

function App() {
  return (
    <ToastProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/hotel/:id" element={<HotelDetailsLayout />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/terms-conditions"
            element={<TermsAndConditionsPage />}
          />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
