import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SelectedTeamsProvider } from "./contexts/SelectedTeamsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "bootstrap/dist/css/bootstrap.min.css"; // if using react-bootstrap

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SelectedTeamsProvider>
        <App />
      </SelectedTeamsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
