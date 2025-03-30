import React, { useState } from "react";
import styled from "styled-components";

// Mock schema data - in a real app, this would come from an API
const mockDatabaseSchema = {
  databases: [
    {
      name: "sales_db",
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "username", type: "VARCHAR(50)", isNullable: false },
            { name: "email", type: "VARCHAR(100)", isNullable: false },
            { name: "first_name", type: "VARCHAR(50)", isNullable: true },
            { name: "last_name", type: "VARCHAR(50)", isNullable: true },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
            { name: "last_login", type: "TIMESTAMP", isNullable: true },
          ],
        },
        {
          name: "products",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "name", type: "VARCHAR(100)", isNullable: false },
            { name: "category", type: "VARCHAR(50)", isNullable: false },
            { name: "price", type: "DECIMAL(10,2)", isNullable: false },
            { name: "stock", type: "INTEGER", isNullable: false },
            { name: "description", type: "TEXT", isNullable: true },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
          ],
        },
        {
          name: "orders",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            {
              name: "user_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "users(id)",
            },
            { name: "total_amount", type: "DECIMAL(10,2)", isNullable: false },
            { name: "status", type: "VARCHAR(20)", isNullable: false },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
            { name: "updated_at", type: "TIMESTAMP", isNullable: true },
          ],
        },
        {
          name: "order_items",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            {
              name: "order_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "orders(id)",
            },
            {
              name: "product_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "products(id)",
            },
            { name: "quantity", type: "INTEGER", isNullable: false },
            { name: "price", type: "DECIMAL(10,2)", isNullable: false },
          ],
        },
        {
          name: "monthly_sales",
          columns: [
            { name: "month", type: "VARCHAR(20)", isPrimary: true },
            { name: "year", type: "INTEGER", isPrimary: true },
            { name: "total_sales", type: "DECIMAL(15,2)", isNullable: false },
            { name: "total_orders", type: "INTEGER", isNullable: false },
            {
              name: "avg_order_value",
              type: "DECIMAL(10,2)",
              isNullable: false,
            },
          ],
        },
      ],
    },
    {
      name: "marketing_db",
      tables: [
        {
          name: "campaigns",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            { name: "name", type: "VARCHAR(100)", isNullable: false },
            { name: "start_date", type: "DATE", isNullable: false },
            { name: "end_date", type: "DATE", isNullable: true },
            { name: "budget", type: "DECIMAL(12,2)", isNullable: false },
            { name: "status", type: "VARCHAR(20)", isNullable: false },
          ],
        },
        {
          name: "leads",
          columns: [
            { name: "id", type: "INTEGER", isPrimary: true },
            {
              name: "campaign_id",
              type: "INTEGER",
              isForeignKey: true,
              references: "campaigns(id)",
            },
            { name: "email", type: "VARCHAR(100)", isNullable: false },
            { name: "phone", type: "VARCHAR(20)", isNullable: true },
            { name: "status", type: "VARCHAR(20)", isNullable: false },
            { name: "created_at", type: "TIMESTAMP", isNullable: false },
          ],
        },
      ],
    },
  ],
};

const ExplorerContainer = styled.div`
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#1e1e1e" : "#f5f5f5"};
  width: 100%;
  box-sizing: border-box;
`;

const ExplorerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 8px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.3px;

  svg {
    color: ${({ theme }) => theme.primary};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#252526" : "#ffffff"};
  color: ${({ theme }) => theme.text.primary};
  font-size: 13px;
  margin: 4px 8px 16px 8px;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) =>
    theme.isDarkMode
      ? "0 2px 6px rgba(0, 0, 0, 0.1)"
      : "0 1px 3px rgba(0, 0, 0, 0.08)"};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}30;
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.disabled};
    opacity: 0.8;
  }
`;

const TreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 0 4px;
  margin-right: 4px;
  position: relative;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
  }
`;

const DatabaseItem = styled.div`
  margin-bottom: 8px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
  min-width: max-content;
`;

const DatabaseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  background-color: ${({ theme, $expanded }) =>
    $expanded
      ? theme.isDarkMode
        ? "rgba(76, 175, 80, 0.15)"
        : "rgba(76, 175, 80, 0.1)"
      : "transparent"};
  border-left: 3px solid
    ${({ theme, $expanded }) => ($expanded ? theme.primary : "transparent")};
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: max-content;

  &:hover {
    background-color: ${({ theme, $expanded }) =>
      $expanded
        ? theme.isDarkMode
          ? "rgba(76, 175, 80, 0.2)"
          : "rgba(76, 175, 80, 0.15)"
        : theme.hover};
  }

  svg {
    color: ${({ theme, $expanded }) =>
      $expanded ? theme.primary : theme.text.secondary};
  }
