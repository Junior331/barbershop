import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  Wallet,
  Signin,
  Signup,
  Barbers,
  Account,
  Confirm,
  Profile,
  Home,
  Calendar,
  Services,
  BookingConfirmationImproved,
  MyBookings,
  DetailsOrder,
  PaymentSuccess,
  PaymentError,
  PaymentPending,
} from "@/pages";
import { PixPayment } from "@/pages/Payment/PixPayment";
import { CardPayment } from "@/pages/Payment/CardPayment";
import { Loading, ProtectedRoute, RoleBasedRoute } from "@/components/elements";

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<RoleBasedRoute allowedRoles={['CLIENT']}><Home /></RoleBasedRoute>} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/barbers" element={<ProtectedRoute><Barbers /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/confirm" element={<ProtectedRoute><Confirm /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        {/* <Route path="/schedule" element={<ProtectedRoute><ScheduleImproved /></ProtectedRoute>} /> */}
        {/* <Route path="/payment" element={<ProtectedRoute><PaymentImproved /></ProtectedRoute>} /> */}
        <Route path="/booking-confirmation/:appointmentId" element={<ProtectedRoute><BookingConfirmationImproved /></ProtectedRoute>} />
        {/* <Route path="/review/:appointmentId" element={<ProtectedRoute><ReviewImproved /></ProtectedRoute>} /> */}
        <Route path="/mybookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/detailsorder/:id" element={<ProtectedRoute><DetailsOrder /></ProtectedRoute>} />

        {/* Payment Result Routes */}
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment/error" element={<ProtectedRoute><PaymentError /></ProtectedRoute>} />
        <Route path="/payment/pending" element={<ProtectedRoute><PaymentPending /></ProtectedRoute>} />

        {/* Checkout Transparente Routes */}
        <Route path="/payment/pix/:appointmentId" element={<ProtectedRoute><PixPayment /></ProtectedRoute>} />
        <Route path="/payment/card/:appointmentId" element={<ProtectedRoute><CardPayment /></ProtectedRoute>} />

        {/* Rotas do Barbeiro */}
        {/* <Route path="/barber" element={<RoleBasedRoute allowedRoles={['BARBER', 'ADMIN']}><BarberDashboard /></RoleBasedRoute>} />
        <Route path="/barber/appointments" element={<RoleBasedRoute allowedRoles={['BARBER', 'ADMIN']}><BarberAppointments /></RoleBasedRoute>} /> */}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};