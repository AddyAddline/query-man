import { useState, useEffect, useRef } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalStyles from "./styles/GlobalStyles";
import Header from "./components/Header";
import { predefinedQueries } from "./data/mockData";
import useSQLQuery from "./hooks/useSQLQuery";
import useTabs from "./hooks/useTabs";
import useLayout from "./hooks/useLayout";
import { nanoid } from "nanoid";
import Sidebar from "./components/Sidebar";
import SaveQueryModal from "./components/SaveQueryModal";
import ResultsSection from "./components/ResultsSection";
import EditorPanel from "./components/EditorPanel";
import MobileHistoryPanel from "./components/MobileHistoryPanel";
import TabsHeader from "./components/TabsHeader";
import MobileToolbar from "./components/MobileToolbar";
import LoadingErrorOverlay from "./components/LoadingErrorOverlay";
import ResizableHandle from "./components/ResizableHandle";

import {
  AppContainer,
  MainContent,
  EditorResultsContainer,
  SplitView,
  SidebarToggle,
} from "./styles/AppStyles";

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
            {/* Tabs Header */}
            <TabsHeader
              layoutDirection={layoutDirection}
              activePanel={activePanel}
              activeOutputTabId={activeOutputTabId}
              outputTabs={outputTabs}
              handleTabClick={handleTabClick}
            />

            <SplitView $direction={layoutDirection}>
              {/* Editor Panel */}
              <EditorPanel
                isFullScreen={isFullScreen}
                layoutDirection={layoutDirection}
                splitSize={splitSize}
                results={results}
                outputTabs={outputTabs}
                activePanel={activePanel}
                queryTabs={queryTabs}
                activeTabId={activeTabId}
                editingTabId={editingTabId}
                newTabName={newTabName}
                tabInputRef={tabInputRef}
                predefinedQueries={predefinedQueries}
                currentQueryId={currentQueryId}
                queryText={queryText}
                queryModified={queryModified}
                setActiveTabId={setActiveTabId}
                closeTab={closeTab}
                handleTabDoubleClick={handleTabDoubleClick}
                handleTabRename={handleTabRename}
                handleRenameBlur={handleRenameBlur}
                handleRenameKeyDown={handleRenameKeyDown}
                addNewTab={addNewTab}
                handleQueryChange={handleQueryChange}
                openSaveQueryDialog={openSaveQueryDialog}
                handleExecuteQuery={handleExecuteQuery}
                setNewTabName={setNewTabName}
              />

              {/* Resizable handle */}
              <ResizableHandle
                layoutDirection={layoutDirection}
                isFullScreen={isFullScreen}
                activeTabResults={activeTabResults}
                outputTabs={outputTabs}
                splitSize={splitSize}
                resizeRef={resizeRef}
                handleResizeStart={handleResizeStart}
              />

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

            {/* Loading and Error overlays */}
            <LoadingErrorOverlay loading={loading} error={displayError} />
          </EditorResultsContainer>
        </MainContent>

        {/* Mobile toolbar */}
        <MobileToolbar
          sidebarOpen={sidebarOpen}
          activeSidebarTab={activeSidebarTab}
          setSidebarOpen={setSidebarOpen}
          setActiveSidebarTab={setActiveSidebarTab}
          setMobileHistoryOpen={setMobileHistoryOpen}
          handleExecuteQuery={handleExecuteQuery}
          queryText={queryText}
        />

        {/* Mobile history panel */}
        <MobileHistoryPanel
          isOpen={mobileHistoryOpen}
          onClose={() => setMobileHistoryOpen(false)}
          queryHistory={queryHistory}
          onHistorySelect={handleHistorySelect}
        />
      </AppContainer>

      {/* Save Query Modal */}
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
