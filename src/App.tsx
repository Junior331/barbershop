import { BrowserRouter as Router } from "react-router-dom";

import "./index.css";
import { AppRoutes } from "./routes";
import { AuthWrapper } from "./AuthWrapper";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthWrapper>
          <AppRoutes />
        </AuthWrapper>
      </AuthProvider>
    </Router>
  );
}
