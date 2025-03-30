import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import styled, { keyframes } from "styled-components";
import CacheIndicator from "./CacheIndicator";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

// Define loading animation
const loadingAnimation = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 100%;
  width: 100%;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.primary};
  }
`;

const TableStats = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    color: ${({ theme }) => theme.primary};
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  scrollbar-width: thin;
  flex: 1;
  width: 100%;
  height: 100%;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 20px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 100%;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  z-index: 10;

  th {
    position: relative;
    padding: 12px 16px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    color: ${({ theme }) => theme.text.primary};
    transition: background-color 0.2s;

    &:hover {
      background-color: ${({ theme }) =>
        theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"};
    }

    &::after {
      content: "";
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.6;
    }

    &.sort-asc::after {
      content: "↓";
      color: ${({ theme }) => theme.primary};
      opacity: 1;
    }

    &.sort-desc::after {
      content: "↑";
      color: ${({ theme }) => theme.primary};
      opacity: 1;
    }
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.border};

    &:nth-child(even) {
      background-color: ${({ theme }) =>
        theme.isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)"};
    }

    &:hover {
      background-color: ${({ theme }) =>
        theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"};
    }

    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 12px 16px;
    color: ${({ theme }) => theme.text.primary};

    @media (max-width: 768px) {
      padding: 10px 12px;
      font-size: 13px;
    }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.surface};
  border-top: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};

  strong {
    color: ${({ theme }) => theme.text.primary};
  }

  @media (max-width: 576px) {
    font-size: 13px;
    text-align: center;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 6px;

  @media (max-width: 576px) {
    justify-content: center;
  }
`;

const PageButton = styled.button`
  padding: 6px 10px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.primary : theme.background};
  color: ${({ $active, theme }) => ($active ? "white" : theme.text.primary)};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ $active, theme }) => ($active ? "white" : theme.primary)};
  }

  @media (max-width: 576px) {
    padding: 6px 8px;
    min-width: 30px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  color: ${({ theme }) => theme.text.secondary};

  svg {
    color: ${({ theme }) => theme.border};
    margin-bottom: 16px;
  }
`;

// Formatter functions for different data types
const formatters = {
  formatCurrency: (value) => {
    if (typeof value === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(value);
    }
    return value;
  },

  formatDate: (value) => {
    if (value && value.includes("-")) {
      return new Date(value).toLocaleDateString();
    }
    return value;
  },
};

// Styled components for virtualized list
const VirtualRow = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  align-items: center;

  &:nth-child(even) {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)"};
  }

  &:hover {
    background-color: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"};
  }
`;

const VirtualCell = styled.div`
  padding: 12px 16px;
  color: ${({ theme }) => theme.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: ${({ $width }) => $width || "150px"};

  &.loading {
    background: linear-gradient(
      90deg,
      ${({ theme }) => (theme.isDarkMode ? "#2a2a2a" : "#f0f0f0")} 25%,
      ${({ theme }) => (theme.isDarkMode ? "#333" : "#e6e6e6")} 50%,
      ${({ theme }) => (theme.isDarkMode ? "#2a2a2a" : "#f0f0f0")} 75%
    );
    background-size: 200% 100%;
    animation: ${loadingAnimation} 1.5s infinite;
    color: transparent;
    border-radius: 4px;
    margin: 4px 8px;
    height: 70%;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
  }
`;

// Update the virtual row height
const ROW_HEIGHT = 48; // Slightly taller for better readability

function ResultTable({ data, title = "Query Results", fromCache = false }) {
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Create columns from the first row's keys
    return Object.keys(data[0]).map((key) => {
      // Determine if it's a numeric column
      const isNumeric = data.some((row) => typeof row[key] === "number");

      // Determine if it's a date column
      const isDate =
        typeof data[0][key] === "string" &&
        data[0][key].match(/^\d{4}-\d{2}-\d{2}/);

      // Determine if it looks like a price/currency
      const isCurrency =
        isNumeric &&
        (key.toLowerCase().includes("price") ||
          key.toLowerCase().includes("cost") ||
          key.toLowerCase().includes("revenue") ||
          key.toLowerCase().includes("total"));

      return columnHelper.accessor(key, {
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "), // Format header
        cell: (info) => {
          const value = info.getValue();

          // Apply formatting based on data type
          if (isCurrency) {
            return formatters.formatCurrency(value);
          } else if (isDate) {
            return formatters.formatDate(value);
          }

          return value;
        },
        // Estimate column width based on content type
        size: isCurrency || isDate ? 120 : 150,
      });
    });
  }, [data, columnHelper]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <TableContainer>
        <TableHeader>
          <Title>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 10h18M3 14h18M3 18h18M3 6h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {title}
          </Title>
        </TableHeader>
        <EmptyState>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 10h18M3 14h18M7 18h10M7 6h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>No results to display</div>
        </EmptyState>
      </TableContainer>
    );
  }

  // Calculate total width for the virtualized list
  const totalWidth = table
    .getAllColumns()
    .reduce((acc, column) => acc + (column.getSize() || 150), 0);

  // Update the Row renderer to show a smoother transition when scrolling
  const Row = ({ index, style }) => {
    const row = table.getRowModel().rows[index];

    // Show a simple loading placeholder when scrolling quickly
    if (!row) {
      // Note: The animation is now handled by styled components
      return (
        <VirtualRow style={style}>
          {columns.map((column, idx) => (
            <VirtualCell
              key={idx}
              $width={`${column.getSize()}px`}
              className="loading"
              style={{
                width: column.getSize(),
                minWidth: column.getSize(),
              }}
            >
              Loading...
            </VirtualCell>
          ))}
        </VirtualRow>
      );
    }

    return (
      <VirtualRow style={style}>
        {row.getVisibleCells().map((cell) => (
          <VirtualCell
            key={cell.id}
            $width={`${cell.column.getSize()}px`}
            style={{
              width: cell.column.getSize(),
              minWidth: cell.column.getSize(),
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </VirtualCell>
        ))}
      </VirtualRow>
    );
  };

  return (
    <TableContainer>
      <TableHeader>
        <Title>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 10h18M3 14h18M3 18h18M3 6h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {title}
          <CacheIndicator fromCache={fromCache} />
        </Title>
        <TableStats>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 20h20M4 12h4v8H4v-8zM10 8h4v12h-4V8zM16 4h4v16h-4V4z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {data.length} rows
        </TableStats>
      </TableHeader>

      <TableWrapper className="table-wrapper">
        {/* Table header */}
        <StyledTable style={{ tableLayout: "fixed", width: `${totalWidth}px` }}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getIsSorted() === "asc"
                        ? "sort-asc"
                        : header.column.getIsSorted() === "desc"
                        ? "sort-desc"
                        : ""
                    }
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </TableHead>
        </StyledTable>

        {/* Virtualized list for rows */}
        <div style={{ height: "calc(100% - 37px)" }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={table.getRowModel().rows.length}
                itemSize={ROW_HEIGHT} // Updated row height
                width={width}
                overscanCount={10} // Increased for smoother scrolling
                itemData={table.getRowModel().rows}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </TableWrapper>
    </TableContainer>
  );
}

export default ResultTable;
