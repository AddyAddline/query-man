import React, { useState, useEffect, useRef, memo } from "react";
import { Editor } from "@monaco-editor/react";
import styled, { keyframes } from "styled-components";

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

    return (
      <EditorContainer
        onKeyDown={handleKeyDown}
        style={style}
        className={hasQueryChanged ? "query-changed" : ""}
      >
        <Editor
          height="100%"
          width="100%"
          language="sql"
          value={query}
          onChange={handleEditorChange}
          options={{
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
          }}
          theme="vs-dark"
        />
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
