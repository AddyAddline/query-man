import React from "react";
import styled from "styled-components";
import { useTheme } from "../context/ThemeContext";

const ToggleContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ToggleButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  width: 64px;
  height: 32px;
  border-radius: 30px;
  border: 1px solid
    ${({ theme, $isDarkMode }) =>
      $isDarkMode ? theme.border : theme.borderLight};
  background-color: ${({ theme, $isDarkMode }) =>
    $isDarkMode ? theme.background : theme.surfaceAlt};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  box-shadow: inset 0 1px 3px
    ${({ $isDarkMode }) =>
      $isDarkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)"};

  &:hover {
    box-shadow: 0 0 5px
      ${({ theme, $isDarkMode }) =>
        $isDarkMode ? theme.primary + "80" : theme.secondary + "80"};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + "40"};
  }

  @media (max-width: 576px) {
    width: 58px;
    height: 28px;
  }
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 4px;
  left: ${({ $isDarkMode }) => ($isDarkMode ? "34px" : "4px")};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $isDarkMode, theme }) =>
    $isDarkMode
      ? "linear-gradient(135deg, #192333, #111827)"
      : `linear-gradient(135deg, ${theme.secondary}, ${theme.secondaryDark})`};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: ${({ $isDarkMode }) =>
    $isDarkMode ? "scale(1.05) rotate(180deg)" : "scale(1) rotate(0)"};

  @media (max-width: 576px) {
    width: 22px;
    height: 22px;
    top: 3px;
    left: ${({ $isDarkMode }) => ($isDarkMode ? "31px" : "3px")};
  }
`;

const SunIcon = styled.div`
  width: 16px;
  height: 16px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0.3)};
  position: relative;
  transition: opacity 0.3s ease;

  svg {
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const MoonIcon = styled.div`
  width: 16px;
  height: 16px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0.3)};
  position: relative;
  transition: opacity 0.3s ease;

  svg {
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const ThumbIcon = styled.div`
  transform: ${({ $isDarkMode }) =>
    $isDarkMode ? "rotate(0deg)" : "rotate(0)"};
  transition: transform 0.6s ease;
`;

// Enhanced Sun Icon with rays animation
const EnhancedSunIcon = ({ visible }) => (
  <SunIcon $visible={visible}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="#FFB800"
        stroke="#FFA000"
        strokeWidth="0.5"
      />
      <path
        d="M12 1V3M12 21V23M1 12H3M21 12H23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M18.36 5.64L19.78 4.22M4.22 19.78L5.64 18.36"
        stroke="#FFB800"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </SunIcon>
);

// Enhanced Moon Icon with stars
const EnhancedMoonIcon = ({ visible }) => (
  <MoonIcon $visible={visible}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="#243557"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="0.75" fill="white" opacity="0.7" />
      <circle cx="9" cy="14" r="0.5" fill="white" opacity="0.5" />
      <circle cx="16" cy="10" r="0.6" fill="white" opacity="0.6" />
    </svg>
  </MoonIcon>
);

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleContainer>
      <ToggleButton
        $isDarkMode={isDarkMode}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      >
        <EnhancedSunIcon visible={!isDarkMode} />
        <EnhancedMoonIcon visible={isDarkMode} />
        <ToggleThumb $isDarkMode={isDarkMode}>
          <ThumbIcon $isDarkMode={isDarkMode}>
            {isDarkMode ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  fill="#243557"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="5" fill="#FFF9C4" />
                <path
                  d="M12 3V4M12 20V21M3 12H4M20 12H21M5.6 5.6L6.3 6.3M18.4 18.4L19.1 19.1M18.4 5.6L17.7 6.3M5.6 18.4L6.3 17.7"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </ThumbIcon>
        </ToggleThumb>
      </ToggleButton>
    </ToggleContainer>
  );
}

export default ThemeToggle;
