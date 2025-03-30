import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Preload critical modules
const preloadCriticalModules = () => {
  // Preload the Monaco Editor as it's the LCP element
  const preloadMonaco = () => {
    // Instead of direct node_modules path, use the same path as in the import
    // This allows Vite to resolve it correctly
    try {
      import("@monaco-editor/react")
        .then(() => console.log("Monaco editor preloaded successfully"))
        .catch((err) => console.warn("Monaco editor preload failed:", err));
    } catch (e) {
      console.warn("Module preloading not supported", e);
    }
  };

  // Add font preload
  const preloadFonts = () => {
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap";
    fontLink.as = "style";
    document.head.appendChild(fontLink);
  };

  // Execute preloads
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      preloadMonaco();
      preloadFonts();
    });
  } else {
    setTimeout(() => {
      preloadMonaco();
      preloadFonts();
    }, 1000);
  }
};

// Start preloading immediately
preloadCriticalModules();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
