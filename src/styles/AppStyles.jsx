import styled from "styled-components";

// Fallback components for lazy loading
export const LoadingFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  opacity: 0.7;
`;

export const EditorFallback = styled(LoadingFallback)`
  min-height: 200px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
`;

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  overflow: hidden;
`;

export const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
`;

// Left sidebar for database explorer
export const Sidebar = styled.div`
  width: ${({ $width }) => $width || "250px"};
  border-right: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#252526" : "#f0f0f0"};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;

  @media (max-width: 768px) {
    width: ${({ $isOpen }) => ($isOpen ? "250px" : "0")};
    position: ${({ $isOpen }) => ($isOpen ? "fixed" : "static")};
    height: 100%;
    z-index: 100;
    transition: width 0.3s ease;
  }
`;

// Sidebar resize handle
export const SidebarResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.2s;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 30px;
    width: 3px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.border};
  }

  &:hover,
  &:active {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

    &::after {
      background-color: ${({ theme }) => theme.primary};
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// Container for the sidebar sections (explorer and history)
export const SidebarSections = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

// Sidebar tabs for navigation
export const SidebarTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

export const SidebarTab = styled.button`
  flex: 1;
  padding: 12px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.primary : "transparent")};
  color: ${({ $active, theme }) =>
    $active ? theme.primary : theme.text.secondary};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

export const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  display: ${({ $active }) => ($active ? "block" : "none")};
  height: 100%;
`;

// Main content area with editor and results
export const EditorResultsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  width: 100%;
`;

// Tabs for editor/results
export const NavTabs = styled.div`
  display: flex;
  background: ${({ theme }) =>
    theme.isDarkMode ? "#252526" : theme.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 0;
  height: 36px;
  width: 100%;
`;

export const NavTab = styled.button`
  padding: 0 16px;
  height: 36px;
  background: ${({ $active, theme }) =>
    $active ? theme.surface : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.primary : theme.text.secondary};
  border: none;
  border-right: 1px solid ${({ theme }) => theme.border};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: ${({ $active, theme }) =>
      !$active && (theme.isDarkMode ? "#2a2a2a" : theme.surfaceAlt)};
  }
`;

// Query editor section
export const EditorSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: ${({ theme, $fullHeight }) =>
    $fullHeight ? "none" : `1px solid ${theme.border}`};
  height: ${({ $fullHeight }) => ($fullHeight ? "100%" : "50%")};
  min-height: ${({ $fullHeight }) => ($fullHeight ? "100%" : "250px")};
  overflow: hidden;
  width: 100%;
  position: relative;
`;

// Results section
export const ResultsSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: ${({ $fullHeight }) => ($fullHeight ? "100%" : "50%")};
  min-height: ${({ $fullHeight }) => ($fullHeight ? "100%" : "250px")};
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  width: 100%;

  /* Add background styling for fullscreen mode */
  &[style*="position: absolute"] {
    background-color: ${({ theme }) => theme.background};
  }
`;

// Horizontal layout for wide screens
export const SplitView = styled.div`
  display: flex;
  flex-direction: ${({ $direction }) =>
    $direction === "vertical" ? "column" : "row"};
  flex: 1;
  overflow: hidden;
  width: 100%;
  position: relative;
`;

// Resize handle
export const ResizeHandle = styled.div`
  position: absolute;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
  z-index: 10;
  transition: background-color 0.2s;

  &:hover,
  &:active {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

    &::after {
      background-color: ${({ theme }) => theme.primary};
    }
  }

  /* Horizontal handle for column layout */
  ${({ $direction }) =>
    $direction === "vertical" &&
    `
    left: 0;
    right: 0;
    height: 6px;
    cursor: row-resize;
    top: 50%;
    transform: translateY(-50%);

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 3px;
      border-radius: 3px;
      background-color: var(--border-color);
    }
  `}

  /* Vertical handle for row layout */
  ${({ $direction }) =>
    $direction === "horizontal" &&
    `
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    left: 50%;
    transform: translateX(-50%);

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: 30px;
      width: 3px;
      border-radius: 3px;
      background-color: var(--border-color);
    }
  `}

  @media (max-width: 768px) {
    display: none;
  }
`;

// Create a ClearButton component for clear all functionality
export const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.error};
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 576px) {
    padding: 4px;
    span {
      display: none;
    }
  }
`;

// Create a VisualizationButton component for visualization
export const VisualizationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.text.primary};
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 576px) {
    padding: 4px;
    span {
      display: none;
    }
  }
`;

