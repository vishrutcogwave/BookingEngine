// import './index.css'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import HotelDetailsPage from './components/pages/HotelDetailsPage'
// import ApiTestPage from './components/pages/ApiTestPage'
// import CheckoutPage from './components/pages/CheckoutPage'
// import PaymentSuccessPage from './components/pages/PaymentSuccessPage'
// import { ToastProvider } from './components/context/ToastContext'
// import ToastContainer from './components/ToastContainer'

// function App() {
//   return (
//     <ToastProvider>
//       <Router>
//         <ToastContainer />
//         <Routes>
//           <Route path="/" element={<HotelDetailsPage />} />
//           <Route path="/hotel/:id" element={<HotelDetailsPage />} />
//           <Route path="/checkout" element={<CheckoutPage />} />
//           <Route path="/payment-success" element={<PaymentSuccessPage />} />
//           <Route path="/api-test" element={<ApiTestPage />} />
//         </Routes>
//       </Router>
//     </ToastProvider>
//   )
// }

// export default App

import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HotelDetailsPage from './components/pages/HotelDetailsPage'
import ApiTestPage from './components/pages/ApiTestPage'
import CheckoutPage from './components/pages/CheckoutPage'
import PaymentSuccessPage from './components/pages/PaymentSuccessPage'
import HomeRedirect from './components/pages/HomeRedirect'
import { ToastProvider } from './components/context/ToastContext'
import ToastContainer from './components/ToastContainer'

function App() {
  return (
    <ToastProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/hotel/:id" element={<HotelDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/api-test" element={<ApiTestPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App