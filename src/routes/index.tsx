import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Home, Wallet, Calendar, Account, Profile, Signin } from "@/pages";
import { Loading } from "@/components/elements";

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route index element={<Signin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};
