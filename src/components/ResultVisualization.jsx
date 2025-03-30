import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const VisualizationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.2s ease-in-out;

  @media (max-width: 768px) {
    margin-top: 16px;
  }
`;

const VisualizationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.background};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.primary};
  }

  @media (max-width: 576px) {
    font-size: 14px;
  }
`;

const ChartContainer = styled.div`
  height: 350px;
  padding: 20px;

  @media (max-width: 768px) {
    height: 300px;
    padding: 16px;
  }

  @media (max-width: 576px) {
    height: 260px;
    padding: 12px;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 15px;
  gap: 12px;
  text-align: center;
  padding: 0 20px;

  svg {
    width: 40px;
    height: 40px;
    opacity: 0.7;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  padding: 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
`;

const Tab = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 2px solid
    ${(props) => (props.$active ? props.theme.primary : "transparent")};
  color: ${(props) =>
    props.$active ? props.theme.primary : props.theme.text.secondary};
  font-weight: ${(props) => (props.$active ? "600" : "normal")};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${({ theme }) => theme.primary};
    background-color: ${({ theme }) => theme.hover};
  }

  @media (max-width: 576px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

// Custom tooltip styles
const CustomTooltipWrapper = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);

  .label {
    font-weight: 600;
    margin-bottom: 5px;
    color: ${({ theme }) => theme.text.primary};
  }

  .value {
    color: ${({ theme }) => theme.text.secondary};
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .color-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
`;

// Colors for charts - more harmonious palette
const COLORS = [
  "#1976d2", // blue - from our new theme
  "#2e7d32", // green - from our new theme
  "#d32f2f", // red - from our new theme
  "#ed6c02", // orange - from our new theme
  "#5e35b1", // purple - from our new theme
  "#0288d1", // lighter blue - from our new theme
  "#00695c", // dark teal
  "#f57c00", // darker orange
];

function ResultVisualization({ data, queryId }) {
  const [activeChart, setActiveChart] = useState("bar");

  // Determine if the data can be visualized
  const canVisualize = useMemo(() => {
    if (!data || data.length === 0) return false;

    // Check if there are at least 2 fields and one is numeric
    const keys = Object.keys(data[0]);
    if (keys.length < 2) return false;

    // Check if there's at least one numeric field
    return keys.some((key) =>
      data.some((item) => typeof item[key] === "number")
    );
  }, [data]);

  // Prepare data for visualization
  const chartData = useMemo(() => {
    if (!canVisualize) return [];

    // Find a numeric field for the values
    const keys = Object.keys(data[0]);
    const numericKey = keys.find((key) => typeof data[0][key] === "number");
    const labelKey = keys.find((key) => key !== numericKey);

    let statusGroups;

    // Use different preparation based on query type
    switch (queryId) {
      case "q2": // Top Products by Revenue
        return data.map((item) => ({
          name:
            item.product_name.length > 20
              ? item.product_name.substring(0, 20) + "..."
              : item.product_name,
          value: item.revenue,
          fullName: item.product_name,
        }));

      case "q3": // Customer Order Analysis
        return data.map((item) => ({
          name:
            item.name.length > 15
              ? item.name.substring(0, 15) + "..."
              : item.name,
          orders: item.order_count,
          spent: item.total_spent,
          fullName: item.name,
        }));

      case "q4": // Product Inventory
        // Group by stock status
        statusGroups = data.reduce((acc, item) => {
          acc[item.stock_status] = (acc[item.stock_status] || 0) + 1;
          return acc;
        }, {});

        return Object.entries(statusGroups).map(([status, count]) => ({
          name: status,
          value: count,
        }));

      case "q5": // Monthly Sales
        return data.map((item) => ({
          name: `Month ${item.month}`,
          orders: item.order_count,
          revenue: item.monthly_revenue / 1000, // Convert to thousands for better display
        }));

      default:
        // Generic preparation (use first string column as label, first numeric as value)
        return data.slice(0, 10).map((item) => {
          const label = String(item[labelKey]);
          const truncatedLabel =
            label.length > 15 ? label.substring(0, 15) + "..." : label;

          return {
            name: truncatedLabel,
            value: item[numericKey],
            fullName: label,
          };
        });
    }
  }, [data, queryId, canVisualize]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltipWrapper>
          <div className="label">{payload[0]?.payload?.fullName || label}</div>
          {payload.map((entry, index) => (
            <div className="value" key={`tooltip-${index}`}>
              <span
                className="color-dot"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span>
                {entry.name}: {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </CustomTooltipWrapper>
      );
    }
    return null;
  };

  if (!canVisualize) {
    return (
      <VisualizationContainer>
        <VisualizationHeader>
          <Title>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 22h18V2H3v20zm2-2V4h14v16H5z" fill="currentColor" />
              <path
                d="M7 14h2v4H7v-4zm4-2h2v6h-2v-6zm4-4h2v10h-2V8z"
                fill="currentColor"
              />
            </svg>
            Data Visualization
          </Title>
        </VisualizationHeader>
        <NoDataMessage>
          <svg
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
              d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 17h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          This data cannot be visualized with the current chart types.
          <br />
          Try a different query with numerical values.
        </NoDataMessage>
      </VisualizationContainer>
    );
  }

  return (
    <VisualizationContainer>
      <VisualizationHeader>
        <Title>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 22h18V2H3v20zm2-2V4h14v16H5z" fill="currentColor" />
            <path
              d="M7 14h2v4H7v-4zm4-2h2v6h-2v-6zm4-4h2v10h-2V8z"
              fill="currentColor"
            />
          </svg>
          Data Visualization
        </Title>
      </VisualizationHeader>

      <TabsContainer>
        <Tab
          $active={activeChart === "bar"}
          onClick={() => setActiveChart("bar")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 20V10M12 20V4M6 20v-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Bar Chart
        </Tab>
        <Tab
          $active={activeChart === "pie"}
          onClick={() => setActiveChart("pie")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.21 15.89A10 10 0 1 1 8 2.83"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 12A10 10 0 0 0 12 2v10h10z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Pie Chart
        </Tab>
      </TabsContainer>

      <ChartContainer>
        {activeChart === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              {queryId === "q3" || queryId === "q5" ? (
                <>
                  <Bar
                    dataKey="orders"
                    fill={COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={queryId === "q3" ? "spent" : "revenue"}
                    fill={COLORS[1]}
                    radius={[4, 4, 0, 0]}
                  />
                </>
              ) : (
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={90}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={1}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </VisualizationContainer>
  );
}

export default ResultVisualization;
