import { useState, useEffect, lazy, Suspense, useRef } from "react";
import styled from "styled-components";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalStyles from "./styles/GlobalStyles";
import Header from "./components/Header";
import QuerySelector from "./components/QuerySelector";
import { predefinedQueries } from "./data/mockData";
import useSQLQuery from "./hooks/useSQLQuery";
import { nanoid } from "nanoid";

// Lazy load all heavy components
const SQLEditor = lazy(() => import("./components/SQLEditor"));
const DatabaseExplorer = lazy(() => import("./components/DatabaseExplorer"));
const ResultTable = lazy(() => import("./components/ResultTable"));
const ResultVisualization = lazy(() =>
  import("./components/ResultVisualization")
);
const QueryHistory = lazy(() => import("./components/QueryHistory"));
const DownloadOptions = lazy(() => import("./components/DownloadOptions"));
const KeyboardShortcuts = lazy(() => import("./components/KeyboardShortcuts"));

// Create lightweight fallback components
const LoadingFallback = styled.div`
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

const EditorFallback = styled(LoadingFallback)`
  min-height: 200px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  overflow: hidden;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
`;

// Left sidebar for database explorer
const Sidebar = styled.div`
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
const SidebarResizeHandle = styled.div`
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
const SidebarSections = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

// Sidebar tabs for navigation
const SidebarTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const SidebarTab = styled.button`
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

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  display: ${({ $active }) => ($active ? "block" : "none")};
  height: 100%;
`;

// Main content area with editor and results
const EditorResultsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  width: 100%;
`;

// Tabs for editor/results
const NavTabs = styled.div`
  display: flex;
  background: ${({ theme }) =>
    theme.isDarkMode ? "#252526" : theme.surfaceAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 0;
  height: 36px;
  width: 100%;
`;

const NavTab = styled.button`
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
const EditorSection = styled.div`
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
const ResultsSection = styled.div`
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
const SplitView = styled.div`
  display: flex;
  flex-direction: ${({ $direction }) =>
    $direction === "vertical" ? "column" : "row"};
  flex: 1;
  overflow: hidden;
  width: 100%;
  position: relative;
`;

// Resize handle
const ResizeHandle = styled.div`
  position: absolute;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
  z-index: 10;
  transition: background-color 0.2s;

  ${({ $direction }) =>
    $direction === "vertical"
      ? `
      left: 0;
      right: 0;
      height: 6px;
      cursor: row-resize;
      top: ${(props) => props.$position || "50%"};
      &::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 3px;
        border-radius: 3px;
        background-color: ${(props) => props.theme.border};
      }
    `
      : `
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      left: ${(props) => props.$position || "50%"};
      &::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        height: 30px;
        width: 3px;
        border-radius: 3px;
        background-color: ${(props) => props.theme.border};
      }
    `}

  &:hover {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

    &::after {
      background-color: ${({ theme }) => theme.primary};
    }
  }

  &:active {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"};

    &::after {
      background-color: ${({ theme }) => theme.primary};
    }
  }
`;

// Run button with better styling
const RunButton = styled.button`
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
const EditorToolbar = styled.div`
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
const ResultsToolbar = styled.div`
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

const ResultsTitle = styled.div`
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

const ToolbarActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

// Mobile navigation and controls
const MobileBar = styled.div`
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

const MobileButton = styled.button`
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
const SidebarToggle = styled.button`
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

const LoadingIndicator = styled.div`
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

const ErrorMessage = styled.div`
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
const MobileHistoryOverlay = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
`;

const MobileHistoryPanel = styled.div`
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

const MobileHistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

// Add these styled components after NavTab:
const EditorTabsBar = styled.div`
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

const EditorTab = styled.div`
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

const TabName = styled.span`
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

const TabActions = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  ${EditorTab}:hover & {
    opacity: 1;
  }
`;

const TabCloseButton = styled.button`
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

const NewTabButton = styled.button`
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
const LayoutToggle = styled.button`
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
const FullScreenButton = styled.button`
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

