import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootEl = document.getElementById("root");

if (rootEl && rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, <App />);
} else if (rootEl) {
  createRoot(rootEl).render(<App />);
}
