import React, {
  useState,
  useEffect,
  useRef,
  memo,
  Suspense,
  lazy,
} from "react";
import styled, { keyframes } from "styled-components";

// Lazy load the Editor component
const MonacoEditor = lazy(() =>
  import("@monaco-editor/react").then((module) => ({ default: module.Editor }))
);

// Add highlight animation for when query changes
const highlightAnimation = keyframes`
  0% { background-color: transparent; }
  30% { background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(76, 175, 80, 0.1)" : "rgba(76, 175, 80, 0.15)"}; }
  100% { background-color: transparent; }
`;

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: none;
  overflow: hidden;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#1e1e1e" : "#ffffff"};
  min-height: 200px;
  height: 100%;
  width: 100%;
  transition: background-color 0.2s;

  &.query-changed {
    animation: ${highlightAnimation} 1s ease-in-out;
  }
`;

// Lightweight placeholder for the editor while it's loading
const PlaceholderContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#1e1e1e" : "#f5f5f5"};
  display: flex;
  flex-direction: column;
  padding: 12px;
`;

const PlaceholderLine = styled.div`
  height: 16px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#2a2a2a" : "#e0e0e0"};
  width: ${(props) => props.$width || "100%"};
  margin-bottom: 8px;
  border-radius: 3px;
`;

// Simple placeholder component for the editor
const EditorPlaceholder = memo(() => (
  <PlaceholderContainer>
    <PlaceholderLine $width="80%" />
    <PlaceholderLine $width="65%" />
    <PlaceholderLine $width="75%" />
    <PlaceholderLine $width="50%" />
    <PlaceholderLine $width="40%" />
    <PlaceholderLine $width="70%" />
  </PlaceholderContainer>
));

// Convert to memo to prevent unnecessary renders
const SQLEditor = memo(
  function SQLEditor({ onExecuteQuery, initialQuery = "", style }) {
    const [query, setQuery] = useState(initialQuery);
    // Add a ref to track if the component is currently updating
    const isUpdatingRef = useRef(false);
    // Store the previous initial query to compare
    const prevInitialQueryRef = useRef(initialQuery);
    // Add state to track when query has changed for animation
    const [hasQueryChanged, setHasQueryChanged] = useState(false);

    // Update local state when initialQuery prop changes
    // Use a more robust approach to avoid infinite loops
    useEffect(() => {
      // Only update if initialQuery has actually changed and component isn't already updating
      if (
        !isUpdatingRef.current &&
        initialQuery !== prevInitialQueryRef.current
      ) {
        isUpdatingRef.current = true;
        setQuery(initialQuery);
        prevInitialQueryRef.current = initialQuery;

        // Trigger the highlight animation
        setHasQueryChanged(true);

        // Remove the animation class after it completes
        const timer = setTimeout(() => {
          setHasQueryChanged(false);
        }, 1000);

        // Reset the flag after the update completes
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);

        return () => clearTimeout(timer);
      }
    }, [initialQuery]);

    const handleEditorChange = (value) => {
      if (value !== query) {
        setQuery(value);
      }
    };

    const executeQuery = () => {
      onExecuteQuery(query);
    };

    const handleKeyDown = (event) => {
      // Execute query with Ctrl+Enter or Cmd+Enter
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        executeQuery();
        event.preventDefault();
      }
    };

    // Handle when editor is fully mounted
    const handleEditorDidMount = () => {
      console.log("Editor mounted successfully");
    };

    // Basic editor options for initial load
    const editorOptions = {
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily:
        "'Source Code Pro', 'Menlo', 'Monaco', 'Courier New', monospace",
      wordWrap: "on",
      lineNumbers: "on",
      folding: true,
      automaticLayout: true,
      padding: { top: 8 },
      lineHeight: 1.5,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      bracketPairColorization: { enabled: true },
      renderLineHighlight: "all",
    };

    return (
      <EditorContainer
        onKeyDown={handleKeyDown}
        style={style}
        className={hasQueryChanged ? "query-changed" : ""}
      >
        <Suspense fallback={<EditorPlaceholder />}>
          <MonacoEditor
            height="100%"
            width="100%"
            language="sql"
            value={query}
            onChange={handleEditorChange}
            options={editorOptions}
            theme="vs-dark"
            onMount={handleEditorDidMount}
          />
        </Suspense>
      </EditorContainer>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to determine if the component should re-render
    return (
      prevProps.initialQuery === nextProps.initialQuery &&
      prevProps.style === nextProps.style
    );
  }
);

export default SQLEditor;
