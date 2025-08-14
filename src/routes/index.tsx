import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  Home,
  Wallet,
  Signin,
  Signup,
  Barbers,
  Account,
  Confirm,
  Profile,
  Calendar,
  Services,
  MyBookings,
  DetailsOrder,
} from "@/pages";
import { Loading, ProtectedRoute } from "@/components/elements";

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/barbers" element={<ProtectedRoute><Barbers /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/confirm" element={<ProtectedRoute><Confirm /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/mybookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/detailsorder/:id" element={<ProtectedRoute><DetailsOrder /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};