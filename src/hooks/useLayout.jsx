import { useState, useRef, useEffect } from "react";

const useLayout = () => {
  // Layout direction state
  const [layoutDirection, setLayoutDirection] = useState("vertical"); // "vertical" or "horizontal"

  // Full-screen mode state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isFullScreenExit = useRef(false);

  // Split size state (for editor/results panels)
  const [splitSize, setSplitSize] = useState(60); // percentage - default to editor being larger
  const resizeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const minSidebarWidth = 180;
  const maxSidebarWidth = 450;
  const sidebarResizeRef = useRef(null);
  const isSidebarResizingRef = useRef(false);
  const startSidebarPosRef = useRef(0);
  const startSidebarWidthRef = useRef(0);

  // Toggle layout direction
  const toggleLayoutDirection = () => {
    // Exit full screen mode first if enabled
    if (isFullScreen) {
      setIsFullScreen(false);
    }

    setLayoutDirection((prev) =>
      prev === "vertical" ? "horizontal" : "vertical"
    );
  };

  // Toggle full-screen mode for results
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Toggle the output display mode
  const toggleOutputMode = (hasResults, isLoading, setActivePanel) => {
    // Exit full screen mode first if enabled
    if (isFullScreen) {
      setIsFullScreen(false);
    }

    // Then toggle the layout direction
    toggleLayoutDirection();

    // When switching to horizontal, make sure we're displaying results
    if (layoutDirection === "vertical" && hasResults && !isLoading) {
      setActivePanel("results-panel");
    }
  };

  // Handle resize start
  const handleResizeStart = (e) => {
    isDraggingRef.current = true;
    document.body.style.cursor =
      layoutDirection === "vertical" ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
    startPosRef.current =
      layoutDirection === "vertical" ? e.clientY : e.clientX;
    startSizeRef.current = splitSize;

    // Add event listeners
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  // Handle resize with better boundaries
  const handleResize = (e) => {
    if (!isDraggingRef.current) return;

    const container = resizeRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();

    let newSplitSize;

    if (layoutDirection === "vertical") {
      const deltaY = e.clientY - startPosRef.current;
      const containerHeight = containerRect.height;

      // Stricter minimum sizes in pixels to ensure elements fit properly
      const minSizeInPixels = 200; // minimum pixels for editor
      const maxSizeInPixels = containerHeight - 200; // ensure result panel has at least 200px

      const currentSizeInPixels =
        (containerHeight * startSizeRef.current) / 100;
      const newSizeInPixels = currentSizeInPixels + deltaY;

      // Convert back to percentage but with pixel-based boundaries
      if (newSizeInPixels < minSizeInPixels) {
        newSplitSize = (minSizeInPixels / containerHeight) * 100;
      } else if (newSizeInPixels > maxSizeInPixels) {
        newSplitSize = (maxSizeInPixels / containerHeight) * 100;
      } else {
        newSplitSize = (newSizeInPixels / containerHeight) * 100;
      }
    } else {
      const deltaX = e.clientX - startPosRef.current;
      const containerWidth = containerRect.width;

      // Stricter minimum sizes in pixels for horizontal layout
      const minSizeInPixels = 300; // minimum pixels for editor
      const maxSizeInPixels = containerWidth - 300; // ensure result panel has at least 300px

      const currentSizeInPixels = (containerWidth * startSizeRef.current) / 100;
      const newSizeInPixels = currentSizeInPixels + deltaX;

      // Convert back to percentage but with pixel-based boundaries
      if (newSizeInPixels < minSizeInPixels) {
        newSplitSize = (minSizeInPixels / containerWidth) * 100;
      } else if (newSizeInPixels > maxSizeInPixels) {
        newSplitSize = (maxSizeInPixels / containerWidth) * 100;
      } else {
        newSplitSize = (newSizeInPixels / containerWidth) * 100;
      }
    }

    setSplitSize(newSplitSize);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Remove event listeners
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  // Handle sidebar resize start
  const handleSidebarResizeStart = (e) => {
    e.preventDefault();
    isSidebarResizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    startSidebarPosRef.current = e.clientX;
    startSidebarWidthRef.current = sidebarWidth;

    // Add event listeners
    document.addEventListener("mousemove", handleSidebarResize);
    document.addEventListener("mouseup", handleSidebarResizeEnd);
  };

  // Handle sidebar resize
  const handleSidebarResize = (e) => {
    if (!isSidebarResizingRef.current) return;

    const deltaX = e.clientX - startSidebarPosRef.current;
    const newWidth = Math.min(
      Math.max(minSidebarWidth, startSidebarWidthRef.current + deltaX),
      maxSidebarWidth
    );
    setSidebarWidth(newWidth);
  };

  // Handle sidebar resize end
  const handleSidebarResizeEnd = () => {
    isSidebarResizingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Remove event listeners
    document.removeEventListener("mousemove", handleSidebarResize);
    document.removeEventListener("mouseup", handleSidebarResizeEnd);
  };

  // Handle results double click for full screen
  const handleResultsDoubleClick = (e) => {
    // Only detect double clicks on the results toolbar, not on the content
    if (e.target.closest(".results-toolbar")) {
      toggleFullScreen();
    }
  };

  // Effect to clean up resize event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
      document.removeEventListener("mousemove", handleSidebarResize);
      document.removeEventListener("mouseup", handleSidebarResizeEnd);
    };
  }, []);

  // Effect to exit fullscreen mode when results are cleared
  useEffect(() => {
    if (isFullScreen && !isFullScreenExit.current) {
      // Set up a ref to check if isFullScreenExit has been triggered
      isFullScreenExit.current = true;
    }
  }, [isFullScreen]);

  // External method to check and exit fullscreen mode when results are cleared
  const checkExitFullScreen = (results) => {
    if (!results && isFullScreen) {
      setIsFullScreen(false);
    }
  };

  return {
    // State
    layoutDirection,
    isFullScreen,
    splitSize,
    resizeRef,
    sidebarOpen,
    sidebarWidth,
    sidebarResizeRef,

    // Methods
    setSidebarOpen,
    setIsFullScreen,
    toggleLayoutDirection,
    toggleFullScreen,
    toggleOutputMode,
    handleResizeStart,
    handleResultsDoubleClick,
    handleSidebarResizeStart,
    checkExitFullScreen,
  };
};

export default useLayout;
