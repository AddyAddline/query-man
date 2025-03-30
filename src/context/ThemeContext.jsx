import React, { createContext, useState, useContext, useEffect } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

// Define our theme colors
const lightTheme = {
  primary: "#4caf50", // green
  primaryLight: "#80e27e",
  primaryDark: "#087f23",
  secondary: "#2196f3", // blue
  secondaryDark: "#0d6efd",
  tertiary: "#673ab7", // purple
  tertiaryDark: "#5e35b1",
  background: "#ffffff",
  surface: "#f5f5f5",
  border: "#e0e0e0",
  hover: "rgba(0, 0, 0, 0.04)",
  active: "rgba(0, 0, 0, 0.08)",
  text: {
    primary: "#333333",
    secondary: "#666666",
    disabled: "#999999",
    inverse: "#ffffff",
  },
  error: "#f44336",
  warning: "#ff9800",
  info: "#2196f3",
  success: "#4caf50",
  // Shadow/elevation tokens
  shadow: {
    small: "0 2px 4px rgba(0, 0, 0, 0.1)",
    medium: "0 4px 8px rgba(0, 0, 0, 0.12)",
    large: "0 8px 16px rgba(0, 0, 0, 0.14)",
  },
  // Animation tokens
  animation: {
    fast: "0.2s ease",
    medium: "0.3s ease",
    slow: "0.5s ease-in-out",
  },
};

const darkTheme = {
  primary: "#4caf50", // green
  primaryLight: "#80e27e",
  primaryDark: "#087f23",
  secondary: "#2196f3", // blue
  secondaryDark: "#0d6efd",
  tertiary: "#9c64ff", // purple
  tertiaryDark: "#8c52e5",
  background: "#121212",
  surface: "#1e1e1e",
  border: "#333333",
  hover: "rgba(255, 255, 255, 0.07)",
  active: "rgba(255, 255, 255, 0.12)",
  text: {
    primary: "#ffffff",
    secondary: "#b3b3b3",
    disabled: "#666666",
    inverse: "#121212",
  },
  error: "#f44336",
  warning: "#ff9800",
  info: "#2196f3",
  success: "#4caf50",
  // Shadow/elevation tokens
  shadow: {
    small: "0 2px 4px rgba(0, 0, 0, 0.3)",
    medium: "0 4px 8px rgba(0, 0, 0, 0.35)",
    large: "0 8px 16px rgba(0, 0, 0, 0.4)",
  },
  // Animation tokens
  animation: {
    fast: "0.2s ease",
    medium: "0.3s ease",
    slow: "0.5s ease-in-out",
  },
};

// Create context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: lightTheme,
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export function ThemeProvider({ children }) {
  // Check if user prefers dark mode or has a saved preference
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedThemePreference = localStorage.getItem("theme");

  const [isDarkMode, setIsDarkMode] = useState(
    savedThemePreference ? savedThemePreference === "dark" : prefersDarkMode
  );

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Current theme based on mode
  const theme = isDarkMode
    ? { ...darkTheme, isDarkMode: true }
    : { ...lightTheme, isDarkMode: false };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
