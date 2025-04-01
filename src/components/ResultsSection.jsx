import { lazy, Suspense } from "react";
import {
  ResultsSection as ResultsSectionContainer,
  ResultsToolbar,
  ResultsTitle,
  ToolbarActions,
  VisualizationButton,
  EmptyResultsPlaceholder,
  LoadingFallback,
  EditorTabsBar,
  EditorTab,
  TabName,
  TabActions,
  TabCloseButton,
  FullScreenButton,
  LayoutToggle,
  ClearButton,
} from "../styles/AppStyles";

// Lazy load components
const ResultTable = lazy(() => import("./ResultTable"));
const ResultVisualization = lazy(() => import("./ResultVisualization"));
const DownloadOptions = lazy(() => import("./DownloadOptions"));

function ResultsSection({
  isFullScreen,
  layoutDirection,
  splitSize,
  outputTabs,
  activeOutputTabId,
  activeTabResults,
  activePanel,
  tabTypes,
  loading,
  handleResultsDoubleClick,
  closeOutputTab,
  handleTabClick,
  toggleFullScreen,
  handleToggleOutputMode,
  handleClearResults,
  createVisualizationTab,
  currentQuery,
}) {
  return (
    <ResultsSectionContainer
      $visible={true}
      $fullHeight={
        activePanel === "results-panel" && layoutDirection === "tabbed"
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
        flex: layoutDirection === "vertical" ? "1 0 auto" : "0 0 auto",
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

          {/* Layout control buttons */}
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
            <span>{isFullScreen ? "Exit full screen" : "Full screen"}</span>
          </FullScreenButton>

          <LayoutToggle
            onClick={handleToggleOutputMode}
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

          {/* Clear All button */}
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
                  onClick={() => createVisualizationTab(activeOutputTabId)}
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
                <Suspense fallback={<div style={{ height: "32px" }}></div>}>
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
              fallback={<LoadingFallback>Loading content...</LoadingFallback>}
            >
              {/* Show either the result table or visualization based on tab type */}
              {tabTypes[activeOutputTabId] === "visualization" ? (
                <ResultVisualization
                  data={activeTabResults.data}
                  queryId={
                    outputTabs.find((tab) => tab.id === activeOutputTabId)
                      .queryId
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
        (layoutDirection === "horizontal" || layoutDirection === "vertical") ? (
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
          <p>Select a query and click "Run SQL" to see the results here</p>
        </EmptyResultsPlaceholder>
      ) : null}
    </ResultsSectionContainer>
  );
}

export default ResultsSection;