// Create a ClearButton component for clear all functionality
const ClearButton = styled.button`
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
const VisualizationButton = styled.button`
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
const SaveButton = styled.button`
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
const QueryChangeNotification = styled.div`
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
const EmptyResultsPlaceholder = styled.div`
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

function App() {
  const [currentQueryId, setCurrentQueryId] = useState(predefinedQueries[0].id);
  const [queryText, setQueryText] = useState(predefinedQueries[0].query);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState("explorer");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  // Add new state for query tabs
  const [queryTabs, setQueryTabs] = useState([
    {
      id: nanoid(),
      name: "New Query",
      queryId: predefinedQueries[0].id,
      query: predefinedQueries[0].query,
      renamed: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(queryTabs[0].id);

  // Add state for tab renaming
  const [editingTabId, setEditingTabId] = useState(null);
  const [newTabName, setNewTabName] = useState("");
  const tabInputRef = useRef(null);

  // Add state for output tabs
  const [outputTabs, setOutputTabs] = useState([]);
  const [activeOutputTabId, setActiveOutputTabId] = useState(null);

  // Modify to store results per tab
  const [tabResults, setTabResults] = useState({});

  // Add state to track tab types (results or visualization)
  const [tabTypes, setTabTypes] = useState({});

  // Get the active tab's results
  const activeTabResults = activeOutputTabId
    ? tabResults[activeOutputTabId]
    : null;

  // Get the active tab
  const activeTab =
    queryTabs.find((tab) => tab.id === activeTabId) || queryTabs[0];

  // Track previous sidebar tab to restore after query execution
  const prevSidebarTabRef = useRef(activeSidebarTab);

  useEffect(() => {
    prevSidebarTabRef.current = activeSidebarTab;
  }, [activeSidebarTab]);

  // Tracking refs to prevent circular updates
  const isUpdatingQuery = useRef(false);
  const isUpdatingTab = useRef(false);

  // Sync the active tab with currentQueryId and queryText
  useEffect(() => {
    // Skip if we're in the middle of updating the tab content
    if (isUpdatingQuery.current) return;

    // Set the flag to indicate we're updating from this hook
    isUpdatingTab.current = true;

    // Set the current query state based on the active tab
    setCurrentQueryId(activeTab.queryId);
    setQueryText(activeTab.query);

    // Clear the flag after the update
    setTimeout(() => {
      isUpdatingTab.current = false;
    }, 0);
  }, [activeTabId, activeTab]);

  // Update the active tab when query changes
  useEffect(() => {
    // Skip if we're in the middle of updating query from the tab sync
    if (isUpdatingTab.current) return;

    // Set the flag to indicate we're updating from this hook
    isUpdatingQuery.current = true;

    // Find the active tab and check if query has changed
    const tab = queryTabs.find((t) => t.id === activeTabId);
    if (tab && (tab.query !== queryText || tab.queryId !== currentQueryId)) {
      setQueryTabs((tabs) =>
        tabs.map((t) =>
          t.id === activeTabId
            ? { ...t, query: queryText, queryId: currentQueryId }
            : t
        )
      );
    }

    // Clear the flag after the update
    setTimeout(() => {
      isUpdatingQuery.current = false;
    }, 0);
  }, [queryText, currentQueryId, activeTabId, queryTabs]);

  // Modify the Set tab name based on query effect to respect manually renamed tabs
  useEffect(() => {
    // Skip if we're in the middle of other updates
    if (isUpdatingTab.current || isUpdatingQuery.current) return;

    // Find the active tab
    const tab = queryTabs.find((t) => t.id === activeTabId);
    if (!tab) return;

    // Skip if the tab has been manually renamed
    if (tab.renamed) return;

    const query = tab.query.trim();
    let tabName = "New Query";

    // Try to extract the first SQL keyword and table name
    const match = query.match(
      /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+(?:.*?FROM\s+)?([^\s;]+)/i
    );

    if (match) {
      const [, action, target] = match;
      tabName = `${action} ${target}`;
    }

    if (tabName !== tab.name) {
      setQueryTabs((tabs) =>
        tabs.map((t) => (t.id === activeTabId ? { ...t, name: tabName } : t))
      );
    }
  }, [activeTabId, queryTabs]);

  // Use the custom SQL query hook
  const {
    results,
    loading,
    error: sqlError,
    executionTime,
    queryHistory,
    executeQuery,
    clearResults,
  } = useSQLQuery();

  // Find current query details
  const currentQuery = predefinedQueries.find((q) => q.id === currentQueryId);

  // Add new error state to display custom error messages
  const [customError, setCustomError] = useState(null);

  // Combined error for UI display
  const displayError = customError || sqlError;

  // Clear error on query change
  useEffect(() => {
    if (customError) {
      setCustomError(null);
    }
  }, [queryText]);

  // Add state to track if the query has been modified but not executed
  const [queryModified, setQueryModified] = useState(false);

  // Update the handleQueryChange function to set queryModified
  const handleQueryChange = (queryId) => {
    const query = predefinedQueries.find((q) => q.id === queryId);
    if (query) {
      // Get the current tab to check if it's been renamed
      const currentTab = queryTabs.find((tab) => tab.id === activeTabId);
      const isRenamed = currentTab?.renamed || false;

      // Update the active tab with the new query
      setQueryTabs((tabs) =>
        tabs.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                name: isRenamed ? tab.name : query.name,
                queryId: queryId,
                query: query.query,
                // Keep the renamed flag
                renamed: isRenamed,
              }
            : tab
        )
      );

      setCurrentQueryId(queryId);
      setQueryText(query.query);
      // Don't clear results when changing queries
      setCustomError(null); // Clear any custom errors when changing queries

      // Set the query modified flag to show notification
      setQueryModified(true);
    }
  };

  // Add a function to explicitly clear results
  const handleClearResults = () => {
    // If in fullscreen mode, exit fullscreen when clearing results
    if (isFullScreen) {
      setIsFullScreen(false);
    }

    // Show confirmation dialog that this will close all output tabs
    const confirmClear = window.confirm(
      "This will close all output tabs. Are you sure you want to continue?"
    );
    if (!confirmClear) return;

    // Clear all output tabs
    setOutputTabs([]);
    setActiveOutputTabId(null);

    // Clear all tab results
    setTabResults({});

    // Clear all tab types
    setTabTypes({});

    clearResults();
  };

  // Function to create a visualization tab
  const createVisualizationTab = (sourceTabId) => {
    // Find the source tab
    const sourceTab = outputTabs.find((tab) => tab.id === sourceTabId);
    if (!sourceTab || !tabResults[sourceTabId]) return;

    // Create a new tab ID
    const visualizationTabId = nanoid();

    // Create a new visualization tab with reference to the source tab's data
    const visualizationTab = {
      id: visualizationTabId,
      name: `${sourceTab.name} Visualization`,
      queryId: sourceTab.queryId,
      queryTabId: sourceTab.queryTabId,
      sourceTabId: sourceTabId, // Reference to the source tab
      timestamp: new Date(),
    };

    // Add the new tab and set it as active
    setOutputTabs((prevTabs) => [...prevTabs, visualizationTab]);
    setActiveOutputTabId(visualizationTabId);

    // Mark this tab as a visualization tab
    setTabTypes((prevTypes) => ({
      ...prevTypes,
      [visualizationTabId]: "visualization",
    }));

    // Copy the data from the source tab to this visualization tab
    setTabResults((prevResults) => ({
      ...prevResults,
      [visualizationTabId]: prevResults[sourceTabId],
    }));
  };

  // Update the handleExecuteQuery to reset queryModified
  const handleExecuteQuery = (query) => {
    // Clear any previous custom errors
    setCustomError(null);

    // Reset query modified state
    setQueryModified(false);

    // Check if the query text matches any predefined query
    const matchingQuery = predefinedQueries.find(
      (q) => q.query.trim() === query.trim()
    );

    if (matchingQuery) {
      // Get the current tab name to use for the output tab
      const currentTab = queryTabs.find((tab) => tab.id === activeTabId);
      const outputTabName = `${currentTab.name} Output`;
      const outputTabId = nanoid();

      // Create a new output tab
      const newOutputTab = {
        id: outputTabId,
        name: outputTabName,
        queryId: matchingQuery.id,
        queryTabId: activeTabId,
        timestamp: new Date(),
      };

      // Add to output tabs and set as active
      setOutputTabs((prevTabs) => [...prevTabs, newOutputTab]);
      setActiveOutputTabId(outputTabId);

      // Mark this as a results tab
      setTabTypes((prevTypes) => ({
        ...prevTypes,
        [outputTabId]: "results",
      }));

      // If the query matches a different predefined query, switch to that query
      if (matchingQuery.id !== currentQueryId) {
        setCurrentQueryId(matchingQuery.id);
      }

      // Store the results in tabResults when they arrive
      const onQueryComplete = (queryResults) => {
        if (queryResults) {
          setTabResults((prevResults) => ({
            ...prevResults,
            [outputTabId]: {
              data: queryResults,
              executionTime,
            },
          }));
        }
      };

      // Execute with the matching query ID to get correct results
      executeQuery(query, matchingQuery.id, currentTab.name, onQueryComplete);

      // On mobile, close sidebar if open
      if (window.innerWidth <= 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    } else {
      // Query text doesn't match any predefined query
      setCustomError(
        "You can only execute queries from the predefined list. Please select a query from the dropdown."
      );
    }
  };

  // Handle query selector change
  useEffect(() => {
    // Reset the query text when current query changes
    const query = predefinedQueries.find((q) => q.id === currentQueryId);
    if (query) {
      setQueryText(query.query);
    }
  }, [currentQueryId]);

  // Modify the history selection to respect renamed flag
  const handleHistorySelect = (historyItem, shouldExecute = false) => {
    // Clear any custom errors
    setCustomError(null);

    // Verify the history item's query still matches a predefined query
    const matchingQuery = predefinedQueries.find(
      (q) => q.id === historyItem.queryId
    );

    if (matchingQuery) {
      // Create a new tab for the history item
      const newTab = {
        id: nanoid(),
        name: `${matchingQuery.name}`,
        queryId: historyItem.queryId,
        query: historyItem.query,
        renamed: false,
      };

      // Add tab and make it active
      setQueryTabs((prevTabs) => [...prevTabs, newTab]);
      setActiveTabId(newTab.id);
      setActivePanel("editor-panel");

      // Close mobile history panel if open
      setMobileHistoryOpen(false);

      // If shouldExecute is true, also run the query and create an output tab
      if (shouldExecute) {
        // Generate a unique ID for the new output tab
        const outputTabId = nanoid();

        // Create a callback to handle the query results
        const onQueryComplete = (queryResults) => {
          if (queryResults) {
            // Store the results in state
            setTabResults((prevResults) => ({
              ...prevResults,
              [outputTabId]: {
                data: queryResults,
                executionTime: executionTime,
              },
            }));

            // Create a new output tab
            const newOutputTab = {
              id: outputTabId,
              name: `${matchingQuery.name} Results`,
              queryId: historyItem.queryId,
              sourceTabId: newTab.id,
              timestamp: new Date().toISOString(),
            };

            // Add the new output tab and make it active
            setOutputTabs((prevTabs) => [...prevTabs, newOutputTab]);
            setActiveOutputTabId(outputTabId);
            setActivePanel("results-panel");
          }
        };

        // Execute the query with our callback
        executeQuery(
          historyItem.query,
          historyItem.queryId,
          newTab.name,
          onQueryComplete
        );
      }
    } else {
      // This would be rare but could happen if predefined queries were changed
      setCustomError(
        "Cannot load this query from history as it's no longer in the predefined list."
      );
    }
  };

  // Modify the handle table click to initialize with renamed flag
  const handleTableClick = (tableName, customSQL) => {
    const newQuery = customSQL || `SELECT * FROM ${tableName} LIMIT 100;`;

    // Find if this matches a predefined query
    const matchingQuery = predefinedQueries.find(
      (q) => q.query.trim() === newQuery.trim()
    );

    const queryId = matchingQuery ? matchingQuery.id : "";

    // Create a new tab for the selected table
    const newTab = {
      id: nanoid(),
      name: `SELECT ${tableName}`,
      queryId: queryId,
      query: newQuery,
      renamed: false,
    };

    setQueryTabs([...queryTabs, newTab]);
    setActiveTabId(newTab.id);

    // Close sidebar on mobile after selecting a table
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Track which panel is currently visible in tabbed mode
  const [activePanel, setActivePanel] = useState("editor-panel");

  // Toggle between vertical and horizontal layout
  const [layoutDirection, setLayoutDirection] = useState("vertical"); // "vertical" or "horizontal"

  // Add state for full-screen mode
  const [isFullScreen, setIsFullScreen] = useState(false);

  // For resize functionality - adjust min and max to be more reasonable
  const [splitSize, setSplitSize] = useState(60); // percentage - default to editor being larger
  const resizeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  // Toggle layout direction
  const toggleLayoutDirection = () => {
    // Exit full screen mode first if enabled
    if (isFullScreen) {
      setIsFullScreen(false);
    }

    setLayoutDirection((prev) =>
      prev === "vertical" ? "horizontal" : "vertical"
    );
  };

  // Toggle full-screen mode for results
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Toggle the output display mode
  const toggleOutputMode = () => {
    // Exit full screen mode first if enabled
    if (isFullScreen) {
      setIsFullScreen(false);
    }

    // Then toggle the layout direction
    toggleLayoutDirection();

    // When switching to horizontal, make sure we're displaying results
    if (layoutDirection === "vertical" && results && !loading) {
      setActivePanel("results-panel");
    }
  };

  // Handle resize start
  const handleResizeStart = (e) => {
    isDraggingRef.current = true;
    document.body.style.cursor =
      layoutDirection === "vertical" ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
    startPosRef.current =
      layoutDirection === "vertical" ? e.clientY : e.clientX;
    startSizeRef.current = splitSize;

    // Add event listeners
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  // Handle resize with better boundaries
  const handleResize = (e) => {
    if (!isDraggingRef.current) return;

    const container = resizeRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();

    let newSplitSize;

    if (layoutDirection === "vertical") {
      const deltaY = e.clientY - startPosRef.current;
      const containerHeight = containerRect.height;

      // Stricter minimum sizes in pixels to ensure elements fit properly
      const minSizeInPixels = 200; // minimum pixels for editor
      const maxSizeInPixels = containerHeight - 200; // ensure result panel has at least 200px

      const currentSizeInPixels =
        (containerHeight * startSizeRef.current) / 100;
      const newSizeInPixels = currentSizeInPixels + deltaY;

      // Convert back to percentage but with pixel-based boundaries
      if (newSizeInPixels < minSizeInPixels) {
        newSplitSize = (minSizeInPixels / containerHeight) * 100;
      } else if (newSizeInPixels > maxSizeInPixels) {
        newSplitSize = (maxSizeInPixels / containerHeight) * 100;
      } else {
        newSplitSize = (newSizeInPixels / containerHeight) * 100;
      }
    } else {
      const deltaX = e.clientX - startPosRef.current;
      const containerWidth = containerRect.width;

      // Stricter minimum sizes in pixels for horizontal layout
      const minSizeInPixels = 300; // minimum pixels for editor
      const maxSizeInPixels = containerWidth - 300; // ensure result panel has at least 300px

      const currentSizeInPixels = (containerWidth * startSizeRef.current) / 100;
      const newSizeInPixels = currentSizeInPixels + deltaX;

      // Convert back to percentage but with pixel-based boundaries
      if (newSizeInPixels < minSizeInPixels) {
        newSplitSize = (minSizeInPixels / containerWidth) * 100;
      } else if (newSizeInPixels > maxSizeInPixels) {
        newSplitSize = (maxSizeInPixels / containerWidth) * 100;
      } else {
        newSplitSize = (newSizeInPixels / containerWidth) * 100;
      }
    }

    setSplitSize(newSplitSize);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Remove event listeners
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  // Effect to clean up resize event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  // Add a new tab
  const addNewTab = () => {
    const newTab = {
      id: nanoid(),
      name: "New Query",
      queryId: predefinedQueries[0].id,
      query: predefinedQueries[0].query,
      renamed: false,
    };
    setQueryTabs([...queryTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  // Close a tab
  const closeTab = (tabId, event) => {
    event.stopPropagation();
    if (queryTabs.length === 1) {
      // Don't close if it's the last tab
      return;
    }

    const newTabs = queryTabs.filter((tab) => tab.id !== tabId);
    setQueryTabs(newTabs);

    // If closing the active tab, activate another one
    if (tabId === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // Handle starting tab rename
  const handleTabDoubleClick = (tabId, currentName) => {
    setEditingTabId(tabId);
    setNewTabName(currentName);
    // Focus the input field after it's rendered
    setTimeout(() => {
      if (tabInputRef.current) {
        tabInputRef.current.focus();
        tabInputRef.current.select();
      }
    }, 0);
  };

  // Handle tab name change
  const handleTabRename = (e) => {
    if (e) e.preventDefault();

    if (editingTabId && newTabName.trim()) {
      setQueryTabs((tabs) =>
        tabs.map((tab) =>
          tab.id === editingTabId
            ? { ...tab, name: newTabName.trim(), renamed: true }
            : tab
        )
      );
    }

    // Reset editing state
    setEditingTabId(null);
    setNewTabName("");
  };

  // Handle clicking outside to cancel renaming
  const handleRenameBlur = () => {
    handleTabRename();
  };

  // Handle keydown events for the rename input
  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTabRename(e);
    } else if (e.key === "Escape") {
      setEditingTabId(null);
      setNewTabName("");
    }
  };

  // Update the closeOutputTab function to remove tabs properly
  const closeOutputTab = (tabId, event) => {
    if (event) event.stopPropagation();

    // Show confirmation dialog
    const confirmClose = window.confirm(
      "Are you sure you want to close this tab?"
    );
    if (!confirmClose) return;

    // Remove the output tab
    setOutputTabs((tabs) => tabs.filter((tab) => tab.id !== tabId));

    // Also remove this tab's results from tabResults
    setTabResults((prevResults) => {
      const newResults = { ...prevResults };
      delete newResults[tabId];
      return newResults;
    });

    // Also remove this tab from tabTypes
    setTabTypes((prevTypes) => {
      const newTypes = { ...prevTypes };
      delete newTypes[tabId];
      return newTypes;
    });

    // If closing the active tab, activate the most recent one
    if (tabId === activeOutputTabId) {
      const remainingTabs = outputTabs.filter((tab) => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        // Find the most recent tab by timestamp
        const mostRecentTab = remainingTabs.reduce((latest, current) =>
          latest.timestamp > current.timestamp ? latest : current
        );
        setActiveOutputTabId(mostRecentTab.id);
      } else {
        setActiveOutputTabId(null);
        // Clear results if there are no remaining tabs
        clearResults();
      }
    }
  };

  // Update the tab click function to handle both nav tabs and output tabs
  const handleTabClick = (tabId) => {
    // Check if it's a main navigation tab
    if (tabId === "editor-panel" || tabId === "results-panel") {
      setActivePanel(tabId);
    } else {
      // First check if it's an output tab
      const outputTab = outputTabs.find((tab) => tab.id === tabId);
      if (outputTab) {
        // It's an output tab
        setActivePanel("results-panel");
        setActiveOutputTabId(tabId);

        // If we don't have results for this tab but we have the query info, re-run the query
        if (!tabResults[tabId] && outputTab.queryId) {
          // Find the original query
          const query = predefinedQueries.find(
            (q) => q.id === outputTab.queryId
          );
          if (query) {
            const onQueryComplete = (queryResults) => {
              if (queryResults) {
                setTabResults((prevResults) => ({
                  ...prevResults,
                  [tabId]: {
                    data: queryResults,
                    executionTime: null,
                  },
                }));
              }
            };

            // Re-execute the query to populate this tab's results
            executeQuery(
              query.query,
              outputTab.queryId,
              outputTab.name,
              onQueryComplete
            );
          }
        }
      } else {
        // It must be an input tab
        setActivePanel("editor-panel");
        setActiveTabId(tabId);
      }
    }
  };

  // Handle results double click for full screen
  const handleResultsDoubleClick = (e) => {
    // Only detect double clicks on the results toolbar, not on the content
    if (e.target.closest(".results-toolbar")) {
      toggleFullScreen();
    }
  };

  // Add state for sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const minSidebarWidth = 180;
  const maxSidebarWidth = 450;
  const sidebarResizeRef = useRef(null);
  const isSidebarResizingRef = useRef(false);
  const startSidebarPosRef = useRef(0);
  const startSidebarWidthRef = useRef(0);

  // Handle sidebar resize start
  const handleSidebarResizeStart = (e) => {
    e.preventDefault();
    isSidebarResizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    startSidebarPosRef.current = e.clientX;
    startSidebarWidthRef.current = sidebarWidth;

    // Add event listeners
    document.addEventListener("mousemove", handleSidebarResize);
    document.addEventListener("mouseup", handleSidebarResizeEnd);
  };

  // Handle sidebar resize
  const handleSidebarResize = (e) => {
    if (!isSidebarResizingRef.current) return;

    const deltaX = e.clientX - startSidebarPosRef.current;
    const newWidth = Math.min(
      Math.max(minSidebarWidth, startSidebarWidthRef.current + deltaX),
      maxSidebarWidth
    );
    setSidebarWidth(newWidth);
  };

  // Handle sidebar resize end
  const handleSidebarResizeEnd = () => {
    isSidebarResizingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Remove event listeners
    document.removeEventListener("mousemove", handleSidebarResize);
    document.removeEventListener("mouseup", handleSidebarResizeEnd);
  };

  // Add cleanup for sidebar resize event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleSidebarResize);
      document.removeEventListener("mouseup", handleSidebarResizeEnd);
    };
  }, []);

  // Effect to exit fullscreen mode when results are cleared
  useEffect(() => {
    if (!results && isFullScreen) {
      setIsFullScreen(false);
    }
  }, [results, isFullScreen]);

  // Add state for save query modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState("");

  // Function to handle saving a query
  const handleSaveQuery = () => {
    if (!saveQueryName.trim()) return;

    // Here you would normally save to a database or localStorage
    // For this demo, we'll just show a confirmation
    alert(`Query "${saveQueryName}" saved successfully!`);
    setShowSaveModal(false);
  };

  // Function to open save query dialog
  const openSaveQueryDialog = () => {
    // Use the current active tab name as default
    const currentTab = queryTabs.find((tab) => tab.id === activeTabId);
    setSaveQueryName(currentTab?.name || "My Query");
    setShowSaveModal(true);
  };

  return (
    <ThemeProvider>
      <GlobalStyles />
      <AppContainer className="app-container">
        <Header
          executionTime={executionTime}
          rowCount={results ? results.length : null}
        />

        <MainContent>
          {/* Database explorer sidebar */}
          <Sidebar $isOpen={sidebarOpen} $width={`${sidebarWidth}px`}>
            <SidebarSections>
              <SidebarTabs>
                <SidebarTab
                  $active={activeSidebarTab === "explorer"}
                  onClick={() => setActiveSidebarTab("explorer")}
                >
                  Database Explorer
                </SidebarTab>
                <SidebarTab
                  $active={activeSidebarTab === "history"}
                  onClick={() => setActiveSidebarTab("history")}
                >
                  Query History
                </SidebarTab>
              </SidebarTabs>

              <SidebarContent $active={activeSidebarTab === "explorer"}>
                <Suspense
                  fallback={
                    <LoadingFallback>Loading explorer...</LoadingFallback>
                  }
                >
                  <DatabaseExplorer onTableClick={handleTableClick} />
                </Suspense>
              </SidebarContent>

              <SidebarContent $active={activeSidebarTab === "history"}>
                <Suspense
                  fallback={
                    <LoadingIndicator>Loading history...</LoadingIndicator>
                  }
                >
                  <QueryHistory
                    history={queryHistory}
                    onSelect={handleHistorySelect}
                  />
                </Suspense>
              </SidebarContent>
            </SidebarSections>

            {/* Add resize handle for sidebar */}
            <SidebarResizeHandle
              onMouseDown={handleSidebarResizeStart}
              ref={sidebarResizeRef}
            />
          </Sidebar>

          {/* Mobile sidebar toggle */}
          <SidebarToggle
            $isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? "×" : "≡"}
          </SidebarToggle>

          {/* New layout with optional tabs */}
          <EditorResultsContainer>
            {layoutDirection === "tabbed" && (
              <NavTabs role="tablist">
                <NavTab
                  $active={activePanel === "editor-panel"}
                  role="tab"
                  aria-controls="editor-panel"
                  aria-selected={activePanel === "editor-panel"}
                  onClick={() => handleTabClick("editor-panel")}
                  className={activePanel === "editor-panel" ? "active-tab" : ""}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 5h12M3 19h12M12 12H3M5 5v7M5 12v7M15 5h6M15 12h6M15 19h6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Input
                </NavTab>

                {/* Dynamic output tabs in tabbed mode */}
                {outputTabs.map((tab) => (
                  <NavTab
                    key={tab.id}
                    $active={
                      activePanel === "results-panel" &&
                      activeOutputTabId === tab.id
                    }
                    role="tab"
                    aria-controls="results-panel"
                    aria-selected={
                      activePanel === "results-panel" &&
                      activeOutputTabId === tab.id
                    }
                    onClick={() => handleTabClick(tab.id)}
                    className={
                      activePanel === "results-panel" &&
                      activeOutputTabId === tab.id
                        ? "active-tab"
                        : ""
                    }
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3h18v18H3V3zm6 4h9M3 9h18M3 15h18M9 9v9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {tab.name}
                  </NavTab>
                ))}
              </NavTabs>
            )}

            <SplitView $direction={layoutDirection}>
              {/* Query Editor Section */}
              <EditorSection
                $fullHeight={
                  (activePanel === "editor-panel" &&
                    layoutDirection === "tabbed") ||
                  outputTabs.length === 0
                }
                role="tabpanel"
                id="editor-panel"
                style={{
                  display:
                    (activePanel === "editor-panel" ||
                      layoutDirection !== "tabbed") &&
                    !isFullScreen
                      ? "flex"
                      : "none",
                  flex:
                    layoutDirection === "vertical" ? "1 0 auto" : "0 0 auto",
                  height:
                    layoutDirection === "vertical"
                      ? results && outputTabs.length > 0
                        ? `${splitSize}%`
                        : "100%"
                      : "100%",
                  width:
                    layoutDirection === "horizontal"
                      ? results && outputTabs.length > 0
                        ? `${splitSize}%`
                        : "100%"
                      : "100%",
                  position: "relative",
                }}
              >
                <EditorTabsBar>
                  {queryTabs.map((tab) => (
                    <EditorTab
                      key={tab.id}
                      $active={tab.id === activeTabId}
                      onClick={() => setActiveTabId(tab.id)}
                      onDoubleClick={() =>
                        handleTabDoubleClick(tab.id, tab.name)
                      }
                      title={`${tab.name} (Double-click to rename)`}
                    >
                      {editingTabId === tab.id ? (
                        <form
                          onSubmit={handleTabRename}
                          style={{ display: "inline" }}
                        >
                          <input
                            ref={tabInputRef}
                            type="text"
                            value={newTabName}
                            onChange={(e) => setNewTabName(e.target.value)}
                            onBlur={handleRenameBlur}
                            onKeyDown={handleRenameKeyDown}
                            style={{
                              width: "120px",
                              background: "transparent",
                              border: "none",
                              borderBottom: "1px solid",
                              color: "inherit",
                              fontSize: "inherit",
                              padding: "0 2px",
                              outline: "none",
                            }}
                          />
                        </form>
                      ) : (
                        <TabName title={tab.name} $renamed={tab.renamed}>
                          {tab.name}
                        </TabName>
                      )}
                      <TabActions>
                        <TabCloseButton
                          onClick={(e) => closeTab(tab.id, e)}
                          title="Close tab"
                        >
                          ×
                        </TabCloseButton>
                      </TabActions>
                    </EditorTab>
                  ))}
                  <NewTabButton onClick={addNewTab} title="New query tab">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4v16m-8-8h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </NewTabButton>
                </EditorTabsBar>

                {/* Editor Toolbar */}
                <EditorToolbar>
                  <QuerySelector
                    queries={predefinedQueries}
                    currentQuery={currentQueryId}
                    onQueryChange={handleQueryChange}
                  />

                  {queryModified && (
                    <QueryChangeNotification>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 8v4m0 4h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Click "Run SQL" to execute the new query
                    </QueryChangeNotification>
                  )}

                  <SaveButton
                    onClick={openSaveQueryDialog}
                    title="Save this query"
                    style={{ marginLeft: "auto", marginRight: "8px" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 21v-8H7v8M7 3v5h8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Save</span>
                  </SaveButton>

                  <RunButton onClick={() => handleExecuteQuery(queryText)}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                    </svg>
                    Run SQL
                  </RunButton>
                </EditorToolbar>

                {/* SQL Editor */}
                <Suspense
                  fallback={<EditorFallback>Loading editor...</EditorFallback>}
                >
                  <SQLEditor
                    onExecuteQuery={handleExecuteQuery}
                    initialQuery={queryText}
                    style={{ flex: 1 }}
                  />
                </Suspense>
              </EditorSection>

              {/* Resizable handle - Position matches layout direction */}
              {layoutDirection !== "tabbed" &&
                !isFullScreen &&
                activeTabResults &&
                outputTabs.length > 0 && (
                  <ResizeHandle
                    ref={resizeRef}
                    $direction={layoutDirection}
                    $position={
                      layoutDirection === "vertical"
                        ? `${splitSize}%`
                        : `${splitSize}%`
                    }
                    onMouseDown={handleResizeStart}
                    style={{
                      left:
                        layoutDirection === "horizontal"
                          ? `${splitSize}%`
                          : undefined,
                      top:
                        layoutDirection === "vertical"
                          ? `${splitSize}%`
                          : undefined,
                      transform:
                        layoutDirection === "horizontal"
                          ? "translateX(-50%)"
                          : undefined,
                    }}
                  />
                )}

              {/* Results Section */}
              <ResultsSection
                $visible={true} // Always visible, we'll handle display inside
                $fullHeight={
                  activePanel === "results-panel" &&
                  layoutDirection === "tabbed"
                }
                role="tabpanel"
                id="results-panel"
                style={{
                  display:
                    (isFullScreen ||
                      (!isFullScreen &&
                        (layoutDirection !== "tabbed" ||
                          activePanel === "results-panel"))) &&
                    (outputTabs.length > 0 ||
                      (layoutDirection !== "tabbed" && activeTabResults))
                      ? "flex"
                      : "none",
                  flex:
                    layoutDirection === "vertical" ? "1 0 auto" : "0 0 auto",
                  height: isFullScreen
                    ? "100%"
                    : layoutDirection === "vertical"
                    ? activeTabResults && outputTabs.length > 0
                      ? `${100 - splitSize}%`
                      : "0"
                    : "100%",
                  width: isFullScreen
                    ? "100%"
                    : layoutDirection === "horizontal"
                    ? activeTabResults && outputTabs.length > 0
                      ? `${100 - splitSize}%`
                      : "0"
                    : "100%",
                  position: isFullScreen ? "absolute" : "relative",
                  top: 0,
                  left: 0,
                  zIndex: isFullScreen ? 100 : "auto",
                }}
                onDoubleClick={handleResultsDoubleClick}
              >
                {/* Output tabs navigation */}
                {outputTabs.length > 0 && (
                  <EditorTabsBar>
                    {outputTabs.map((tab) => (
                      <EditorTab
                        key={tab.id}
                        $active={tab.id === activeOutputTabId}
                        onClick={() => handleTabClick(tab.id)}
                        title={tab.name}
                      >
                        <TabName>{tab.name}</TabName>
                        <TabActions>
                          <TabCloseButton
                            onClick={(e) => closeOutputTab(tab.id, e)}
                            title="Close output tab"
                          >
                            ×
                          </TabCloseButton>
                        </TabActions>
                      </EditorTab>
                    ))}

                    {/* Add layout control buttons - now on the left side */}
                    <FullScreenButton
                      onClick={toggleFullScreen}
                      title={isFullScreen ? "Exit full screen" : "Full screen"}
                      style={{
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "auto",
                      }}
                    >
                      {isFullScreen ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 3v4H4M4 8V4m16 0h-4v4m0-4h4v4M4 16h4v4m-4 0v-4m16 0v4h-4m4-4v4h-4v-4"
                            stroke="currentColor"
                            strokeWidth="2"
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
                          <path
                            d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span>
                        {isFullScreen ? "Exit full screen" : "Full screen"}
                      </span>
                    </FullScreenButton>

                    <LayoutToggle
                      onClick={toggleOutputMode}
                      title={
                        layoutDirection === "vertical"
                          ? "Switch to side-by-side view"
                          : "Switch to vertical view"
                      }
                      style={{
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {layoutDirection === "vertical" ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 4V20"
                            stroke="currentColor"
                            strokeWidth="2"
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
                          <path
                            d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span>
                        {layoutDirection === "vertical"
                          ? "Side-by-side View"
                          : "Vertical View"}
                      </span>
                    </LayoutToggle>

                    {/* Add Clear All button at the tabs level */}
                    <ClearButton
                      onClick={handleClearResults}
                      title="Clear all results"
                      style={{
                        color: "var(--theme-error, #f44336)",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6M4 6h16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Clear All</span>
                    </ClearButton>
                  </EditorTabsBar>
                )}

                {activeTabResults && !loading && activeOutputTabId ? (
                  <>
                    <ResultsToolbar className="results-toolbar">
                      <ResultsTitle>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 3h18v18H3V3zm6 4h9M3 9h18M3 15h18M9 9v9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {`Results: ${currentQuery.name}`}
                      </ResultsTitle>

                      <ToolbarActions>
                        {/* Visualization button - Only show for non-visualization tabs */}
                        {tabTypes[activeOutputTabId] !== "visualization" && (
                          <VisualizationButton
                            onClick={() =>
                              createVisualizationTab(activeOutputTabId)
                            }
                            title="Create visualization"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18 20V10M12 20V4M6 20v-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Create Visualization</span>
                          </VisualizationButton>
                        )}

                        {/* Only show export options in results tabs, not in visualization tabs */}
                        {tabTypes[activeOutputTabId] !== "visualization" && (
                          <Suspense
                            fallback={<div style={{ height: "32px" }}></div>}
                          >
                            <DownloadOptions
                              data={activeTabResults.data}
                              queryName={currentQuery?.name}
                            />
                          </Suspense>
                        )}
                      </ToolbarActions>
                    </ResultsToolbar>

                    <div
                      style={{
                        flex: 1,
                        overflow: "auto",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Suspense
                        fallback={
                          <LoadingIndicator>
                            Loading content...
                          </LoadingIndicator>
                        }
                      >
                        {/* Show either the result table or visualization based on tab type */}
                        {tabTypes[activeOutputTabId] === "visualization" ? (
                          <ResultVisualization
                            data={activeTabResults.data}
                            queryId={
                              outputTabs.find(
                                (tab) => tab.id === activeOutputTabId
                              ).queryId
                            }
                          />
                        ) : (
                          <ResultTable data={activeTabResults.data} title="" />
                        )}
                      </Suspense>
                    </div>
                  </>
                ) : !loading &&
                  activeTabResults === null &&
                  !isFullScreen &&
                  (layoutDirection === "horizontal" ||
                    layoutDirection === "vertical") ? (
                  <EmptyResultsPlaceholder>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3h18v18H3V3zm6 4h9M3 9h18M3 15h18M9 9v9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h3>No Results to Display</h3>
                    <p>
                      Select a query and click "Run SQL" to see the results here
                    </p>
                  </EmptyResultsPlaceholder>
                ) : null}
              </ResultsSection>
            </SplitView>

            {/* Loading indicator and errors */}
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 50,
                }}
              >
                <LoadingIndicator>Executing query...</LoadingIndicator>
              </div>
            )}

            {displayError && (
              <div style={{ padding: "16px" }}>
                <ErrorMessage>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {displayError}
                </ErrorMessage>
              </div>
            )}
          </EditorResultsContainer>
        </MainContent>

        {/* Mobile bottom bar */}
        <MobileBar>
          <MobileButton
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              setActiveSidebarTab("explorer");
            }}
            $active={sidebarOpen && activeSidebarTab === "explorer"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 4h18M3 12h18M3 20h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Tables
          </MobileButton>

          <MobileButton onClick={() => setMobileHistoryOpen(true)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8v4l3 3m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            History
          </MobileButton>

          <MobileButton
            onClick={() => {
              handleExecuteQuery(queryText);
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 3l14 9-14 9V3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Run
          </MobileButton>
        </MobileBar>

        {/* Mobile history panel */}
        <MobileHistoryOverlay $isOpen={mobileHistoryOpen}>
          <MobileHistoryPanel>
            <MobileHistoryHeader>
              <h3>Query History</h3>
              <button
                onClick={() => setMobileHistoryOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </MobileHistoryHeader>
            <Suspense
              fallback={<LoadingIndicator>Loading history...</LoadingIndicator>}
            >
              <QueryHistory
                history={queryHistory}
                onSelect={handleHistorySelect}
              />
            </Suspense>
          </MobileHistoryPanel>
        </MobileHistoryOverlay>
      </AppContainer>

      {/* Add Save Query modal */}
      {showSaveModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--theme-surface)",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "95%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              border: "1px solid var(--theme-border)",
              outline: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--theme-border)",
                paddingBottom: "16px",
                marginBottom: "4px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "var(--theme-text-primary)",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Save Query
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--theme-text-secondary)",
                  cursor: "pointer",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: "var(--theme-text-primary)",
                  fontWeight: "500",
                }}
              >
                Query Name:
              </label>
              <input
                type="text"
                value={saveQueryName}
                onChange={(e) => setSaveQueryName(e.target.value)}
                style={{
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "1px solid var(--theme-border)",
                  borderRadius: "6px",
                  backgroundColor: "var(--theme-background)",
                  color: "var(--theme-text-primary)",
                  width: "100%",
                  boxSizing: "border-box",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--theme-primary)";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(76, 175, 80, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--theme-border)";
                  e.target.style.boxShadow =
                    "inset 0 1px 2px rgba(0, 0, 0, 0.05)";
                }}
                autoFocus
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "10px",
                paddingTop: "16px",
                borderTop: "1px solid var(--theme-border)",
              }}
            >
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "transparent",
                  color: "#dc3545",
                  border: "1px solid #dc3545",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: "80px",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "rgba(220, 53, 69, 0.08)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.boxShadow = "none";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuery}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  minWidth: "80px",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#218838";
                  e.target.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#28a745";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;