`;

const DatabaseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${({ theme, $expanded }) =>
    $expanded ? theme.primary : theme.text.secondary};
`;

const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: ${({ theme, $expanded }) =>
    $expanded ? theme.primary : theme.text.secondary};
  transform: ${({ $expanded }) =>
    $expanded ? "rotate(0deg)" : "rotate(-90deg)"};
  transition: transform 0.2s ease;
`;

const TablesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2px 0 8px 28px;
`;

const TableItem = styled.li`
  margin-bottom: 2px;
  border-radius: 4px;
  transition: all 0.15s ease;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  color: ${({ theme }) => theme.text.primary};
  font-size: 13px;
  background-color: ${({ theme, $expanded }) =>
    $expanded
      ? theme.isDarkMode
        ? "rgba(33, 150, 243, 0.15)"
        : "rgba(33, 150, 243, 0.1)"
      : "transparent"};
  border-left: 2px solid
    ${({ theme, $expanded }) => ($expanded ? theme.secondary : "transparent")};
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: max-content;

  &:hover {
    background-color: ${({ theme, $expanded }) =>
      $expanded
        ? theme.isDarkMode
          ? "rgba(33, 150, 243, 0.2)"
          : "rgba(33, 150, 243, 0.15)"
        : theme.hover};
  }

  svg {
    color: ${({ theme, $expanded }) =>
      $expanded ? theme.secondary : theme.text.secondary};
  }
`;

const TableIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: ${({ theme, $expanded }) =>
    $expanded ? theme.secondary : theme.text.secondary};
`;

const ColumnsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2px 0 8px 24px;
  border-left: 1px dashed
    ${({ theme }) =>
      theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
`;

const ColumnItem = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  border-radius: 4px;
  transition: background-color 0.15s ease;
  min-width: max-content;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const ColumnName = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-family: "Roboto Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.3px;
  white-space: nowrap;
`;

const ColumnType = styled.span`
  color: ${({ theme }) => theme.info};
  font-size: 12px;
  opacity: 0.8;
  padding: 1px 4px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(33, 150, 243, 0.15)" : "rgba(33, 150, 243, 0.1)"};
  border-radius: 3px;
  font-family: "Roboto Mono", monospace;
  white-space: nowrap;
`;

const ColumnConstraint = styled.span`
  color: ${({ theme }) => theme.warning};
  font-size: 11px;
  opacity: 0.9;
  padding: 1px 4px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "rgba(255, 152, 0, 0.15)" : "rgba(255, 152, 0, 0.1)"};
  border-radius: 3px;
  font-family: "Roboto Mono", monospace;
  white-space: nowrap;
`;

const ColumnIcon = styled.span`
  margin-right: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: ${({ $isPrimary, $isForeignKey, theme }) =>
    $isPrimary
      ? theme.primary
      : $isForeignKey
      ? theme.secondary
      : theme.text.secondary};
`;

const ActionsMenu = styled.div`
  position: absolute;
  right: 8px;
  background-color: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  z-index: 100;
  overflow: hidden;
  min-width: 160px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: none;
  background: none;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  color: ${({ theme }) => theme.text.primary};
  font-size: 13px;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.text.secondary};
  }
