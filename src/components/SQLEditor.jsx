import React, {
  useState,
  useEffect,
  useRef,
  memo,
  Suspense,
  lazy,
} from "react";
import styled, { keyframes } from "styled-components";
import { useTheme } from "../context/ThemeContext";

// Lazy load the Editor component with priority
const MonacoEditor = lazy(() => {
  // Use high priority loading
  const promise = import(
    /* webpackChunkName: "monaco-editor", webpackPrefetch: true */ "@monaco-editor/react"
  ).then((module) => ({ default: module.Editor }));

  // Add priority hint
  promise.priority = 1;
  return promise;
});

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
  background-color: ${({ theme }) => theme.surface};
  min-height: 200px;
  height: 100%;
  width: 100%;
  transition: background-color 0.2s;
  position: relative;

  &.query-changed {
    animation: ${highlightAnimation} 1s ease-in-out;
  }
`;

// Simple textarea for immediate display while Monaco loads
// Ensure paste functionality works by removing any restrictive properties
const SimpleTextarea = styled.textarea.attrs({
  readOnly: false,
  autoComplete: "on",
  spellCheck: "true",
  autoCorrect: "on",
})`
  width: 100%;
  height: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => (theme.isDarkMode ? "#d4d4d4" : theme.text.primary)};
  border: none;
  resize: none;
  font-family: "Source Code Pro", "Menlo", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  tab-size: 2;
  outline: none;
  display: block;
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;

  &:focus {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.primary};
  }
`;

// Lightweight placeholder for the editor while it's loading
const PlaceholderContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.surface};
  display: flex;
  flex-direction: column;
  padding: 12px;
`;

const PlaceholderLine = styled.div`
  height: 16px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#2a2a2a" : theme.borderLight};
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
    // Add state to track if Monaco editor is loaded
    const [monacoLoaded, setMonacoLoaded] = useState(false);
    // Get theme context
    const { theme } = useTheme();

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

    // Handle simple textarea changes
    const handleTextareaChange = (e) => {
      const value = e.target.value;
      if (value !== query) {
        setQuery(value);
      }
    };

    // Handle paste event explicitly to ensure it works
    const handlePaste = () => {
      // We don't need to do anything special here, just ensure
      // we don't prevent the default behavior
    };

    // Fix any paste prevention after mounting
    useEffect(() => {
      // This function ensures pasting works in the editor
      const fixPastePrevention = () => {
        // Find all textareas within our component
        const container = document.querySelector(".editor-container");
        if (!container) return;

        const textareas = container.querySelectorAll("textarea, .inputarea");
        textareas.forEach((textarea) => {
          // Ensure user-select is set to text
          textarea.style.userSelect = "text";
          textarea.style.webkitUserSelect = "text";
          textarea.style.msUserSelect = "text";
          textarea.style.mozUserSelect = "text";

          // Remove readonly attribute if present
          textarea.removeAttribute("readonly");

          // Add paste event listener
          textarea.addEventListener(
            "paste",
            () => {
              // Allow default paste behavior
            },
            true
          );
        });
      };

      // Run initially and with a delay to catch Monaco editor elements
      fixPastePrevention();
      const timer1 = setTimeout(fixPastePrevention, 500);
      const timer2 = setTimeout(fixPastePrevention, 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }, [monacoLoaded]);

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
    const handleEditorDidMount = (editor) => {
      setMonacoLoaded(true);

      // Ensure paste works in Monaco editor
      if (editor) {
        const editorDomNode = editor.getDomNode();
        if (editorDomNode) {
          const textareas = editorDomNode.querySelectorAll(
            "textarea, .inputarea"
          );
          textareas.forEach((textarea) => {
            // Remove any attributes that might prevent pasting
            textarea.removeAttribute("readonly");
            textarea.style.userSelect = "text";
            textarea.style.webkitUserSelect = "text";
          });
        }
      }
    };

    // Get editor theme based on current app theme
    const editorTheme = theme.isDarkMode ? "vs-dark" : "vs";

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
      // Ensure clipboard functionality works
      readOnly: false,
      quickSuggestions: true,
      // Make paste work
      accessibilitySupport: "off",
    };

    return (
      <EditorContainer
        onKeyDown={handleKeyDown}
        style={style}
        className={`editor-container ${hasQueryChanged ? "query-changed" : ""}`}
      >
        {/* Show textarea immediately while Monaco loads */}
        {!monacoLoaded && (
          <SimpleTextarea
            value={query}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            spellCheck="false"
            className="sc-eNhQl"
            placeholder="Enter SQL query here..."
            data-loading="eager"
            loading="eager"
            readOnly={false}
            autoComplete="on"
            aria-label="SQL query editor"
          />
        )}

        <Suspense fallback={<EditorPlaceholder />}>
          <div
            style={{
              display: monacoLoaded ? "block" : "none",
              width: "100%",
              height: "100%",
            }}
          >
            <MonacoEditor
              height="100%"
              width="100%"
              language="sql"
              value={query}
              onChange={handleEditorChange}
              options={editorOptions}
              theme={editorTheme}
              onMount={handleEditorDidMount}
            />
          </div>
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
