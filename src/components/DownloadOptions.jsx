import React from "react";
import styled from "styled-components";

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 576px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  background-color: ${({ theme, $variant }) =>
    $variant === "json" ? theme.tertiary + "E6" : theme.secondary + "E6"};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 34px;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background-color: ${({ theme, $variant }) =>
      $variant === "json" ? theme.tertiaryDark : theme.secondaryDark};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.border};
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
  }
`;

const CSVIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 3v4a1 1 0 001 1h4M17 21h-10a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM16 12.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 16.5v-1a2 2 0 00-2-2h-1M12 16.5v-1a2 2 0 012-2h1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const JSONIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 3v4a1 1 0 001 1h4M17 21h-10a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 16.5c0-1.5-2-1-2-3s2-1.5 2-3M13 16.5l1.5-1.5 1.5 1.5M14.5 15l1.5-1.5M14.5 15l-1.5-1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function DownloadOptions({ data, queryName }) {
  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    // Get headers from the first row
    const headers = Object.keys(data[0]);

    // Convert data to CSV format
    let csvContent = headers.join(",") + "\n";

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle values with commas by wrapping in quotes
        const formattedValue =
          typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        return formattedValue;
      });
      csvContent += values.join(",") + "\n";
    });

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${queryName || "query-results"}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    if (!data || data.length === 0) return;

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${queryName || "query-results"}.json`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isDisabled = !data || data.length === 0;

  return (
    <OptionsContainer>
      <DownloadButton
        onClick={downloadCSV}
        disabled={isDisabled}
        $variant="csv"
        title="Export as CSV"
      >
        <CSVIcon />
        Export CSV
      </DownloadButton>

      <DownloadButton
        onClick={downloadJSON}
        disabled={isDisabled}
        $variant="json"
        title="Export as JSON"
      >
        <JSONIcon />
        Export JSON
      </DownloadButton>
    </OptionsContainer>
  );
}

export default DownloadOptions;
