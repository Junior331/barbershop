import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "../i18n.tsx";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Suprimir erros conhecidos de extensões do Chrome
window.addEventListener('error', (event) => {
  if (event.error && event.error.message &&
      event.error.message.includes('message channel closed')) {
    event.preventDefault();
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message &&
      event.reason.message.includes('message channel closed')) {
    event.preventDefault();
    return;
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
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
    </BrowserRouter>
  </React.StrictMode>
);
