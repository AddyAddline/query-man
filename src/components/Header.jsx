import React from "react";
import styled from "styled-components";
import ThemeToggle from "./ThemeToggle";

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  box-shadow: ${({ theme }) => theme.shadow.small};
  height: 64px;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 10px 12px;
  }

  @media (max-width: 576px) {
    padding: 8px 10px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    height: 24px;
    width: 24px;

    @media (max-width: 576px) {
      height: 22px;
      width: 22px;
    }
  }
`;

const AppTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.primary},
    ${({ theme }) => theme.secondary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 576px) {
    gap: 10px;
  }
`;

const MetricsDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  background-color: ${({ theme }) =>
    theme.isDarkMode ? theme.surface : theme.surfaceAlt};
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.borderLight};
  box-shadow: ${({ theme }) => theme.shadow.small};

  @media (max-width: 576px) {
    font-size: 12px;
    padding: 5px 10px;
    gap: 8px;
  }
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
`;

const MetricIcon = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
`;

function Header({ executionTime = null, rowCount = null }) {
  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 5h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 8h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zm1-6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm0 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM7 8h10M7 16h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="5" cy="7" r="1" fill="currentColor" />
            <circle cx="5" cy="15" r="1" fill="currentColor" />
          </svg>
        </LogoIcon>
        <AppTitle>Query Man</AppTitle>
      </Logo>

      <Controls>
        {(executionTime || rowCount) && (
          <MetricsDisplay>
            {executionTime && (
              <Metric>
                <MetricIcon>
                  <svg
                    width="14"
                    height="14"
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
                      d="M12 6v6l4 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </MetricIcon>
                <span>{executionTime}</span>
              </Metric>
            )}
            {rowCount && (
              <Metric>
                <MetricIcon>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 3h18v18H3V3zm6 4h9M3 9h18M3 15h18M9 9v9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </MetricIcon>
                <span>{rowCount} rows</span>
              </Metric>
            )}
          </MetricsDisplay>
        )}
        <ThemeToggle />
      </Controls>
    </HeaderContainer>
  );
}

export default Header;
