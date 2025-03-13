import { BrowserRouter as Router } from "react-router-dom";

// import Provider from "./lib/provider";
import { AppRoutes } from "./routes";

function App() {
  return (
    // <Provider>
    <Router>
      <AppRoutes />
    </Router>
    // </Provider>
  );
}

export default App;
