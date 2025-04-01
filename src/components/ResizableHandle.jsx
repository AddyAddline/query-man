import { ResizeHandle } from "../styles/AppStyles";

function ResizableHandle({
  layoutDirection,
  isFullScreen,
  activeTabResults,
  outputTabs,
  splitSize,
  resizeRef,
  handleResizeStart,
}) {
  if (
    layoutDirection === "tabbed" ||
    isFullScreen ||
    !activeTabResults ||
    outputTabs.length === 0
  ) {
    return null;
  }

  return (
    <ResizeHandle
      ref={resizeRef}
      $direction={layoutDirection}
      $position={
        layoutDirection === "vertical" ? `${splitSize}%` : `${splitSize}%`
      }
      onMouseDown={handleResizeStart}
      style={{
        left: layoutDirection === "horizontal" ? `${splitSize}%` : undefined,
        top: layoutDirection === "vertical" ? `${splitSize}%` : undefined,
        transform:
          layoutDirection === "horizontal" ? "translateX(-50%)" : undefined,
      }}
    />
  );
}

export default ResizableHandle;
