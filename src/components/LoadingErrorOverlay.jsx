import { LoadingFallback, ErrorMessage } from "../styles/AppStyles";

function LoadingErrorOverlay({ loading, error }) {
  return (
    <>
      {/* Loading indicator */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 50,
          }}
        >
          <LoadingFallback>Executing query...</LoadingFallback>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ padding: "16px" }}>
          <ErrorMessage>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8v4M12 16h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {error}
          </ErrorMessage>
        </div>
      )}
    </>
  );
}

export default LoadingErrorOverlay;
