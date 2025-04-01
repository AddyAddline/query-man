import { useState, useRef } from "react";
import { nanoid } from "nanoid";

const useTabs = ({ predefinedQueries, executeQuery }) => {
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

  // Tab renaming state
  const [editingTabId, setEditingTabId] = useState(null);
  const [newTabName, setNewTabName] = useState("");
  const tabInputRef = useRef(null);

  // Output tabs state
  const [outputTabs, setOutputTabs] = useState([]);
  const [activeOutputTabId, setActiveOutputTabId] = useState(null);

  // Track tab results and types
  const [tabResults, setTabResults] = useState({});
  const [tabTypes, setTabTypes] = useState({});

  // Active panel
  const [activePanel, setActivePanel] = useState("editor-panel");

  // Query sync prevention flags
  const isUpdatingQuery = useRef(false);
  const isUpdatingTab = useRef(false);

  // Get the active tab
  const activeTab =
    queryTabs.find((tab) => tab.id === activeTabId) || queryTabs[0];

  // Get the active tab's results
  const activeTabResults = activeOutputTabId
    ? tabResults[activeOutputTabId]
    : null;

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

  // Close an output tab
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
      }
    }
  };

  // Create a visualization tab
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

  // Handle tab click
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

  // Clear all output tabs and results
  const clearAllOutputTabs = () => {
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

    return true; // Indicate success
  };

  // Update an existing query tab
  const updateQueryTab = (tabId, updates) => {
    setQueryTabs((tabs) =>
      tabs.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
    );
  };

  // Execute a query and create a new output tab
  const executeQueryAndCreateTab = (query, queryId, tabName) => {
    // Create a new output tab
    const outputTabId = nanoid();
    const outputTabName = `${tabName} Output`;

    // Create a new output tab
    const newOutputTab = {
      id: outputTabId,
      name: outputTabName,
      queryId: queryId,
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

    // Return the callback to store results
    return (queryResults, executionTime) => {
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
  };

  // Create a new query tab from history
  const createTabFromHistory = (historyItem) => {
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

      return newTab;
    }

    return null;
  };

  return {
    // State
    queryTabs,
    activeTabId,
    activeTab,
    editingTabId,
    newTabName,
    tabInputRef,
    outputTabs,
    activeOutputTabId,
    activeTabResults,
    tabResults,
    tabTypes,
    activePanel,
    isUpdatingQuery,
    isUpdatingTab,

    // Methods
    setActiveTabId,
    setActivePanel,
    setQueryTabs,
    setActiveOutputTabId,
    setTabResults,
    setNewTabName,
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
  };
};

export default useTabs;
