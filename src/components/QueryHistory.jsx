import React, { memo } from "react";
import styled from "styled-components";

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 20px;
  }
`;

const HistoryItem = styled.div`
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background-color 0.2s;
  align-items: center;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"};
  }
`;

const QueryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: ${({ theme }) => theme.primary};
  flex-shrink: 0;
`;

const QueryContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const QueryText = styled.div`
  font-family: "Roboto Mono", monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;

  ${HistoryItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
  color: ${({ theme }) => theme.text.secondary};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
    color: ${({ theme }) => theme.text.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  height: 100%;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.6;
    margin-bottom: 16px;
  }
`;

// Use memo to prevent unnecessary re-renders when history hasn't changed
const QueryHistory = memo(
  function QueryHistory({ history = [], onSelect }) {
    if (!history.length) {
      return (
        <HistoryContainer>
          <EmptyState>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>No query history yet</div>
            <div style={{ fontSize: "13px", marginTop: "8px", opacity: "0.8" }}>
              Run a query to see your history
            </div>
          </EmptyState>
        </HistoryContainer>
      );
    }

    return (
      <HistoryContainer>
        <HistoryList>
          {history.map((item, index) => (
            <HistoryItem key={index} onClick={() => onSelect(item, false)}>
              <QueryIcon>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </QueryIcon>

              <QueryContent>
                <QueryText title={item.query}>
                  {item.query.length > 60
                    ? `${item.query.substring(0, 60)}...`
                    : item.query}
                </QueryText>
                <Timestamp>
                  {item.timestamp} · {item.executionTime} · {item.rowCount} rows
                  {item.fromCache && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        color: "#0078ff",
                      }}
                    >
                      (cached)
                    </span>
                  )}
                </Timestamp>
              </QueryContent>

              <ActionButtons>
                <ActionButton
                  title="Run query"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item, true);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                  </svg>
                </ActionButton>
              </ActionButtons>
            </HistoryItem>
          ))}
        </HistoryList>
      </HistoryContainer>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the history array length changes or the first item changes
    // This optimizes for the common case where a new item is added to history
    return (
      prevProps.history.length === nextProps.history.length &&
      (prevProps.history.length === 0 ||
        prevProps.history[0].id === nextProps.history[0].id)
    );
  }
);

export default QueryHistory;
