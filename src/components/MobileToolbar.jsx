import { MobileBar, MobileButton } from "../styles/AppStyles";

function MobileToolbar({
  sidebarOpen,
  activeSidebarTab,
  setSidebarOpen,
  setActiveSidebarTab,
  setMobileHistoryOpen,
  handleExecuteQuery,
  queryText,
}) {
  return (
    <MobileBar>
      <MobileButton
        onClick={() => {
          setSidebarOpen(!sidebarOpen);
          setActiveSidebarTab("explorer");
        }}
        $active={sidebarOpen && activeSidebarTab === "explorer"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4h18M3 12h18M3 20h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Tables
      </MobileButton>

      <MobileButton onClick={() => setMobileHistoryOpen(true)}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 8v4l3 3m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        History
      </MobileButton>

      <MobileButton
        onClick={() => {
          handleExecuteQuery(queryText);
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 3l14 9-14 9V3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Run
      </MobileButton>
    </MobileBar>
  );
}

export default MobileToolbar;
