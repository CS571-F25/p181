import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SelectedTeamsProvider } from "./contexts/SelectedTeamsContext";
import "bootstrap/dist/css/bootstrap.min.css"; // if using react-bootstrap

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SelectedTeamsProvider>
      <App />
    </SelectedTeamsProvider>
  </React.StrictMode>
);
