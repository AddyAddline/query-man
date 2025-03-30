import React from "react";
import styled from "styled-components";

const CacheBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.info + "15"};
  color: ${({ theme }) => theme.info};
  border: 1px solid ${({ theme }) => theme.info + "30"};
  margin-left: 10px;

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

function CacheIndicator({ fromCache }) {
  if (!fromCache) return null;

  return (
    <CacheBadge title="Results loaded from cache">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 9.5V5a2 2 0 012-2h4.5M15.5 3h4.5a2 2 0 012 2v4.5M21.5 15v4.5a2 2 0 01-2 2h-4M9 21.5H4.5a2 2 0 01-2-2v-4M12 17l5-5m-5-5V7v5h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Cached
    </CacheBadge>
  );
}

export default CacheIndicator;
