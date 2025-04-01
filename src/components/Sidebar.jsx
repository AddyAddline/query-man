import { lazy, Suspense } from "react";
import {
  Sidebar as SidebarContainer,
  SidebarSections,
  SidebarTabs,
  SidebarTab,
  SidebarContent,
  SidebarResizeHandle,
  LoadingFallback,
} from "../styles/AppStyles";

// Lazy load components
const DatabaseExplorer = lazy(() => import("./DatabaseExplorer"));
const QueryHistory = lazy(() => import("./QueryHistory"));

function Sidebar({
  sidebarWidth,
  sidebarOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  handleSidebarResizeStart,
  sidebarResizeRef,
  handleTableClick,
  queryHistory,
  handleHistorySelect,
}) {
  return (
    <SidebarContainer $width={`${sidebarWidth}px`} $isOpen={sidebarOpen}>
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
            fallback={<LoadingFallback>Loading explorer...</LoadingFallback>}
          >
            <DatabaseExplorer onTableClick={handleTableClick} />
          </Suspense>
        </SidebarContent>

        <SidebarContent $active={activeSidebarTab === "history"}>
          <Suspense
            fallback={<LoadingFallback>Loading history...</LoadingFallback>}
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
    </SidebarContainer>
  );
}

export default Sidebar;
