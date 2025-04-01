import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalStyles from "./styles/GlobalStyles";
import Header from "./components/Header";
import QuerySelector from "./components/QuerySelector";
import { predefinedQueries } from "./data/mockData";
import useSQLQuery from "./hooks/useSQLQuery";
import useTabs from "./hooks/useTabs";
import useLayout from "./hooks/useLayout";
import { nanoid } from "nanoid";
import Sidebar from "./components/Sidebar";
import SaveQueryModal from "./components/SaveQueryModal";
import ResultsSection from "./components/ResultsSection";
import {
  LoadingFallback,
  EditorFallback,
  AppContainer,
  MainContent,
  EditorResultsContainer,
  NavTabs,
  NavTab,
  EditorSection,
  SplitView,
  ResizeHandle,
  SaveButton,
  QueryChangeNotification,
  RunButton,
  EditorToolbar,
  MobileBar,
  MobileButton,
  SidebarToggle,
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
} from "./styles/AppStyles";

// Lazy load all heavy components
const SQLEditor = lazy(() => import("./components/SQLEditor"));
const QueryHistory = lazy(() => import("./components/QueryHistory"));

function App() {
  const [currentQueryId, setCurrentQueryId] = useState(predefinedQueries[0].id);
  const [queryText, setQueryText] = useState(predefinedQueries[0].query);
  const [activeSidebarTab, setActiveSidebarTab] = useState("explorer");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  // Use the layout management hook
  const {
    layoutDirection,
    isFullScreen,
    splitSize,
    resizeRef,
    sidebarOpen,
    sidebarWidth,
    sidebarResizeRef,
    setSidebarOpen,
    setIsFullScreen,
    toggleFullScreen,
    toggleOutputMode,
    handleResizeStart,
    handleResultsDoubleClick,
    handleSidebarResizeStart,
    checkExitFullScreen,
  } = useLayout();

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

  // Use the checkExitFullScreen function to exit fullscreen when results are cleared
  useEffect(() => {
    checkExitFullScreen(results);
  }, [results, checkExitFullScreen]);

  // Modified toggleOutputMode to pass the required parameters
  const handleToggleOutputMode = () => {
    toggleOutputMode(results, loading, setActivePanel);
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

  // Add state for save query modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState("");

  // Function to handle saving a query
  const handleSaveQuery = (name) => {
    if (!name.trim()) return;

    // Here you would normally save to a database or localStorage
    // For this demo, we'll just show a confirmation
    alert(`Query "${name}" saved successfully!`);
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
          <Sidebar
            sidebarWidth={sidebarWidth}
            sidebarOpen={sidebarOpen}
            activeSidebarTab={activeSidebarTab}
            setActiveSidebarTab={setActiveSidebarTab}
            handleSidebarResizeStart={handleSidebarResizeStart}
            sidebarResizeRef={sidebarResizeRef}
            handleTableClick={handleTableClick}
            queryHistory={queryHistory}
            handleHistorySelect={handleHistorySelect}
          />

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
                isFullScreen={isFullScreen}
                layoutDirection={layoutDirection}
                splitSize={splitSize}
                outputTabs={outputTabs}
                activeOutputTabId={activeOutputTabId}
                activeTabResults={activeTabResults}
                activePanel={activePanel}
                tabTypes={tabTypes}
                loading={loading}
                handleResultsDoubleClick={handleResultsDoubleClick}
                closeOutputTab={closeOutputTab}
                handleTabClick={handleTabClick}
                toggleFullScreen={toggleFullScreen}
                handleToggleOutputMode={handleToggleOutputMode}
                handleClearResults={handleClearResults}
                createVisualizationTab={createVisualizationTab}
                currentQuery={currentQuery}
              />
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

      <SaveQueryModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveQuery}
        initialName={saveQueryName}
      />
    </ThemeProvider>
  );
}

export default App;
