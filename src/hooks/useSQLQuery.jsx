import { useState, useCallback } from "react";
import { mockResults } from "../data/mockData";

function useSQLQuery() {
  // State for managing query execution
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  // Format date utility function
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Clear history function
  const clearHistory = useCallback(() => {
    setQueryHistory([]);
  }, []);

  // Execute query function
  const executeQuery = useCallback((query, queryId, tabName, onComplete) => {
    // Reset error state
    setError(null);

    // Validate query
    if (!query?.trim()) {
      setError("Query cannot be empty");
      return;
    }

    if (!queryId) {
      setError("Query ID is required");
      return;
    }

    setLoading(true);

    // Simulate query execution time (between 200ms and 1000ms)
    const executionDelay = Math.floor(Math.random() * 800) + 200;

    // Execute after delay
    const timer = setTimeout(() => {
      try {
        // Get mock results based on current query ID
        const queryResult = mockResults[queryId] || [];

        if (!queryResult || queryResult.length === 0) {
          throw new Error("No results found for this query");
        }

        setResults(queryResult);

        // Set execution time
        const time = (executionDelay / 1000).toFixed(3);
        const timeFormatted = `${time}s`;
        setExecutionTime(timeFormatted);

        // Add to history
        const historyItem = {
          id: Date.now(),
          query,
          queryId,
          tabName,
          timestamp: formatDate(new Date()),
          executionTime: timeFormatted,
          rowCount: queryResult.length,
        };

        setQueryHistory((prev) => [historyItem, ...prev]);

        // Call the callback with results if provided
        if (onComplete) {
          onComplete(queryResult);
        }
      } catch (err) {
        console.error("Error executing query:", err);
        setError(err.message || "An error occurred while executing the query");
        setResults(null);

        // Call the callback with null to indicate error
        if (onComplete) {
          onComplete(null);
        }
      } finally {
        setLoading(false);
      }
    }, executionDelay);

    // Cleanup function
    return () => clearTimeout(timer);
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setResults(null);
    setExecutionTime(null);
    setError(null);
  }, []);

  // Select a query from history
  const selectFromHistory = useCallback(
    (historyItem) => {
      if (historyItem) {
        executeQuery(
          historyItem.query,
          historyItem.queryId,
          historyItem.tabName
        );
      }
    },
    [executeQuery]
  );

  return {
    results,
    loading,
    error,
    executionTime,
    queryHistory,
    executeQuery,
    clearHistory,
    clearResults,
    selectFromHistory,
  };
}

export default useSQLQuery;
