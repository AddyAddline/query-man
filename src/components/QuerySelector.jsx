import React from "react";
import styled from "styled-components";

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const Label = styled.label`
  font-weight: 500;
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  align-items: center;
  margin-right: 4px;

  @media (max-width: 576px) {
    font-size: 12px;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  min-width: 180px;
  max-width: 300px;
  flex: 1;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid ${({ theme }) => theme.text.secondary};
    pointer-events: none;
  }

  @media (max-width: 576px) {
    min-width: 140px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 6px 10px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 13px;
  background-color: ${({ theme }) => (theme.isDarkMode ? "#252526" : "#fff")};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  appearance: none;
  transition: all 0.2s;
  height: 32px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primaryLight}30;
  }

  @media (max-width: 576px) {
    font-size: 12px;
    padding: 6px 8px;
  }
`;

const QueryDescription = styled.div`
  padding: 6px 10px;
  margin-left: 8px;
  background-color: ${({ theme }) =>
    theme.isDarkMode ? "#2d2d2d" : "#f1f1f1"};
  color: ${({ theme }) => theme.text.secondary};
  border-radius: 4px;
  font-size: 12px;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    max-width: 200px;
  }

  @media (max-width: 576px) {
    display: none;
  }
`;

function QuerySelector({ queries, currentQuery, onQueryChange }) {
  const selectedQuery = queries.find((q) => q.id === currentQuery);

  return (
    <SelectorContainer>
      <Label htmlFor="query-selector">Select a predefined query:</Label>

      <SelectWrapper>
        <Select
          id="query-selector"
          value={currentQuery}
          onChange={(e) => onQueryChange(e.target.value)}
        >
          {queries.map((query) => (
            <option key={query.id} value={query.id}>
              {query.name}
            </option>
          ))}
        </Select>
      </SelectWrapper>

      {selectedQuery && selectedQuery.description && (
        <QueryDescription title={selectedQuery.description}>
          {selectedQuery.description}
        </QueryDescription>
      )}
    </SelectorContainer>
  );
}

export default QuerySelector;
