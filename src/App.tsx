import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { AdminLayout } from "./components/AdminLayout"
import { AdminGuard } from "./components/AdminGuard"
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
import AdminLogin from "./pages/admin/AdminLogin"
import AdminOverview from "./pages/admin/AdminOverview"
import AdminPages from "./pages/admin/AdminPages"
import AdminPackages from "./pages/admin/AdminPackages"
import AdminDestinations from "./pages/admin/AdminDestinations"
import AdminSuppliers from "./pages/admin/AdminSuppliers"
import AdminDeals from "./pages/admin/AdminDeals"
import AdminBookings from "./pages/admin/AdminBookings"
import AdminQuotes from "./pages/admin/AdminQuotes"
import AdminMessages from "./pages/admin/AdminMessages"
import AdminSupplierApplications from "./pages/admin/AdminSupplierApplications"

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
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
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="destinations" element={<AdminDestinations />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="supplier-applications" element={<AdminSupplierApplications />} />
        </Route>
      </Routes>
    </>
  )
}
