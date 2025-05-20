import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "../i18n.tsx";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./lib/provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <App />
      <Toaster position="top-right" />
    </Provider>
  </React.StrictMode>
);
