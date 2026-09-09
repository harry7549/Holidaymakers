import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { ScrollToTop } from "./components/ScrollToTop"
import Home from "./pages/Home"
import Explore from "./pages/Explore"
import PackageDetail from "./pages/PackageDetail"
import BuildTrip from "./pages/BuildTrip"
import Checkout from "./pages/Checkout"
import BookingConfirmation from "./pages/BookingConfirmation"
import Destinations from "./pages/Destinations"
import DestinationDetail from "./pages/DestinationDetail"
import Deals from "./pages/Deals"
import Suppliers from "./pages/Suppliers"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Wishlist from "./pages/Wishlist"
import Compare from "./pages/Compare"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/package/:slug" element={<PackageDetail />} />
          <Route path="/build-trip" element={<BuildTrip />} />
          <Route path="/checkout/:slug" element={<Checkout />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  )
}
