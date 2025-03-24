import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  Home,
  Wallet,
  Signin,
  Barbers,
  Account,
  Confirm,
  Profile,
  Calendar,
  Services,
  EditOrder,
  MyBookings,
} from "@/pages";
import { Loading } from "@/components/elements";

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<Signin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/barbers" element={<Barbers />} />
        <Route path="/account" element={<Account />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/services" element={<Services />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/editorder/:id" element={<EditOrder />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};
