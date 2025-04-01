import { lazy, Suspense } from "react";
import {
  MobileHistoryOverlay,
  MobileHistoryPanel as MobileHistoryPanelContainer,
  MobileHistoryHeader,
  LoadingFallback,
} from "../styles/AppStyles";

// Lazy load components
const QueryHistory = lazy(() => import("./QueryHistory"));

function MobileHistoryPanel({
  isOpen,
  onClose,
  queryHistory,
  onHistorySelect,
}) {
  return (
    <MobileHistoryOverlay $isOpen={isOpen}>
      <MobileHistoryPanelContainer>
        <MobileHistoryHeader>
          <h3>Query History</h3>
          <button
            onClick={onClose}
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
          <QueryHistory history={queryHistory} onSelect={onHistorySelect} />
        </Suspense>
      </MobileHistoryPanelContainer>
    </MobileHistoryOverlay>
  );
}

export default MobileHistoryPanel;
