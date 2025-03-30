import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Preload critical modules
const preloadCriticalModules = () => {
  // Preload the Monaco Editor as it's the LCP element
  const preloadMonaco = () => {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = "/node_modules/@monaco-editor/react/dist/esm/index.js";
    document.head.appendChild(link);
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
  requestIdleCallback(() => {
    preloadMonaco();
    preloadFonts();
  });
};

// Start preloading during idle time
if ("requestIdleCallback" in window) {
  preloadCriticalModules();
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(preloadCriticalModules, 1000);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
