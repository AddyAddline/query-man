import { NavTabs, NavTab } from "../styles/AppStyles";

function TabsHeader({
  layoutDirection,
  activePanel,
  activeOutputTabId,
  outputTabs,
  handleTabClick,
}) {
  if (layoutDirection !== "tabbed") return null;

  return (
    <NavTabs role="tablist">
      <NavTab
        $active={activePanel === "editor-panel"}
        role="tab"
        aria-controls="editor-panel"
        aria-selected={activePanel === "editor-panel"}
        onClick={() => handleTabClick("editor-panel")}
        className={activePanel === "editor-panel" ? "active-tab" : ""}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 5h12M3 19h12M12 12H3M5 5v7M5 12v7M15 5h6M15 12h6M15 19h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Input
      </NavTab>

      {/* Dynamic output tabs in tabbed mode */}
      {outputTabs.map((tab) => (
        <NavTab
          key={tab.id}
          $active={
            activePanel === "results-panel" && activeOutputTabId === tab.id
          }
          role="tab"
          aria-controls="results-panel"
          aria-selected={
            activePanel === "results-panel" && activeOutputTabId === tab.id
          }
          onClick={() => handleTabClick(tab.id)}
          className={
            activePanel === "results-panel" && activeOutputTabId === tab.id
              ? "active-tab"
              : ""
          }
        >
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
          {tab.name}
        </NavTab>
      ))}
    </NavTabs>
  );
}

export default TabsHeader;