// Create a SaveButton component for save functionality
export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.text.primary};
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 576px) {
    padding: 4px;
    span {
      display: none;
    }
  }
`;

// Add a styled component for the notification
export const QueryChangeNotification = styled.div`
  display: flex;
  align-items: center;
  margin-left: 12px;
  padding: 6px 10px;
  background-color: ${({ theme }) => theme.info + "20"};
  border-left: 3px solid ${({ theme }) => theme.info};
  border-radius: 4px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 12px;
  gap: 6px;
  max-width: 300px;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.info};
  }

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 4px 8px;
  }

  @media (max-width: 576px) {
    display: none;
  }
`;

// Add a styled component for the empty results placeholder
export const EmptyResultsPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  height: 100%;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  h3 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 14px;
    max-width: 300px;
  }
`;

// Run button with better styling
export const RunButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  margin-left: auto;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: ${({ theme }) => theme.shadow.small};

  &:hover {
    background-color: ${({ theme }) => theme.primaryDark};
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 576px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

// Editor toolbar
export const EditorToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#252526" : theme.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  min-height: 48px;
  width: 100%;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 8px;
    gap: 4px;
  }
`;

// Results toolbar
export const ResultsToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#252526" : theme.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  min-height: 40px;
  width: 100%;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

export const ResultsTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 1;
  min-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    color: ${({ theme }) => theme.primary};
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 576px) {
    font-size: 12px;
  }
`;

export const ToolbarActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

// Mobile navigation and controls
export const MobileBar = styled.div`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.surface};
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 8px 16px;
  z-index: 99;
  justify-content: space-around;

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const MobileButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ $active, theme }) =>
    $active ? theme.primary : theme.text.secondary};
  font-size: 12px;
  padding: 8px;
  cursor: pointer;

  svg {
    margin-bottom: 4px;
    font-size: 18px;
  }
`;

// Toggle button for sidebar on mobile
export const SidebarToggle = styled.button`
  display: none;
  position: fixed;
  left: ${({ $isOpen }) => ($isOpen ? "280px" : "0")};
  top: 70px;
  z-index: 101;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: left 0.3s ease;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 15px;

  svg {
    margin-right: 8px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.error + "15"};
  border-left: 4px solid ${({ theme }) => theme.error};
  color: ${({ theme }) => theme.text.primary};
  padding: 16px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: ${({ theme }) => theme.error};
    min-width: 20px;
  }

  @media (max-width: 576px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`;

// Mobile-friendly history for small screens
export const MobileHistoryOverlay = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
`;

export const MobileHistoryPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  background-color: ${({ theme }) => theme.background};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  animation: slide-up 0.3s ease;

  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

export const MobileHistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

// Add these styled components after NavTab:
export const EditorTabsBar = styled.div`
  display: flex;
  background: ${({ theme }) =>
    theme.isDarkMode ? "#252526" : theme.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  height: 36px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const EditorTab = styled.div`
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background: ${({ $active, theme }) =>
    $active ? theme.surface : "transparent"};
  border-right: 1px solid ${({ theme }) => theme.border};
  color: ${({ $active, theme }) =>
    $active
      ? theme.isDarkMode
        ? theme.text.primary
        : theme.text.primary
      : theme.text.secondary};
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${({ $active, theme }) =>
      !$active && (theme.isDarkMode ? "#2a2a2a" : theme.surfaceAlt)};
  }
`;

export const TabName = styled.span`
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;

  /* Add a small pen icon after renamed tabs */
  ${(props) =>
    props.$renamed &&
    `
    &::after {
      content: '✎';
      font-size: 10px;
      margin-left: 4px;
      opacity: 0.5;
      position: relative;
      top: -1px;
    }
  `}
`;

export const TabActions = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  ${EditorTab}:hover & {
    opacity: 1;
  }
`;

export const TabCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.text.secondary};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
    color: ${({ theme }) => theme.text.primary};
  }
`;

export const NewTabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  color: ${({ theme }) => theme.text.secondary};
  border: none;
  border-right: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
    color: ${({ theme }) => theme.text.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Add these styled components for the layout toggle
export const LayoutToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.text.primary};
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 576px) {
    padding: 4px;
    span {
      display: none;
    }
  }
`;

// Add a full-screen toggle button for the results
export const FullScreenButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.text.primary};
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 576px) {
    padding: 4px;
    span {
      display: none;
    }
  }
`;
