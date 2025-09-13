import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}
