import { lazy, Suspense } from "react";
import {
  EditorSection,
  EditorFallback,
  EditorTabsBar,
  EditorTab,
  TabName,
  TabActions,
  TabCloseButton,
  NewTabButton,
  EditorToolbar,
  RunButton,
  SaveButton,
  QueryChangeNotification,
} from "../styles/AppStyles";
import QuerySelector from "./QuerySelector";

// Lazy load components
const SQLEditor = lazy(() => import("./SQLEditor"));

function EditorPanel({
  isFullScreen,
  layoutDirection,
  splitSize,
  results,
  outputTabs,
  activePanel,
  queryTabs,
  activeTabId,
  editingTabId,
  newTabName,
  tabInputRef,
  predefinedQueries,
  currentQueryId,
  queryText,
  queryModified,
  setActiveTabId,
  closeTab,
  handleTabDoubleClick,
  handleTabRename,
  handleRenameBlur,
  handleRenameKeyDown,
  addNewTab,
  handleQueryChange,
  openSaveQueryDialog,
  handleExecuteQuery,
  setNewTabName,
}) {
  return (
    <EditorSection
      $fullHeight={
        (activePanel === "editor-panel" && layoutDirection === "tabbed") ||
        outputTabs.length === 0
      }
      role="tabpanel"
      id="editor-panel"
      style={{
        display:
          (activePanel === "editor-panel" || layoutDirection !== "tabbed") &&
          !isFullScreen
            ? "flex"
            : "none",
        flex: layoutDirection === "vertical" ? "1 0 auto" : "0 0 auto",
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
            onDoubleClick={() => handleTabDoubleClick(tab.id, tab.name)}
            title={`${tab.name} (Double-click to rename)`}
          >
            {editingTabId === tab.id ? (
              <form onSubmit={handleTabRename} style={{ display: "inline" }}>
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
      <Suspense fallback={<EditorFallback>Loading editor...</EditorFallback>}>
        <SQLEditor
          onExecuteQuery={handleExecuteQuery}
          initialQuery={queryText}
          style={{ flex: 1 }}
        />
      </Suspense>
    </EditorSection>
  );
}

export default EditorPanel;
