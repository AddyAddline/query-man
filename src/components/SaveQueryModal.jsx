import { useState, useEffect } from "react";

function SaveQueryModal({ isOpen, onClose, onSave, initialName = "My Query" }) {
  const [queryName, setQueryName] = useState(initialName);

  useEffect(() => {
    setQueryName(initialName);
  }, [initialName]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!queryName.trim()) return;
    onSave(queryName);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--theme-surface)",
          padding: "24px",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "95%",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          border: "1px solid var(--theme-border)",
          outline: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--theme-border)",
            paddingBottom: "16px",
            marginBottom: "4px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "var(--theme-text-primary)",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Save Query
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--theme-text-secondary)",
              cursor: "pointer",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              color: "var(--theme-text-primary)",
              fontWeight: "500",
            }}
          >
            Query Name:
          </label>
          <input
            type="text"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            style={{
              padding: "10px 14px",
              fontSize: "14px",
              border: "1px solid var(--theme-border)",
              borderRadius: "6px",
              backgroundColor: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              width: "100%",
              boxSizing: "border-box",
              boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "border-color 0.2s, box-shadow 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--theme-primary)";
              e.target.style.boxShadow =
                "0 0 0 3px rgba(76, 175, 80, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--theme-border)";
              e.target.style.boxShadow = "inset 0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
            autoFocus
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "10px",
            paddingTop: "16px",
            borderTop: "1px solid var(--theme-border)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              backgroundColor: "transparent",
              color: "#dc3545",
              border: "1px solid #dc3545",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: "80px",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "rgba(220, 53, 69, 0.08)";
              e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.boxShadow = "none";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              minWidth: "80px",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#218838";
              e.target.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#28a745";
              e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveQueryModal;
