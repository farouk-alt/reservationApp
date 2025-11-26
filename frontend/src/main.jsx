import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
// import { reportWebVitals } from './reportWebVitals';

// reportWebVitals((metric) => {
//   fetch("http://reservation.local/api/web-vitals", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(metric),
//   });
// });


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
