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
import ItineraryPrint from "./pages/ItineraryPrint"
import Destinations from "./pages/Destinations"
import DestinationDetail from "./pages/DestinationDetail"
import Deals from "./pages/Deals"
import Suppliers from "./pages/Suppliers"
import About from "./pages/About"
import Contact from "./pages/Contact"
import DynamicPage from "./pages/DynamicPage"
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
import AdminPackageDetail from "./pages/admin/AdminPackageDetail"
import AdminDestinations from "./pages/admin/AdminDestinations"
import AdminDestinationDetail from "./pages/admin/AdminDestinationDetail"
import AdminSuppliers from "./pages/admin/AdminSuppliers"
import AdminSupplierDetail from "./pages/admin/AdminSupplierDetail"
import AdminDeals from "./pages/admin/AdminDeals"
import AdminDealDetail from "./pages/admin/AdminDealDetail"
import AdminClients from "./pages/admin/AdminClients"
import AdminClientDetail from "./pages/admin/AdminClientDetail"
import AdminBookings from "./pages/admin/AdminBookings"
import AdminQuotes from "./pages/admin/AdminQuotes"
import AdminMessages from "./pages/admin/AdminMessages"
import AdminSupplierApplications from "./pages/admin/AdminSupplierApplications"
import AdminSettings from "./pages/admin/AdminSettings"
import AdminChat from "./pages/admin/AdminChat"

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
          <Route path="/:slug" element={<DynamicPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/itinerary/:packageId" element={<ItineraryPrint />} />

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
          <Route path="packages/:id" element={<AdminPackageDetail />} />
          <Route path="destinations" element={<AdminDestinations />} />
          <Route path="destinations/:id" element={<AdminDestinationDetail />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="suppliers/:id" element={<AdminSupplierDetail />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="deals/:id" element={<AdminDealDetail />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="clients/:id" element={<AdminClientDetail />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="supplier-applications" element={<AdminSupplierApplications />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>
      </Routes>
    </>
  )
}