`;

function DatabaseExplorer({ onTableClick }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [contextMenuItems, setContextMenuItems] = useState(null);

  // Toggle expanded state of databases or tables
  const toggleExpand = (type, name) => {
    setExpandedItems((prev) => ({
      ...prev,
      [`${type}_${name}`]: !prev[`${type}_${name}`],
    }));
  };

  // Filter function based on search term
  const filterSchemaItems = () => {
    if (!searchTerm.trim()) return mockDatabaseSchema.databases;

    // Filter and return new structure containing only matches
    return mockDatabaseSchema.databases
      .map((db) => ({
        ...db,
        tables: db.tables.filter(
          (table) =>
            table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            table.columns.some((col) =>
              col.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        ),
      }))
      .filter((db) => db.tables.length > 0);
  };

  // Generate SQL for table
  const generateSelectSQL = (tableName) => {
    if (onTableClick) {
      onTableClick(tableName);
    }
  };

  // Context menu handler for tables
  const handleTableContextMenu = (e, tableName) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenuItems({
      x: e.clientX,
      y: e.clientY,
      tableName,
    });
  };

  // Close context menu when clicking elsewhere
  const handleClickOutside = () => {
    setContextMenuItems(null);
  };

  // Handle options in the context menu
  const handleContextMenuAction = (action, tableName) => {
    switch (action) {
      case "select":
        generateSelectSQL(tableName);
        break;
      case "count":
        if (onTableClick) {
          onTableClick(tableName, `SELECT COUNT(*) FROM ${tableName};`);
        }
        break;
      default:
        break;
    }
    setContextMenuItems(null);
  };

  // Effect to close context menu on outside click
  React.useEffect(() => {
    if (contextMenuItems) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenuItems]);

  const filteredData = filterSchemaItems();

  return (
    <ExplorerContainer onClick={() => setContextMenuItems(null)}>
      <ExplorerHeader>
        <Title>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 8h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Database Explorer
        </Title>
      </ExplorerHeader>

      <SearchInput
        type="text"
        placeholder="Search tables and columns..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TreeContainer>
        {filteredData.map((database) => (
          <DatabaseItem key={database.name}>
            <DatabaseHeader
              onClick={() => toggleExpand("db", database.name)}
              $expanded={expandedItems[`db_${database.name}`]}
            >
              <ChevronIcon $expanded={expandedItems[`db_${database.name}`]}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </ChevronIcon>
              <DatabaseIcon $expanded={expandedItems[`db_${database.name}`]}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8c4.42 0 8-1.34 8-3s-3.58-3-8-3-8 1.34-8 3 3.58 3 8 3z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </DatabaseIcon>
              {database.name}
            </DatabaseHeader>

            {expandedItems[`db_${database.name}`] && (
              <TablesList>
                {database.tables.map((table) => (
                  <TableItem key={table.name}>
                    <TableHeader
                      onClick={() => toggleExpand("table", table.name)}
                      onContextMenu={(e) =>
                        handleTableContextMenu(e, table.name)
                      }
                      onDoubleClick={() => generateSelectSQL(table.name)}
                      $expanded={expandedItems[`table_${table.name}`]}
                    >
                      <ChevronIcon
                        $expanded={expandedItems[`table_${table.name}`]}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19 9l-7 7-7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </ChevronIcon>
                      <TableIcon
                        $expanded={expandedItems[`table_${table.name}`]}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 3h18v18H3V3zm0 6h18M3 15h18M9 3v18"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </TableIcon>
                      {table.name}
                    </TableHeader>

                    {expandedItems[`table_${table.name}`] && (
                      <ColumnsList>
                        {table.columns.map((column) => (
                          <ColumnItem key={column.name}>
                            <ColumnIcon
                              $isPrimary={column.isPrimary}
                              $isForeignKey={column.isForeignKey}
                            >
                              {column.isPrimary ? (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L9 19l-2 2-2-2 2-2 4.257-4.257A6 6 0 1121 9z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <circle
                                    cx="15"
                                    cy="9"
                                    r="2"
                                    fill="currentColor"
                                  />
                                </svg>
                              ) : column.isForeignKey ? (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              )}
                            </ColumnIcon>
                            <ColumnName>{column.name}</ColumnName>
                            <ColumnType>{column.type}</ColumnType>
                            {column.isNullable === false && (
                              <ColumnConstraint>NOT NULL</ColumnConstraint>
                            )}
                          </ColumnItem>
                        ))}
                      </ColumnsList>
                    )}
                  </TableItem>
                ))}
              </TablesList>
            )}
          </DatabaseItem>
        ))}
      </TreeContainer>

      {contextMenuItems && (
        <ActionsMenu
          style={{
            top: `${contextMenuItems.y}px`,
            left: `${contextMenuItems.x}px`,
          }}
        >
          <ActionButton
            onClick={() =>
              handleContextMenuAction("select", contextMenuItems.tableName)
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Select All Rows
          </ActionButton>
          <ActionButton
            onClick={() =>
              handleContextMenuAction("count", contextMenuItems.tableName)
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4h-2l-4 4v-4H7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 9h8M8 13h6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Count Rows
          </ActionButton>
        </ActionsMenu>
      )}
    </ExplorerContainer>
  );
}

export default DatabaseExplorer;
