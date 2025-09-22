import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  HomeImproved,
  Wallet,
  Signin,
  Signup,
  Barbers,
  Account,
  Confirm,
  Profile,
  Calendar,
  ServicesImproved,
  BookingConfirmationImproved,
  MyBookings,
  DetailsOrder,
} from "@/pages";
import { Loading, ProtectedRoute, RoleBasedRoute } from "@/components/elements";

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<RoleBasedRoute allowedRoles={['CLIENT']}><HomeImproved /></RoleBasedRoute>} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/barbers" element={<ProtectedRoute><Barbers /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/confirm" element={<ProtectedRoute><Confirm /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><ServicesImproved /></ProtectedRoute>} />
        {/* <Route path="/schedule" element={<ProtectedRoute><ScheduleImproved /></ProtectedRoute>} /> */}
        {/* <Route path="/payment" element={<ProtectedRoute><PaymentImproved /></ProtectedRoute>} /> */}
        <Route path="/booking-confirmation/:appointmentId" element={<ProtectedRoute><BookingConfirmationImproved /></ProtectedRoute>} />
        {/* <Route path="/review/:appointmentId" element={<ProtectedRoute><ReviewImproved /></ProtectedRoute>} /> */}
        <Route path="/mybookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/detailsorder/:id" element={<ProtectedRoute><DetailsOrder /></ProtectedRoute>} />

        {/* Rotas do Barbeiro */}
        {/* <Route path="/barber" element={<RoleBasedRoute allowedRoles={['BARBER', 'ADMIN']}><BarberDashboard /></RoleBasedRoute>} />
        <Route path="/barber/appointments" element={<RoleBasedRoute allowedRoles={['BARBER', 'ADMIN']}><BarberAppointments /></RoleBasedRoute>} /> */}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};