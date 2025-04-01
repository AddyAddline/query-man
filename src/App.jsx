import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalStyles from "./styles/GlobalStyles";
import Header from "./components/Header";
import QuerySelector from "./components/QuerySelector";
import { predefinedQueries } from "./data/mockData";
import useSQLQuery from "./hooks/useSQLQuery";
import useTabs from "./hooks/useTabs";
import { nanoid } from "nanoid";
import {
  LoadingFallback,
  EditorFallback,
  AppContainer,
  MainContent,
  Sidebar,
  SidebarResizeHandle,
  SidebarSections,
  SidebarTabs,
  SidebarTab,
  SidebarContent,
  EditorResultsContainer,
  NavTabs,
  NavTab,
  EditorSection,
  ResultsSection,
  SplitView,
  ResizeHandle,
  ClearButton,
  VisualizationButton,
  SaveButton,
  QueryChangeNotification,
  EmptyResultsPlaceholder,
  RunButton,
  EditorToolbar,
  ResultsToolbar,
  ResultsTitle,
  ToolbarActions,
  MobileBar,
  MobileButton,
  SidebarToggle,
  LoadingIndicator,
  ErrorMessage,
  MobileHistoryOverlay,
  MobileHistoryPanel,
  MobileHistoryHeader,
  EditorTabsBar,
  EditorTab,
  TabName,
  TabActions,
  TabCloseButton,
  NewTabButton,
  LayoutToggle,
  FullScreenButton,
} from "./styles/AppStyles";

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

function App() {
  const [currentQueryId, setCurrentQueryId] = useState(predefinedQueries[0].id);
  const [queryText, setQueryText] = useState(predefinedQueries[0].query);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState("explorer");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

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

  // Use our custom tabs hook
  const {
    queryTabs,
    activeTabId,
    activeTab,
    editingTabId,
    newTabName,
    tabInputRef,
    outputTabs,
    activeOutputTabId,
    activeTabResults,
    tabTypes,
    activePanel,
    isUpdatingQuery,
    isUpdatingTab,
    setActiveTabId,
    setActivePanel,
    setQueryTabs,
    addNewTab,
    closeTab,
    handleTabDoubleClick,
    handleTabRename,
    handleRenameBlur,
    handleRenameKeyDown,
    closeOutputTab,
    createVisualizationTab,
    handleTabClick,
    clearAllOutputTabs,
    updateQueryTab,
    executeQueryAndCreateTab,
    createTabFromHistory,
    setNewTabName,
  } = useTabs({
    predefinedQueries,
    executeQuery,
  });

  // Track previous sidebar tab to restore after query execution
  const prevSidebarTabRef = useRef(activeSidebarTab);

  useEffect(() => {
    prevSidebarTabRef.current = activeSidebarTab;
  }, [activeSidebarTab]);

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
      updateQueryTab(activeTabId, {
        query: queryText,
        queryId: currentQueryId,
      });
    }

    // Clear the flag after the update
    setTimeout(() => {
      isUpdatingQuery.current = false;
    }, 0);
  }, [queryText, currentQueryId, activeTabId, queryTabs, updateQueryTab]);

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
      updateQueryTab(activeTabId, { name: tabName });
    }
  }, [activeTabId, queryTabs, updateQueryTab, isUpdatingTab, isUpdatingQuery]);

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
  }, [queryText, customError]);

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
      updateQueryTab(activeTabId, {
        name: isRenamed ? currentTab.name : query.name,
        queryId: queryId,
        query: query.query,
        renamed: isRenamed,
      });

      setCurrentQueryId(queryId);
      setQueryText(query.query);
      // Don't clear results when changing queries
      setCustomError(null); // Clear any custom errors when changing queries

      // Set the query modified flag to show notification
      setQueryModified(true);
    }
  };

  // Handle the clear results button click
  const handleClearResults = () => {
    // If in fullscreen mode, exit fullscreen when clearing results
    if (isFullScreen) {
      setIsFullScreen(false);
    }

    // Use the clearAllOutputTabs function from our hook
    const success = clearAllOutputTabs();

    // Only clear results if the user confirmed
    if (success) {
      clearResults();
    }
  };

  // Update the handleExecuteQuery to use our hook's functions
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

      // Create a new output tab and get the callback to store results
      const onQueryComplete = executeQueryAndCreateTab(
        query,
        matchingQuery.id,
        currentTab.name
      );

      // If the query matches a different predefined query, switch to that query
      if (matchingQuery.id !== currentQueryId) {
        setCurrentQueryId(matchingQuery.id);
      }

      // Execute with the matching query ID to get correct results
      executeQuery(query, matchingQuery.id, currentTab.name, (queryResults) => {
        onQueryComplete(queryResults, executionTime);
      });

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

  // Modify the history selection to use our hook
  const handleHistorySelect = (historyItem, shouldExecute = false) => {
    // Clear any custom errors
    setCustomError(null);

    // Create a new tab from history using our hook
    const newTab = createTabFromHistory(historyItem);

    if (newTab) {
      // Close mobile history panel if open
      setMobileHistoryOpen(false);

      // If shouldExecute is true, also run the query and create an output tab
      if (shouldExecute) {
        // Create a new output tab and get the callback to store results
        const onQueryComplete = executeQueryAndCreateTab(
          historyItem.query,
          historyItem.queryId,
          newTab.name
        );

        // Execute the query
        executeQuery(
          historyItem.query,
          historyItem.queryId,
          newTab.name,
          (queryResults) => {
            onQueryComplete(queryResults, executionTime);
            setActivePanel("results-panel");
          }
        );
      }
    } else {
      // This would be rare but could happen if predefined queries were changed
      setCustomError(
        "Cannot load this query from history as it's no longer in the predefined list."
      );
    }
  };

  // Handle table click
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

  // Handle results double click for full screen
  const handleResultsDoubleClick = (e) => {
    // Only detect double clicks on the results toolbar, not on the content
    if (e.target.closest(".results-toolbar")) {
      toggleFullScreen();
    }
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
                    <LoadingFallback>Loading history...</LoadingFallback>
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
                          <LoadingFallback>Loading content...</LoadingFallback>
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
                <LoadingFallback>Executing query...</LoadingFallback>
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
              fallback={<LoadingFallback>Loading history...</LoadingFallback>}
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
